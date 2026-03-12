// config/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "星火园帮 API 文档",
      version: "1.0.0",
      description: "星火园帮校园互助平台后台管理系统 API 文档",
      contact: {
        name: "星火园帮开发团队",
        email: "support@xinghuo-yuanbang.com",
      },
    },
    servers: [
      {
        url: "http://localhost:1111",
        description: "开发环境",
      },
      {
        url: "https://api.xinghuo-yuanbang.com",
        description: "生产环境",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "用户唯一标识符",
              example: "abc123def456",
            },
            openid: {
              type: "string",
              description: "微信 OpenID",
            },
            nickname: {
              type: "string",
              description: "用户昵称",
              example: "小明",
            },
            avatarUrl: {
              type: "string",
              description: "头像URL",
            },

            role: {
              type: "string",
              enum: ["user", "rider", "admin"],
              description: "用户角色",
            },
            isVerified: {
              type: "boolean",
              description: "是否已验证",
            },
            gender: {
              type: "integer",
              enum: [0, 1, 2],
              description: "性别：0-未知, 1-男, 2-女",
            },
            phoneNumber: {
              type: "string",
              description: "手机号码",
            },
            school: {
              type: "string",
              description: "学校名称",
            },

            realName: {
              type: "string",
              description: "真实姓名",
            },
            riderApplicationStatus: {
              type: "string",
              enum: ["none", "pending", "approved", "rejected"],
              description: "接单员申请状态",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "创建时间",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "更新时间",
            },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "任务ID",
            },
            title: {
              type: "string",
              description: "任务标题",
              example: "帮忙取快递",
            },
            description: {
              type: "string",
              description: "任务描述",
            },
            taskType: {
              type: "string",
              description: "任务类型",
              example: "takeaway",
            },
            rewardAmount: {
              type: "number",
              format: "decimal",
              description: "奖励金额",
              example: 5.0,
            },
            locationText: {
              type: "string",
              description: "位置描述",
            },
            status: {
              type: "string",
              enum: [
                "open",
                "assigned",
                "acceptor_done",
                "publisher_confirmed",
                "cancelled",
                "expired",
              ],
              description: "任务状态",
            },
            publisherId: {
              type: "string",
              description: "发布者ID",
            },
            acceptorId: {
              type: "string",
              description: "接单者ID",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "截止时间",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "创建时间",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "更新时间",
            },
          },
        },
        UserAddress: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "地址ID",
            },
            userId: {
              type: "string",
              description: "用户ID",
            },
            name: {
              type: "string",
              description: "地址标签",
              example: "宿舍",
            },
            detail: {
              type: "string",
              description: "详细地址",
              example: "学生公寓1号楼101室",
            },
            phone: {
              type: "string",
              description: "联系电话",
            },
            isDefault: {
              type: "boolean",
              description: "是否为默认地址",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "响应消息",
            },
            data: {
              type: "object",
              description: "响应数据",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            totalItems: {
              type: "integer",
              description: "总记录数",
            },
            totalPages: {
              type: "integer",
              description: "总页数",
            },
            currentPage: {
              type: "integer",
              description: "当前页码",
            },
            data: {
              type: "array",
              items: {},
              description: "数据列表",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./models/*.js"],
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions: {
    explorer: true,
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      showRequestDuration: true,
    },
  },
};
