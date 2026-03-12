// routes/wallet.routes.js
const express = require("express");
const router = express.Router();
const WalletService = require("../services/walletService");
const { authJwt } = require("../middleware");
const db = require("../models");
const { User } = db;

// 获取用户钱包信息
router.get("/info", [authJwt.verifyToken], async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, date } = req.query;
    const result = await WalletService.getWalletInfo(
      userId,
      parseInt(page),
      parseInt(limit),
      date
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("获取钱包信息失败:", error);
    res.status(500).json({
      success: false,
      message: "获取钱包信息失败",
      error: error.message,
    });
  }
});

// 获取用户钱包余额
router.get("/balance", [authJwt.verifyToken], async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    res.status(200).json({
      success: true,
      balance: parseFloat(user.walletBalance),
    });
  } catch (error) {
    console.error("获取钱包余额失败:", error);
    res.status(500).json({
      success: false,
      message: "获取钱包余额失败",
      error: error.message,
    });
  }
});

// 获取用户提现记录
router.get("/withdrawals", [authJwt.verifyToken], async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const result = await WalletService.getUserWithdrawals(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    // 调试日志：检查时间字段
    if (result.withdrawals && result.withdrawals.length > 0) {
      console.log("第一条提现记录的时间字段:", {
        applyTime: result.withdrawals[0].applyTime,
        applyTimeType: typeof result.withdrawals[0].applyTime,
        applyTimeValue: result.withdrawals[0].applyTime,
      });
    }

    res.status(200).json({
      success: true,
      data: result, // 返回完整结果对象，包含withdrawals数组
    });
  } catch (error) {
    console.error("获取提现记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取提现记录失败",
      error: error.message,
    });
  }
});

// 获取用户任务收入记录
router.get("/task-earnings", [authJwt.verifyToken], async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 15, date } = req.query;

    const result = await WalletService.getUserTaskEarnings(
      userId,
      parseInt(page),
      parseInt(limit),
      date
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("获取任务收入记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取任务收入记录失败",
      error: error.message,
    });
  }
});

// 申请提现
router.post("/withdraw", [authJwt.verifyToken], async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, withdrawType = "wechat" } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "提现金额必须大于0",
      });
    }

    const result = await WalletService.applyThirdPartyWithdrawal(
      userId,
      amount
    );

    // 直接返回完整结果
    res.status(200).json(result);
  } catch (error) {
    console.error("申请提现失败:", error);
    res.status(500).json({
      success: false,
      message: "申请提现失败",
      error: error.message,
    });
  }
});

// 查询提现状态
router.get("/withdrawal/:id", [authJwt.verifyToken], async (req, res) => {
  try {
    const userId = req.userId;
    const withdrawalId = req.params.id;

    // 验证提现记录是否属于当前用户
    const withdrawal = await db.Withdrawal.findOne({
      where: { id: withdrawalId, userId: userId },
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "提现记录不存在",
      });
    }

    const result = await WalletService.queryThirdPartyTransferResult(
      withdrawalId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("查询提现状态失败:", error);
    res.status(500).json({
      success: false,
      message: "查询提现状态失败",
      error: error.message,
    });
  }
});

// 完成转账（使用获取到的openid）
router.post("/complete-transfer", [authJwt.verifyToken], async (req, res) => {
  try {
    const { withdrawalId, openid, encdata, ivtick } = req.body;

    if (!withdrawalId || !openid || !encdata || !ivtick) {
      return res.status(400).json({
        success: false,
        message: "缺少必要参数",
      });
    }

    // 查找提现记录
    const withdrawal = await db.Withdrawal.findByPk(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "提现记录不存在",
      });
    }

    // 验证签名
    const thirdPartyService = require("../services/thirdPartyRedPacketService");
    const isValid = thirdPartyService.verifyOpenid(openid, ivtick, encdata);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "签名验证失败",
      });
    }

    // 使用新的openid进行转账
    const transferResult = await thirdPartyService.transferToUser({
      openid: openid,
      amount: parseFloat(withdrawal.amount),
      orderId: withdrawal.thirdPartyOrderId || `WD${Date.now()}`,
    });

    if (transferResult.success) {
      // 转账成功，扣除用户余额
      const user = await db.User.findByPk(withdrawal.userId);
      if (user) {
        const newBalance =
          parseFloat(user.walletBalance) - parseFloat(withdrawal.amount);
        await user.update({
          walletBalance: newBalance,
          totalWithdrawn:
            parseFloat(user.totalWithdrawn) + parseFloat(withdrawal.amount),
        });
      }

      // 更新提现记录状态
      await withdrawal.update({
        status: "completed",
        completeTime: new Date(),
        thirdPartyTicket: transferResult.data.ticket,
        thirdPartyOrderId: transferResult.data.orderId,
      });

      res.status(200).json({
        success: true,
        message: "提现成功！资金已转入微信零钱",
        data: {
          orderId: transferResult.data.orderId,
          ticket: transferResult.data.ticket,
          amount: withdrawal.amount,
          status: "completed",
        },
      });
    } else {
      // 转账失败，更新提现记录状态
      await withdrawal.update({
        status: "failed",
        completeTime: new Date(),
      });

      throw new Error(transferResult.message || "第三方转账失败");
    }
  } catch (error) {
    console.error("完成转账失败:", error);
    res.status(500).json({
      success: false,
      message: "完成转账失败",
      error: error.message,
    });
  }
});

// 第三方授权回调接口（短路径）
router.get("/callback", async (req, res) => {
  try {
    const {
      u: userId,
      a: amount,
      o: orderId,
      u_openid,
      encdata,
      ivtick,
    } = req.query;

    console.log("收到第三方授权回调:", {
      userId,
      amount,
      orderId,
      u_openid,
      encdata,
      ivtick,
    });

    if (!userId || !amount || !orderId || !u_openid) {
      return res.status(400).json({
        success: false,
        message: "缺少必要参数",
      });
    }

    // 验证签名
    const thirdPartyService = require("../services/thirdPartyRedPacketService");
    const isValid = thirdPartyService.verifyOpenid(u_openid, ivtick, encdata);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "签名验证失败",
      });
    }

    // 立即返回HTML页面，不等待转账完成
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>提现处理成功</title>
      </head>
      <body>
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
          <h2 style="color: #4CAF50;">✅ 提现处理成功</h2>
          <p>转账已完成！</p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">提现已完成，请点击下方按钮返回</p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">如果页面没有自动跳转，请手动点击返回按钮</p>
          <button onclick="manualReturn()" style="margin-top: 30px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
            手动返回
          </button>
        </div>
        <script>
          // 检测环境并自动跳转
          function autoReturn() {
            console.log('开始检测环境...');
            console.log('wx对象:', typeof wx);
            console.log('wx.miniProgram:', typeof wx !== 'undefined' ? typeof wx.miniProgram : 'undefined');
            console.log('WeixinJSBridge:', typeof WeixinJSBridge);
            
            // 尝试多种方式关闭页面
            if (typeof wx !== 'undefined' && wx.miniProgram) {
              console.log('检测到微信小程序环境');
              try {
                // 微信小程序环境 - 先发送成功消息
                wx.miniProgram.postMessage({
                  data: { type: 'withdraw_success' }
                });
                console.log('已发送成功消息');
                
                // 延迟返回
                setTimeout(() => {
                  console.log('准备返回小程序');
                  wx.miniProgram.navigateBack();
                }, 1000);
              } catch (error) {
                console.error('小程序返回失败:', error);
                // 备用方案
                setTimeout(() => {
                  window.history.back();
                }, 1000);
              }
            } else if (typeof WeixinJSBridge !== 'undefined') {
              console.log('检测到微信浏览器环境');
              try {
                WeixinJSBridge.call('closeWindow');
              } catch (error) {
                console.error('微信浏览器关闭失败:', error);
                window.history.back();
              }
            } else if (window.history.length > 1) {
              console.log('使用浏览器返回');
              window.history.back();
            } else {
              console.log('尝试关闭窗口');
              window.close();
            }
          }
          
          // 手动返回函数
          function manualReturn() {
            console.log('用户点击手动返回');
            autoReturn();
          }
          
          // 页面加载完成后延迟执行
          window.addEventListener('load', function() {
            console.log('页面加载完成，2秒后自动返回');
            setTimeout(autoReturn, 2000);
          });
          
          // 备用方案：如果load事件没触发，直接延迟执行
          setTimeout(function() {
            console.log('备用方案：直接执行自动返回');
            autoReturn();
          }, 3000);
        </script>
      </body>
      </html>
    `;

    // 立即返回HTML页面
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(htmlContent);

    // 异步处理转账（不阻塞响应）
    setImmediate(async () => {
      try {
        console.log("开始异步处理转账...");

        const transferResult = await thirdPartyService.transferToUser({
          openid: u_openid,
          amount: parseFloat(amount),
          orderId: orderId,
        });

        if (transferResult.success) {
          console.log("查找提现记录，订单号:", orderId);
          const withdrawal = await db.Withdrawal.findOne({
            where: { thirdPartyOrderId: orderId },
          });

          console.log(
            "查找提现记录结果:",
            withdrawal ? `找到记录 ID: ${withdrawal.id}` : "未找到记录"
          );

          if (withdrawal) {
            console.log("提现记录详情:", {
              id: withdrawal.id,
              userId: withdrawal.userId,
              amount: withdrawal.amount,
              status: withdrawal.status,
              thirdPartyOrderId: withdrawal.thirdPartyOrderId,
            });

            const user = await db.User.findByPk(withdrawal.userId);
            console.log(
              "查找用户结果:",
              user ? `找到用户 ID: ${user.id}` : "未找到用户"
            );

            if (user) {
              console.log("用户当前余额:", user.walletBalance);
              console.log("用户当前总提现:", user.totalWithdrawn);

              const newBalance =
                parseFloat(user.walletBalance) - parseFloat(withdrawal.amount);
              console.log("计算新余额:", newBalance);

              try {
                await user.update({
                  walletBalance: newBalance,
                  totalWithdrawn:
                    parseFloat(user.totalWithdrawn) +
                    parseFloat(withdrawal.amount),
                });
              } catch (userUpdateError) {
                console.error("更新用户余额失败:", userUpdateError);
                throw userUpdateError;
              }
            }

            try {
              console.log("准备更新提现记录...");
              console.log("更新数据:", {
                status: "completed",
                completeTime: new Date(),
                thirdPartyTicket: transferResult.data.ticket,
              });

              await withdrawal.update({
                status: "completed",
                completeTime: new Date(),
                thirdPartyTicket: transferResult.data.ticket,
              });

              console.log("数据库更新完成");
            } catch (updateError) {
              console.error("更新提现记录失败:", updateError);
              console.error("更新数据:", {
                status: "completed",
                completeTime: new Date(),
                thirdPartyTicket: transferResult.data.ticket,
              });
              throw updateError;
            }
          } else {
            console.error("未找到对应的提现记录，订单号:", orderId);
          }
        } else {
          console.error("转账失败:", transferResult.message);

          console.log("查找提现记录，订单号:", orderId);
          const withdrawal = await db.Withdrawal.findOne({
            where: { thirdPartyOrderId: orderId },
          });

          console.log(
            "查找提现记录结果:",
            withdrawal ? `找到记录 ID: ${withdrawal.id}` : "未找到记录"
          );

          if (withdrawal) {
            await withdrawal.update({
              status: "failed",
              completeTime: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("异步处理转账失败:", error);
        console.error("错误堆栈:", error.stack);
        console.error("错误详情:", {
          message: error.message,
          name: error.name,
          code: error.code,
        });
      }
    });
  } catch (error) {
    console.error("处理授权回调失败:", error);
    res.status(500).json({
      success: false,
      message: "处理授权回调失败",
      error: error.message,
    });
  }
});

// 第三方授权回调接口（原路径，保持兼容性）
router.get("/withdraw-callback", async (req, res) => {
  try {
    const { userId, amount, orderId, u_openid, encdata, ivtick } = req.query;

    console.log("收到第三方授权回调:", {
      userId,
      amount,
      orderId,
      u_openid,
      encdata,
      ivtick,
    });

    if (!userId || !amount || !orderId || !u_openid) {
      return res.status(400).json({
        success: false,
        message: "缺少必要参数",
      });
    }

    // 验证签名
    const thirdPartyService = require("../services/thirdPartyRedPacketService");
    const isValid = thirdPartyService.verifyOpenid(u_openid, ivtick, encdata);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "签名验证失败",
      });
    }

    // 立即返回HTML页面，不等待转账完成
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>提现处理成功</title>
      </head>
      <body>
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
          <h2 style="color: #4CAF50;">✅ 提现处理成功</h2>
          <p>转账已完成！</p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">提现已完成，请点击下方按钮返回</p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">如果页面没有自动跳转，请手动点击返回按钮</p>
          <button onclick="manualReturn()" style="margin-top: 30px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
            手动返回
          </button>
        </div>
        <script>
          // 检测环境并自动跳转
          function autoReturn() {
            console.log('开始检测环境...');
            console.log('wx对象:', typeof wx);
            console.log('wx.miniProgram:', typeof wx !== 'undefined' ? typeof wx.miniProgram : 'undefined');
            console.log('WeixinJSBridge:', typeof WeixinJSBridge);
            
            // 尝试多种方式关闭页面
            if (typeof wx !== 'undefined' && wx.miniProgram) {
              console.log('检测到微信小程序环境');
              try {
                // 微信小程序环境 - 先发送成功消息
                wx.miniProgram.postMessage({
                  data: { type: 'withdraw_success' }
                });
                console.log('已发送成功消息');
                
                // 延迟返回
                setTimeout(() => {
                  console.log('准备返回小程序');
                  wx.miniProgram.navigateBack();
                }, 1000);
              } catch (error) {
                console.error('小程序返回失败:', error);
                // 备用方案
                setTimeout(() => {
                  window.history.back();
                }, 1000);
              }
            } else if (typeof WeixinJSBridge !== 'undefined') {
              console.log('检测到微信浏览器环境');
              try {
                WeixinJSBridge.call('closeWindow');
              } catch (error) {
                console.error('微信浏览器关闭失败:', error);
                window.history.back();
              }
            } else if (window.history.length > 1) {
              console.log('使用浏览器返回');
              window.history.back();
            } else {
              console.log('尝试关闭窗口');
              window.close();
            }
          }
          
          // 手动返回函数
          function manualReturn() {
            console.log('用户点击手动返回');
            autoReturn();
          }
          
          // 页面加载完成后延迟执行
          window.addEventListener('load', function() {
            console.log('页面加载完成，2秒后自动返回');
            setTimeout(autoReturn, 2000);
          });
          
          // 备用方案：如果load事件没触发，直接延迟执行
          setTimeout(function() {
            console.log('备用方案：直接执行自动返回');
            autoReturn();
          }, 3000);
        </script>
      </body>
      </html>
    `;

    // 立即返回HTML页面
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(htmlContent);

    // 异步处理转账（不阻塞响应）
    setImmediate(async () => {
      try {
        console.log("开始异步处理转账...");

        const transferResult = await thirdPartyService.transferToUser({
          openid: u_openid,
          amount: parseFloat(amount),
          orderId: orderId,
        });

        if (transferResult.success) {
          console.log("查找提现记录，订单号:", orderId);
          const withdrawal = await db.Withdrawal.findOne({
            where: { thirdPartyOrderId: orderId },
          });

          console.log(
            "查找提现记录结果:",
            withdrawal ? `找到记录 ID: ${withdrawal.id}` : "未找到记录"
          );

          if (withdrawal) {
            console.log("提现记录详情:", {
              id: withdrawal.id,
              userId: withdrawal.userId,
              amount: withdrawal.amount,
              status: withdrawal.status,
              thirdPartyOrderId: withdrawal.thirdPartyOrderId,
            });

            const user = await db.User.findByPk(withdrawal.userId);
            console.log(
              "查找用户结果:",
              user ? `找到用户 ID: ${user.id}` : "未找到用户"
            );

            if (user) {
              console.log("用户当前余额:", user.walletBalance);
              console.log("用户当前总提现:", user.totalWithdrawn);

              const newBalance =
                parseFloat(user.walletBalance) - parseFloat(withdrawal.amount);
              console.log("计算新余额:", newBalance);

              try {
                await user.update({
                  walletBalance: newBalance,
                  totalWithdrawn:
                    parseFloat(user.totalWithdrawn) +
                    parseFloat(withdrawal.amount),
                });
              } catch (userUpdateError) {
                console.error("更新用户余额失败:", userUpdateError);
                throw userUpdateError;
              }
            }

            try {
              console.log("准备更新提现记录...");
              console.log("更新数据:", {
                status: "completed",
                completeTime: new Date(),
                thirdPartyTicket: transferResult.data.ticket,
              });

              await withdrawal.update({
                status: "completed",
                completeTime: new Date(),
                thirdPartyTicket: transferResult.data.ticket,
              });

              console.log("数据库更新完成");
            } catch (updateError) {
              console.error("更新提现记录失败:", updateError);
              console.error("更新数据:", {
                status: "completed",
                completeTime: new Date(),
                thirdPartyTicket: transferResult.data.ticket,
              });
              throw updateError;
            }
          } else {
            console.error("未找到对应的提现记录，订单号:", orderId);
          }
        } else {
          console.error("转账失败:", transferResult.message);

          console.log("查找提现记录，订单号:", orderId);
          const withdrawal = await db.Withdrawal.findOne({
            where: { thirdPartyOrderId: orderId },
          });

          console.log(
            "查找提现记录结果:",
            withdrawal ? `找到记录 ID: ${withdrawal.id}` : "未找到记录"
          );

          if (withdrawal) {
            await withdrawal.update({
              status: "failed",
              completeTime: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("异步处理转账失败:", error);
        console.error("错误堆栈:", error.stack);
        console.error("错误详情:", {
          message: error.message,
          name: error.name,
          code: error.code,
        });
      }
    });
  } catch (error) {
    console.error("处理授权回调失败:", error);
    res.status(500).json({
      success: false,
      message: "处理授权回调失败",
      error: error.message,
    });
  }
});

module.exports = router;
