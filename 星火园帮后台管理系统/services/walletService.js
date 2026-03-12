// services/walletService.js
const db = require("../models");
const { User, Task, Withdrawal } = db;
const { Op } = require("sequelize");
const WechatPayService = require("./wechatPayService");
const ThirdPartyRedPacketService = require("./thirdPartyRedPacketService");
const shardingHelper = require("./shardingHelper");

class WalletService {
  /**
   * 处理任务完成后的资金分配（平台扣除10%佣金，90%给接单员）
   * @param {string} taskId 任务ID
   * @param {string} acceptorId 接单员ID
   * @param {number} taskAmount 任务金额
   */
  static async processTaskCompletion(
    taskId,
    acceptorId,
    taskAmount,
    communityId = null
  ) {
    const transaction = await db.sequelize.transaction();

    try {
      // 获取任务信息（从分片表查询）
      let taskInfo = null;

      if (communityId) {
        // 如果提供了社区ID，直接从对应分片表查询
        const tableName = shardingHelper.getTaskTableName(communityId);
        taskInfo = await shardingHelper.findByIdInShardedTable(
          tableName,
          taskId
        );
      } else {
        // 如果没有提供社区ID，遍历所有分片表查找
        const communities = await db.Community.findAll({
          attributes: ["id", "name"],
        });

        for (const community of communities) {
          try {
            const tableName = shardingHelper.getTaskTableName(community.id);
            taskInfo = await shardingHelper.findByIdInShardedTable(
              tableName,
              taskId
            );
            if (taskInfo) {
              console.log(
                `在社区 ${community.name} 的分片表中找到任务 ${taskId}`
              );
              break;
            }
          } catch (error) {
            console.error(
              `查询社区 ${community.name} 分片表失败:`,
              error.message
            );
            // 继续查询其他社区
          }
        }
      }

      if (!taskInfo) {
        throw new Error("任务不存在");
      }

      // 处理借物品任务的资金分配
      if (taskInfo.taskType === "借物品") {
        return await this.processBorrowTaskCompletion(
          taskInfo,
          acceptorId,
          transaction
        );
      }

      // 处理帮我买任务的资金分配
      if (taskInfo.taskType === "帮我买") {
        return await this.processBuyTaskCompletion(
          taskInfo,
          acceptorId,
          transaction
        );
      }

      // 其他任务类型的原有逻辑
      // 计算平台费用（10%）和接单员收入（90%）
      const platformFee = parseFloat((taskAmount * 0.1).toFixed(2));
      const riderAmount = taskAmount - platformFee;

      console.log(
        `任务完成资金分配: 任务金额=${taskAmount}, 平台费用=${platformFee}, 接单员收入=${riderAmount}`
      );

      // 获取接单员信息
      const acceptor = await User.findByPk(acceptorId, { transaction });
      if (!acceptor) {
        throw new Error("接单员不存在");
      }

      // 检查是否已经处理过
      if (taskInfo.paymentStatus === "transferred") {
        console.log(`任务 ${taskId} 已经处理过资金分配`);
        return {
          success: true,
          message: "资金已分配",
          platformFee,
          riderAmount,
        };
      }

      // 尝试真正的微信支付转账
      let wechatTransferResult = null;
      try {
        const wechatPay = WechatPayService;

        // 生成商户订单号
        const partnerTradeNo = `TASK_${taskId}_${Date.now()}`;

        // 调用微信企业付款到零钱
        wechatTransferResult = await wechatPay.transferToBalance({
          openid: acceptor.openid,
          amount: Math.round(riderAmount * 100), // 转换为分
          desc: `任务完成奖励 - ${taskInfo.title}`,
          partnerTradeNo: partnerTradeNo,
        });

        console.log(
          `微信支付转账成功: ${JSON.stringify(wechatTransferResult)}`
        );
      } catch (wechatError) {
        console.error(`微信支付转账失败: ${wechatError.message}`);

        // 如果微信支付失败，回退到余额增加模式
        console.log("回退到余额增加模式");

        const acceptorBalanceBefore = parseFloat(acceptor.walletBalance);
        const acceptorBalanceAfter = acceptorBalanceBefore + riderAmount;

        await acceptor.update(
          {
            walletBalance: acceptorBalanceAfter,
            totalEarnings: parseFloat(acceptor.totalEarnings) + riderAmount,
          },
          { transaction }
        );

        wechatTransferResult = {
          success: false,
          fallback: true,
          message: "微信支付失败，已增加到余额",
        };
      }

      // 更新任务状态
      await taskInfo.update(
        {
          paymentStatus: "transferred",
          platformFee: platformFee,
          acceptorFee: riderAmount,
          transferTime: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      console.log(
        `资金分配完成: 接单员收入${riderAmount}元, 平台费用${platformFee}元`
      );

      return {
        success: true,
        wechatTransfer: wechatTransferResult,
        platformFee,
        riderAmount,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("资金分配失败:", error);
      throw error;
    }
  }

  /**
   * 处理借物品任务完成后的资金分配
   * @param {Object} task 任务对象
   * @param {string} acceptorId 接单员ID
   * @param {Object} transaction 数据库事务
   */
  static async processBorrowTaskCompletion(task, acceptorId, transaction) {
    try {
      console.log(
        `[processBorrowTaskCompletion] 处理借物品任务完成: ${task.id}, 模式: ${task.borrowMode}`
      );

      // 获取发布者和接单员信息
      const publisher = await User.findByPk(task.publisherId, { transaction });
      const acceptor = await User.findByPk(acceptorId, { transaction });

      if (!publisher || !acceptor) {
        throw new Error("用户信息不存在");
      }

      // 从任务详情中解析押金和租金信息
      const specifics = task.specifics || "";
      const depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
      const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
      const expectedDepositMatch = specifics.match(
        /预期押金[：:]\s*(\d+(?:\.\d+)?)元/
      );
      const expectedRentMatch = specifics.match(
        /预期日租金[：:]\s*(\d+(?:\.\d+)?)元/
      );

      let deposit = 0;
      let dailyRent = 0;
      let totalRent = 0;

      if (task.borrowMode === "lend") {
        // 借出模式：从specifics中解析押金和日租金
        deposit = parseFloat(depositMatch ? depositMatch[1] : 0);
        dailyRent = parseFloat(rentMatch ? rentMatch[1] : 0);
      } else if (task.borrowMode === "borrow") {
        // 借进模式：从specifics中解析预期押金和预期日租金
        deposit = parseFloat(
          expectedDepositMatch ? expectedDepositMatch[1] : 0
        );
        dailyRent = parseFloat(expectedRentMatch ? expectedRentMatch[1] : 0);
      }

      // 计算总租金（需要从借用时长计算）
      const durationMatch = specifics.match(/借用时长[：:]\s*(\d+)天/);
      const days = durationMatch ? parseInt(durationMatch[1]) : 1;
      totalRent = dailyRent * days;

      console.log(
        `[processBorrowTaskCompletion] 押金: ${deposit}, 日租金: ${dailyRent}, 天数: ${days}, 总租金: ${totalRent}`
      );

      if (task.borrowMode === "lend") {
        // 借出模式：押金退还给借入者，租金给发布者
        console.log(
          `[processBorrowTaskCompletion] 借出模式：押金${deposit}元退还给借入者，租金${totalRent}元给发布者`
        );

        // 押金退还给借入者（通过微信退款）
        if (deposit > 0) {
          try {
            const wechatPayRefundService = require("./wechatPayRefundService");
            const refundNo =
              "DEPOSIT_REFUND" + Date.now() + Math.floor(Math.random() * 10000);

            const refundResult = await wechatPayRefundService.applyRefund(
              task.out_trade_no,
              refundNo,
              deposit + totalRent, // 原订单总金额
              deposit, // 只退还押金
              "借物品任务完成，押金退还"
            );

            if (refundResult.success) {
              console.log(
                `[processBorrowTaskCompletion] 押金${deposit}元已退还给借入者`
              );
            } else {
              console.error(
                `[processBorrowTaskCompletion] 押金退款失败: ${refundResult.error}`
              );
            }
          } catch (refundError) {
            console.error(
              `[processBorrowTaskCompletion] 押金退款处理失败:`,
              refundError
            );
          }
        }

        // 租金给发布者（扣除10%服务费）
        let platformFee = 0;
        let publisherRent = 0;

        if (totalRent > 0) {
          platformFee = parseFloat((totalRent * 0.1).toFixed(2)); // 10%服务费
          publisherRent = totalRent - platformFee; // 发布者实际收入

          const publisherBalanceBefore = parseFloat(publisher.walletBalance);
          const publisherBalanceAfter = publisherBalanceBefore + publisherRent;

          await publisher.update(
            {
              walletBalance: publisherBalanceAfter,
              totalEarnings:
                parseFloat(publisher.totalEarnings) + publisherRent,
            },
            { transaction }
          );

          console.log(
            `[processBorrowTaskCompletion] 租金${totalRent}元，扣除服务费${platformFee}元，发布者收入${publisherRent}元`
          );
        }

        // 更新任务状态（使用原始SQL更新分表）
        const tableName = `tasks_community_${task.communityId}`;

        console.log(
          `[processBorrowTaskCompletion] 借出模式更新任务状态: 任务ID=${task.id}, 平台费用=${platformFee}, 发布者收入=${publisherRent}`
        );

        await db.sequelize.query(
          `UPDATE ${tableName} SET paymentStatus = ?, platformFee = ?, acceptorFee = ?, transferTime = NOW() WHERE id = ?`,
          {
            replacements: [
              "transferred",
              platformFee,
              publisherRent, // 使用发布者实际收入
              task.id,
            ],
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: transaction,
          }
        );
      } else if (task.borrowMode === "borrow") {
        // 借进模式：押金退还给发布者，租金给借出者
        console.log(
          `[processBorrowTaskCompletion] 借进模式：押金${deposit}元退还给发布者，租金${totalRent}元给借出者`
        );

        // 押金退还给发布者（通过微信退款）
        if (deposit > 0) {
          try {
            const wechatPayRefundService = require("./wechatPayRefundService");
            const refundNo =
              "DEPOSIT_REFUND" + Date.now() + Math.floor(Math.random() * 10000);

            const refundResult = await wechatPayRefundService.applyRefund(
              task.out_trade_no,
              refundNo,
              deposit + totalRent, // 原订单总金额
              deposit, // 只退还押金
              "借物品任务完成，押金退还"
            );

            if (refundResult.success) {
              console.log(
                `[processBorrowTaskCompletion] 押金${deposit}元已退还给发布者`
              );
            } else {
              console.error(
                `[processBorrowTaskCompletion] 押金退款失败: ${refundResult.error}`
              );
            }
          } catch (refundError) {
            console.error(
              `[processBorrowTaskCompletion] 押金退款处理失败:`,
              refundError
            );
          }
        }

        // 租金给借出者（扣除10%服务费）
        let platformFee = 0;
        let acceptorRent = 0;

        if (totalRent > 0) {
          platformFee = parseFloat((totalRent * 0.1).toFixed(2)); // 10%服务费
          acceptorRent = totalRent - platformFee; // 借出者实际收入

          const acceptorBalanceBefore = parseFloat(acceptor.walletBalance);
          const acceptorBalanceAfter = acceptorBalanceBefore + acceptorRent;

          await acceptor.update(
            {
              walletBalance: acceptorBalanceAfter,
              totalEarnings: parseFloat(acceptor.totalEarnings) + acceptorRent,
            },
            { transaction }
          );

          console.log(
            `[processBorrowTaskCompletion] 租金${totalRent}元，扣除服务费${platformFee}元，借出者收入${acceptorRent}元`
          );
        }

        // 更新任务状态（使用原始SQL更新分表）
        const tableName = `tasks_community_${task.communityId}`;
        await db.sequelize.query(
          `UPDATE ${tableName} SET paymentStatus = ?, platformFee = ?, acceptorFee = ?, transferTime = NOW() WHERE id = ?`,
          {
            replacements: ["transferred", platformFee, acceptorRent, task.id],
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: transaction,
          }
        );
      }

      await transaction.commit();

      return {
        success: true,
        message: "借物品任务资金分配完成",
        deposit,
        totalRent,
        borrowMode: task.borrowMode,
      };
    } catch (error) {
      await transaction.rollback();
      console.error(
        "[processBorrowTaskCompletion] 借物品任务资金分配失败:",
        error
      );
      throw error;
    }
  }

  /**
   * 获取用户钱包信息
   * @param {string} userId 用户ID
   */
  static async getUserWallet(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("用户不存在");
    }

    // 获取最近的提现记录
    const recentWithdrawals = await Withdrawal.findAll({
      where: { userId },
      order: [["applyTime", "DESC"]],
      limit: 10,
    });

    return {
      walletBalance: parseFloat(user.walletBalance),
      totalEarnings: parseFloat(user.totalEarnings),
      totalWithdrawn: parseFloat(user.totalWithdrawn),
      recentWithdrawals,
    };
  }

  /**
   * 获取用户钱包信息（包含收入明细）
   * @param {string} userId 用户ID
   * @param {number} page 页码
   * @param {number} limit 每页数量
   * @param {string} date 日期筛选 (YYYY-MM-DD)
   */
  static async getWalletInfo(userId, page = 1, limit = 20, date = null) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("用户不存在");
      }

      const offset = (page - 1) * limit;

      // 获取所有社区的任务收入记录（跨分片查询）
      let taskEarnings = [];

      try {
        // 获取所有社区列表
        const communities = await db.Community.findAll({
          attributes: ["id", "name"],
        });

        console.log(
          `开始跨分片查询任务收入，用户ID: ${userId}, 社区数量: ${communities.length}`
        );

        // 遍历所有社区分片表
        for (const community of communities) {
          try {
            const tableName = shardingHelper.getTaskTableName(community.id);
            console.log(
              `查询社区 ${community.name} (ID: ${community.id}) 的分片表: ${tableName}`
            );

            // 构建任务收入查询条件
            const taskWhereCondition = {
              [Op.or]: [
                // 普通任务的收入（非借物品任务）
                {
                  acceptorId: userId,
                  taskType: { [Op.ne]: "借物品" },
                  status: {
                    [Op.in]: ["publisher_confirmed", "completed", "done"],
                  },
                  paymentStatus: "transferred",
                },
                // 借进模式的收入（借入者作为接单员获得租金收入）
                {
                  acceptorId: userId,
                  taskType: "借物品",
                  borrowMode: "borrow",
                  status: {
                    [Op.in]: ["publisher_confirmed", "completed", "done"],
                  },
                  paymentStatus: "transferred",
                },
                // 借出模式的收入（借出者作为发布者获得租金收入）
                {
                  publisherId: userId,
                  taskType: "借物品",
                  borrowMode: "lend",
                  status: {
                    [Op.in]: ["publisher_confirmed", "completed", "done"],
                  },
                  paymentStatus: "transferred",
                },
              ],
            };

            // 如果指定了日期，添加日期筛选
            if (date) {
              const startDate = new Date(date + " 00:00:00");
              const endDate = new Date(date + " 23:59:59");
              taskWhereCondition.transferTime = {
                [Op.between]: [startDate, endDate],
              };
            }

            // 查询该社区的任务收入记录
            const communityEarnings =
              await shardingHelper.queryFromShardedTable(tableName, {
                where: taskWhereCondition,
                attributes: [
                  "id",
                  "title",
                  "taskType",
                  "rewardAmount",
                  "acceptorFee",
                  "platformFee",
                  "borrowMode",
                  "transferTime",
                  "createdAt",
                  "communityId",
                ],
                order: [["transferTime", "DESC"]],
                limit: parseInt(limit),
                offset: parseInt(offset),
              });

            if (communityEarnings.rows && communityEarnings.rows.length > 0) {
              taskEarnings = taskEarnings.concat(communityEarnings.rows);
              console.log(
                `社区 ${community.name} 找到 ${communityEarnings.rows.length} 条任务收入记录`
              );
            }
          } catch (communityError) {
            console.error(
              `查询社区 ${community.name} 任务收入失败:`,
              communityError.message
            );
            // 继续查询其他社区，不中断整个流程
          }
        }

        // 按转账时间排序并限制结果数量
        taskEarnings = taskEarnings
          .sort((a, b) => new Date(b.transferTime) - new Date(a.transferTime))
          .slice(0, parseInt(limit));

        console.log(
          `跨分片查询完成，总共找到 ${taskEarnings.length} 条任务收入记录`
        );
      } catch (shardingError) {
        console.error("跨分片查询任务收入失败:", shardingError);
        // 如果分片查询失败，返回空数组而不是抛出错误
        taskEarnings = [];
      }

      // 获取二手市集收入记录
      let marketEarnings = [];
      try {
        let marketQuery = `SELECT 
          id, type, amount, description, created_at, related_id, related_type
         FROM wallet_records 
         WHERE user_id = ? AND type = 'income' AND related_type = 'market_product'`;

        let replacements = [userId];

        // 如果指定了日期，添加日期筛选
        if (date) {
          const startDate = new Date(date + " 00:00:00");
          const endDate = new Date(date + " 23:59:59");
          marketQuery += ` AND created_at BETWEEN ? AND ?`;
          replacements.push(startDate, endDate);
          console.log("二手市集收入日期筛选条件:", {
            date,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          });
        }

        marketQuery += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        replacements.push(parseInt(limit), parseInt(offset));

        const marketRecords = await db.sequelize.query(marketQuery, {
          replacements,
          type: db.sequelize.QueryTypes.SELECT,
        });
        marketEarnings = marketRecords;
      } catch (error) {
        console.log("wallet_records表不存在或查询失败，跳过二手市集收入记录");
        marketEarnings = [];
      }

      // 合并并排序所有收入记录
      const allEarnings = [];

      // 添加任务收入
      taskEarnings.forEach((task) => {
        let amount = 0;

        // 对于借物品任务，需要特殊处理金额显示
        if (task.taskType === "借物品") {
          if (task.borrowMode === "lend") {
            // 借出模式：发布者获得租金收入（扣除10%服务费）
            // 实际收入 = acceptorFee（这是借出者的实际收入）
            amount = parseFloat(task.acceptorFee || 0);
          } else if (task.borrowMode === "borrow") {
            // 借进模式：接单者获得租金收入（扣除10%服务费）
            amount = parseFloat(task.acceptorFee || 0);
          }
        } else if (task.taskType === "帮我买") {
          // 帮我买任务：使用acceptorFee（已包含预算+跑腿费-服务费）
          amount = parseFloat(task.acceptorFee || 0);
        } else {
          // 其他任务类型：使用acceptorFee或rewardAmount
          amount = parseFloat(task.acceptorFee || task.rewardAmount || 0);
        }

        allEarnings.push({
          id: task.id,
          title: task.title,
          type: task.taskType,
          amount: amount,
          time: task.transferTime || task.createdAt,
          source: "task",
        });
      });

      // 添加二手市集收入
      marketEarnings.forEach((record) => {
        allEarnings.push({
          id: record.related_id,
          title: record.description,
          type: "二手市集",
          amount: parseFloat(record.amount),
          time: record.created_at,
          source: "market",
        });
      });

      // 添加考试资料奖励收入
      try {
        let examRewardQuery = `SELECT id, amount, type, description, createdAt 
                              FROM user_earnings 
                              WHERE userId = ? AND type = 'exam_reward'`;

        let examReplacements = [userId];

        // 如果指定了日期，添加日期筛选
        if (date) {
          const startDate = new Date(date + " 00:00:00");
          const endDate = new Date(date + " 23:59:59");
          examRewardQuery += ` AND createdAt BETWEEN ? AND ?`;
          examReplacements.push(startDate, endDate);
        }

        examRewardQuery += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        examReplacements.push(parseInt(limit), parseInt(offset));

        const examRewardRecords = await db.sequelize.query(examRewardQuery, {
          replacements: examReplacements,
          type: db.sequelize.QueryTypes.SELECT,
        });

        examRewardRecords.forEach((record) => {
          allEarnings.push({
            id: record.id,
            title: record.description,
            type: "考试资料奖励",
            amount: parseFloat(record.amount),
            time: record.createdAt,
            source: "exam_reward",
          });
        });

        console.log(`找到 ${examRewardRecords.length} 条考试资料奖励记录`);
      } catch (error) {
        console.log("查询考试资料奖励记录失败:", error.message);
      }

      // 按时间排序
      allEarnings.sort((a, b) => new Date(b.time) - new Date(a.time));

      // 获取最近的提现记录
      const recentWithdrawals = await Withdrawal.findAll({
        where: { userId },
        order: [["applyTime", "DESC"]],
        limit: 10,
      });

      return {
        walletBalance: parseFloat(user.walletBalance),
        totalEarnings: parseFloat(user.totalEarnings),
        totalWithdrawn: parseFloat(user.totalWithdrawn),
        earnings: allEarnings.slice(0, limit), // 只返回指定数量的记录
        recentWithdrawals,
        page: parseInt(page),
        limit: parseInt(limit),
        total: allEarnings.length,
      };
    } catch (error) {
      console.error("获取钱包信息失败:", error);
      throw error;
    }
  }

  /**
   * 申请提现
   * @param {string} userId 用户ID
   * @param {number} amount 提现金额
   * @param {string} withdrawType 提现类型 (wechat|bank)
   */
  static async applyWithdrawal(userId, amount, withdrawType = "wechat") {
    const transaction = await db.sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error("用户不存在");
      }

      // 如果是银行卡提现，检查是否绑定银行卡
      if (withdrawType === "bank") {
        if (!user.bankCardNumber || !user.bankName || !user.realName) {
          throw new Error("请先绑定银行卡信息");
        }
      }

      const currentBalance = parseFloat(user.walletBalance);
      if (currentBalance < amount) {
        throw new Error("余额不足");
      }

      if (amount < 1) {
        throw new Error("提现金额不能少于1元");
      }

      // 计算当前周数
      const now = new Date();
      const year = now.getFullYear();
      const weekNumber = this.getWeekNumber(now);

      // 扣除余额
      const newBalance = currentBalance - amount;
      await user.update(
        {
          walletBalance: newBalance,
        },
        { transaction }
      );

      // 创建提现申请
      const withdrawal = await Withdrawal.create(
        {
          userId,
          amount,
          withdrawType, // 新增提现类型字段
          status: "pending",
          weekNumber,
          year,
        },
        { transaction }
      );

      await transaction.commit();

      console.log(
        `提现申请创建成功: 用户${userId}, 金额${amount}元, 类型${withdrawType}`
      );

      return {
        success: true,
        withdrawalId: withdrawal.id,
        newBalance,
        withdrawType,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("提现申请失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户提现记录
   * @param {string} userId 用户ID
   * @param {number} page 页码
   * @param {number} limit 每页数量
   */
  static async getUserWithdrawals(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Withdrawal.findAndCountAll({
      where: { userId },
      order: [["applyTime", "DESC"]],
      limit,
      offset,
      include: [{ model: User, as: "admin", attributes: ["nickname", "id"] }],
      attributes: [
        "id",
        "amount",
        "withdrawType",
        "status",
        "applyTime",
        "processTime",
        "completeTime",
        "rejectReason",
        "thirdPartyOrderId",
        "thirdPartyTicket",
        "failReason",
      ],
    });

    // 调试日志：检查查询结果
    console.log("查询到的提现记录数量:", count);
    if (rows && rows.length > 0) {
      console.log("第一条记录详情:", {
        id: rows[0].id,
        applyTime: rows[0].applyTime,
        applyTimeType: typeof rows[0].applyTime,
        applyTimeValue: rows[0].applyTime,
        applyTimeString: String(rows[0].applyTime),
      });
    }

    return {
      withdrawals: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * 管理员审核提现申请
   * @param {string} withdrawalId 提现申请ID
   * @param {string} adminId 管理员ID
   * @param {string} action 操作：approve/reject
   * @param {string} reason 拒绝原因（可选）
   */
  static async processWithdrawal(withdrawalId, adminId, action, reason = "") {
    const transaction = await db.sequelize.transaction();

    try {
      const withdrawal = await Withdrawal.findByPk(withdrawalId, {
        transaction,
        include: [{ model: User, as: "user" }],
      });
      if (!withdrawal) {
        throw new Error("提现申请不存在");
      }

      if (withdrawal.status !== "pending") {
        throw new Error("提现申请已处理");
      }

      const now = new Date();

      if (action === "approve") {
        // 通过提现申请
        await withdrawal.update(
          {
            status: "approved",
            processTime: now,
            adminId,
          },
          { transaction }
        );

        // 尝试真正的微信支付转账
        let wechatTransferResult = null;
        try {
          const wechatPay = WechatPayService;

          // 生成商户订单号
          const partnerTradeNo = `WITHDRAW_${withdrawalId}_${Date.now()}`;

          // 调用微信企业付款到零钱
          wechatTransferResult = await wechatPay.transferToBalance({
            openid: withdrawal.user.openid,
            amount: Math.round(withdrawal.amount * 100), // 转换为分
            desc: `提现申请 - ${
              withdrawal.withdrawType === "bank" ? "银行卡" : "微信零钱"
            }`,
            partnerTradeNo: partnerTradeNo,
          });

          console.log(
            `提现微信支付转账成功: ${JSON.stringify(wechatTransferResult)}`
          );

          // 更新提现状态为已完成
          await withdrawal.update(
            {
              status: "completed",
              completeTime: now,
              paymentNo: wechatTransferResult.paymentNo,
            },
            { transaction }
          );
        } catch (wechatError) {
          console.error(`提现微信支付转账失败: ${wechatError.message}`);

          // 如果微信支付失败，标记为处理中，等待人工处理
          await withdrawal.update(
            {
              status: "processing",
              rejectReason: `微信支付失败: ${wechatError.message}`,
            },
            { transaction }
          );

          wechatTransferResult = {
            success: false,
            message: "微信支付失败，需要人工处理",
          };
        }

        // 更新用户总提现金额
        const user = await User.findByPk(withdrawal.userId, { transaction });
        await user.update(
          {
            totalWithdrawn:
              parseFloat(user.totalWithdrawn) + parseFloat(withdrawal.amount),
          },
          { transaction }
        );
      } else if (action === "reject") {
        // 拒绝提现申请
        await withdrawal.update(
          {
            status: "rejected",
            processTime: now,
            adminId,
            rejectReason: reason,
          },
          { transaction }
        );

        // 退还余额
        const user = await User.findByPk(withdrawal.userId, { transaction });
        const currentBalance = parseFloat(user.walletBalance);
        await user.update(
          {
            walletBalance: currentBalance + parseFloat(withdrawal.amount),
          },
          { transaction }
        );
      }

      await transaction.commit();

      console.log(`提现申请处理完成: ${action}, 申请ID: ${withdrawalId}`);

      return {
        success: true,
        status: action === "approve" ? "completed" : "rejected",
        wechatTransfer: wechatTransferResult,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("处理提现申请失败:", error);
      throw error;
    }
  }

  /**
   * 获取本周待处理的提现申请（管理员功能）
   * @param {number} weekNumber 周数
   * @param {number} year 年份
   */
  static async getWeeklyWithdrawals(weekNumber, year) {
    const withdrawals = await Withdrawal.findAll({
      where: {
        weekNumber,
        year,
        status: "pending",
      },
      include: [
        { model: User, as: "user", attributes: ["nickname", "id", "openid"] },
      ],
      order: [["applyTime", "ASC"]],
    });

    const totalAmount = withdrawals.reduce(
      (sum, w) => sum + parseFloat(w.amount),
      0
    );

    return {
      withdrawals,
      totalAmount,
      count: withdrawals.length,
    };
  }

  /**
   * 批量处理本周提现申请（管理员功能）
   * @param {string} adminId 管理员ID
   * @param {number} weekNumber 周数
   * @param {number} year 年份
   */
  static async batchProcessWeeklyWithdrawals(adminId, weekNumber, year) {
    const transaction = await db.sequelize.transaction();

    try {
      const withdrawals = await Withdrawal.findAll({
        where: {
          weekNumber,
          year,
          status: "pending",
        },
        transaction,
      });

      let processedCount = 0;
      let totalAmount = 0;

      for (const withdrawal of withdrawals) {
        try {
          // 标记为已通过
          await withdrawal.update(
            {
              status: "approved",
              processTime: new Date(),
              adminId,
            },
            { transaction }
          );

          // TODO: 调用微信企业付款API
          // 这里先标记为已完成
          await withdrawal.update(
            {
              status: "completed",
              completeTime: new Date(),
            },
            { transaction }
          );

          // 更新用户总提现金额
          const user = await User.findByPk(withdrawal.userId, { transaction });
          await user.update(
            {
              totalWithdrawn:
                parseFloat(user.totalWithdrawn) + parseFloat(withdrawal.amount),
            },
            { transaction }
          );

          processedCount++;
          totalAmount += parseFloat(withdrawal.amount);
        } catch (error) {
          console.error(`处理提现申请 ${withdrawal.id} 失败:`, error);
        }
      }

      await transaction.commit();

      console.log(
        `批量处理完成: 处理了${processedCount}个提现申请，总金额${totalAmount}元`
      );

      return {
        success: true,
        processedCount,
        totalAmount,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("批量处理提现申请失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户任务收入记录
   * @param {string} userId 用户ID
   * @param {number} page 页码
   * @param {number} limit 每页数量
   * @param {string} date 日期筛选 (YYYY-MM-DD)
   */
  static async getUserTaskEarnings(userId, page = 1, limit = 20, date = null) {
    try {
      const offset = (page - 1) * limit;

      // 获取所有社区的任务收入记录（跨分片查询）
      let allEarnings = [];
      let totalCount = 0;

      try {
        // 获取所有社区列表
        const communities = await db.Community.findAll({
          attributes: ["id", "name"],
        });

        console.log(
          `开始跨分片查询任务收入记录，用户ID: ${userId}, 社区数量: ${communities.length}`
        );

        // 遍历所有社区分片表
        for (const community of communities) {
          try {
            const tableName = shardingHelper.getTaskTableName(community.id);
            console.log(
              `查询社区 ${community.name} (ID: ${community.id}) 的分片表: ${tableName}`
            );

            // 构建查询条件
            const whereCondition = {
              [Op.or]: [
                // 普通任务的收入（非借物品任务）
                {
                  acceptorId: userId,
                  taskType: { [Op.ne]: "借物品" },
                },
                // 借进模式的收入（借入者作为接单员获得租金收入）
                {
                  acceptorId: userId,
                  taskType: "借物品",
                  borrowMode: "borrow",
                },
                // 借出模式的收入（借出者作为发布者获得租金收入）
                {
                  publisherId: userId,
                  taskType: "借物品",
                  borrowMode: "lend",
                },
              ],
              status: {
                [Op.in]: ["publisher_confirmed", "completed", "done"],
              },
              paymentStatus: "transferred",
            };

            // 如果指定了日期，添加日期筛选
            if (date) {
              const startDate = new Date(date + " 00:00:00");
              const endDate = new Date(date + " 23:59:59");
              whereCondition.transferTime = {
                [Op.between]: [startDate, endDate],
              };
            }

            // 查询该社区的任务收入记录
            const communityEarnings =
              await shardingHelper.queryFromShardedTable(tableName, {
                where: whereCondition,
                attributes: [
                  "id",
                  "title",
                  "taskType",
                  "rewardAmount",
                  "acceptorFee",
                  "platformFee",
                  "borrowMode",
                  "transferTime",
                  "createdAt",
                  "communityId",
                ],
                order: [["transferTime", "DESC"]],
              });

            if (communityEarnings.rows && communityEarnings.rows.length > 0) {
              allEarnings = allEarnings.concat(communityEarnings.rows);
              totalCount +=
                communityEarnings.count || communityEarnings.rows.length;
              console.log(
                `社区 ${community.name} 找到 ${communityEarnings.rows.length} 条任务收入记录`
              );
            }
          } catch (communityError) {
            console.error(
              `查询社区 ${community.name} 任务收入失败:`,
              communityError.message
            );
            // 继续查询其他社区，不中断整个流程
          }
        }

        // 按转账时间排序
        allEarnings = allEarnings.sort(
          (a, b) => new Date(b.transferTime) - new Date(a.transferTime)
        );

        console.log(
          `跨分片查询完成，总共找到 ${allEarnings.length} 条任务收入记录`
        );
      } catch (shardingError) {
        console.error("跨分片查询任务收入失败:", shardingError);
        // 如果分片查询失败，返回空结果
        return {
          success: true,
          data: {
            earnings: [],
            total: 0,
            page: parseInt(page),
            pageSize: parseInt(limit),
            totalPages: 0,
          },
        };
      }

      // 手动分页
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const rows = allEarnings.slice(startIndex, endIndex);

      const earnings = rows.map((task) => {
        let amount = 0;

        // 对于借物品任务，需要特殊处理金额显示
        if (task.taskType === "借物品") {
          if (task.borrowMode === "lend") {
            // 借出模式：发布者获得租金收入（扣除10%服务费）
            // 实际收入 = rewardAmount - platformFee
            amount =
              parseFloat(task.rewardAmount || 0) -
              parseFloat(task.platformFee || 0);
          } else if (task.borrowMode === "borrow") {
            // 借进模式：接单者获得租金收入（扣除10%服务费）
            amount = parseFloat(task.acceptorFee || 0);
          }
        } else {
          // 其他任务类型：使用rewardAmount
          amount = parseFloat(task.rewardAmount || 0);
        }

        return {
          id: task.id,
          taskTitle: task.title,
          taskType: task.taskType,
          amount: amount,
          acceptorFee: parseFloat(task.acceptorFee || 0),
          transferTime: task.transferTime,
          createdAt: task.createdAt,
        };
      });

      console.log("查询结果:", {
        totalCount: allEarnings.length,
        earningsCount: earnings.length,
        date: date,
        sampleEarnings: earnings.slice(0, 2),
      });

      return {
        earnings,
        total: allEarnings.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(allEarnings.length / parseInt(limit)),
      };
    } catch (error) {
      console.error("获取用户任务收入记录失败:", error);
      throw error;
    }
  }

  /**
   * 获取当前周数
   * @param {Date} date 日期
   */
  static getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  /**
   * 使用第三方接口申请提现到微信零钱
   * @param {string} userId 用户ID
   * @param {number} amount 提现金额
   * @returns {Object} 提现结果
   */
  static async applyThirdPartyWithdrawal(userId, amount) {
    const transaction = await db.sequelize.transaction();

    try {
      // 获取用户信息
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error("用户不存在");
      }

      // 移除真实姓名检查，直接进行提现
      // if (!user.realName) {
      //   throw new Error("请先完善真实姓名信息");
      // }

      // 检查钱包余额
      if (parseFloat(user.walletBalance) < amount) {
        throw new Error("钱包余额不足");
      }

      // 检查提现金额
      if (amount < 0.3) {
        throw new Error("提现金额不能低于0.3元");
      }

      // 检查每日提现限额
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayWithdrawals = await Withdrawal.findAll({
        where: {
          userId: userId,
          createdAt: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
          status: {
            [Op.in]: ["pending", "processing", "completed"],
          },
        },
        attributes: ["amount"],
      });

      const todayTotal = todayWithdrawals.reduce(
        (sum, w) => sum + parseFloat(w.amount),
        0
      );

      if (todayTotal + amount > 5000) {
        throw new Error("今日提现额度已超限，请明天再试");
      }

      // 计算当前周数和年份
      const now = new Date();
      const year = now.getFullYear();
      const weekNumber = this.getWeekNumber(now);

      // 使用第三方代发接口进行转账
      try {
        const thirdPartyService = ThirdPartyRedPacketService;

        // 生成订单号
        const orderId = thirdPartyService.generateOrderId();

        // 创建提现记录（暂不扣除余额，等转账成功后再扣除）
        console.log("创建提现记录，订单号:", orderId);
        const withdrawal = await Withdrawal.create(
          {
            userId: userId,
            amount: amount,
            withdrawType: "wechat",
            status: "pending",
            weekNumber: weekNumber,
            year: year,
            thirdPartyOrderId: orderId, // 保存订单号
            thirdPartyTicket: null,
          },
          { transaction }
        );
        console.log(
          "提现记录创建成功，ID:",
          withdrawal.id,
          "订单号:",
          withdrawal.thirdPartyOrderId
        );

        // 暂不扣除钱包余额，等转账成功后再扣除
        // 这样可以避免转账失败时余额被错误扣除

        console.log("需要获取第三方openid进行转账...");
        console.log("用户ID:", userId);
        console.log("转账金额:", amount);

        // 生成授权URL（使用更短的路径）
        const redirectUrl = `https://xinghuoyuanbang.top/campushelper/api/v1/wallet/callback?u=${userId}&a=${amount}&o=${orderId}`;
        console.log("回调URL:", redirectUrl);

        console.log("调用第三方服务生成授权URL...");
        const authUrl = thirdPartyService.getAuthorizationUrl(redirectUrl, 0); // 改为mp=0，不使用小程序路径
        console.log("生成的授权URL:", authUrl);
        console.log("授权URL类型:", typeof authUrl);
        console.log("授权URL长度:", authUrl ? authUrl.length : 0);

        // 提交事务，保存提现记录
        await transaction.commit();
        console.log("提现记录已保存到数据库，ID:", withdrawal.id);

        return {
          success: false,
          needAuthorization: true,
          authUrl: authUrl,
          message: "正在处理提现申请",
          data: {
            withdrawalId: withdrawal.id,
            orderId: orderId,
            amount: amount,
            status: "pending_authorization",
          },
        };

        // 注意：这里不再需要直接转账逻辑，因为我们已经直接进入授权流程
        // 转账将在用户完成授权后的回调接口中处理
      } catch (error) {
        // 检查事务状态，避免重复回滚
        if (transaction && !transaction.finished) {
          await transaction.rollback();
        }
        console.error("第三方转账失败:", error);
        throw error;
      }
    } catch (error) {
      // 检查事务状态，避免重复回滚
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      console.error("第三方提现申请失败:", error);
      throw error;
    }
  }

  /**
   * 查询第三方转账结果
   * @param {string} withdrawalId 提现记录ID
   * @returns {Object} 查询结果
   */
  static async queryThirdPartyTransferResult(withdrawalId) {
    try {
      const withdrawal = await Withdrawal.findByPk(withdrawalId);
      if (!withdrawal) {
        throw new Error("提现记录不存在");
      }

      if (!withdrawal.thirdPartyOrderId) {
        throw new Error("该提现记录未使用第三方接口");
      }

      const thirdPartyService = ThirdPartyRedPacketService;
      const queryResult = await thirdPartyService.queryTransferResult(
        withdrawal.thirdPartyOrderId
      );

      if (queryResult.success) {
        const result = queryResult.data;

        // 根据第三方返回的状态更新本地状态
        let newStatus = withdrawal.status;
        let newMessage = "";

        switch (result.status) {
          case "0": // 未领取
            newStatus = "processing";
            newMessage = "转账处理中，等待用户领取";
            break;
          case "1": // 已领取
            newStatus = "completed";
            newMessage = "转账成功，用户已领取";
            break;
          case "2": // 已退回
            newStatus = "failed";
            newMessage = "转账失败，金额已退回";
            break;
          case "3": // 已过期
            newStatus = "failed";
            newMessage = "转账超时，金额已退回";
            break;
          default:
            newStatus = "processing";
            newMessage = "转账状态未知";
        }

        // 更新提现记录状态
        await withdrawal.update({
          status: newStatus,
          completeTime: newStatus === "completed" ? new Date() : null,
          failReason: newStatus === "failed" ? newMessage : null,
        });

        return {
          success: true,
          message: newMessage,
          data: {
            status: newStatus,
            thirdPartyStatus: result.status,
            orderId: result.orderId,
            ticket: result.ticket,
            amount: result.money / 100, // 转换为元
            gotTime: result.gotTime,
            opmsg: result.opmsg,
          },
        };
      } else {
        throw new Error(`查询失败: ${queryResult.message}`);
      }
    } catch (error) {
      console.error("查询第三方转账结果失败:", error);
      return {
        success: false,
        message: error.message || "查询失败",
        error: error.message,
      };
    }
  }

  /**
   * 处理帮我买任务完成后的资金分配
   * @param {Object} task 任务对象
   * @param {string} acceptorId 接单员ID
   * @param {Object} transaction 数据库事务
   */
  static async processBuyTaskCompletion(task, acceptorId, transaction) {
    try {
      console.log(`[processBuyTaskCompletion] 处理帮我买任务完成: ${task.id}`);

      // 获取接单员信息
      const acceptor = await User.findByPk(acceptorId, { transaction });
      if (!acceptor) {
        throw new Error("接单员不存在");
      }

      // 检查是否已经处理过
      if (task.paymentStatus === "transferred") {
        console.log(`帮我买任务 ${task.id} 已经处理过资金分配`);
        return {
          success: true,
          message: "资金已分配",
        };
      }

      // 从任务详情中解析物品预算和跑腿费
      const specifics = task.specifics || "";
      const budgetMatch = specifics.match(/物品预算[：:]\s*(\d+(?:\.\d+)?)元/);
      const rewardMatch = specifics.match(/跑腿费[：:]\s*(\d+(?:\.\d+)?)元/);

      // 如果没有从specifics解析到，尝试从任务字段获取
      let budget = 0;
      let reward = 0;

      if (budgetMatch) {
        budget = parseFloat(budgetMatch[1]);
      } else if (task.budget) {
        budget = parseFloat(task.budget);
      }

      if (rewardMatch) {
        reward = parseFloat(rewardMatch[1]);
      } else if (task.rewardAmount) {
        reward = parseFloat(task.rewardAmount);
      }

      console.log(
        `帮我买任务资金解析: 物品预算=${budget}元, 跑腿费=${reward}元`
      );

      // 计算资金分配
      // 接单员收到：物品预算 + 跑腿费 - 跑腿费×10%服务费
      const platformFeeFromReward = parseFloat((reward * 0.1).toFixed(2)); // 跑腿费的10%服务费
      const riderAmount = budget + reward - platformFeeFromReward; // 接单员最终收入

      console.log(
        `帮我买任务资金分配: 物品预算=${budget}元, 跑腿费=${reward}元, 跑腿费服务费=${platformFeeFromReward}元, 接单员收入=${riderAmount}元`
      );

      // 尝试真正的微信支付转账
      let wechatTransferResult = null;
      try {
        const wechatPay = WechatPayService;

        // 生成商户订单号
        const partnerTradeNo = `BUY_TASK_${task.id}_${Date.now()}`;

        // 调用微信企业付款到零钱
        wechatTransferResult = await wechatPay.transferToBalance({
          openid: acceptor.openid,
          amount: Math.round(riderAmount * 100), // 转换为分
          desc: `帮我买任务完成奖励 - ${task.title}`,
          partnerTradeNo: partnerTradeNo,
        });

        console.log(
          `帮我买任务微信支付转账成功: ${JSON.stringify(wechatTransferResult)}`
        );
      } catch (wechatError) {
        console.error(`帮我买任务微信支付转账失败: ${wechatError.message}`);

        // 如果微信支付失败，回退到余额增加模式
        console.log("帮我买任务回退到余额增加模式");

        const acceptorBalanceBefore = parseFloat(acceptor.walletBalance);
        const acceptorBalanceAfter = acceptorBalanceBefore + riderAmount;

        await acceptor.update(
          {
            walletBalance: acceptorBalanceAfter,
            totalEarnings: parseFloat(acceptor.totalEarnings) + riderAmount,
          },
          { transaction }
        );

        wechatTransferResult = {
          success: false,
          fallback: true,
          message: "微信支付失败，已增加到余额",
        };
      }

      // 更新任务状态
      // 更新任务状态（使用原始SQL更新分表）
      const tableName = `tasks_community_${task.communityId}`;
      await db.sequelize.query(
        `UPDATE ${tableName} SET paymentStatus = ?, platformFee = ?, acceptorFee = ?, transferTime = NOW() WHERE id = ?`,
        {
          replacements: [
            "transferred",
            platformFeeFromReward,
            riderAmount,
            task.id,
          ],
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: transaction,
        }
      );

      console.log(
        `帮我买任务资金分配完成: 接单员收入${riderAmount}元, 跑腿费服务费${platformFeeFromReward}元`
      );

      return {
        success: true,
        wechatTransfer: wechatTransferResult,
        platformFee: platformFeeFromReward,
        riderAmount,
        budget,
        reward,
      };
    } catch (error) {
      console.error("帮我买任务资金分配失败:", error);
      throw error;
    }
  }

  /**
   * 处理考试资料奖励发放
   * @param {number} userId 用户ID
   * @param {number} amount 奖励金额
   * @param {string} proofId 凭证ID
   * @param {string} adminId 管理员ID
   */
  static async processExamReward(userId, amount, proofId, adminId) {
    const transaction = await db.sequelize.transaction();

    try {
      // 获取用户信息
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error("用户不存在");
      }

      // 更新用户余额
      const newBalance = parseFloat(user.walletBalance) + parseFloat(amount);
      const newTotalEarnings =
        parseFloat(user.totalEarnings) + parseFloat(amount);

      await user.update(
        {
          walletBalance: newBalance,
          totalEarnings: newTotalEarnings,
        },
        { transaction }
      );

      // 记录收入明细
      await db.sequelize.query(
        `INSERT INTO user_earnings (userId, amount, type, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            userId,
            amount,
            "exam_reward",
            `考试资料奖励 - 凭证ID: ${proofId}`,
            new Date(),
            new Date(),
          ],
          type: db.sequelize.QueryTypes.INSERT,
          transaction,
        }
      );

      await transaction.commit();

      console.log(`考试资料奖励发放成功: 用户${userId} 获得${amount}元奖励`);
      return {
        success: true,
        newBalance,
        newTotalEarnings,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("考试资料奖励发放失败:", error);
      throw error;
    }
  }
}

module.exports = WalletService;
