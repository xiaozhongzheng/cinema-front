<template>
  <div id="main">
    <el-container>
      <el-header class="navBar">
        <div class="head">
          <div class="title">
            <el-avatar shape="square" :size="50" fit="fill" :src="url"></el-avatar>
            <span> 影院购票界面</span>
          </div>
          <el-menu :default-active="indexPath" class="el-menu-demo" mode="horizontal" router>
            <el-menu-item v-for="(item, index) in menuList" :index="item.path"
              :class="{ active: activeIndex === index }" :key="item.name" @click="activeIndex = index">
              {{ item.name }}
            </el-menu-item>
          </el-menu>
          <el-input v-model="title" placeholder="请输入要查询的电影名" class="search"></el-input>
          <el-button type="success" @click="dialogVisible = true">充值</el-button>

          <div class="right">
            <template v-if="user.username">
              <el-avatar v-if="user && user.image" :src="user.image"></el-avatar>
              <el-avatar :src="userDefault" v-else></el-avatar>
            </template>

            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                {{ user.username || '未登录' }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu v-if="user.username">
                  <el-dropdown-item command="/user/me/cart" :icon="ShoppingCart">
                    我的购物车
                  </el-dropdown-item>
                  <el-dropdown-item command="/user/me/order" :icon="Document">
                    我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="/user/me/detail" :icon="User">
                    个人详情
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" :icon="Help">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
                <el-dropdown-menu v-else>
                  <el-dropdown-item command="login" :icon="SwitchButton">
                    登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-dialog title="充值" v-model="dialogVisible" width="30%" @close="resetMoney">
        <div>
          <el-radio-group v-model="money">
            <el-radio :label="item" border v-for="item in moneyArr" :key="item" style="width: 150px; margin: 20px">
              {{ item }} 元
            </el-radio>
          </el-radio-group>
          优惠：
          <span style="color: rgb(194, 199, 213)">一次性充值1000元的用户享八折优惠，充值400元以上的享九折优惠，充值200元以上的享九五折优惠</span>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="recharge()">充 值</el-button>
          </span>
        </template>
      </el-dialog>

      <div class="emptyBox"></div>
      <el-main>
        <router-view v-if="showView" :titleName="title"></router-view>
      </el-main>
    </el-container>
    <LoginDialog v-if="showLoginDialog" :dialogVisible="showLoginDialog" @handleClose="handleClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import { recharge as rechargeApi } from "@/api/user";
import logo from "@/assets/images/logo.png";
import { ElMessage } from "element-plus";
import LoginDialog from "@/components/login";
import userDefault from '@/assets/images/user-default.png'
import { ShoppingCart, Document, User, Help, ArrowDown, SwitchButton } from '@element-plus/icons-vue'
// 路由和状态管理
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式变量
const showLoginDialog = ref(false);
const handleClose = () => {
  showLoginDialog.value = false;
};
const url = logo;
const menuList = ref([
  { name: "首页", path: "/user/home" },
  { name: "电影大全", path: "/user/movies" },
]);
const activeIndex = ref(0);
const title = ref("");
const indexPath = ref("");
const dialogVisible = ref(false);
const money = ref("");
const moneyArr = ref([50, 100, 200, 300, 400, 500, 1000]);
const user = ref({
  username: "",
  image: "",
  discount: "",
});
const showView = ref(false);

// 计算属性
const getDiscount = computed(() => {
  const userDiscount = user.value.discount || 1;
  const m = money.value;
  let discount = 1;

  if (m >= 1000) {
    discount = 0.8;
  } else if (m >= 400) {
    discount = 0.9;
  } else if (m >= 200) {
    discount = 0.95;
  }

  return discount < userDiscount ? discount : userDiscount;
});

// 生命周期钩子
onMounted(() => {
  indexPath.value = route.path;
  user.value = userStore.userInfo;
  console.log(userStore.userInfo, "userStore.userInfo;");
  showView.value = true;
});

watch(() => userStore.userInfo, (newVal) => {
  console.log(newVal, 'newVal')
  user.value = newVal;
})

// 监听
watch(
  () => route,
  (to: any) => {
    indexPath.value = to.path;
    document.documentElement.scrollTop = 0; // 使页面回到顶部
  },
  { immediate: true }
);

watch(title, () => {
  toShowMovies();
});

// 方法
const handleCommand = (command: string) => {
  if (command === "login") {
    showLoginDialog.value = true
    return
  }

  if (command === "logout") {
    // 用户退出登录
    logout(userStore.userInfo);
    return;
  }

  if (command !== indexPath.value) {
    // 只有原路径和目标路径不同才可以跳转
    router.push(command);
  }
};

const logout = async (data: any) => {
  await userStore.logoutAction(data);
  // 清空本地存储的数据
  ElMessage.success("退出成功");
  router.push("/user/home");
};

const recharge = async () => {
  await rechargeApi({
    money: money.value,
    discount: getDiscount.value,
  });
  ElMessage.success("充值成功");
  resetMoney();
};

const resetMoney = () => {
  money.value = "";
  dialogVisible.value = false;
};

const toShowMovies = () => {
  if (indexPath.value !== "/user/movies") {
    router.push({
      name: "movies",
    });
  }
};
</script>

<style scoped lang="scss">
$height: 80px;

#main {
  width: 1440px;
  min-height: 100vh;
  font-size: 14px;
  position: relative;

  .navBar {
    width: 100%;
    height: $height !important;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    background-color: #fff;
    border-bottom: 1px solid pink;

    .head {
      width: 1200px;
      height: $height;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;

      .title {
        display: flex;
        align-items: center;
        gap: 20px;
        font-size: 20px;
        font-weight: 600;
      }

      .el-menu-demo {
        display: flex;
        justify-content: flex-end;
        flex: 1;
        height: 100%;
        border: 0;
        background: transparent;

        &>li {
          height: 100%;
          display: flex;
          align-items: center;
          font-size: 16px;
          color: black;
          border: 0;
        }

        .active {
          background-color: skyblue;
          color: white;
        }
      }

      .search {
        width: 250px;
      }

      .right {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }

  .emptyBox {
    height: $height + 20px;
  }
}

.el-main {
  background-color: #fff;
  color: #333;
  text-align: center;
  padding: 0;
  /* 去除滚轮条 */
  overflow: visible;
}
</style>
