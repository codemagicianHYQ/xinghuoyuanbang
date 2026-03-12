const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const config = require("../config/wechat.config");

/**
 * 微信消息推送验证和接收端点
 * 用于接收微信服务器的消息推送
 */

// GET请求用于验证服务器
router.get("/message", (req, res) => {
  console.log("收到微信验证请求:", req.query);

  const { signature, timestamp, nonce, echostr } = req.query;

  // 检查必要参数
  if (!signature || !timestamp || !nonce || !echostr) {
    console.log("❌ 缺少必要参数");
    return res.status(400).send("缺少必要参数");
  }

  // 验证签名
  if (verifySignature(signature, timestamp, nonce)) {
    res.send(echostr);
  } else {
    console.log("❌ 微信验证失败");
    res.status(403).send("验证失败");
  }
});

// POST请求用于接收消息推送
router.post("/message", (req, res) => {
  console.log("收到微信消息推送:", {
    query: req.query,
    body: req.body,
  });

  const { signature, timestamp, nonce, msg_signature, encrypt_type } =
    req.query;

  try {
    // 根据加密类型处理消息
    if (encrypt_type === "aes") {
      // 安全模式：加密消息
      if (
        !verifyMsgSignature(msg_signature, timestamp, nonce, req.body.Encrypt)
      ) {
        console.log("消息签名验证失败");
        return res.status(403).send("签名验证失败");
      }

      // 解密消息
      const decryptedMsg = decryptMessage(req.body.Encrypt);
      console.log("解密后的消息:", decryptedMsg);

      // 处理解密后的消息
      handleWechatMessage(decryptedMsg);
    } else {
      // 明文模式
      if (!verifySignature(signature, timestamp, nonce)) {
        console.log("明文消息签名验证失败");
        return res.status(403).send("签名验证失败");
      }

      // 处理明文消息
      handleWechatMessage(req.body);
    }

    // 回复成功
    res.send("success");
  } catch (error) {
    console.error("处理微信消息推送时出错:", error);
    res.status(500).send("处理失败");
  }
});

/**
 * 验证微信签名（明文模式）
 */
function verifySignature(signature, timestamp, nonce) {
  const token = config.messageToken || "YOUR_TOKEN_HERE";

  console.log("🔐 开始验证签名:", {
    token: token,
    timestamp: timestamp,
    nonce: nonce,
    signature: signature,
  });

  // 字典序排序
  const arr = [token, timestamp, nonce].sort();
  console.log("📝 排序后的数组:", arr);

  // 拼接字符串
  const str = arr.join("");
  console.log("🔗 拼接后的字符串:", str);

  // SHA1加密
  const sha1 = crypto.createHash("sha1");
  sha1.update(str);
  const result = sha1.digest("hex");

  console.log("🔍 签名验证结果:", {
    computed: result,
    received: signature,
    match: result === signature,
  });

  return result === signature;
}

/**
 * 验证消息签名（安全模式）
 */
function verifyMsgSignature(msg_signature, timestamp, nonce, encrypt) {
  const token = config.messageToken || "YOUR_TOKEN_HERE";

  // 字典序排序
  const arr = [token, timestamp, nonce, encrypt].sort();

  // 拼接字符串
  const str = arr.join("");

  // SHA1加密
  const sha1 = crypto.createHash("sha1");
  sha1.update(str);
  const result = sha1.digest("hex");

  console.log("消息签名验证:", {
    computed: result,
    received: msg_signature,
    match: result === msg_signature,
  });

  return result === msg_signature;
}

/**
 * 解密微信消息（安全模式）
 */
function decryptMessage(encryptedMsg) {
  try {
    const encodingAESKey =
      config.encodingAESKey || "YOUR_ENCODING_AES_KEY_HERE";
    const appId = config.appId;

    // AESKey = Base64_Decode(EncodingAESKey + "=")
    const aesKey = Buffer.from(encodingAESKey + "=", "base64");

    // Base64解码加密消息
    const encryptedBuffer = Buffer.from(encryptedMsg, "base64");

    // AES解密
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      aesKey,
      aesKey.slice(0, 16)
    );
    decipher.setAutoPadding(false);

    let decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    // 去除PKCS#7填充
    const pad = decrypted[decrypted.length - 1];
    decrypted = decrypted.slice(0, decrypted.length - pad);

    // 解析消息结构：random(16B) + msg_len(4B) + msg + appid
    const random = decrypted.slice(0, 16);
    const msgLen = decrypted.readUInt32BE(16);
    const msg = decrypted.slice(20, 20 + msgLen).toString("utf8");
    const receivedAppId = decrypted.slice(20 + msgLen).toString("utf8");

    console.log("解密结果:", {
      msgLen,
      receivedAppId,
      expectedAppId: appId,
      appIdMatch: receivedAppId === appId,
    });

    // 验证AppId
    if (receivedAppId !== appId) {
      throw new Error("AppId不匹配");
    }

    // 解析JSON消息
    return JSON.parse(msg);
  } catch (error) {
    console.error("解密消息失败:", error);
    throw error;
  }
}

/**
 * 处理微信消息
 */
function handleWechatMessage(message) {
  console.log("处理微信消息:", message);

  const { MsgType, Event } = message;

  if (MsgType === "event") {
    switch (Event) {
      case "task_published":
        handleTaskPublished(message);
        break;
      case "task_accepted":
        handleTaskAccepted(message);
        break;
      case "task_completed":
        handleTaskCompleted(message);
        break;
      default:
        console.log("未处理的事件类型:", Event);
    }
  } else {
    console.log("未处理的消息类型:", MsgType);
  }
}

/**
 * 处理任务发布事件
 */
function handleTaskPublished(message) {
  console.log("处理任务发布事件:", message);

  // 这里可以发送模板消息给相关用户
  // 例如：通知附近的接单员有新任务

  // TODO: 实现具体的通知逻辑
  // - 查找附近的接单员
  // - 发送模板消息通知
}

/**
 * 处理任务接取事件
 */
function handleTaskAccepted(message) {
  console.log("处理任务接取事件:", message);

  // 这里可以发送模板消息给任务发布者
  // 通知任务已被接取

  // TODO: 实现具体的通知逻辑
  // - 获取任务发布者信息
  // - 发送模板消息通知任务已被接取
}

/**
 * 处理任务完成事件
 */
function handleTaskCompleted(message) {
  console.log("处理任务完成事件:", message);

  // 这里可以发送模板消息给相关用户
  // 通知任务完成

  // TODO: 实现具体的通知逻辑
  // - 发送完成通知给发布者和接单员
}

module.exports = router;
