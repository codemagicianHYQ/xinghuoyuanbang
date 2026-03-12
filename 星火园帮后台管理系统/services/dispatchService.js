// services/dispatchService.js
const db = require("../models");
const { Task, DispatchTeam, TeamMember, User } = db;

class DispatchService {
  /**
   * 自动派单给校园自营团队
   * @param {Object} task - 任务对象
   * @returns {Object} 派单结果
   */
  static async autoDispatchToCampusTeam(task) {
    try {
      console.log(`[DispatchService] 开始为任务 ${task.id} 进行自动派单`);

      // 查找校园自营团队
      const campusTeam = await DispatchTeam.findOne({
        where: { type: "campus", status: "active" },
        include: [
          {
            model: TeamMember,
            as: "members",
            where: { status: "active" },
            include: [
              {
                model: User,
                as: "user",
                where: {
                  role: "rider",
                  riderApplicationStatus: "approved",
                },
              },
            ],
          },
        ],
      });

      if (!campusTeam) {
        console.log("[DispatchService] 未找到活跃的校园自营团队");
        return {
          success: false,
          message: "暂无可用的校园自营团队",
        };
      }

      if (!campusTeam.members || campusTeam.members.length === 0) {
        console.log("[DispatchService] 校园自营团队暂无活跃成员");
        return {
          success: false,
          message: "校园自营团队暂无可用成员",
        };
      }

      // 根据派单规则选择合适的成员
      const selectedMember = await this.selectBestMember(
        task,
        campusTeam.members
      );

      if (!selectedMember) {
        console.log("[DispatchService] 未找到合适的团队成员");
        return {
          success: false,
          message: "暂无可用的团队成员",
        };
      }

      // 执行派单
      const dispatchResult = await this.executeDispatch(task, selectedMember);

      console.log(
        `[DispatchService] 任务 ${task.id} 派单完成，分配给用户 ${selectedMember.user.nickname}`
      );

      return dispatchResult;
    } catch (error) {
      console.error("[DispatchService] 自动派单失败:", error);
      return {
        success: false,
        message: "派单失败，请稍后重试",
      };
    }
  }

  /**
   * 根据派单规则选择最佳成员
   * @param {Object} task - 任务对象
   * @param {Array} members - 团队成员列表
   * @returns {Object} 选中的成员
   */
  static async selectBestMember(task, members) {
    try {
      // 获取派单规则
      const dispatchRules = {
        maxConcurrentTasks: 3,
        minRating: 4.0,
        responseTimeLimit: 300,
      };

      // 过滤符合条件的成员
      const eligibleMembers = [];

      for (const member of members) {
        // 检查当前任务数
        const currentTaskCount = await Task.count({
          where: {
            acceptorId: member.userId,
            status: ["open", "assigned"],
          },
        });

        if (currentTaskCount >= dispatchRules.maxConcurrentTasks) {
          continue; // 跳过任务数已满的成员
        }

        // 检查用户评分（如果有的话）
        // 这里可以添加评分检查逻辑

        eligibleMembers.push({
          ...member,
          currentTaskCount,
          score: this.calculateMemberScore(member, task),
        });
      }

      if (eligibleMembers.length === 0) {
        return null;
      }

      // 按分数排序，选择最佳成员
      eligibleMembers.sort((a, b) => b.score - a.score);

      return eligibleMembers[0];
    } catch (error) {
      console.error("[DispatchService] 选择成员失败:", error);
      return null;
    }
  }

  /**
   * 计算成员分数
   * @param {Object} member - 成员对象
   * @param {Object} task - 任务对象
   * @returns {Number} 分数
   */
  static calculateMemberScore(member, task) {
    let score = 100; // 基础分数

    // 根据当前任务数调整分数
    score -= member.currentTaskCount * 10;

    // 根据工作时间调整分数
    const now = new Date();
    const hour = now.getHours();

    // 工作时间加分
    if (hour >= 8 && hour <= 12) {
      score += 5; // 上午时段
    } else if (hour >= 14 && hour <= 18) {
      score += 5; // 下午时段
    } else if (hour >= 18 && hour <= 22) {
      score += 3; // 晚上时段
    } else {
      score -= 10; // 非工作时间
    }

    // 根据服务区域调整分数
    // 这里可以根据任务位置和成员服务区域进行匹配

    return Math.max(0, score); // 确保分数不为负数
  }

  /**
   * 执行派单
   * @param {Object} task - 任务对象
   * @param {Object} member - 选中的成员
   * @returns {Object} 派单结果
   */
  static async executeDispatch(task, member) {
    try {
      // 更新任务状态
      await task.update({
        acceptorId: member.userId,
        status: "assigned",
        assignedAt: new Date(),
      });

      // 这里可以添加通知逻辑，比如发送微信消息给接单员

      return {
        success: true,
        message: "派单成功",
        data: {
          taskId: task.id,
          acceptorId: member.userId,
          acceptorName: member.user.nickname,
        },
      };
    } catch (error) {
      console.error("[DispatchService] 执行派单失败:", error);
      return {
        success: false,
        message: "派单执行失败",
      };
    }
  }

  /**
   * 手动派单
   * @param {String} taskId - 任务ID
   * @param {String} userId - 用户ID
   * @returns {Object} 派单结果
   */
  static async manualDispatch(taskId, userId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        return {
          success: false,
          message: "任务不存在",
        };
      }

      if (task.status !== "open") {
        return {
          success: false,
          message: "任务状态不允许派单",
        };
      }

      const user = await User.findByPk(userId);
      if (
        !user ||
        (user.role !== "rider" && user.riderApplicationStatus !== "approved")
      ) {
        return {
          success: false,
          message: "用户不是有效的接单员",
        };
      }

      // 检查用户是否在校园自营团队中
      const teamMember = await TeamMember.findOne({
        where: { userId: userId, status: "active" },
        include: [
          {
            model: DispatchTeam,
            as: "team",
            where: { type: "campus", status: "active" },
          },
        ],
      });

      if (!teamMember) {
        return {
          success: false,
          message: "用户不在校园自营团队中",
        };
      }

      // 执行派单
      await task.update({
        acceptorId: userId,
        status: "assigned",
        assignedAt: new Date(),
      });

      return {
        success: true,
        message: "手动派单成功",
        data: {
          taskId: task.id,
          acceptorId: userId,
          acceptorName: user.nickname,
        },
      };
    } catch (error) {
      console.error("[DispatchService] 手动派单失败:", error);
      return {
        success: false,
        message: "手动派单失败",
      };
    }
  }
}

module.exports = DispatchService;
