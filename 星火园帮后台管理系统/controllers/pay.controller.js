const WechatPay = require("wechatpay-node-v3");
const fs = require("fs");
const db = require("../models");
const User = db.User;
const crypto = require("crypto");
const config = require("../config/server.config.js"); // 新增：假设配置文件已包含相关字段

const appid = config.WECHAT_APPID;
const mchid = config.WECHAT_MCHID;
const apiv3Key = config.WECHAT_APIv3KEY;
const publicKeyPath = config.WECHAT_PUBLIC_KEY_PATH;
const privateKeyPath = config.WECHAT_PRIVATE_KEY_PATH;
const serial = config.WECHAT_SERIAL;

// 只读取一次密钥文件
const publicKey = fs.readFileSync(publicKeyPath);
const privateKey = fs.readFileSync(privateKeyPath);

const pay = new WechatPay({
  mchid: mchid,
  appid: appid,
  publicKey: publicKey, // 微信平台证书路径
  privateKey: privateKey, // 商户私钥路径
  serial: serial,
  apiv3Key: apiv3Key,
});

// 微信小程序统一下单
exports.unifiedOrder = async (req, res, next) => {
  const { amount, description, taskId, paymentType, borrowInfo } = req.body;
  const userId = req.userId;
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "支付金额无效" });
  }
  try {
    // 1. 获取用户openid
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: "用户不存在" });
    }

    if (!user.openid) {
      return res.status(400).json({
        message: "用户openid不存在，请重新登录获取",
        error: "MISSING_OPENID",
      });
    }

    // 检查openid格式是否正确（微信openid通常是28位字符串）
    if (user.openid.startsWith("wx_") || user.openid.length < 20) {
      console.error("支付失败：用户openid格式不正确", {
        userId: user.id,
        nickname: user.nickname,
        openid: user.openid,
        openidLength: user.openid.length,
      });

      return res.status(400).json({
        message: "支付失败：用户身份验证异常，请重新登录",
        error: "INVALID_OPENID_FORMAT",
        detail: "系统检测到用户身份信息不完整，请退出后重新登录微信小程序",
        currentOpenid: user.openid,
      });
    }

    console.log("支付用户信息:", {
      userId: user.id,
      nickname: user.nickname,
      openid: user.openid,
      openidLength: user.openid.length,
    });
    const out_trade_no =
      "ORDER" + Date.now() + Math.floor(Math.random() * 10000);

    // 如果是借物品任务，需要创建支付记录
    if (paymentType === "borrow_item") {
      if (taskId) {
        // 借出模式：已有任务，更新支付信息
        console.log(`[unifiedOrder] 借出模式借物品任务支付，任务ID: ${taskId}`);

        // 从分表中查找任务
        const communities = await db.Community.findAll({
          attributes: ["id", "name"],
        });

        let task = null;
        let communityId = null;

        for (const community of communities) {
          try {
            const tableName = `tasks_community_${community.id}`;
            const tasks = await db.sequelize.query(
              `SELECT * FROM ${tableName} WHERE id = ?`,
              {
                replacements: [taskId],
                type: db.sequelize.QueryTypes.SELECT,
              }
            );

            if (tasks.length > 0) {
              task = tasks[0];
              communityId = community.id;
              break;
            }
          } catch (error) {
            console.error(`查询分表 ${tableName} 失败:`, error);
          }
        }

        if (task) {
          // 更新分表中的任务支付信息
          const tableName = `tasks_community_${communityId}`;
          await db.sequelize.query(
            `UPDATE ${tableName} SET out_trade_no = ?, paymentStatus = ? WHERE id = ?`,
            {
              replacements: [out_trade_no, "pending", taskId],
              type: db.sequelize.QueryTypes.UPDATE,
            }
          );
          console.log(`[unifiedOrder] 已更新任务 ${taskId} 的支付信息`);
        }
      } else {
        // 借进模式：还没有任务，创建临时支付记录
        console.log(`[unifiedOrder] 借进模式借物品任务支付，创建临时支付记录`);
        // 将支付信息存储到用户信息中，等任务创建时使用
        const user = await db.User.findByPk(userId);
        if (user) {
          user.tempPaymentInfo = JSON.stringify({
            out_trade_no,
            paymentType: "borrow_item",
            borrowInfo,
            amount,
            description,
            createdAt: new Date(),
          });
          await user.save();
          console.log(`[unifiedOrder] 已保存用户 ${userId} 的临时支付信息`);
        }
      }
    }

    const result = await pay.transactions_jsapi({
      description: description || "星火园帮任务赏金",
      out_trade_no,
      amount: {
        total: Math.round(amount * 100), // 单位分
        currency: "CNY",
      },
      payer: {
        openid: user.openid,
      },
      notify_url: "https://xinghuoyuanbang.top/campushelper/api/v1/pay/notify",
    });
    console.log("微信支付下单返回", result);
    // 兼容微信支付返回结构
    let prepay_id;
    if (result.prepay_id) {
      prepay_id = result.prepay_id;
    } else if (result.data && result.data.package) {
      // result.data.package 形如 'prepay_id=xxxx'
      prepay_id = result.data.package.replace("prepay_id=", "");
    }
    if (!prepay_id) {
      return res
        .status(500)
        .json({ message: "微信支付下单失败", wxResult: result });
    }
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString("hex");
    const pkg = `prepay_id=${prepay_id}`;
    const signType = "RSA";
    const message = `${appid}\n${timeStamp}\n${nonceStr}\n${pkg}\n`;
    const paySign = crypto
      .sign("sha256", Buffer.from(message), {
        key: privateKey, // 商户私钥路径
        padding: crypto.constants.RSA_PKCS1_PADDING,
      })
      .toString("base64");
    const paymentParams = {
      appId: appid,
      timeStamp,
      nonceStr,
      package: pkg,
      signType,
      paySign,
    };
    return res.json({ paymentParams, out_trade_no });
  } catch (err) {
    console.error("微信统一下单失败:", err);
    res.status(500).json({ message: "微信支付下单失败", error: err.message });
  }
};

// 微信支付退款接口
exports.refund = async (req, res) => {
  const { out_trade_no, out_refund_no, refund, total } = req.body;
  try {
    const result = await pay.refund.apply({
      out_trade_no, // 原支付订单号
      out_refund_no, // 退款单号
      reason: "用户申请退款",
      notify_url:
        "https://xinghuoyuanbang.top/campushelper/api/v1/pay/refund-notify",
      amount: {
        refund: refund, // 退款金额（分）
        total: total, // 原订单金额（分）
        currency: "CNY",
      },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "退款失败", error: err.message });
  }
};

// 微信支付回调（支付成功通知）
exports.notify = async (req, res) => {
  try {
    const notifyData = req.body;
    console.log(
      "[支付回调] apiv3Key长度:",
      apiv3Key.length,
      "apiv3Key前后:",
      apiv3Key.slice(0, 4),
      apiv3Key.slice(-4)
    );
    console.log("[支付回调] resource:", JSON.stringify(notifyData.resource));
    // 1. 解密微信推送的支付结果
    const resource = notifyData.resource;
    if (!resource) throw new Error("缺少resource字段");
    // 解密算法：AES-256-GCM
    // 直接用顶部的apiv3Key
    function aesGcmDecrypt(key, associatedData, nonce, ciphertext) {
      try {
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce);

        // 微信支付回调的认证标签长度可能不是固定的16字节
        // 需要根据实际的ciphertext长度动态计算
        const cipherBuffer = Buffer.from(ciphertext, "base64");
        const authTagLength = 16; // AES-GCM标准认证标签长度

        if (cipherBuffer.length < authTagLength) {
          throw new Error("密文长度不足，无法提取认证标签");
        }

        const authTag = cipherBuffer.slice(-authTagLength);
        const encryptedData = cipherBuffer.slice(0, -authTagLength);

        decipher.setAuthTag(authTag);

        if (associatedData) {
          decipher.setAAD(Buffer.from(associatedData, "utf8"));
        }

        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString("utf8");
      } catch (error) {
        console.error("AES-GCM解密失败:", error);
        throw new Error(`解密失败: ${error.message}`);
      }
    }
    const key = Buffer.from(apiv3Key, "utf8");
    const associatedData = resource.associated_data || "";
    const nonce = resource.nonce;
    const ciphertext = resource.ciphertext;
    // 微信官方推荐用 pay.decipher_gcm，但 node-v3 版本有兼容性问题时可用自定义
    let decrypted;
    try {
      decrypted = pay.decipher_gcm(associatedData, nonce, ciphertext, apiv3Key);
    } catch (e) {
      // 兼容性兜底
      decrypted = aesGcmDecrypt(key, associatedData, nonce, ciphertext);
    }
    const payResult = JSON.parse(decrypted);
    const { out_trade_no, transaction_id, amount } = payResult;
    // 2. 查找本地订单并更新状态
    if (out_trade_no) {
      // 从分表中查找任务
      const communities = await db.Community.findAll({
        attributes: ["id", "name"],
      });

      let task = null;
      let communityId = null;

      for (const community of communities) {
        try {
          const tableName = `tasks_community_${community.id}`;
          const tasks = await db.sequelize.query(
            `SELECT * FROM ${tableName} WHERE out_trade_no = ?`,
            {
              replacements: [out_trade_no],
              type: db.sequelize.QueryTypes.SELECT,
            }
          );

          if (tasks.length > 0) {
            task = tasks[0];
            communityId = community.id;
            break;
          }
        } catch (error) {
          console.error(`查询分表 ${tableName} 失败:`, error);
        }
      }

      if (task) {
        // 更新分表中的任务支付状态
        const tableName = `tasks_community_${communityId}`;
        await db.sequelize.query(
          `UPDATE ${tableName} SET paymentStatus = ?, transaction_id = ? WHERE out_trade_no = ?`,
          {
            replacements: ["paid", transaction_id || null, out_trade_no],
            type: db.sequelize.QueryTypes.UPDATE,
          }
        );
        console.log(`[支付回调] 任务订单 ${out_trade_no} 支付状态已更新`);
      } else {
        // 如果不是任务订单，尝试查找二手市集订单
        const shardingHelper = require("../services/shardingHelper");
        let marketProduct = null;
        let marketCommunityId = null;

        // 在所有社区的市场表中查找
        for (const community of communities) {
          try {
            const marketTableName = shardingHelper.getMarketTableName(community.id);
            const products = await db.sequelize.query(
              `SELECT * FROM ${marketTableName} WHERE out_trade_no = ?`,
              {
                replacements: [out_trade_no],
                type: db.sequelize.QueryTypes.SELECT,
              }
            );

            if (products.length > 0) {
              marketProduct = products[0];
              marketCommunityId = community.id;
              break;
            }
          } catch (error) {
            // 表不存在，继续查找下一个
            continue;
          }
        }

        if (marketProduct) {
          // 更新二手市集商品的支付状态（虽然商品表没有 paymentStatus 字段，但可以记录 transaction_id）
          const marketTableName = shardingHelper.getMarketTableName(marketCommunityId);
          await db.sequelize.query(
            `UPDATE ${marketTableName} SET updatedAt = NOW() WHERE out_trade_no = ?`,
            {
              replacements: [out_trade_no],
              type: db.sequelize.QueryTypes.UPDATE,
            }
          );
          console.log(`[支付回调] 二手市集订单 ${out_trade_no} 支付状态已确认`);
        } else {
          console.log(`[支付回调] 未找到订单 ${out_trade_no}（可能是其他类型订单）`);
        }
      }
    }
    // 3. 记录支付流水（可选）
    res.status(200).send({ code: "SUCCESS", message: "成功" });
  } catch (err) {
    console.error("支付回调处理失败:", err);
    res.status(500).send({ code: "FAIL", message: "失败" });
  }
};

// 微信退款回调
exports.refundNotify = async (req, res) => {
  try {
    const notifyData = req.body;
    console.log(
      "[退款回调] apiv3Key长度:",
      apiv3Key.length,
      "apiv3Key前后:",
      apiv3Key.slice(0, 4),
      apiv3Key.slice(-4)
    );
    console.log("[退款回调] resource:", JSON.stringify(notifyData.resource));
    const resource = notifyData.resource;
    if (!resource) throw new Error("缺少resource字段");
    // 直接用顶部的apiv3Key
    function aesGcmDecrypt(key, associatedData, nonce, ciphertext) {
      try {
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce);

        // 微信支付回调的认证标签长度可能不是固定的16字节
        // 需要根据实际的ciphertext长度动态计算
        const cipherBuffer = Buffer.from(ciphertext, "base64");
        const authTagLength = 16; // AES-GCM标准认证标签长度

        if (cipherBuffer.length < authTagLength) {
          throw new Error("密文长度不足，无法提取认证标签");
        }

        const authTag = cipherBuffer.slice(-authTagLength);
        const encryptedData = cipherBuffer.slice(0, -authTagLength);

        decipher.setAuthTag(authTag);

        if (associatedData) {
          decipher.setAAD(Buffer.from(associatedData, "utf8"));
        }

        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString("utf8");
      } catch (error) {
        console.error("AES-GCM解密失败:", error);
        throw new Error(`解密失败: ${error.message}`);
      }
    }
    const key = Buffer.from(apiv3Key, "utf8");
    const associatedData = resource.associated_data || "";
    const nonce = resource.nonce;
    const ciphertext = resource.ciphertext;
    let decrypted;
    try {
      decrypted = pay.decipher_gcm(associatedData, nonce, ciphertext, apiv3Key);
    } catch (e) {
      decrypted = aesGcmDecrypt(key, associatedData, nonce, ciphertext);
    }
    const refundResult = JSON.parse(decrypted);
    const { out_refund_no, refund_status } = refundResult;
    // 2. 查找本地退款单并更新状态
    // === 重要提示：如有退款表，需增加 out_refund_no 字段 ===
    // await Refund.update({ status: refund_status }, { where: { out_refund_no } });
    // 3. 记录退款流水（可选）
    res.status(200).send({ code: "SUCCESS", message: "成功" });
  } catch (err) {
    console.error("退款回调处理失败:", err);
    res.status(500).send({ code: "FAIL", message: "失败" });
  }
};
