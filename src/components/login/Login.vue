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
        <el-radio :label="1">员工</el-radio>
        <el-radio :label="2">管理员</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
  <div class="button-group">
    <el-button type="primary" @click="handleLogin" class="login-btn"> 登录 </el-button>
    <el-button type="info" @click="handleClose" class="register-btn"> 取消 </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits } from "vue";
import { useUserStore } from "@/stores";
import { ElMessage } from "element-plus";

const emit = defineEmits<{
  (e: "handleClose"): void;
}>();
const handleClose = () => {
  emit("handleClose");
};

const store = useUserStore();
const formRef = ref();
// 响应式数据
const userForm = reactive({
  username: "",
  password: "",
  roleId: 0,
});

const rules = reactive({
  username: [
    { required: true, message: "请输入用户名" },
    { min: 4, max: 8, message: "账号的位数在4到8之间" },
  ],
  password: [
    { required: true, message: "请输入密码" },
    { min: 3, max: 10, message: "密码的位数在3到10之间" },
  ],
});

const handleLogin = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (valid) {
    await store.loginAction({ ...userForm });
    ElMessage.success("登录成功");
    emit("handleClose");
  }
};
</script>

<style lang="scss" scoped>
.loginForm {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  // 表单样式优化
  :deep(.el-form-item) {
    width: 100%;
    max-width: 400px;
    .el-form-item__label {
      font-weight: 500;
    }
  }
  .button-group {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
