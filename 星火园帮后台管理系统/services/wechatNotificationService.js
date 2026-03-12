const axios = require("axios");
const config = require("../config/wechat.config");

/**
 * 微信消息推送服务
 * 用于发送任务相关的消息通知
 */
class WechatNotificationService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * 获取微信小程序Access Token
   */
  async getAccessToken() {
    try {
      // 检查token是否还有效
      if (
        this.accessToken &&
        this.tokenExpiry &&
        Date.now() < this.tokenExpiry
      ) {
        return this.accessToken;
      }

      const response = await axios.get(
        "https://api.weixin.qq.com/cgi-bin/token",
        {
          params: {
            grant_type: "client_credential",
            appid: config.appId,
            secret: config.appSecret,
          },
        }
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        // 提前5分钟过期
        this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

        return this.accessToken;
      } else {
        throw new Error(
          `获取Access Token失败: ${JSON.stringify(response.data)}`
        );
      }
    } catch (error) {
      console.error("获取Access Token出错:", error);
      throw error;
    }
  }

  /**
   * 发送订阅消息
   * @param {string} openid - 用户openid
   * @param {string} templateId - 模板ID
   * @param {object} data - 消息数据
   * @param {string} page - 跳转页面
   */
  async sendSubscribeMessage(openid, templateId, data, page = "") {
    try {
      // 验证必要参数
      if (!openid || !templateId || !data) {
        console.error("❌ 订阅消息参数不完整:", {
          openid: !!openid,
          templateId: !!templateId,
          data: !!data,
        });
        return false;
      }

      const accessToken = await this.getAccessToken();

      const messageData = {
        touser: openid,
        template_id: templateId,
        page: page,
        data: data,
        miniprogram_state: config.isDev ? "trial" : "formal",
      };

      console.log("📤 发送订阅消息:", {
        openid: openid.substring(0, 10) + "...",
        templateId,
        data,
        page,
      });

      console.log("📋 消息数据详情:", JSON.stringify(messageData, null, 2));
      console.log("🔍 模板ID验证:", {
        templateId,
        isValid: templateId && templateId.length > 10,
        isConfigured: !templateId.includes("YOUR_"),
      });

      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
        messageData
      );

      if (response.data.errcode === 0) {
        console.log("✅ 订阅消息发送成功");
        // 记录发送成功的统计
        this.recordNotificationStats(templateId, "success");
        return true;
      } else {
        // 处理特定错误码
        if (response.data.errcode === 43101) {
          console.warn(
            "⚠️ 用户未授权订阅消息或拒绝接收:",
            response.data.errmsg
          );
        } else if (response.data.errcode === 40037) {
          console.warn("⚠️ 模板ID无效:", response.data.errmsg);
        } else if (response.data.errcode === 41030) {
          console.warn("⚠️ 页面路径无效:", response.data.errmsg);
        } else if (response.data.errcode === 47003) {
          console.error("❌ 参数格式错误:", response.data.errmsg);
          console.error("检查数据格式:", data);
        } else if (response.data.errcode === 43107) {
          console.warn("⚠️ 订阅消息能力被封禁:", response.data.errmsg);
        } else if (response.data.errcode === 43108) {
          console.warn("⚠️ 并发下发消息给同一个粉丝:", response.data.errmsg);
        } else if (response.data.errcode === 45168) {
          console.warn("⚠️ 命中敏感词:", response.data.errmsg);
        } else {
          console.error("❌ 订阅消息发送失败:", response.data);
        }
        // 记录发送失败的统计
        this.recordNotificationStats(
          templateId,
          "failed",
          response.data.errcode
        );
        return false;
      }
    } catch (error) {
      console.error("发送订阅消息出错:", error);
      // 记录发送错误的统计
      this.recordNotificationStats(templateId, "error");
      return false;
    }
  }

  /**
   * 记录订阅消息发送统计
   * @param {string} templateId - 模板ID
   * @param {string} status - 发送状态 (success, failed, error)
   * @param {number} errorCode - 错误码（可选）
   */
  recordNotificationStats(templateId, status, errorCode = null) {
    try {
      // 这里可以添加统计逻辑，比如记录到数据库或Redis
      console.log(
        `📊 订阅消息统计: ${templateId} - ${status}${
          errorCode ? ` (错误码: ${errorCode})` : ""
        }`
      );

      // 可以在这里添加更详细的统计逻辑
      // 例如：记录到数据库、发送到监控系统等
    } catch (error) {
      console.error("记录订阅消息统计失败:", error);
    }
  }

  /**
   * 发送任务发布通知给附近的接单员
   * @param {object} task - 任务信息
   * @param {array} nearbyRiders - 附近的接单员列表
   */
  async notifyTaskPublished(task, nearbyRiders = []) {
    console.log("🚀 [notifyTaskPublished] 开始发送任务发布通知:", {
      taskId: task.id,
      taskType: task.taskType,
      riderCount: nearbyRiders.length,
    });

    // 使用配置文件中的模板ID
    const templateId = config.templates.newTask;

    // 如果没有配置模板ID，记录日志但不报错
    if (!templateId || templateId.includes("YOUR_")) {
      console.log(
        "❌ [notifyTaskPublished] 未配置新任务通知模板ID，跳过消息推送"
      );
      return;
    }

    console.log("✅ [notifyTaskPublished] 使用新任务通知模板ID:", templateId);

    if (nearbyRiders.length === 0) {
      console.log("⚠️ [notifyTaskPublished] 没有附近的接单员，跳过推送");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const rider of nearbyRiders) {
      if (rider.openid) {
        console.log(
          `📤 [notifyTaskPublished] 向接单员 ${rider.nickname} (${rider.id}) 发送通知`
        );

        // 根据实际模板字段格式化数据
        const messageData = {
          character_string1: {
            value: this.formatCharacterString(
              task.out_trade_no || task.id.toString()
            ),
          }, // 订单编号
          amount2: {
            value: this.formatAmount(task.reward || task.rewardAmount || 0),
          }, // 订单金额
          time3: { value: this.formatTime(new Date()) }, // 发起时间
          thing4: {
            value: this.formatThing(task.locationText || "未知地点"),
          }, // 收货地址
          thing5: {
            value: this.formatThing(task.taskType || "校园跑腿"),
          }, // 订单类型
        };

        // 使用与订阅消息中相同的订单号，确保一致性
        const orderNumber = task.out_trade_no || task.id.toString();
        const result = await this.sendSubscribeMessage(
          rider.openid,
          templateId,
          messageData,
          `/subpages/task/task_detail/task_detail?orderNumber=${orderNumber}`
        );

        if (result) {
          successCount++;
        } else {
          failCount++;
          console.log(`❌ [notifyTaskPublished] 向 ${rider.nickname} 发送失败`);
        }

        // 避免频繁调用API
        await this.sleep(100);
      } else {
        console.log(
          `⚠️ [notifyTaskPublished] 接单员 ${rider.nickname} (${rider.id}) 没有openid，跳过`
        );
      }
    }

    console.log(
      `📊 [notifyTaskPublished] 推送完成: 成功 ${successCount}, 失败 ${failCount}, 总计 ${nearbyRiders.length}`
    );
  }

  /**
   * 发送任务接取通知给发布者
   * @param {object} task - 任务信息
   * @param {object} acceptor - 接单员信息
   */
  async notifyTaskAccepted(task, acceptor) {
    console.log("🤝 [notifyTaskAccepted] 开始发送任务接取通知:", {
      taskId: task.id,
      publisherId: task.publisherId,
      acceptorId: acceptor.id,
      acceptorName: acceptor.nickname,
    });

    // 获取发布者信息
    const { User } = require("../models");
    const publisher = task.publisher || (await User.findByPk(task.publisherId));
    if (!publisher) {
      console.log("❌ [notifyTaskAccepted] 发布者信息不存在，跳过通知");
      return;
    }

    if (!publisher.openid) {
      console.log(
        `⚠️ [notifyTaskAccepted] 发布者 ${publisher.nickname} (${publisher.id}) 未绑定微信openid，跳过通知`
      );
      return;
    }

    console.log(
      `✅ [notifyTaskAccepted] 发布者 ${publisher.nickname} (${publisher.id}) 有openid，准备发送通知`
    );

    const templateId = config.templates.taskAccepted;

    if (!templateId || templateId.includes("YOUR_")) {
      console.log("未配置任务接取通知模板ID，跳过消息推送");
      return;
    }

    console.log("使用任务接取通知模板ID:", templateId);

    const messageData = {
      character_string1: {
        value: this.formatCharacterString(
          task.out_trade_no || task.id.toString()
        ),
      }, // 订单号
      amount2: {
        value: this.formatAmount(task.reward || task.rewardAmount || 0),
      }, // 订单金额
      thing12: {
        value: this.formatThing(task.taskType || "校园跑腿"),
      }, // 任务名称
      thing13: {
        value: this.formatThing(acceptor.nickname || "接单员"),
      }, // 接单人员
      time14: { value: this.formatTime(new Date()) }, // 接单时间
    };

    console.log("📋 接单通知数据:", {
      publisherOpenid: publisher.openid.substring(0, 10) + "...",
      taskId: task.id,
      acceptorName: acceptor.nickname,
      messageData,
    });

    // 使用与订阅消息中相同的订单号，确保一致性
    const orderNumber = task.out_trade_no || task.id.toString();
    console.log("🔗 [notifyTaskAccepted] 构建跳转链接:", {
      taskId: task.id,
      orderNumber: orderNumber,
      taskIdType: typeof task.id,
      jumpUrl: `/subpages/task/task_detail/task_detail?orderNumber=${orderNumber}`,
    });

    const result = await this.sendSubscribeMessage(
      publisher.openid,
      templateId,
      messageData,
      `/subpages/task/task_detail/task_detail?orderNumber=${orderNumber}`
    );

    if (result) {
      console.log("✅ 任务接单通知发送成功");
    } else {
      console.warn("⚠️ 任务接单通知发送失败");
    }
  }

  /**
   * 发送任务送达通知
   * @param {object} task - 任务信息
   * @param {object} acceptor - 接单员信息
   */
  async notifyTaskDelivered(task, acceptor) {
    console.log("📦 [notifyTaskDelivered] 开始发送任务送达通知:", {
      taskId: task.id,
      publisherId: task.publisherId,
      acceptorId: acceptor?.id,
      acceptorName: acceptor?.nickname,
    });

    const { User } = require("../models");
    const publisher = task.publisher || (await User.findByPk(task.publisherId));
    if (!publisher) {
      console.log("❌ [notifyTaskDelivered] 发布者信息不存在，跳过通知");
      return;
    }

    if (!publisher.openid) {
      console.log(
        `⚠️ [notifyTaskDelivered] 发布者 ${publisher.nickname} (${publisher.id}) 未绑定微信openid，跳过通知`
      );
      return;
    }

    console.log(
      `✅ [notifyTaskDelivered] 发布者 ${publisher.nickname} (${publisher.id}) 有openid，准备发送通知`
    );

    const templateId = config.templates.taskDelivered;
    if (!templateId || templateId.includes("YOUR_")) {
      console.log(
        "❌ [notifyTaskDelivered] 未配置任务送达通知模板ID，跳过消息推送"
      );
      return;
    }

    console.log("✅ [notifyTaskDelivered] 使用任务送达通知模板ID:", templateId);

    const messageData = {
      character_string1: {
        value: this.formatCharacterString(
          task.out_trade_no || task.id.toString()
        ),
      }, // 订单编号
      time2: { value: this.formatTime(new Date()) }, // 送达时间
      thing3: {
        value: this.formatThing("您的订单已送达，请及时确认"),
      }, // 备注
      thing4: {
        value: this.formatThing(task.taskType || "校园跑腿"),
      }, // 订单类型
      time6: { value: this.formatTime(new Date()) }, // 完成时间
    };

    console.log(
      "📋 [notifyTaskDelivered] 消息数据:",
      JSON.stringify(messageData, null, 2)
    );

    try {
      // 使用与订阅消息中相同的订单号，确保一致性
      const orderNumber = task.out_trade_no || task.id.toString();
      const result = await this.sendSubscribeMessage(
        publisher.openid,
        templateId,
        messageData,
        `/subpages/task/task_detail/task_detail?orderNumber=${orderNumber}`
      );

      if (result) {
        console.log("✅ [notifyTaskDelivered] 任务送达通知发送成功");
      } else {
        console.warn("⚠️ [notifyTaskDelivered] 任务送达通知发送失败");
      }
    } catch (error) {
      console.error("❌ [notifyTaskDelivered] 发送任务送达通知失败:", error);
    }
  }

  /**
   * 发送任务完成通知
   * @param {object} task - 任务信息
   * @param {string} notifyType - 通知类型: 'publisher' | 'acceptor'
   */
  async notifyTaskCompleted(task, notifyType = "both") {
    console.log("✅ [notifyTaskCompleted] 开始发送任务完成通知:", {
      taskId: task.id,
      notifyType,
      publisherId: task.publisher?.id,
      acceptorId: task.acceptor?.id,
      publisherOpenid: task.publisher?.openid,
      acceptorOpenid: task.acceptor?.openid,
    });

    const templateId = config.templates.taskCompleted;

    if (!templateId || templateId.includes("YOUR_")) {
      console.log(
        "❌ [notifyTaskCompleted] 未配置任务完成通知模板ID，跳过消息推送"
      );
      return;
    }

    console.log("✅ [notifyTaskCompleted] 使用任务完成通知模板ID:", templateId);

    // 通知发布者
    if (notifyType === "publisher" || notifyType === "both") {
      console.log("📤 [notifyTaskCompleted] 准备通知发布者");
      const publisher = task.publisher;
      if (publisher && publisher.openid) {
        console.log(
          `✅ [notifyTaskCompleted] 发布者 ${publisher.nickname} (${publisher.id}) 有openid，发送通知`
        );

        // 借物品任务使用acceptorFee字段，其他任务使用rewardAmount
        let displayAmount = 0;
        if (task.taskType === "借物品") {
          displayAmount = task.acceptorFee || 0;
        } else {
          displayAmount = task.reward || task.rewardAmount || 0;
        }

        const messageData = {
          character_string1: {
            value: this.formatCharacterString(
              task.out_trade_no || task.id.toString()
            ),
          }, // 订单号
          amount2: {
            value: this.formatAmount(displayAmount),
          }, // 订单金额
          time3: { value: this.formatTime(new Date()) }, // 完成时间
          phrase7: {
            value: this.formatThing("订单已完成"),
          }, // 订单状态
          thing5: {
            value: this.formatThing(task.taskType || "校园跑腿"),
          }, // 订单类型
        };

        console.log(
          "📋 [notifyTaskCompleted] 发布者消息数据:",
          JSON.stringify(messageData, null, 2)
        );

        try {
          // 使用与订阅消息中相同的订单号，确保一致性
          const orderNumber = task.out_trade_no || task.id.toString();
          await this.sendSubscribeMessage(
            publisher.openid,
            templateId,
            messageData,
            `/subpages/task/task_detail/task_detail?orderNumber=${orderNumber}`
          );
        } catch (error) {
          console.error("❌ [notifyTaskCompleted] 发布者通知发送失败:", error);
        }
      } else {
        console.log(
          `⚠️ [notifyTaskCompleted] 发布者 ${
            publisher?.nickname || "unknown"
          } 没有openid，跳过通知`
        );
      }
    }

    // 通知接单员
    console.log(
      `🔍 [notifyTaskCompleted] 检查是否需要通知接单员，notifyType: ${notifyType}`
    );
    if (notifyType === "acceptor" || notifyType === "both") {
      console.log("📤 [notifyTaskCompleted] 准备通知接单员");
      const acceptor = task.acceptor;
      console.log(`🔍 [notifyTaskCompleted] 接单员信息:`, {
        hasAcceptor: !!acceptor,
        acceptorId: acceptor?.id,
        acceptorNickname: acceptor?.nickname,
        acceptorOpenid: acceptor?.openid,
      });
      if (acceptor && acceptor.openid) {
        console.log(
          `✅ [notifyTaskCompleted] 接单员 ${acceptor.nickname} (${acceptor.id}) 有openid，发送通知`
        );

        // 借物品任务使用acceptorFee字段，其他任务使用rewardAmount
        let displayAmount = 0;
        if (task.taskType === "借物品") {
          displayAmount = task.acceptorFee || 0;
        } else {
          displayAmount = task.reward || task.rewardAmount || 0;
        }

        const messageData = {
          character_string1: {
            value: this.formatCharacterString(
              task.out_trade_no || task.id.toString()
            ),
          }, // 订单号
          amount2: {
            value: this.formatAmount(displayAmount),
          }, // 订单金额
          time3: { value: this.formatTime(new Date()) }, // 完成时间
          phrase7: {
            value: this.formatThing("订单已完成"),
          }, // 订单状态
          thing5: {
            value: this.formatThing(task.taskType || "校园跑腿"),
          }, // 订单类型
        };

        console.log(
          "📋 [notifyTaskCompleted] 接单员消息数据:",
          JSON.stringify(messageData, null, 2)
        );

        try {
          await this.sendSubscribeMessage(
            acceptor.openid,
            templateId,
            messageData,
            `/pages/profile/profile`
          );
        } catch (error) {
          console.error("❌ [notifyTaskCompleted] 接单员通知发送失败:", error);
        }
      } else {
        console.log(
          `⚠️ [notifyTaskCompleted] 接单员 ${
            acceptor?.nickname || "unknown"
          } 没有openid，跳过通知`
        );
      }
    } else {
      console.log(
        `🚫 [notifyTaskCompleted] 不需要通知接单员，notifyType: ${notifyType}`
      );
    }

    console.log("🎯 [notifyTaskCompleted] 任务完成通知处理完毕");
  }

  /**
   * 延时函数
   * @param {number} ms - 延时毫秒数
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 格式化事物类型数据 (thing.DATA)
   * @param {string} text - 原始文本
   * @returns {string} 格式化后的文本，最多20个字符
   */
  formatThing(text) {
    if (!text) return "";
    // 事物类型限制：20个以内字符，可汉字、数字、字母或符号组合
    const formatted = String(text).trim();
    return formatted.length > 20
      ? formatted.substring(0, 17) + "..."
      : formatted;
  }

  /**
   * 格式化金额类型数据 (amount.DATA)
   * @param {number} amount - 金额数值
   * @returns {string} 格式化后的金额，格式：¥10.00
   */
  formatAmount(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "¥0";
    }
    // 金额类型限制：1个币种符号+10位以内纯数字，可带小数，结尾可带"元"
    const numAmount = Number(amount);
    return `¥${numAmount.toFixed(2)}`;
  }

  /**
   * 格式化时间类型数据 (time.DATA)
   * @param {Date} date - 日期对象
   * @returns {string} 格式化后的时间，格式：HH:MM
   */
  formatTime(date) {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    // 时间类型限制：24小时制时间格式，支持HH:MM或HH:MM:SS
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  /**
   * 格式化日期类型数据 (date.DATA)
   * @param {Date} date - 日期对象
   * @returns {string} 格式化后的日期，格式：2024年1月1日
   */
  formatDate(date) {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    // 日期类型限制：年月日格式
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }

  /**
   * 格式化姓名类型数据 (name.DATA)
   * @param {string} name - 姓名
   * @returns {string} 格式化后的姓名，最多10个汉字
   */
  formatName(name) {
    if (!name) return "用户";
    // 姓名类型限制：10个以内纯汉字或20个以内纯字母或符号
    const formatted = String(name).trim();
    return formatted.length > 10 ? formatted.substring(0, 10) : formatted;
  }

  /**
   * 格式化字符串类型数据 (character_string.DATA)
   * @param {string} text - 原始文本
   * @returns {string} 格式化后的文本，最多32个字符
   */
  formatCharacterString(text) {
    if (!text) return "";
    // 字符串类型限制：32位以内数字、字母或符号，可数字、字母或符号组合
    const formatted = String(text).trim();
    return formatted.length > 32
      ? formatted.substring(0, 29) + "..."
      : formatted;
  }

  /**
   * 获取附近的接单员
   * @param {object} task - 任务信息
   * @returns {array} 附近的接单员列表
   */
  async getNearbyRiders(task) {
    try {
      // 这里应该根据任务地点查找附近的接单员
      // 暂时返回所有活跃的接单员作为示例
      const { User } = require("../models");

      const riders = await User.findAll({
        where: {
          riderApplicationStatus: "approved",
          // 可以添加更多条件，如最近活跃时间等
        },
        attributes: ["id", "nickname", "openid"],
        limit: 20, // 限制推送数量
      });

      return riders;
    } catch (error) {
      console.error("获取附近接单员失败:", error);
      return [];
    }
  }
}

module.exports = new WechatNotificationService();
