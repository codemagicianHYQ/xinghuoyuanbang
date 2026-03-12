import axiosInstance from "./axiosInstance";

// 获取仪表盘汇总数据
export const getDashboardSummary = async () => {
  try {
    const response = await axiosInstance.get("/dashboard/summary");
    return response.data;
  } catch (error) {
    console.error("获取仪表盘汇总数据失败:", error);
    throw error;
  }
};

// 获取任务趋势数据
export const getTaskTrend = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get("/dashboard/task-trend", {
      params: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    });
    return response.data;
  } catch (error) {
    console.error("获取任务趋势数据失败:", error);
    throw error;
  }
};

// 获取用户活跃度数据
export const getUserActivity = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get("/dashboard/user-activity", {
      params: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    });
    return response.data;
  } catch (error) {
    console.error("获取用户活跃度数据失败:", error);
    throw error;
  }
};

// 获取最近任务列表
export const getRecentTasks = async (limit = 5) => {
  try {
    const response = await axiosInstance.get("/dashboard/recent-tasks", {
      params: {
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("获取最近任务失败:", error);
    throw error;
  }
};

// 获取营业流水统计
export const getRevenueStats = async (params) => {
  try {
    const response = await axiosInstance.get("/dashboard/revenue-stats", {
      params,
    });
    return response;
  } catch (error) {
    console.error("获取营业流水统计失败:", error);
    throw error;
  }
};

// 获取利润趋势数据
export const getProfitTrend = async (params) => {
  try {
    const response = await axiosInstance.get("/dashboard/profit-trend", {
      params,
    });
    return response;
  } catch (error) {
    console.error("获取利润趋势数据失败:", error);
    throw error;
  }
};
