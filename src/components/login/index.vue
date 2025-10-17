<template>
  <el-dialog
    class="main"
    v-model="dialogVisible"
    title=""
    width="50%"
    :before-close="handleClose"
  >
    <div class="login">
      <!-- <div class="header">
        <el-avatar
          shape="square"
          :size="50"
          fit="fill"
          :src="url"
          class="logo"
        ></el-avatar>
        <span class="title">影院管理系统</span>
      </div> -->
      <div class="tabList">
        <div @click="activeIndex = index" v-for="(name,index) in tabList" :key="name" class="item" :class="{active: activeIndex === index}">{{ name }}</div>
      </div>

      <LoginComponent @handleClose="handleClose"  v-if="activeIndex === 0"  />

      <RegisterComponent @handleClose="handleClose"  v-if="activeIndex === 1"  />
     
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, defineProps, defineEmits } from "vue";
import LoginComponent from "./Login.vue";
import RegisterComponent from "./Register.vue";
type Props = {
  dialogVisible: boolean;
};
const props = defineProps<Props>();
const { dialogVisible } = toRefs(props);
const emit = defineEmits<{
  (e: "handleClose"): void;
}>();
const handleClose = () => {
  emit("handleClose");
};
const tabList = [
  "登录",
  "注册"
]
const activeIndex = ref(0)

</script>

<style scoped lang="scss">
.main {
  background-color: pink;
}
.login {
  width: 100%;
  height: 100%;
  // background-image: url("@/assets/images/login.jpg");
  // background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 20px;
  .tabList {
    display: flex;
    width: 300px;
    height: 50px;
    background-color: #2B2C2E;
    border-radius: 25px;
    font-size: 18px;
    margin-bottom: 30px;
    .item {
      flex: 1;
      border-radius: 25px;
      display: grid;
      place-items: center;
      color: #FFF;
    }
    .active {
      background-color: #5EAFB5;
      color: #000;
      font-weight: 500;
    }
  }
  

}
</style>
