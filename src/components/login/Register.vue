<template>
  <el-form
    label-width="auto"
    :model="registerForm"
    status-icon
    :rules="rules"
    ref="formRef"
    class="registerForm"
  >
    <el-form-item label="账号" prop="username">
      <el-input
        type="text"
        v-model="registerForm.username"
        placeholder="请输入用户名"
      ></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input
        type="password"
        v-model="registerForm.password"
        placeholder="请输入密码"
        show-password
      ></el-input>
    </el-form-item>
    <el-form-item label="确认密码" prop="checkPass">
      <el-input
        type="password"
        v-model="registerForm.checkPass"
        placeholder="请再次输入密码"
        show-password
      ></el-input>
    </el-form-item>
    <el-form-item label="电话号码" prop="phone">
      <el-input v-model="registerForm.phone" placeholder="请输入手机号"></el-input>
    </el-form-item>
  </el-form>
  <div class="button-group">
    <el-button type="primary" @click="handleRegister">注册</el-button>
    <el-button type="info" @click="handleClose">取消</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,defineEmits } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { register } from "@/api/user";

const router = useRouter();
const formRef = ref();
const emit = defineEmits<{
  (e: "handleClose"): void;
}>();
const handleClose = () => {
  emit("handleClose");
};

// 响应式数据
const registerForm = reactive({
  password: "",
  checkPass: "",
  username: "",
  phone: "",
});

// 验证规则
const validatePass = (_rule:any, value:string, callback: (val?: any) => void) => {
  if (value === "") {
    callback(new Error("请输入密码"));
  } else {
    if (registerForm.checkPass !== "") {
      formRef.value.validateField("checkPass");
    }
    callback();
  }
};

const validatePass2 = (_rule:any, value:string, callback: (val?: any) => void) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== registerForm.password) {
    callback(new Error("两次输入密码不一致!"));
  } else {
    callback();
  }
};

const rules = reactive({
  password: [{ validator: validatePass, trigger: "blur" }],
  checkPass: [{ validator: validatePass2, trigger: "blur" }],
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 4, max: 8, message: "长度在 4 到 8 个字符", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入电话号码", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号码格式不正确", trigger: "blur" },
  ],
});

// 方法
const handleRegister = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (valid) {
    await register({ ...registerForm });
    ElMessage.success("注册成功");
    toLogin();
  }
};

const toLogin = () => {
  router.push("/login");
};
</script>

<style scoped lang="scss">
.registerForm {
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
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
