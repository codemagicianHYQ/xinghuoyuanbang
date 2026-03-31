const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authJwt } = require("../middleware");
const { generateFileUrl, encodeFileUrl } = require("../config/domain");
const router = express.Router();

// 腾讯云COS SDK
const COS = require("cos-nodejs-sdk-v5");

// 仅使用环境变量，勿将密钥写入代码
const cosConfig = {
  SecretId: process.env.COS_SECRET_ID || "",
  SecretKey: process.env.COS_SECRET_KEY || "",
};

const cos = new COS(cosConfig);

// 仅提示是否已配置，避免在日志中输出密钥片段
if (process.env.NODE_ENV !== "production") {
  console.log("🔧 COS配置初始化:", {
    hasSecretId: !!cosConfig.SecretId,
    hasSecretKey: !!cosConfig.SecretKey,
  });
}

// COS上传函数
const uploadToCOS = async (file, path) => {
  const key = `${path}/${file.filename}`;

  // 使用硬编码配置或环境变量
  const bucket = process.env.COS_BUCKET || "xinghuo-yuanbang-1361801137";
  const region = process.env.COS_REGION || "ap-shanghai";

  console.log("COS上传配置:", {
    Bucket: bucket,
    Region: region,
    SecretId: cosConfig.SecretId ? "已配置" : "未配置",
    SecretKey: cosConfig.SecretKey ? "已配置" : "未配置",
  });

  console.log("实际使用的参数:", {
    Bucket: bucket,
    Region: region,
    Key: key,
  });

  try {
    const result = await cos.putObject({
      Bucket: bucket,
      Region: region,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    console.log(`文件上传到COS成功: ${key}`);
    return key;
  } catch (error) {
    console.error(`文件上传到COS失败:`, error);
    throw error;
  }
};

// 学生证上传配置 - 使用内存存储
const studentIdUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 头像上传配置 - 使用内存存储
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 聊天图片上传配置 - 使用内存存储
const chatImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 校园论坛图片上传配置 - 使用内存存储
const campusImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 反馈图片上传配置 - 使用内存存储
const feedbackUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 商品图片上传配置 - 使用内存存储
const marketImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else if (file.mimetype === "image/webp") {
        ext = ".webp";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 任务图片上传配置 - 使用内存存储
const taskImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 图书封面上传配置 - 使用内存存储
const bookCoverUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片类型
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("只允许上传图片文件"));
    }
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else if (file.mimetype === "image/webp") {
        ext = ".webp";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 订单确认图片上传配置 - 使用内存存储
const orderConfirmImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 售后图片上传配置 - 使用内存存储
const afterSalesImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 考试资料发送凭证图片上传配置 - 使用内存存储
const examProofUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `exam-proof-${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 通用上传接口 - 根据请求参数决定上传类型
router.post("/", async (req, res) => {
  try {
    const uploadType = req.query.type || req.body.type || "avatar"; // 支持query和body两种方式
    console.log("通用上传接口 - 上传类型:", uploadType);
    console.log("通用上传接口 - 请求体:", req.body);
    console.log("通用上传接口 - 查询参数:", req.query);

    let upload;
    let staticPath;

    if (uploadType === "studentId") {
      upload = studentIdUpload;
      staticPath = "/学生证";
    } else if (uploadType === "feedback") {
      upload = feedbackUpload;
      staticPath = "/用户反馈";
    } else if (uploadType === "chat") {
      upload = chatImageUpload; // 使用聊天图片专用上传配置
      staticPath = "/聊天图片";
    } else if (uploadType === "market") {
      upload = marketImageUpload; // 使用商品图片专用上传配置
      staticPath = "/商品图片";
    } else if (uploadType === "campus") {
      upload = campusImageUpload; // 使用校园论坛专用上传配置
      staticPath = "/校园论坛";
    } else if (uploadType === "task") {
      upload = taskImageUpload; // 使用任务图片专用上传配置
      staticPath = "/任务图片";
    } else if (uploadType === "orderConfirm") {
      upload = orderConfirmImageUpload; // 使用订单确认图片专用上传配置
      staticPath = "/订单确认";
    } else if (uploadType === "afterSales") {
      upload = afterSalesImageUpload; // 使用售后图片专用上传配置
      staticPath = "/售后图片";
    } else if (uploadType === "exam-proof") {
      upload = examProofUpload; // 使用考试资料凭证专用上传配置
      staticPath = "/考试资料发送凭证";
    } else {
      upload = avatarUpload;
      staticPath = "/用户头像";
    }

    upload.single("file")(req, res, async (err) => {
      console.log("multer处理结果 - 错误:", err);
      console.log("multer处理结果 - 文件:", req.file);

      if (err) {
        console.error("multer处理文件失败:", err);
        return res
          .status(400)
          .json({ message: "文件上传失败", error: err.message });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "未收到文件" });
      }

      // 根据上传类型返回不同的URL
      let url;
      if (uploadType === "campus") {
        // 校园论坛使用本地文件服务
        url = `${req.protocol}://${req.get("host")}${staticPath}/${
          file.filename
        }`;
      } else {
        // 其他类型使用COS
        url = generateFileUrl(staticPath, file.filename);
      }

      console.log("文件上传成功，URL:", url);
      console.log("文件保存路径:", file.path);
      console.log("文件大小:", file.size);
      console.log("文件类型:", file.mimetype);

      // 验证文件是否真的存在
      if (fs.existsSync(file.path)) {
        console.log("✅ 文件确实保存到:", file.path);
      } else {
        console.log("❌ 文件没有保存到:", file.path);
      }

      res.json({
        success: true,
        data: { url },
        message: "上传成功",
      });
    });
  } catch (err) {
    res.status(500).json({ message: "上传失败", error: err.message });
  }
});

// 学生证专用上传接口（保持向后兼容）
router.post("/studentId", studentIdUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/学生证");
      url = generateFileUrl("/学生证", file.filename);
      console.log("学生证使用COS存储");
    } catch (error) {
      console.warn("学生证COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "/学生证";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL
      url = `https://xinghuoyuanbang.top/学生证/${file.filename}`;
      console.log("学生证使用本地存储:", url);
    }

    console.log("学生证上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: "上传失败", error: err.message });
  }
});

// 头像专用上传接口
router.post("/avatar", avatarUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/用户头像");
      url = generateFileUrl("/用户头像", file.filename);
      console.log("头像使用COS存储");
    } catch (error) {
      console.warn("头像COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "/用户头像";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL（编码以兼容手机端）
      url = encodeFileUrl(
        `https://xinghuoyuanbang.top/用户头像/${file.filename}`
      );
      console.log("头像使用本地存储:", url);
    }

    console.log("头像上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: "上传失败", error: err.message });
  }
});

// 反馈图片专用上传接口
router.post("/feedback", feedbackUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/用户反馈");
      url = generateFileUrl("/用户反馈", file.filename);
      console.log("反馈图片使用COS存储");
    } catch (error) {
      console.warn("反馈图片COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "/用户反馈";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL
      url = `https://xinghuoyuanbang.top/用户反馈/${file.filename}`;
      console.log("反馈图片使用本地存储:", url);
    }

    console.log("反馈上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: "上传失败", error: err.message });
  }
});

// 商品图片专用上传接口
router.post("/market", marketImageUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/二手市集");
      url = generateFileUrl("/二手市集", file.filename);
      console.log("使用COS存储");
    } catch (error) {
      console.warn("COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "/二手市集";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL
      url = `https://xinghuoyuanbang.top/二手市集/${file.filename}`;
      console.log("使用本地存储:", url);
    }

    console.log("商品图片上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });

    res.json({
      success: true,
      data: { url },
      message: "上传成功",
    });
  } catch (err) {
    console.error("商品图片上传失败:", err);
    res.status(500).json({
      success: false,
      message: "上传失败",
      error: err.message,
    });
  }
});

// 聊天图片专用上传接口
router.post("/chat", chatImageUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/聊天图片");
      url = generateFileUrl("/聊天图片", file.filename);
      console.log("聊天图片使用COS存储");
    } catch (error) {
      console.warn("聊天图片COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "/聊天图片";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL
      url = `https://xinghuoyuanbang.top/聊天图片/${file.filename}`;
      console.log("聊天图片使用本地存储:", url);
    }

    console.log("聊天图片上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });

    res.json({
      success: true,
      data: { url },
      message: "上传成功",
    });
  } catch (err) {
    console.error("聊天图片上传失败:", err);
    res.status(500).json({
      success: false,
      message: "上传失败",
      error: err.message,
    });
  }
});

// 任务图片专用上传接口
router.post("/task", taskImageUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/任务图片");
      url = generateFileUrl("/任务图片", file.filename);
      console.log("任务图片使用COS存储");
    } catch (error) {
      console.warn("任务图片COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "/任务图片";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL
      url = `https://xinghuoyuanbang.top/任务图片/${file.filename}`;
      console.log("任务图片使用本地存储:", url);
    }

    console.log("任务图片上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });

    res.json({
      success: true,
      data: { url },
      message: "上传成功",
    });
  } catch (err) {
    console.error("任务图片上传失败:", err);
    res.status(500).json({
      success: false,
      message: "上传失败",
      error: err.message,
    });
  }
});

// 订单确认图片专用上传接口
router.post(
  "/orderConfirm",
  orderConfirmImageUpload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "未收到文件" });
      }

      // 检查COS配置，如果未配置则使用本地存储
      let url;
      try {
        // 尝试上传到COS
        await uploadToCOS(file, "/订单确认");
        url = generateFileUrl("/订单确认", file.filename);
        console.log("订单确认图片使用COS存储");
      } catch (error) {
        console.warn("订单确认图片COS上传失败，使用本地存储:", error.message);
        // 回退到本地存储
        const fs = require("fs");
        const path = require("path");

        const dest = "/订单确认";
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        const localPath = path.join(dest, file.filename);
        fs.writeFileSync(localPath, file.buffer);

        // 使用本地文件URL
        url = `https://xinghuoyuanbang.top/订单确认/${file.filename}`;
        console.log("订单确认图片使用本地存储:", url);
      }

      console.log("订单确认图片上传文件信息:", {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: url,
      });

      res.json({
        success: true,
        data: { url },
        message: "上传成功",
      });
    } catch (err) {
      console.error("订单确认图片上传失败:", err);
      res.status(500).json({
        success: false,
        message: "上传失败",
        error: err.message,
      });
    }
  }
);

// 校园论坛图片专用上传接口（完全仿照二手市集）
router.post("/campus", campusImageUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/校园论坛");
      url = generateFileUrl("/校园论坛", file.filename);
      console.log("校园论坛图片使用COS存储");
    } catch (error) {
      console.warn("校园论坛图片COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "/校园论坛";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL
      url = `https://xinghuoyuanbang.top/校园论坛/${file.filename}`;
      console.log("校园论坛图片使用本地存储:", url);
    }

    console.log("校园论坛图片上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });

    res.json({
      success: true,
      data: { url },
      message: "上传成功",
    });
  } catch (err) {
    res.status(500).json({ message: "上传失败", error: err.message });
  }
});

// 售后图片专用上传接口
router.post(
  "/afterSales",
  afterSalesImageUpload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "未收到文件" });
      }

      // 检查COS配置，如果未配置则使用本地存储
      let url;
      try {
        // 尝试上传到COS
        await uploadToCOS(file, "/售后图片");
        url = generateFileUrl("/售后图片", file.filename);
        console.log("售后图片使用COS存储");
      } catch (error) {
        console.warn("售后图片COS上传失败，使用本地存储:", error.message);
        // 回退到本地存储
        const fs = require("fs");
        const path = require("path");

        const dest = "/售后图片";
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        const localPath = path.join(dest, file.filename);
        fs.writeFileSync(localPath, file.buffer);

        // 使用本地文件URL
        url = `https://xinghuoyuanbang.top/售后图片/${file.filename}`;
        console.log("售后图片使用本地存储:", url);
      }

      console.log("售后图片上传文件信息:", {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: url,
      });

      res.json({
        success: true,
        data: { url },
        message: "上传成功",
      });
    } catch (err) {
      console.error("售后图片上传失败:", err);
      res.status(500).json({
        success: false,
        message: "上传失败",
        error: err.message,
      });
    }
  }
);

// 考试资料发送凭证图片专用上传接口
router.post("/exam-proof", examProofUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/考试资料发送凭证");
      url = generateFileUrl("/考试资料发送凭证", file.filename);
      console.log("考试资料凭证使用COS存储");
    } catch (error) {
      console.warn("考试资料凭证COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "/考试资料发送凭证";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL
      url = `https://xinghuoyuanbang.top/考试资料发送凭证/${file.filename}`;
      console.log("考试资料凭证使用本地存储:", url);
    }

    console.log("考试资料凭证上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });

    res.json({
      success: true,
      data: { url },
      message: "上传成功",
    });
  } catch (err) {
    console.error("考试资料凭证上传失败:", err);
    res.status(500).json({
      success: false,
      message: "上传失败",
      error: err.message,
    });
  }
});

// 图书封面专用上传接口
router.post("/book-cover", bookCoverUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "未收到文件" });
    }

    // 检查COS配置，如果未配置则使用本地存储
    let url;
    try {
      // 尝试上传到COS
      await uploadToCOS(file, "/图书封面");
      url = generateFileUrl("/图书封面", file.filename);
      console.log("图书封面使用COS存储");
    } catch (error) {
      console.warn("图书封面COS上传失败，使用本地存储:", error.message);
      // 回退到本地存储
      const fs = require("fs");
      const path = require("path");

      const dest = "./uploads/图书封面";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const localPath = path.join(dest, file.filename);
      fs.writeFileSync(localPath, file.buffer);

      // 使用本地文件URL
      url = `https://xinghuoyuanbang.top/图书封面/${file.filename}`;
      console.log("图书封面使用本地存储:", url);
    }

    console.log("图书封面上传文件信息:", {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: url,
    });

    res.json({
      success: true,
      data: { url },
      message: "上传成功",
    });
  } catch (err) {
    console.error("图书封面上传失败:", err);
    res.status(500).json({
      success: false,
      message: "上传失败",
      error: err.message,
    });
  }
});

// 考试资料封面上传配置 - 使用内存存储
const examResourceCoverUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片类型
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("只允许上传图片文件"));
    }
    // 生成文件名
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg") {
      ext = ".jpg";
    }
    if (!ext) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        ext = ".jpg";
      } else if (file.mimetype === "image/png") {
        ext = ".png";
      } else if (file.mimetype === "image/webp") {
        ext = ".webp";
      } else {
        ext = ".jpg";
      }
    }
    file.filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`.trim();
    cb(null, true);
  },
});

// 考试资料封面专用上传接口
router.post(
  "/exam-resource-cover",
  examResourceCoverUpload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "未收到文件" });
      }

      // 检查COS配置，如果未配置则使用本地存储
      let url;
      try {
        // 尝试上传到COS
        await uploadToCOS(file, "/考试资料封面");
        url = generateFileUrl("/考试资料封面", file.filename);
        console.log("考试资料封面使用COS存储");
      } catch (error) {
        console.warn("考试资料封面COS上传失败，使用本地存储:", error.message);
        // 回退到本地存储
        const fs = require("fs");
        const path = require("path");

        const dest = "./uploads/考试资料封面";
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        const localPath = path.join(dest, file.filename);
        fs.writeFileSync(localPath, file.buffer);

        // 使用本地文件URL
        url = `https://xinghuoyuanbang.top/考试资料封面/${file.filename}`;
        console.log("考试资料封面使用本地存储:", url);
      }

      console.log("考试资料封面上传文件信息:", {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: url,
      });

      res.json({
        success: true,
        data: { url },
        message: "上传成功",
      });
    } catch (err) {
      console.error("考试资料封面上传失败:", err);
      res.status(500).json({
        success: false,
        message: "上传失败",
        error: err.message,
      });
    }
  }
);

module.exports = router;
