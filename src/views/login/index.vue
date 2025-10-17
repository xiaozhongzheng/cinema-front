<template>
  <el-button type="primary" @click="showDialog = true">
    去登录{{ showDialog }}
  </el-button>
  <LoginDialog v-if="showDialog" :dialogVisible="showDialog" @handleClose="handleClose" />
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import LoginDialog from "@/components/login";

const showDialog = ref(false);
const handleClose = () => {
  showDialog.value = false;
};
</script>

<style lang="scss" scoped></style>
