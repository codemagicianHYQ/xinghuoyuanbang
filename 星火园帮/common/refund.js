import request from "./request.js";

// 申请退款
export function applyRefund(orderId, refundAmount, refundReason) {
  return request({
    url: "/refund/apply",
    method: "POST",
    data: {
      orderId,
      refundAmount,
      refundReason,
    },
  });
}

// 查询退款状态
export function getRefundStatus(refundNo) {
  return request({
    url: `/refund/status/${refundNo}`,
    method: "GET",
  });
}

// 获取订单退款记录
export function getOrderRefunds(orderId) {
  return request({
    url: `/refund/order/${orderId}`,
    method: "GET",
  });
}

// 取消订单并申请退款
export function cancelOrderAndRefund(taskId, reason = "用户取消订单") {
  return request({
    url: "/refund/apply",
    method: "POST",
    data: {
      taskId,
      refundAmount: 0, // 全额退款，从任务中获取金额
      refundReason: reason,
    },
  });
}
