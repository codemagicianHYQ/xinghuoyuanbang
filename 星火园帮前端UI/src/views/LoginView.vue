<template>
  <div class="login-container">
    <el-card class="login-card" shadow="lg">
      <template #header>
        <div class="login-header">星火园帮管理后台登录</div>
      </template>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="邮箱/用户ID" prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入管理员邮箱或用户ID（社区管理员）"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loading"
            class="login-button"
            native-type="submit"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
// import { User, Lock } from '@element-plus/icons-vue'; // Icons should be globally registered
import { login as apiLogin } from "../api/auth"; // 引入登录API调用

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  email: "",
  password: "",
});

const loginRules = {
  email: [
    { required: true, message: "请输入邮箱地址或用户ID", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const response = await apiLogin(loginForm.email, loginForm.password);
        // 假设后端成功登录后返回的数据结构为 { accessToken: '...', user: {...} }
        if (response.data && response.data.accessToken) {
          localStorage.setItem("admin-auth-token", response.data.accessToken);
          localStorage.setItem(
            "admin-user-info",
            JSON.stringify(response.data.user),
          ); // 存储用户信息
          ElMessage.success("登录成功！");
          router.push("/"); // 跳转到仪表盘或默认首页
        } else {
          ElMessage.error(response.data.message || "登录失败，请检查凭据。");
        }
      } catch (error) {
        console.error("Login error:", error);
        ElMessage.error(
          error.response?.data?.message ||
            error.message ||
            "登录时发生错误，请稍后再试。",
        );
      } finally {
        loading.value = false;
      }
    } else {
      console.log("表单验证失败");
      return false;
    }
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5; // 与主布局背景色一致或使用背景图
  // background-image: url('/path/to/your/login-background.jpg');
  // background-size: cover;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}

.login-header {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px; // 与表单的间距
}

.el-form-item {
  margin-bottom: 25px;
}

.login-button {
  width: 100%;
  font-size: 16px;
}
</style>
