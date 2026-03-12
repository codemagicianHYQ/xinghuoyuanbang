/**
 * 前端性能优化配置
 * 针对微信小程序的性能优化策略
 */

const performanceConfig = {
  // 图片优化配置
  imageOptimization: {
    // 图片压缩质量
    quality: 80,
    // 最大图片尺寸
    maxWidth: 800,
    maxHeight: 600,
    // 支持的图片格式
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    // 懒加载配置
    lazyLoad: {
      enabled: true,
      threshold: 100, // 距离视口100px时开始加载
      placeholder: "/static/images/placeholder.png",
    },
  },

  // 网络请求优化
  networkOptimization: {
    // 请求超时时间
    timeout: 10000,
    // 重试配置
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      retryDelayMultiplier: 2,
    },
    // 请求去重
    deduplication: {
      enabled: true,
      cacheTime: 5000, // 5秒内相同请求会被去重
    },
    // 并发控制
    concurrency: {
      maxConcurrent: 6, // 最大并发请求数
      queueSize: 20, // 请求队列大小
    },
  },

  // 缓存策略
  cacheStrategy: {
    // 本地存储缓存
    localStorage: {
      enabled: true,
      maxSize: 10 * 1024 * 1024, // 10MB
      expiration: {
        userInfo: 24 * 60 * 60 * 1000, // 24小时
        taskList: 5 * 60 * 1000, // 5分钟
        communityData: 30 * 60 * 1000, // 30分钟
        systemConfig: 24 * 60 * 60 * 1000, // 24小时
      },
    },
    // 内存缓存
    memoryCache: {
      enabled: true,
      maxSize: 5 * 1024 * 1024, // 5MB
      maxAge: 10 * 60 * 1000, // 10分钟
    },
  },

  // 页面性能优化
  pageOptimization: {
    // 预加载配置
    preload: {
      enabled: true,
      pages: [
        "/pages/tasks/tasks",
        "/pages/profile/profile",
        "/subpages/publish/publish-express",
      ],
    },
    // 页面预渲染
    prerender: {
      enabled: false, // 微信小程序不支持预渲染
      pages: [],
    },
    // 代码分割
    codeSplitting: {
      enabled: true,
      chunks: {
        vendor: ["vue", "vuex"],
        common: ["common/utils", "common/request"],
        pages: true,
      },
    },
  },

  // 资源压缩配置
  compression: {
    // 图片压缩
    image: {
      enabled: true,
      quality: 80,
      progressive: true,
    },
    // 代码压缩
    code: {
      enabled: true,
      minify: true,
      uglify: true,
    },
    // 资源合并
    bundling: {
      enabled: true,
      css: true,
      js: true,
    },
  },

  // 监控配置
  monitoring: {
    // 性能监控
    performance: {
      enabled: true,
      metrics: [
        "pageLoadTime",
        "firstContentfulPaint",
        "largestContentfulPaint",
        "cumulativeLayoutShift",
      ],
      reportInterval: 30000, // 30秒上报一次
    },
    // 错误监控
    error: {
      enabled: true,
      reportErrors: true,
      reportUnhandledRejections: true,
    },
    // 用户行为监控
    userBehavior: {
      enabled: true,
      trackEvents: ["pageView", "buttonClick", "formSubmit", "apiCall"],
    },
  },

  // 微信小程序特定优化
  wechatOptimization: {
    // 分包配置
    subpackages: {
      enabled: true,
      packages: [
        {
          root: "subpages/publish",
          pages: [
            "publish-express",
            "publish-takeaway",
            "publish-buy",
            "publish-borrow",
            "publish-game",
            "publish-paperwork",
            "publish-writing",
            "publish-moving",
            "publish-mutual-help",
            "publish-course-sub",
          ],
        },
        {
          root: "subpages/profile",
          pages: [
            "my-published",
            "my-accepted",
            "wallet",
            "address",
            "messages",
            "settings",
            "edit-info",
            "apply-rider",
            "rider-center",
          ],
        },
      ],
    },
    // 预加载配置
    preloadRule: {
      "pages/home/home": {
        network: "all",
        packages: ["subpages/publish"],
      },
      "pages/tasks/tasks": {
        network: "all",
        packages: ["subpages/profile"],
      },
    },
    // 性能优化
    performance: {
      // 启用同层渲染
      enableLayerRendering: true,
      // 优化长列表
      optimizeLongList: true,
      // 启用虚拟滚动
      virtualScroll: true,
    },
  },
};

// 性能优化工具函数
const performanceUtils = {
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 节流函数
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // 图片懒加载
  lazyLoadImage(imageElement, src, placeholder) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    });

    if (imageElement) {
      imageElement.src =
        placeholder || performanceConfig.imageOptimization.lazyLoad.placeholder;
      imageElement.classList.add("lazy");
      observer.observe(imageElement);
    }
  },

  // 请求去重
  requestDeduplication: (() => {
    const pendingRequests = new Map();

    return (key, requestFn) => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
      }

      const promise = requestFn().finally(() => {
        pendingRequests.delete(key);
      });

      pendingRequests.set(key, promise);
      return promise;
    };
  })(),

  // 性能监控
  performanceMonitor: {
    // 记录页面加载时间
    recordPageLoad(pageName) {
      const loadTime = Date.now() - performance.timing.navigationStart;
      console.log(`页面 ${pageName} 加载时间: ${loadTime}ms`);

      // 上报性能数据
      if (loadTime > 3000) {
        console.warn(`页面 ${pageName} 加载时间过长: ${loadTime}ms`);
      }
    },

    // 记录API调用时间
    recordApiCall(apiName, duration) {
      console.log(`API ${apiName} 调用时间: ${duration}ms`);

      if (duration > 2000) {
        console.warn(`API ${apiName} 响应时间过长: ${duration}ms`);
      }
    },

    // 记录内存使用
    recordMemoryUsage() {
      const memInfo = wx.getSystemInfoSync();
      console.log("系统内存信息:", memInfo);
    },
  },
};

module.exports = {
  performanceConfig,
  performanceUtils,
};
