// controllers/pageConfig.controller.js

/**
 * @description 获取首页配置数据 (用于 /home/config)
 * @param {object} req Express请求对象
 * @param {object} res Express响应对象
 */
exports.getHomePageConfig = async (req, res) => {
  try {
    const { version = "campus" } = req.query;

    // 根据版本返回不同的配置
    const homeConfigData = {
      // Banner 相关配置
      bannerMainTitle: version === "campus" ? "不想出门？" : "生活服务",
      bannerSubTitle: version === "campus" ? "Call我马上办" : "邻里互助",
      bannerCharacterImg: "/static/images/character.png",
      bannerPrimaryBgImg: "/static/images/banner-bg.png",
      bannerRiderBgImg: "/static/images/rider-banner-bg.png",
      riderBannerIcon: "/static/icons/rider-banner-icon.png",
      bannerActionText:
        version === "campus"
          ? "探索最新校园互助任务!"
          : "探索最新社区服务任务!",
      bannerLinkType: "navigateTo",
      bannerLink: "/pages/tasks/list?featured=true",

      // 服务列表
      // 修改点：让前端优先使用其本地的 staticServices。
      // 后端可以不返回 services 字段，或者返回一个空数组。
      // 如果后端确实有需要动态控制的服务项（例如，限时活动服务），可以在这里添加，
      // 前端则需要有合并或替换逻辑。
      // 为简单起见，并遵循“前端优先”的思路，这里不返回 services，
      // 或者返回一个明确的信号告知前端使用自己的默认值。
      // services: [], // 或者干脆不包含 services 字段
      // 如果您的前端 currentServices 逻辑是:
      // const source = (this.homePageConfig && Array.isArray(this.homePageConfig.services) && this.homePageConfig.services.length > 0)
      //                ? this.homePageConfig.services
      //                : this.staticServices;
      // 那么后端不返回 services 字段或返回 services: [] 都会使前端使用 staticServices。

      // 为了明确，我们这里返回一个空的 services 数组，或者完全移除 services 字段。
      // 如果您希望后端未来能覆盖前端的 services，那么后端应该返回完整的 services 列表。
      // 根据“以前端优先”，这里我们假设后端不干预前端的静态服务列表，除非有特定动态项。
      // 我们将 services 字段从后端响应中移除，这样前端的 currentServices 会自动使用 staticServices。
      // 如果您希望后端能“追加”或“修改”前端的静态列表，那将需要更复杂的合并逻辑。
      // 当前最直接的方式是，如果后端不提供services，前端就用自己的。

      // 特色专区项目 (保持您之前提供的版本)
      featuredItems: [
        {
          type: "throw_trash",
          title: "扔垃圾",
          style:
            "background-image: linear-gradient(to right, #FFD700, #FFA500);",
          icon: "/static/icons/trash.png",
          link: "/pages/publish/publish?category=throw_trash&title=帮忙扔垃圾",
        },
        {
          type: "laundry",
          title: "衣物干洗",
          style:
            "background-image: linear-gradient(to right, #87CEFA, #00BFFF);",
          icon: "/static/icons/laundry.png",
          link: "/pages/publish/publish?category=laundry&title=衣物干洗",
        },
      ],

      // 优惠卡片列表 (保持您之前提供的版本，为空数组)
      offerCards: [],

      // 公告内容 (保持您之前提供的版本)

      // 底部标语配置 (保持您之前提供的版本)
      sloganMain: "每个人的",
      sloganHighlight: "生活小助手",
      sloganSub: "你的需求, 我来搞定",
    };

    // 从 homeConfigData 中移除 services 字段，以确保前端使用其 staticServices
    // delete homeConfigData.services;
    // 或者，如果前端 currentServices 逻辑能正确处理空数组，则返回空数组也可以：
    homeConfigData.services = [];

    res.status(200).json({
      code: 0,
      message: "首页配置加载成功 (服务列表由前端定义)",
      data: homeConfigData,
    });
  } catch (error) {
    console.error("获取首页配置发生错误:", error);
    res.status(500).json({
      code: 5001,
      message: "获取首页配置失败，服务器内部错误。",
      error: error.message,
    });
  }
};

// --- 其他控制器函数 (getPublicPageConfig, adminGetAllPageConfigs, etc.) 保持不变 ---
exports.getPublicPageConfig = async (req, res) => {
  const pageKey = req.params.pageKey;
  try {
    console.log(`请求公共页面配置: ${pageKey}`);
    const publicConfigData = {
      pageKey: pageKey,
      title: `这是公共页面 '${pageKey}' 的标题 (示例)`,
      content: `这是 '${pageKey}' 页面的内容配置 (示例内容)。`,
    };
    res.status(200).json({
      code: 0,
      message: `公共页面 '${pageKey}' 配置获取成功。`,
      data: publicConfigData,
    });
  } catch (error) {
    console.error(`获取公共页面 '${pageKey}' 配置失败:`, error);
    res.status(500).json({
      code: 5002,
      message: `获取公共页面 '${pageKey}' 配置失败。`,
      error: error.message,
    });
  }
};

exports.adminGetAllPageConfigs = async (req, res) => {
  try {
    console.log("管理员请求获取所有页面配置");
    const allConfigs = [
      { pageKey: "home", title: "首页配置", lastModified: new Date() },
      {
        pageKey: "about_us",
        title: "关于我们页面配置",
        lastModified: new Date(),
      },
    ];
    res.status(200).json({
      code: 0,
      message: "所有页面配置获取成功。",
      data: allConfigs,
    });
  } catch (error) {
    console.error("管理员获取所有页面配置失败:", error);
    res.status(500).json({
      code: 5003,
      message: "管理员获取所有页面配置失败。",
      error: error.message,
    });
  }
};

exports.adminGetPageConfig = async (req, res) => {
  const pageKey = req.params.pageKey;
  try {
    console.log(`管理员请求获取页面配置: ${pageKey}`);

    // 引入PageConfig模型
    const db = require("../models");
    const PageConfig = db.PageConfig;

    // 从数据库获取配置
    const pageConfig = await PageConfig.findOne({
      where: { pageKey: pageKey },
    });

    if (pageConfig) {
      res.status(200).json({
        success: true,
        message: `页面 '${pageKey}' 配置获取成功。`,
        data: pageConfig.toJSON(),
      });
    } else {
      // 如果配置不存在，返回404
      res.status(404).json({
        success: false,
        message: `页面 '${pageKey}' 配置不存在。`,
      });
    }
  } catch (error) {
    console.error(`管理员获取页面 '${pageKey}' 配置失败:`, error);
    res.status(500).json({
      code: 5004,
      message: `管理员获取页面 '${pageKey}' 配置失败。`,
      error: error.message,
    });
  }
};

exports.adminUpdatePageConfig = async (req, res) => {
  const pageKey = req.params.pageKey;
  const newConfigData = req.body;
  try {
    console.log(`管理员更新页面配置: ${pageKey}，数据:`, newConfigData);

    // 引入PageConfig模型
    const db = require("../models");
    const PageConfig = db.PageConfig;

    // 查找或创建配置
    const [pageConfig, created] = await PageConfig.findOrCreate({
      where: { pageKey: pageKey },
      defaults: {
        pageKey: pageKey,
        configData: newConfigData.configData || newConfigData,
        description: newConfigData.description || "系统配置",
        isActive:
          newConfigData.isActive !== undefined ? newConfigData.isActive : true,
      },
    });

    if (!created) {
      // 如果配置已存在，更新它
      await pageConfig.update({
        configData: newConfigData.configData || newConfigData,
        description: newConfigData.description || pageConfig.description,
        isActive:
          newConfigData.isActive !== undefined
            ? newConfigData.isActive
            : pageConfig.isActive,
        updatedAt: new Date(),
      });
    }

    console.log(`${created ? "创建" : "更新"}页面配置成功: ${pageKey}`);

    res.status(200).json({
      success: true,
      message: `页面 '${pageKey}' 配置${created ? "创建" : "更新"}成功。`,
      data: {
        pageKey: pageKey,
        updatedConfig: pageConfig.toJSON(),
        created: created,
      },
    });
  } catch (error) {
    console.error(`管理员更新页面 '${pageKey}' 配置失败:`, error);
    res.status(500).json({
      success: false,
      message: `管理员更新页面 '${pageKey}' 配置失败。`,
      error: error.message,
    });
  }
};

exports.adminDeletePageConfig = async (req, res) => {
  const pageKey = req.params.pageKey;
  try {
    console.log(`管理员删除页面配置: ${pageKey}`);
    res.status(200).json({
      code: 0,
      message: `页面 '${pageKey}' 配置删除成功。`,
    });
  } catch (error) {
    console.error(`管理员删除页面 '${pageKey}' 配置失败:`, error);
    res.status(500).json({
      code: 5005,
      message: `管理员删除页面 '${pageKey}' 配置失败。`,
      error: error.message,
    });
  }
};
