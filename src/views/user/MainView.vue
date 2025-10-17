<template>
  <div id="main">
    <el-container>
      <el-header class="navBar">
        <div class="head">
          <div class="title">
            <el-avatar shape="square" :size="50" fit="fill" :src="url"></el-avatar>
            <span> 影院购票界面</span>
          </div>
          <el-menu
            :default-active="indexPath"
            class="el-menu-demo"
            mode="horizontal"
            router
          >
            <el-menu-item
              v-for="(item, index) in menuList"
              :index="item.path"
              :class="{ active: activeIndex === index }"
              :key="item.name"
              @click="activeIndex = index"
            >
              {{ item.name }}
            </el-menu-item>
          </el-menu>
          <el-input
            v-model="title"
            placeholder="请输入要查询的电影名"
            class="search"
          ></el-input>
          <el-button type="primary" @click="showLoginDialog = true"> 去登录 </el-button>
          <el-button type="success" @click="dialogVisible = true">充值</el-button>

          <div class="right">
            <el-avatar v-if="user && user.image" :src="user.image"></el-avatar>
            <el-avatar icon="User" v-else></el-avatar>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                {{ user.username }}
                <i class="el-icon-arrow-down"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="/user/me/cart" icon="ShoppingCart"
                    >我的购物车</el-dropdown-item
                  >
                  <el-dropdown-item command="/user/me/order" icon="Order"
                    >我的订单</el-dropdown-item
                  >
                  <el-dropdown-item command="/user/me/detail" icon="User"
                    >个人详情</el-dropdown-item
                  >
                  <el-dropdown-item command="out" icon="Switch"
                    >退出登录</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-dialog title="充值" v-model="dialogVisible" width="30%" @close="resetMoney">
        <div>
          <el-radio-group v-model="money">
            <el-radio
              :label="item"
              border
              v-for="item in moneyArr"
              :key="item"
              style="width: 150px; margin: 20px"
            >
              {{ item }} 元
            </el-radio>
          </el-radio-group>
          优惠：
          <span style="color: rgb(194, 199, 213)"
            >一次性充值1000元的用户享八折优惠，充值400元以上的享九折优惠，充值200元以上的享九五折优惠</span
          >
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
    <LoginDialog
      v-if="showLoginDialog"
      :dialogVisible="showLoginDialog"
      @handleClose="handleClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMainStore } from "@/stores";
import { recharge as rechargeApi } from "@/api/user";
import logo from "@/assets/images/logo.png";
import { ElMessage } from "element-plus";
import LoginDialog from "@/components/login";

// 路由和状态管理
const route = useRoute();
const router = useRouter();
const store = useMainStore();

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
  user.value = store.userInfo;
  console.log(store.$state, "store.userInfo;");
  showView.value = true;
});

// 监听
watch(
  () => route,
  (to) => {
    indexPath.value = to.path;
    document.documentElement.scrollTop = 0; // 使页面回到顶部
  },
  { immediate: true }
);

watch(title, () => {
  toShowMovies();
});

// 方法
const handleCommand = (command) => {
  if (command === "out") {
    // 用户退出登录
    logout({
      roleId: store.getters.roleId,
      userId: store.getters.userId,
    });
    return;
  }
  if (command !== indexPath.value) {
    // 只有原路径和目标路径不同才可以跳转
    router.push(command);
  }
};

const logout = async (data) => {
  await store.dispatch("logout", data);
  // 清空本地存储的数据
  ElMessage.success("退出成功");
  router.push("/login");
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

        & > li {
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
