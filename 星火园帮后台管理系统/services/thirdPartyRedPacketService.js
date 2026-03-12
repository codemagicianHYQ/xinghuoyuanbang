const axios = require("axios");
const crypto = require("crypto");

class ThirdPartyRedPacketService {
  constructor() {
    this.uid = "10815823";
    this.apiKey =
      process.env.THIRD_PARTY_API_KEY || "JNqP5XjMEkyIFC3wK4a0qjZd-wgamHYQ";
    this.domain = "xinghuoyuanbang.top";
    this.baseUrl = "https://mp001.yaoyaola.net/exapi";
  }

  /**
   * 生成MD5签名
   * @param {string} str 待签名字符串
   * @returns {string} MD5签名
   */
  generateSign(str) {
    return crypto.createHash("md5").update(str).digest("hex");
  }

  /**
   * 生成订单号
   * @returns {string} 订单号
   */
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000); // 增加随机数范围
    const microtime = process.hrtime.bigint(); // 使用高精度时间戳
    return `WD${timestamp}${random}${microtime.toString().slice(-6)}`;
  }

  /**
   * 验证openid签名
   * @param {string} openid 用户openid
   * @param {string} ivtick 时间戳
   * @param {string} encdata 签名数据
   * @returns {boolean} 验证结果
   */
  verifyOpenid(openid, ivtick, encdata) {
    try {
      // 尝试不同的签名算法顺序
      const signStr1 = `${this.apiKey}${openid}${ivtick}`;
      const signStr2 = `${openid}${ivtick}${this.apiKey}`;
      const signStr3 = `${ivtick}${openid}${this.apiKey}`;

      const expectedSign1 = this.generateSign(signStr1);
      const expectedSign2 = this.generateSign(signStr2);
      const expectedSign3 = this.generateSign(signStr3);

      console.log("验证openid签名:");
      console.log("openid:", openid);
      console.log("ivtick:", ivtick);
      console.log("encdata:", encdata);
      console.log("apiKey:", this.apiKey);
      console.log("signStr1 (apikey+openid+ivtick):", signStr1);
      console.log("expectedSign1:", expectedSign1);
      console.log("signStr2 (openid+ivtick+apikey):", signStr2);
      console.log("expectedSign2:", expectedSign2);
      console.log("signStr3 (ivtick+openid+apikey):", signStr3);
      console.log("expectedSign3:", expectedSign3);

      // 检查哪种签名匹配
      if (expectedSign1 === encdata) {
        console.log("签名验证成功 (apikey+openid+ivtick)");
        return true;
      } else if (expectedSign2 === encdata) {
        console.log("签名验证成功 (openid+ivtick+apikey)");
        return true;
      } else if (expectedSign3 === encdata) {
        console.log("签名验证成功 (ivtick+openid+apikey)");
        return true;
      } else {
        console.log("所有签名算法都不匹配");
        return false;
      }
    } catch (error) {
      console.error("验证openid签名失败:", error);
      return false;
    }
  }

  /**
   * 获取授权URL
   * @param {string} redirectUrl 回调URL
   * @param {number} mp 小程序路径参数（0=不使用小程序路径）
   * @param {number} flag 授权类型（0=静默获取openid）
   * @returns {string} 授权URL
   */
  getAuthorizationUrl(redirectUrl, mp = 0, flag = 0) {
    const params = new URLSearchParams({
      url: redirectUrl,
      flag: flag.toString(),
    });

    if (mp !== 0) {
      params.append("mp", mp.toString());
    }

    return `${this.baseUrl}/check_user/${this.uid}?${params.toString()}`;
  }

  /**
   * 商家转账到用户（使用企业付款接口）
   * @param {Object} params 转账参数
   * @param {string} params.openid 用户openid
   * @param {number} params.amount 转账金额（元）
   * @param {string} params.realName 用户真实姓名（已废弃，不再使用）
   * @param {string} params.orderId 自定义订单号（可选）
   * @returns {Object} 转账结果
   */
  async transferToUser(params) {
    const {
      openid,
      amount,
      realName,
      orderId = this.generateOrderId(),
    } = params;

    // 验证参数
    if (!openid || !amount) {
      throw new Error("缺少必要参数：openid, amount");
    }

    if (amount < 0.3) {
      throw new Error("转账金额不能低于0.3元");
    }

    // 转换为分
    const amountInCents = Math.round(amount * 100);

    try {
      console.log(
        `开始转账，openid: ${openid}, 金额: ${amount}元, 订单号: ${orderId}`
      );

      // 当前时间戳（秒）
      const reqtick = Math.floor(Date.now() / 1000);

      // 构建签名字符串：uid+type+orderid+money+reqtick+openid+apikey
      const signStr = `${this.uid}1${orderId}${amountInCents}${reqtick}${openid}${this.apiKey}`;
      const sign = this.generateSign(signStr);

      // 构建请求URL
      const requestUrl = `${this.baseUrl}/SendRedPackToOpenid`;
      const queryParams = new URLSearchParams({
        uid: this.uid,
        type: "1", // 企业付款接口
        orderid: orderId,
        money: amountInCents,
        reqtick: reqtick,
        openid: openid, // 企业付款接口需要openid
        // 不传递tousername参数，避免姓名校验
        sign: sign,
        // 企业付款显示信息
        sendname: "星火园帮",
        wishing: "星火园帮提现到账", // 设置备注信息
      });

      const fullUrl = `${requestUrl}?${queryParams.toString()}`;

      console.log("调用第三方转账接口:", fullUrl);

      // 发送请求
      const response = await axios.get(fullUrl, {
        timeout: 30000, // 30秒超时
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Xinghuoyuanbang/1.0)",
          Referer: `https://${this.domain}`,
        },
      });

      const result = response.data;
      console.log("第三方转账接口返回:", result);

      // 处理返回结果
      if (result.errcode === "0") {
        return {
          success: true,
          message: "转账成功",
          data: {
            ticket: result.ticket,
            orderId: orderId,
            amount: amount,
            retmoney: result.retmoney,
            retmsg: result.retmsg,
          },
        };
      } else {
        const errorMsg = result.errmsg || "转账失败";
        console.log("转账失败:", errorMsg);
        throw new Error(`转账失败:${errorMsg}`);
      }
    } catch (error) {
      console.log("转账失败:", error.message);
      throw error;
    }
  }
}

module.exports = new ThirdPartyRedPacketService();
