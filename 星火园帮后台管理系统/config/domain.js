// config/domain.js
require("dotenv").config();

/**
 * 域名配置
 * 统一管理所有域名，方便修改和维护
 */

const domainConfig = {
  // COS对象存储域名配置
  cos: {
    // 当前使用的域名（高风险）
    current: "https://xinghuoyuanbang-1361801137.cos.ap-shanghai.myqcloud.com",

    // 新的自定义域名（推荐）
    custom: process.env.COS_CUSTOM_DOMAIN || null,

    // CDN加速域名（可选）
    cdn: process.env.COS_CDN_DOMAIN || null,

    // 全球加速域名（可选）
    global: process.env.COS_GLOBAL_DOMAIN || null,
  },

  // 服务器域名
  server: {
    // 当前服务器域名
    current: process.env.SERVER_DOMAIN || "https://xinghuoyuanbang.top",

    // API基础路径
    api: "/api",
  },
};

/**
 * 获取COS域名
 * 优先级：CDN > 自定义 > 全球加速 > 当前
 */
function getCosDomain() {
  const { cos } = domainConfig;

  if (cos.cdn) {
    console.log("🌐 使用CDN加速域名:", cos.cdn);
    return cos.cdn;
  }

  if (cos.custom) {
    console.log("🔒 使用自定义域名:", cos.custom);
    return cos.custom;
  }

  if (cos.global) {
    console.log("🌍 使用全球加速域名:", cos.global);
    return cos.global;
  }

  console.warn("⚠️ 使用默认COS域名，存在安全风险");
  return cos.current;
}

/**
 * 对文件URL进行编码，解决手机端（微信小程序等）无法正确解析含中文路径、空格的问题
 * @param {string} url 原始URL
 * @returns {string} 编码后的URL
 */
function encodeFileUrl(url) {
  if (!url || typeof url !== "string") return url;
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").filter(Boolean);
    const encodedPath =
      "/" +
      segments
        .map((seg) => {
          try {
            const decoded = decodeURIComponent(seg);
            return encodeURIComponent(decoded);
          } catch {
            return encodeURIComponent(seg);
          }
        })
        .join("/");
    return u.origin + encodedPath + (u.search || "") + (u.hash || "");
  } catch (e) {
    return url;
  }
}

/**
 * 生成文件URL（已编码，兼容手机端显示）
 * @param {string} path 文件路径
 * @param {string} filename 文件名
 */
function generateFileUrl(path, filename) {
  const domain = getCosDomain();
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  const filePath = `${fullPath}/${filename}`;

  // 确保域名以https开头
  const baseUrl = domain.startsWith("http") ? domain : `https://${domain}`;

  // 对路径编码：中文、空格等在手机端（微信小程序）需正确编码才能加载
  const segments = filePath.split("/").filter(Boolean);
  const encodedPath =
    "/" + segments.map((seg) => encodeURIComponent(seg)).join("/");
  return `${baseUrl}${encodedPath}`;
}

/**
 * 获取域名配置信息
 */
function getDomainInfo() {
  return {
    cos: {
      current: domainConfig.cos.current,
      custom: domainConfig.cos.custom,
      cdn: domainConfig.cos.cdn,
      global: domainConfig.cos.global,
      active: getCosDomain(),
    },
    server: domainConfig.server,
  };
}

module.exports = {
  domainConfig,
  getCosDomain,
  generateFileUrl,
  encodeFileUrl,
  getDomainInfo,
};
