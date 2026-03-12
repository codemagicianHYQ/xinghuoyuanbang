// services/wechatPayService.js
// const WechatPay = require("wechatpay-node-v3"); // 暂时注释，等安装SDK后启用
const fs = require("fs");
const crypto = require("crypto");
const config = require("../config/server.config.js");

class WechatPayService {
  constructor() {
    this.pay = null;
    this.initWechatPay();
  }

  // 初始化微信支付实例
  initWechatPay() {
    try {
      console.log("⚠️ 微信支付SDK未安装，使用模拟模式");
      console.log("请运行: npm install wechatpay-node-v3");

      // 暂时不初始化真实的微信支付
      this.pay = null;

      // TODO: 当安装了wechatpay-node-v3后，启用以下代码
      /*
      const appid = config.WECHAT_APPID;
      const mchid = config.WECHAT_MCHID;
      const apiv3Key = config.WECHAT_APIv3KEY;
      const publicKeyPath = config.WECHAT_PUBLIC_KEY_PATH;
      const privateKeyPath = config.WECHAT_PRIVATE_KEY_PATH;
      const serial = config.WECHAT_SERIAL;

      // 检查证书文件是否存在
      if (!fs.existsSync(publicKeyPath)) {
        console.error("微信支付公钥文件不存在:", publicKeyPath);
        return;
      }
      if (!fs.existsSync(privateKeyPath)) {
        console.error("微信支付私钥文件不存在:", privateKeyPath);
        return;
      }

      // 读取证书文件
      const publicKey = fs.readFileSync(publicKeyPath);
      const privateKey = fs.readFileSync(privateKeyPath);

      this.pay = new WechatPay({
        mchid: mchid,
        appid: appid,
        publicKey: publicKey,
        privateKey: privateKey,
        serial: serial,
        apiv3Key: apiv3Key,
      });

      console.log("✅ 微信支付服务初始化成功");
      */
    } catch (error) {
      console.error("❌ 微信支付服务初始化失败:", error);
    }
  }

  // 申请退款 - 模拟模式
  async applyRefund(
    outTradeNo,
    outRefundNo,
    totalAmount,
    refundAmount,
    reason = "用户取消订单"
  ) {
    try {
      console.log("模拟微信支付退款API调用:");
      console.log("- 原订单号:", outTradeNo);
      console.log("- 退款单号:", outRefundNo);
      console.log("- 原订单金额:", totalAmount);
      console.log("- 退款金额:", refundAmount);

      // 模拟退款成功
      const result = {
        refund_id: `MOCK_REFUND_${outRefundNo}`,
        out_refund_no: outRefundNo,
        transaction_id: `MOCK_TXN_${Date.now()}`,
        out_trade_no: outTradeNo,
        amount: {
          refund: Math.round(refundAmount * 100),
          total: Math.round(totalAmount * 100),
          currency: "CNY",
        },
        status: "PROCESSING",
      };

      console.log("模拟微信支付退款API返回结果:", result);

      return {
        success: true,
        data: result,
        refund_id: result.refund_id,
        refund_status: "PROCESSING",
      };
    } catch (error) {
      console.error("模拟微信支付退款API调用失败:", error);
      return {
        success: false,
        error: error.message,
        refund_status: "FAILED",
      };
    }
  }

  // 查询退款状态 - 模拟模式
  async queryRefund(outRefundNo) {
    try {
      console.log("模拟查询微信支付退款状态:", outRefundNo);

      // 模拟查询结果
      const result = {
        refund_id: `MOCK_REFUND_${outRefundNo}`,
        out_refund_no: outRefundNo,
        status: "SUCCESS", // 模拟为成功状态
        amount: {
          refund: 100, // 模拟退款金额
          total: 100,
        },
      };

      console.log("模拟微信支付退款查询结果:", result);

      return {
        success: true,
        data: result,
        refund_status: "SUCCESS",
      };
    } catch (error) {
      console.error("模拟微信支付退款查询失败:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 验证退款通知签名 - 模拟模式
  verifyRefundNotify(headers, body) {
    try {
      console.log("模拟验证退款通知签名");
      // 在模拟模式下，直接返回true
      return true;
    } catch (error) {
      console.error("模拟退款通知签名验证失败:", error);
      return false;
    }
  }

  // 转账到零钱 - 模拟模式
  async transferToBalance({ openid, amount, desc, partnerTradeNo }) {
    // 在模拟模式下，抛出错误以触发回退到余额增加模式
    // 因为微信支付SDK未安装，无法进行真实的转账操作
    console.log("⚠️ 微信支付转账功能未实现，使用模拟模式");
    console.log("模拟微信支付转账到零钱API调用:");
    console.log("- 用户openid:", openid);
    console.log("- 转账金额(分):", amount);
    console.log("- 转账说明:", desc);
    console.log("- 商户订单号:", partnerTradeNo);
    console.log("⚠️ 微信支付SDK未安装，将回退到余额增加模式");

    // 抛出错误，让调用方回退到余额增加模式
    throw new Error("微信支付SDK未安装，请使用余额增加模式");
  }
}

module.exports = new WechatPayService();
