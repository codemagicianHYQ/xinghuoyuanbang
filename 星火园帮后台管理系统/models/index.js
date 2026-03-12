const Sequelize = require("sequelize");
const sequelize = new Sequelize("users", "root", "Hyq@1471753670", {
  host: "10.0.4.11",
  port: 3306,
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 30000, // 减少连接超时时间
    timezone: "+08:00", // 设置时区为北京时间
  },
  timezone: "+08:00", // Sequelize 时区设置
  logging: false,
  pool: {
    max: 2, // 减少最大连接数
    min: 0,
    acquire: 30000, // 减少获取连接超时时间
    idle: 5000, // 减少空闲连接时间
    evict: 1000, // 添加连接回收时间
  },
  // 添加查询超时配置
  define: {
    timestamps: true,
    underscored: false,
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
    max: 3,
  },
});

// 加载 User 模型
const User = require("./user.model.js")(sequelize, Sequelize);
const Task = require("./task.model.js")(sequelize, Sequelize);
const Chat = require("./chat.model.js")(sequelize, Sequelize);
const Feedback = require("./feedback.model.js")(sequelize, Sequelize);
const Withdrawal = require("./withdrawal.model.js")(sequelize, Sequelize);
const Resource = require("./resource.model.js")(sequelize, Sequelize);
const CampusResource = require("./campusResource.model.js")(
  sequelize,
  Sequelize
);
const Comment = require("./comment.model.js")(sequelize, Sequelize);
const Book = require("./book.model.js")(sequelize, Sequelize);
const DispatchTeam = require("./dispatchTeam.model.js")(sequelize, Sequelize);
const TeamApplication = require("./teamApplication.model.js")(
  sequelize,
  Sequelize
);
const TeamMember = require("./teamMember.model.js")(sequelize, Sequelize);
const MarketProduct = require("./marketProduct.model.js")(sequelize, Sequelize);
const Follow = require("./follow.model.js")(sequelize, Sequelize);
const SystemMessage = require("./SystemMessage.js");
const SystemBroadcast = require("./SystemBroadcast.js");
const UserBroadcastRead = require("./UserBroadcastRead.js");
const Community = require("./community.model.js")(sequelize, Sequelize);
const PageConfig = require("./pageConfig.model.js")(sequelize, Sequelize);
const AfterSales = require("./afterSales.model.js");
const ExamProof = require("./examProof.model.js")(sequelize, Sequelize);

// 连接事件监听（简化版本，避免API兼容性问题）
// 注意：某些Sequelize版本可能不支持connectionManager事件监听

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;
db.Task = Task;
db.Chat = Chat;
db.Feedback = Feedback;
db.Withdrawal = Withdrawal;
db.Resource = Resource;
db.CampusResource = CampusResource;
db.Comment = Comment;
db.Book = Book;
db.DispatchTeam = DispatchTeam;
db.TeamApplication = TeamApplication;
db.TeamMember = TeamMember;
db.MarketProduct = MarketProduct;
db.SystemMessage = SystemMessage;
db.SystemBroadcast = SystemBroadcast;
db.UserBroadcastRead = UserBroadcastRead;
db.Community = Community;
db.PageConfig = PageConfig;
db.AfterSales = AfterSales;
db.ExamProof = ExamProof;

// 预留地址模型加载和关联（如有 userAddress.model.js 时启用）
const UserAddress = require("./userAddress.model.js")(sequelize, Sequelize);
db.UserAddress = UserAddress;
db.User.hasMany(UserAddress, { foreignKey: "userId", as: "addresses" });
db.UserAddress.belongsTo(User, { foreignKey: "userId", as: "user" });

// 任务与用户的关联
Task.belongsTo(User, { foreignKey: "publisherId", as: "publisher" });
Task.belongsTo(User, { foreignKey: "acceptorId", as: "acceptor" });
User.hasMany(Task, { foreignKey: "publisherId", as: "publishedTasks" });
User.hasMany(Task, { foreignKey: "acceptorId", as: "acceptedTasks" });

// 聊天与用户的关联
Chat.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Chat.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });
User.hasMany(Chat, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Chat, { foreignKey: "receiverId", as: "receivedMessages" });

// 聊天与任务的关联（taskId 可以为 NULL）- 暂时注释掉关联
// Chat.belongsTo(Task, { foreignKey: "taskId", as: "task", constraints: false });
// Task.hasMany(Chat, { foreignKey: "taskId", as: "chats", constraints: false });

// 校园资源与用户的关联
CampusResource.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(CampusResource, {
  foreignKey: "createdBy",
  as: "campusResources",
});

// 评论关联
Comment.belongsTo(CampusResource, {
  foreignKey: "campusResourceId",
  as: "campusResource",
});
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });
Comment.hasMany(Comment, {
  foreignKey: "parentId",
  as: "replies",
  onDelete: "CASCADE",
});

CampusResource.hasMany(Comment, {
  foreignKey: "campusResourceId",
  as: "comments",
  onDelete: "CASCADE",
});
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });

// 关注关系关联
Follow.belongsTo(User, { foreignKey: "followerId", as: "follower" });
Follow.belongsTo(User, { foreignKey: "followingId", as: "following" });
User.hasMany(Follow, { foreignKey: "followerId", as: "following" });
User.hasMany(Follow, { foreignKey: "followingId", as: "followers" });

// 反馈与用户的关联
Feedback.belongsTo(User, { foreignKey: "userId", as: "user" });
Feedback.belongsTo(User, { foreignKey: "adminId", as: "admin" });
User.hasMany(Feedback, { foreignKey: "userId", as: "feedbacks" });
User.hasMany(Feedback, { foreignKey: "adminId", as: "processedFeedbacks" });

// 提现与用户的关联
Withdrawal.belongsTo(User, { foreignKey: "userId", as: "user" });
Withdrawal.belongsTo(User, { foreignKey: "adminId", as: "admin" });
User.hasMany(Withdrawal, { foreignKey: "userId", as: "withdrawals" });
User.hasMany(Withdrawal, { foreignKey: "adminId", as: "processedWithdrawals" });

// 派单团队相关关联
DispatchTeam.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(DispatchTeam, { foreignKey: "createdBy", as: "createdTeams" });

TeamApplication.belongsTo(User, { foreignKey: "userId", as: "applicant" });
TeamApplication.belongsTo(DispatchTeam, { foreignKey: "teamId", as: "team" });
TeamApplication.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });
User.hasMany(TeamApplication, { foreignKey: "userId", as: "teamApplications" });
User.hasMany(TeamApplication, {
  foreignKey: "reviewedBy",
  as: "reviewedApplications",
});
DispatchTeam.hasMany(TeamApplication, {
  foreignKey: "teamId",
  as: "applications",
});

TeamMember.belongsTo(DispatchTeam, { foreignKey: "teamId", as: "team" });
TeamMember.belongsTo(User, { foreignKey: "userId", as: "user" });
DispatchTeam.hasMany(TeamMember, { foreignKey: "teamId", as: "members" });
User.hasMany(TeamMember, { foreignKey: "userId", as: "teamMemberships" });

// 市场商品相关关联
MarketProduct.belongsTo(User, { foreignKey: "sellerId", as: "seller" });
MarketProduct.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });
User.hasMany(MarketProduct, { foreignKey: "sellerId", as: "marketProducts" });
User.hasMany(MarketProduct, { foreignKey: "buyerId", as: "purchasedProducts" });

// 系统消息与用户的关联
SystemMessage.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(SystemMessage, { foreignKey: "userId", as: "systemMessages" });

// 广播消息与用户阅读记录的关联
UserBroadcastRead.belongsTo(User, { foreignKey: "userId", as: "user" });
UserBroadcastRead.belongsTo(SystemBroadcast, {
  foreignKey: "broadcastId",
  as: "broadcast",
});
User.hasMany(UserBroadcastRead, { foreignKey: "userId", as: "broadcastReads" });
SystemBroadcast.hasMany(UserBroadcastRead, {
  foreignKey: "broadcastId",
  as: "userReads",
});

// 社区相关关联（只有任务与社区关联，用户不关联社区）
Task.belongsTo(Community, { foreignKey: "communityId", as: "community" });
Community.hasMany(Task, { foreignKey: "communityId", as: "tasks" });

// 售后申请相关关联
AfterSales.belongsTo(Task, { foreignKey: "taskId", as: "task" });
AfterSales.belongsTo(User, { foreignKey: "userId", as: "user" });
AfterSales.belongsTo(Community, { foreignKey: "communityId", as: "community" });
Task.hasMany(AfterSales, { foreignKey: "taskId", as: "afterSales" });
User.hasMany(AfterSales, { foreignKey: "userId", as: "afterSales" });
Community.hasMany(AfterSales, { foreignKey: "communityId", as: "afterSales" });

// 数据库同步已禁用，手动管理表结构
// sequelize.sync() 相关代码已删除

module.exports = db;

// 为了支持解构导入，也导出各个模型
module.exports.User = User;
module.exports.Task = Task;
module.exports.Chat = Chat;
module.exports.Feedback = Feedback;
module.exports.Withdrawal = Withdrawal;
module.exports.Resource = Resource;
module.exports.CampusResource = CampusResource;
module.exports.Book = Book;
module.exports.UserAddress = UserAddress;
module.exports.DispatchTeam = DispatchTeam;
module.exports.TeamApplication = TeamApplication;
module.exports.TeamMember = TeamMember;
module.exports.MarketProduct = MarketProduct;
module.exports.Follow = Follow;
module.exports.SystemMessage = SystemMessage;
module.exports.SystemBroadcast = SystemBroadcast;
module.exports.UserBroadcastRead = UserBroadcastRead;
module.exports.Community = Community;
module.exports.ExamProof = ExamProof;
