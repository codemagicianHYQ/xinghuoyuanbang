const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../models"); // 添加数据库引用
const { sequelize } = db; // 获取sequelize实例
const wechatPayRefundService = require("../services/wechatPayRefundService"); // 引入微信支付退款服务

// 微信支付退款配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID,
  mchId: process.env.WECHAT_MCH_ID,
  apiKey: process.env.WECHAT_API_KEY,
  certPath: process.env.WECHAT_CERT_PATH,
  keyPath: process.env.WECHAT_KEY_PATH,
};

// 生成随机字符串
function generateNonceStr() {
  return Math.random().toString(36).substr(2, 15);
}

// 生成签名
function generateSign(params, apiKey) {
  const sortedParams =
    Object.keys(params)
      .filter((key) => params[key] !== "" && params[key] != null)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&") + `&key=${apiKey}`;

  return crypto
    .createHash("md5")
    .update(sortedParams)
    .digest("hex")
    .toUpperCase();
}

// GET方法处理 - 提供接口信息
router.get("/notify", (req, res) => {
  res.json({
    message: "微信支付退款通知接口",
    method: "POST",
    description: "此接口用于接收微信支付的退款状态变更通知",
    status: "服务正常",
    timestamp: new Date().toISOString(),
  });
});

// 微信退款通知接口
router.post("/notify", async (req, res) => {
  try {
    console.log("收到微信退款通知:", req.body);

    // 验证微信通知签名
    const signature = req.headers["x-wechat-signature"];
    const timestamp = req.headers["x-wechat-timestamp"];
    const nonce = req.headers["x-wechat-nonce"];

    // 验证签名逻辑（这里简化处理，实际需要验证微信签名）
    // const expectedSignature = generateSign(req.body, WECHAT_CONFIG.apiKey);
    // if (signature !== expectedSignature) {
    //   console.error("签名验证失败");
    //   return res.status(400).send("FAIL");
    // }

    // 处理微信支付官方退款通知
    const refundData = req.body;

    // 验证签名 - 暂时跳过验证（开发阶段）
    console.log("⚠️ 开发阶段：跳过退款通知签名验证");
    /*
    if (!wechatPayRefundService.verifyRefundNotify(req.headers, refundData)) {
      console.error("退款通知签名验证失败");
      return res.status(400).json({
        code: "FAIL",
        message: "签名验证失败",
      });
    }
    */

    // 解析退款通知数据
    let refundInfo;
    try {
      // 微信支付官方API返回JSON格式
      refundInfo =
        typeof refundData === "string" ? JSON.parse(refundData) : refundData;
      console.log("微信支付官方退款通知数据:", refundInfo);
    } catch (error) {
      console.error("解析退款通知数据失败:", error);
      return res.status(400).send("FAIL");
    }

    // 处理微信支付v3退款通知
    if (
      refundInfo.event_type === "REFUND.SUCCESS" ||
      refundInfo.event_type === "REFUND.ABNORMAL" ||
      refundInfo.event_type === "REFUND.CLOSED"
    ) {
      console.log("收到退款通知:", refundInfo.event_type);

      // 解密通知数据
      let resourceData = null;
      if (refundInfo.resource && refundInfo.resource.ciphertext) {
        try {
          resourceData = await wechatPayRefundService.decryptRefundNotify(
            refundInfo.resource
          );
          console.log("解密后的退款数据:", resourceData);
        } catch (error) {
          console.error("解密退款通知数据失败:", error);
          return res.status(400).json({
            code: "FAIL",
            message: "解密失败",
          });
        }
      }

      if (resourceData) {
        // 查询退款记录
        const [refund] = await sequelize.query(
          "SELECT * FROM refunds WHERE wechat_refund_id = ? OR out_refund_no = ?",
          {
            replacements: [resourceData.refund_id, resourceData.out_refund_no],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        if (refund) {
          const refundRecord = refund;
          const refundStatus = resourceData.refund_status;

          // 更新退款状态
          await sequelize.query(
            "UPDATE refunds SET status = ?, updated_at = NOW() WHERE id = ?",
            {
              replacements: [refundStatus, refundRecord.id],
              type: sequelize.QueryTypes.UPDATE,
            }
          );

          // 根据退款状态更新任务状态
          if (refundStatus === "SUCCESS") {
            await sequelize.query(
              "UPDATE tasks SET refund_status = 'full', refunded_at = NOW() WHERE id = ?",
              {
                replacements: [refundRecord.task_id],
                type: sequelize.QueryTypes.UPDATE,
              }
            );
          } else if (refundStatus === "ABNORMAL") {
            await sequelize.query(
              "UPDATE tasks SET refund_status = 'abnormal' WHERE id = ?",
              {
                replacements: [refundRecord.task_id],
                type: sequelize.QueryTypes.UPDATE,
              }
            );
            console.log("退款异常，任务状态已更新");
          } else if (refundStatus === "CLOSED") {
            await sequelize.query(
              "UPDATE tasks SET refund_status = 'closed' WHERE id = ?",
              {
                replacements: [refundRecord.task_id],
                type: sequelize.QueryTypes.UPDATE,
              }
            );
            console.log("退款关闭，任务状态已更新");
          }
        } else {
          console.log("未找到对应的退款记录:", resourceData.refund_id);
        }
      }
    }

    // 兼容旧版本通知格式
    if (
      refundInfo.return_code === "SUCCESS" &&
      refundInfo.result_code === "SUCCESS"
    ) {
      // 查询退款记录
      const [refund] = await sequelize.query(
        "SELECT * FROM refunds WHERE wechat_refund_id = ?",
        {
          replacements: [refundInfo.refund_id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (refund) {
        const refundRecord = refund;

        // 更新退款状态
        await sequelize.query(
          "UPDATE refunds SET status = ?, updated_at = NOW() WHERE wechat_refund_id = ?",
          {
            replacements: [refundInfo.refund_status, refundInfo.refund_id],
            type: sequelize.QueryTypes.UPDATE,
          }
        );

        // 如果退款成功，更新任务状态
        if (refundInfo.refund_status === "SUCCESS") {
          await sequelize.query(
            "UPDATE tasks SET refund_status = 'full', refunded_at = NOW() WHERE id = ?",
            {
              replacements: [refundRecord.task_id],
              type: sequelize.QueryTypes.UPDATE,
            }
          );
        }
      }
    }

    // 返回成功响应 - 微信支付要求返回200或204状态码
    res.status(200).send("");
  } catch (error) {
    console.error("退款通知处理失败:", error);
    res.status(500).json({
      code: "FAIL",
      message: "处理失败",
    });
  }
});

// 申请退款
router.post("/apply", async (req, res) => {
  try {
    console.log("收到退款处理请求:", req.body);
    const { taskId, refundAmount, refundReason } = req.body;

    // 查询任务信息 - 从分表中查找
    let task = null;
    let communityId = null;
    const communities = await sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: sequelize.QueryTypes.SELECT }
    );

    // 遍历所有社区分表查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await sequelize.query(
          `SELECT * FROM ${tableName} WHERE id = ? AND status IN ("open", "assigned", "paid")`,
          {
            replacements: [parseInt(taskId)],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        if (tasks.length > 0) {
          task = tasks[0];
          communityId = community.id;
          break;
        }
      } catch (error) {
        // 表不存在，继续查找下一个
        continue;
      }
    }

    if (!task) {
      console.log("任务不存在或状态不允许退款, taskId:", taskId);
      return res.status(400).json({
        success: false,
        message: "任务不存在或状态不允许退款",
      });
    }

    // 借出模式（lend）的任务发布者没有付款，不允许申请退款
    if (task.taskType === "借物品" && task.borrowMode === "lend") {
      console.log(`借出模式任务 ${taskId} 发布者没有付款，不允许申请退款`);
      return res.status(400).json({
        success: false,
        message: "借出模式任务无需退款，请直接取消订单",
      });
    }

    const taskData = task;
    console.log("找到任务:", taskData);

    // 解析任务金额并计算实际支付金额
    const rewardAmount = parseFloat(taskData.rewardAmount) || 0;
    const taskType = String(taskData.taskType || "").trim();

    // 根据任务类型计算实际支付金额
    let actualPaidAmount = rewardAmount;

    if (taskType === "帮我买") {
      // 帮我买任务：实际支付金额 = rewardAmount（跑腿费）+ budget（预算）+ 0.1（服务费）
      const budget = parseFloat(taskData.budget || 0);
      const serviceFee = 0.1;
      actualPaidAmount = rewardAmount + budget + serviceFee;
      console.log(
        `帮我买任务金额计算: 跑腿费${rewardAmount}元 + 预算${budget}元 + 服务费${serviceFee}元 = ${actualPaidAmount}元`
      );
    }

    console.log(
      "任务金额:",
      taskData.rewardAmount,
      "实际支付金额:",
      actualPaidAmount
    );

    // 检查退款金额
    const actualRefundAmount =
      refundAmount === 0 ? actualPaidAmount : parseFloat(refundAmount) || 0;
    if (actualRefundAmount > actualPaidAmount) {
      return res.status(400).json({
        success: false,
        message: "退款金额不能超过实际支付金额",
      });
    }

    // 生成退款单号
    const refundNo = `RF${Date.now()}${Math.random().toString().substr(2, 6)}`;

    // 调用微信支付退款API
    console.log("开始调用微信支付退款API，退款单号:", refundNo);

    let refundResponse; // 声明变量

    // 检查是否需要退款
    if (actualPaidAmount === 0) {
      // 免费任务，直接取消，不需要退款
      console.log("免费任务，直接取消，无需退款");
      refundResponse = {
        return_code: "SUCCESS",
        result_code: "SUCCESS",
        refund_id: null,
        refund_status: "NO_REFUND",
      };
    } else {
      // 付费任务，需要退款
      console.log("付费任务，开始退款处理");

      // 使用tasks表中的out_trade_no作为原支付订单号
      const outTradeNo = taskData.out_trade_no || `TASK_${taskId}`;

      // 调用真实的微信支付退款API
      const refundResult = await wechatPayRefundService.applyRefund(
        outTradeNo, // 原支付订单号（从tasks表获取）
        refundNo, // 退款单号
        actualPaidAmount, // 原订单金额（使用实际支付金额）
        actualRefundAmount, // 退款金额
        refundReason || "用户取消订单" // 退款原因
      );

      if (refundResult.success) {
        refundResponse = {
          return_code: "SUCCESS",
          result_code: "SUCCESS",
          refund_id: refundResult.refund_id,
          refund_status: refundResult.refund_status,
        };
      } else {
        // 检查是否是"订单已全额退款"的情况
        if (
          refundResult.error &&
          (refundResult.error.includes("订单已全额退款") ||
            refundResult.error.includes("已全额退款") ||
            refundResult.error.includes("INVALID_REQUEST"))
        ) {
          refundResponse = {
            return_code: "SUCCESS",
            result_code: "SUCCESS",
            refund_id: null,
            refund_status: "ALREADY_REFUNDED",
          };
        } else {
          refundResponse = {
            return_code: "FAIL",
            result_code: "FAIL",
            err_code_des: refundResult.error || "微信退款API调用失败",
          };
        }
      }
    }

    console.log("微信退款API调用结果:", refundResponse);

    if (
      refundResponse.return_code === "SUCCESS" &&
      refundResponse.result_code === "SUCCESS"
    ) {
      if (refundResponse.refund_status === "NO_REFUND") {
        // 免费任务，直接取消，不记录退款
        const taskTableName = `tasks_community_${communityId}`;
        await sequelize.query(
          `UPDATE ${taskTableName} SET status = "cancelled" WHERE id = ?`,
          {
            replacements: [taskId],
            type: sequelize.QueryTypes.UPDATE,
          }
        );

        res.json({
          success: true,
          message: "订单已取消",
          data: {
            refundNo: null,
            refundAmount: 0,
            status: "cancelled",
          },
        });
      } else {
        // 付费任务，记录退款信息
        if (refundResponse.refund_status === "ALREADY_REFUNDED") {
          // 订单已经退款，直接记录并取消任务
          await sequelize.query(
            `INSERT INTO refunds (
              task_id, refund_no, amount, reason, status, 
              wechat_refund_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            {
              replacements: [
                taskId,
                refundNo,
                actualRefundAmount,
                refundReason || "用户取消订单",
                "success", // 设置为成功状态
                null, // 没有微信退款ID
              ],
              type: sequelize.QueryTypes.INSERT,
            }
          );

          // 更新任务状态和支付状态 - 使用分表
          const taskTableName = `tasks_community_${communityId}`;
          await sequelize.query(
            `UPDATE ${taskTableName} SET status = "cancelled", paymentStatus = "refunded" WHERE id = ?`,
            {
              replacements: [taskId],
              type: sequelize.QueryTypes.UPDATE,
            }
          );

          // 发送系统消息给发布者
          try {
            const SystemMessageService = require("../services/systemMessageService");
            const taskTableName = `tasks_community_${communityId}`;
            const task = await sequelize.query(
              `SELECT id, title, publisherId FROM ${taskTableName} WHERE id = ?`,
              {
                replacements: [taskId],
                type: sequelize.QueryTypes.SELECT,
              }
            );

            if (task && task.length > 0) {
              const taskData = task[0];
              await SystemMessageService.sendOrderCancelled(
                taskData.publisherId,
                taskData,
                refundReason || "用户取消订单"
              );
              console.log(
                `✅ [refund/apply] 已发送订单取消系统消息给发布者 ${taskData.publisherId}`
              );
            }
          } catch (error) {
            console.error("❌ [refund/apply] 发送系统消息给发布者失败:", error);
          }

          res.json({
            success: true,
            message: "订单已退款，取消成功",
            data: {
              refundNo,
              refundAmount: actualRefundAmount,
              status: "success",
            },
          });
        } else {
          // 正常退款流程
          await sequelize.query(
            `INSERT INTO refunds (
              task_id, refund_no, amount, reason, status, 
              wechat_refund_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            {
              replacements: [
                taskId,
                refundNo,
                actualRefundAmount,
                refundReason || "用户取消订单",
                "processing", // 设置为处理中状态
                refundResponse.refund_id,
              ],
              type: sequelize.QueryTypes.INSERT,
            }
          );

          // 更新任务状态和支付状态 - 使用分表
          const taskTableName = `tasks_community_${communityId}`;
          await sequelize.query(
            `UPDATE ${taskTableName} SET status = "cancelled", paymentStatus = "refunded" WHERE id = ?`,
            {
              replacements: [taskId],
              type: sequelize.QueryTypes.UPDATE,
            }
          );

          // 发送系统消息给发布者
          try {
            const SystemMessageService = require("../services/systemMessageService");
            const taskTableName = `tasks_community_${communityId}`;
            const task = await sequelize.query(
              `SELECT id, title, publisherId FROM ${taskTableName} WHERE id = ?`,
              {
                replacements: [taskId],
                type: sequelize.QueryTypes.SELECT,
              }
            );

            if (task && task.length > 0) {
              const taskData = task[0];
              await SystemMessageService.sendOrderCancelled(
                taskData.publisherId,
                taskData,
                refundReason || "用户取消订单"
              );
              console.log(
                `✅ [refund/apply] 已发送订单取消系统消息给发布者 ${taskData.publisherId}`
              );
            }
          } catch (error) {
            console.error("❌ [refund/apply] 发送系统消息给发布者失败:", error);
          }

          res.json({
            success: true,
            message:
              "退款申请已提交，正在处理中。退款将在1-3个工作日内到账微信零钱",
            data: {
              refundNo,
              refundAmount: actualRefundAmount,
              status: "processing",
            },
          });
        }
      }
    } else {
      // 退款失败
      await sequelize.query(
        `INSERT INTO refunds (
          task_id, refund_no, amount, reason, status, 
          error_msg, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        {
          replacements: [
            taskId,
            refundNo,
            actualRefundAmount,
            refundReason || "用户取消订单",
            "failed",
            refundResponse.err_code_des || "退款失败",
          ],
          type: sequelize.QueryTypes.INSERT,
        }
      );

      res.status(400).json({
        success: false,
        message: refundResponse.err_code_des || "退款处理失败",
      });
    }
  } catch (error) {
    console.error("退款处理失败:", error);
    res.status(500).json({
      success: false,
      message: "退款处理失败，请稍后重试",
    });
  }
});

// 查询退款状态
router.get("/status/:refundNo", async (req, res) => {
  try {
    const { refundNo } = req.params;

    // 查询退款记录
    const [refund] = await sequelize.query(
      "SELECT * FROM refunds WHERE refund_no = ?",
      {
        replacements: [refundNo],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "退款记录不存在",
      });
    }

    const refundData = refund;

    // 如果退款状态是处理中，查询微信支付退款状态
    if (refundData.status === "processing") {
      console.log("退款状态为处理中，查询微信支付退款状态");
      try {
        const queryResult = await wechatPayRefundService.queryRefund(
          refundData.refund_no
        );
        if (queryResult.success) {
          // 更新本地退款状态
          await sequelize.query(
            "UPDATE refunds SET status = ?, updated_at = NOW() WHERE refund_no = ?",
            {
              replacements: [queryResult.refund_status, refundData.refund_no],
              type: sequelize.QueryTypes.UPDATE,
            }
          );
          refundData.status = queryResult.refund_status;
        }
      } catch (error) {
        console.error("查询微信支付退款状态失败:", error);
      }
    }

    res.json({
      success: true,
      data: refundData,
    });
  } catch (error) {
    console.error("查询退款状态失败:", error);
    res.status(500).json({
      success: false,
      message: "查询退款状态失败",
    });
  }
});

// 获取任务退款记录
router.get("/order/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const [refunds] = await sequelize.query(
      "SELECT * FROM refunds WHERE task_id = ? ORDER BY created_at DESC",
      {
        replacements: [taskId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      data: refunds,
    });
  } catch (error) {
    console.error("获取退款记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取退款记录失败",
    });
  }
});

// 获取所有退款记录（后台管理用）
router.get("/all", async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "";
    let replacements = [];

    // 状态筛选
    if (status) {
      whereClause += " WHERE status = ?";
      replacements.push(status);
    }

    // 搜索筛选
    if (search) {
      const searchWhere =
        " WHERE refund_no LIKE ? OR task_id LIKE ? OR reason LIKE ?";
      if (whereClause) {
        whereClause +=
          " AND (refund_no LIKE ? OR task_id LIKE ? OR reason LIKE ?)";
      } else {
        whereClause = searchWhere;
      }
      const searchTerm = `%${search}%`;
      replacements.push(searchTerm, searchTerm, searchTerm);
    }

    // 查询总数
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total FROM refunds${whereClause}`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // 查询数据
    const refunds = await sequelize.query(
      `SELECT * FROM refunds${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      data: refunds,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit),
      },
    });
  } catch (error) {
    console.error("获取所有退款记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取退款记录失败",
    });
  }
});

module.exports = router;
