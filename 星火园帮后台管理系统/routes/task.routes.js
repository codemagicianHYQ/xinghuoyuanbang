const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller.js");
const { verifyToken, isAdmin } = require("../middleware/authJwt");
const { taskLimiter } = require("../middleware/security");

/**
 * @swagger
 * /campushelper/api/v1/tasks:
 *   get:
 *     tags: [任务管理]
 *     summary: 获取所有任务
 *     description: 获取所有任务列表，支持分页和筛选
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: taskType
 *         schema:
 *           type: string
 *         description: 任务类型筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 任务状态筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get("/", taskController.getAllTasks);

/**
 * @swagger
 * /campushelper/api/v1/tasks/my-published:
 *   get:
 *     tags: [任务管理]
 *     summary: 获取我发布的任务
 *     description: 获取当前用户发布的任务列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       401:
 *         description: 未授权访问
 */
router.get("/my-published", [verifyToken, taskLimiter], (req, res, next) => {
  req.query.type = "published";
  return taskController.getMyTasks(req, res, next);
});

/**
 * @swagger
 * /campushelper/api/v1/tasks/my-accepted:
 *   get:
 *     tags: [任务管理]
 *     summary: 获取我接受的任务
 *     description: 获取当前用户接受的任务列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       401:
 *         description: 未授权访问
 */
router.get("/my-accepted", [verifyToken, taskLimiter], (req, res, next) => {
  req.query.type = "accepted";
  return taskController.getMyTasks(req, res, next);
});

// 获取用户完成任务数量 - 必须在 /:id 路由之前
router.get(
  "/completed-count",
  [verifyToken],
  taskController.getCompletedTasksCount
);

/**
 * @swagger
 * /campushelper/api/v1/tasks/{id}:
 *   get:
 *     tags: [任务管理]
 *     summary: 获取单个任务
 *     description: 根据任务ID获取任务详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: 任务不存在
 */
// 通过订单号查找任务
router.get(
  "/order/:orderNumber",
  [verifyToken],
  taskController.getTaskByOrderNumber
);

// 公开API：通过订单号查找任务（用于订阅消息跳转）
router.get("/public/order/:orderNumber", taskController.getTaskByOrderNumber);

// 公开API：通过任务ID获取任务详情（用于订阅消息跳转）
router.get("/public/:id", taskController.getTaskById);
// 需要认证的API：通过任务ID获取任务详情
router.get("/:id", [verifyToken], taskController.getTaskById);

/**
 * @swagger
 * /campushelper/api/v1/tasks:
 *   post:
 *     tags: [任务管理]
 *     summary: 创建任务
 *     description: 创建新的任务
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - taskType
 *               - rewardAmount
 *             properties:
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               taskType:
 *                 type: string
 *                 description: 任务类型
 *               rewardAmount:
 *                 type: number
 *                 description: 任务赏金
 *               locationText:
 *                 type: string
 *                 description: 任务地点
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: 截止时间
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 */
router.post("/", [verifyToken, taskLimiter], taskController.createTask);

/**
 * @swagger
 * /campushelper/api/v1/tasks/{id}/accept:
 *   post:
 *     tags: [任务管理]
 *     summary: 接受任务
 *     description: 接单员接受任务
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 接受成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: 任务不存在或状态不允许
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 */
router.post(
  "/:id/accept",
  [verifyToken, taskLimiter],
  taskController.acceptTask
);

/**
 * @swagger
 * /campushelper/api/v1/tasks/{id}:
 *   put:
 *     tags: [任务管理]
 *     summary: 更新任务
 *     description: 更新任务信息或状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               taskType:
 *                 type: string
 *               rewardAmount:
 *                 type: number
 *               locationText:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [open, assigned, acceptor_done, publisher_confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 任务不存在
 */
// 接单员确认完成任务
router.post(
  "/:id/acceptor-confirm-done",
  [verifyToken, taskLimiter],
  taskController.acceptorConfirmDone
);

// 发布者确认完成任务
router.post(
  "/:id/publisher-confirm-done",
  [verifyToken, taskLimiter],
  taskController.publisherConfirmDone
);

// 自动确认完成任务（定时任务调用，需要管理员权限）
router.post(
  "/auto-confirm-done",
  [verifyToken, isAdmin],
  taskController.autoConfirmDone
);

router.put("/:id", [verifyToken, taskLimiter], taskController.updateTask);

// --- Admin Routes for Task Management ---
// 管理员获取所有任务
router.get(
  "/admin/all",
  [verifyToken, isAdmin, taskLimiter],
  taskController.adminGetAllTasks
);

// 管理员创建任务
router.post(
  "/admin/tasks",
  [verifyToken, isAdmin, taskLimiter],
  taskController.adminCreateTask
);

// 管理员更新任务
router.put(
  "/admin/tasks/:id",
  [verifyToken, isAdmin, taskLimiter],
  taskController.adminUpdateTask
);

// 管理员删除任务
router.delete(
  "/admin/tasks/:id",
  [verifyToken, isAdmin, taskLimiter],
  taskController.adminDeleteTask
);

// 首页推荐任务（最新10条）
router.get("/home-recommend", taskController.getHomeRecommendTasks);

// 转单功能
router.post("/:id/transfer", [verifyToken], taskController.transferTask);

// 驳回订单功能
router.post("/:id/reject", [verifyToken], taskController.rejectTask);

module.exports = router;
