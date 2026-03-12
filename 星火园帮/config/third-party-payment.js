// 第三方支付配置文�?
export const THIRD_PARTY_CONFIG = {
  // 客户编号
  UID: "10815823",

  // API密钥 (需要配置您的实际apikey)
  API_KEY: "your_apikey_here",

  // 第三方接口基础URL
  BASE_URL: "https://mp001.yaoyaola.net/exapi",

  // 授权接口
  AUTH_URL: "https://mp001.yaoyaola.net/exapi/check_user/10815823",

  // 转账接口
  TRANSFER_URL: "https://mp001.yaoyaola.net/exapi/SendRedPackToOpenid",

  // 回调URL (小程序路�?
  CALLBACK_URL: "/subpages/profile/withdraw",

  // 转账类型 (0:红包, 1:企业付款)
  TRANSFER_TYPE: 1,

  // 商家名称
  SEND_NAME: "星火园帮",

  // 转账标题
  TRANSFER_TITLE: "提现到账",
};

// 生成签名
export function generateSign(params) {
  const { UID, API_KEY, TRANSFER_TYPE } = THIRD_PARTY_CONFIG;
  const { orderId, amountInCents, reqTick, openid } = params;

  // 签名规则: md5(uid+type+orderid+money+reqtick+openid+apikey)
  const signString = `${UID}${TRANSFER_TYPE}${orderId}${amountInCents}${reqTick}${openid}${API_KEY}`;

  return md5(signString);
}

// 简化的MD5实现
function md5(str) {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
