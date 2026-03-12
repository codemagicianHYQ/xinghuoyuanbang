const db = require("../models");
const PageConfig = db.PageConfig;

// 验证 PageConfig 是否存在
if (!PageConfig) {
  console.error("[maintenance.controller] 错误: PageConfig 模型未找到");
}

// 获取服务器状态（不受维护模式影响）
exports.getServerStatus = async (req, res) => {
  try {
    const SETTINGS_PAGE_KEY = "app_system_settings";

    const pageConfig = await PageConfig.findOne({
      where: { pageKey: SETTINGS_PAGE_KEY, isActive: true },
    });

    let maintenanceMode = false;
    let maintenanceMessage = "";

    if (pageConfig && pageConfig.configData) {
      maintenanceMode = pageConfig.configData.maintenanceMode || false;
      maintenanceMessage = pageConfig.configData.maintenanceMessage || "";
    }

    res.json({
      success: true,
      data: {
        serverStatus: maintenanceMode ? "maintenance" : "running",
        maintenanceMode,
        maintenanceMessage,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("获取服务器状态失败:", error);
    res.status(500).json({
      success: false,
      message: "获取服务器状态失败",
      error: error.message,
    });
  }
};

// 检查系统维护状态
exports.checkMaintenanceStatus = async (req, res) => {
  try {
    const SETTINGS_PAGE_KEY = "app_system_settings";

    // 查找系统设置配置
    const pageConfig = await PageConfig.findOne({
      where: { pageKey: SETTINGS_PAGE_KEY, isActive: true },
    });

    if (!pageConfig || !pageConfig.configData) {
      // 没有配置或配置为空，系统正常运行
      return res.json({
        success: true,
        data: {
          maintenanceMode: false,
          maintenanceMessage: "",
        },
      });
    }

    const settings = pageConfig.configData;
    const maintenanceMode = settings.maintenanceMode || false;
    const maintenanceMessage =
      settings.maintenanceMessage || "系统正在维护中，请稍后再试...";

    console.log(`[checkMaintenanceStatus] 维护模式状态: ${maintenanceMode}`);

    res.json({
      success: true,
      data: {
        maintenanceMode,
        maintenanceMessage,
      },
    });
  } catch (error) {
    console.error("检查维护状态失败:", error);
    res.status(500).json({
      success: false,
      message: "检查维护状态失败",
      error: error.message,
    });
  }
};

// 获取维护状态（管理员用）
exports.getMaintenanceStatus = async (req, res) => {
  try {
    const SETTINGS_PAGE_KEY = "app_system_settings";

    const pageConfig = await PageConfig.findOne({
      where: { pageKey: SETTINGS_PAGE_KEY, isActive: true },
    });

    if (!pageConfig || !pageConfig.configData) {
      return res.json({
        success: true,
        data: {
          maintenanceMode: false,
          maintenanceMessage: "",
        },
      });
    }

    const settings = pageConfig.configData;

    res.json({
      success: true,
      data: {
        maintenanceMode: settings.maintenanceMode || false,
        maintenanceMessage: settings.maintenanceMode
          ? settings.maintenanceMessage || "系统正在维护中，请稍后再试..."
          : "",
      },
    });
  } catch (error) {
    console.error("获取维护状态失败:", error);
    res.status(500).json({
      success: false,
      message: "获取维护状态失败",
      error: error.message,
    });
  }
};
