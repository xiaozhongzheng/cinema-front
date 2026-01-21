<template>
  <el-form
    :model="userForm"
    :rules="rules"
    status-icon
    ref="formRef"
    label-width="auto"
    class="loginForm"
  >
    <el-form-item label="账号" prop="username">
      <el-input
        type="text"
        v-model="userForm.username"
        placeholder="请输入用户名"
      ></el-input>
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input
        type="password"
        v-model="userForm.password"
        show-password
        placeholder="请输入密码"
      ></el-input>
    </el-form-item>

    <el-form-item label="身份">
      <el-radio-group v-model="userForm.roleId">
        <el-radio :label="0">用户</el-radio>
        <el-radio :label="1">管理员</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
  <div class="button-group">
    <el-button type="primary" class="login-btn" @click="handleLogin">
      立即登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const store = useUserStore();

const formRef = ref();
const userForm = reactive({
  username: "xzzz",
  password: "123",
  roleId: 0,
});

const handleLogin = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  await store.loginAction({ ...userForm });
  ElMessage.success("登录成功");

  const redirect = route.query.redirect as string;
  console.log(redirect,'redirect')
  router.replace(redirect || "/user/home");
};
</script>

<style lang="scss" scoped>
.loginForm {
  width: 100%;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
  }

  .login-btn {
    width: 100%;
    height: 42px;
    border-radius: 10px;
    font-size: 16px;
  }
}
</style>
