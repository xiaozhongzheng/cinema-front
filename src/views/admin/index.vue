<template>
  <div class="app-container">
    <!-- 主布局容器（Flex 容器） -->
    <div class="main-layout">
      <!-- 侧边栏（Flex 项目） -->
      <aside
        class="sidebar"
        :class="{
          'sidebar-collapsed': isCollapse,
          'sidebar-hidden': !showSidebar && isMobile,
        }"
      >
        <!-- 折叠按钮 -->
        <div class="collapse-trigger" @click="toggleCollapse">
          <el-icon>
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <!-- 侧边栏菜单 -->
        <el-menu
          :default-active="currentPath"
          class="sidebar-menu"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :router="true"
          :collapse="isCollapse"
        >
          <SideBarItem
            v-for="route in routes"
            :key="route.path"
            :route="route"
          />
        </el-menu>
      </aside>

      <!-- 主内容区（Flex 项目，占剩余空间） -->
      <div class="main-content">
        <!-- 头部导航（Flex 容器） -->
        <header class="header">
          <div class="header-inner">
            <!-- 移动端菜单按钮 -->
            <el-button
              :icon="Menu"
              class="mobile-menu-btn"
              @click="showSidebar = !showSidebar"
              v-if="isMobile"
            />
            <div class="metaNameClass">{{ metaName }}</div>

            <!-- 系统信息（Flex 项目） -->
            <!-- <div class="system-info">
              <el-avatar shape="square" :size="50" fit="fill" :src="logoUrl" />
              <span class="system-name"> 影院管理系统</span>
            </div> -->

            <!-- 用户操作区（Flex 项目，靠右） -->
            <div class="user-actions">
              <el-dropdown @command="handleCommand">
                <span class="user-name">
                  {{ username }}
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="home_page">
                      <el-icon><User /></el-icon>
                      <span>个人中心</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="out" divided>
                      <el-icon><SwitchButton /></el-icon>
                      <span>退出登录</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </header>

        <!-- 页面内容区 -->
        <main class="page-content">
          <router-view />
        </main>
      </div>
    </div>

    <!-- 个人中心弹窗 -->
    <MyCenterDialog v-model="showDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Fold,
  Expand,
  Menu,
  ArrowDown,
  User,
  SwitchButton,
} from "@element-plus/icons-vue";
import MyCenterDialog from "./components/MyCenterDialog.vue";
import SideBarItem from "./components/SideBarItem.vue";
import { useUserStore } from "@/stores";
import { adminSystemTitle } from "@/utils/constant";

// 类型定义
interface RouteRecord {
  path: string;
  name?: string;
  meta?: any;
  children?: RouteRecord[];
}

// 组合式 API
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const currentPath = ref<string>(route.path);
const showDialog = ref<boolean>(false);
const isCollapse = ref<boolean>(false);
const showSidebar = ref<boolean>(true);
const screenWidth = ref<number>(window.innerWidth);
const mobileBreakpoint = 768;

// 计算属性
const routes = computed((): any => {
  return router.options.routes;
});
const metaName = computed(() => {
  const { children = [] } = routes.value[5];
  const { meta = {} } = children.find(
    (item: any) => item.path === currentPath.value
  );
  return meta.title || "";
});

console.log(routes.value[5], "routes");

const isMobile = computed((): boolean => {
  return screenWidth.value < mobileBreakpoint;
});

const username = computed((): string => {
  return userStore.userInfo?.username || "";
});

const logoUrl = ref<string>(
  new URL("@/assets/images/logo.png", import.meta.url).href
);

// 监听器
watch(
  () => route.path,
  (newPath: string) => {
    currentPath.value = newPath;
  }
);

watch(screenWidth, () => {
  handleResponsive();
});

// 生命周期
onMounted(() => {
  document.title = adminSystemTitle;
  window.addEventListener("resize", handleResize);
  handleResponsive();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// 方法
const handleResize = (): void => {
  screenWidth.value = window.innerWidth;
};

const handleResponsive = (): void => {
  if (isMobile.value) {
    showSidebar.value = false;
  } else {
    showSidebar.value = true;
    isCollapse.value = false;
  }
};

const toggleCollapse = (): void => {
  isCollapse.value = !isCollapse.value;
};

const logout = async (): Promise<void> => {
  try {
    await userStore.logoutAction({
      // userId: userStore.userId,
    });
    ElMessage.success("退出成功");
    router.push("/login");
  } catch (error) {
    ElMessage.error("退出失败");
  }
};

const handleCommand = async (command: string): Promise<void> => {
  if (command === "out") {
    try {
      await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      await logout();
    } catch {
      // 用户取消操作
    }
    return;
  }

  if (command === "home_page") {
    showDialog.value = true;
  }
};
</script>

<style scoped lang="scss">
// 变量定义
$sidebar-width: 200px;
$sidebar-collapsed-width: 64px;
$header-height: 80px;
$bg-color: #f4f6f8;
$sidebar-bg: #545c64;

// 根容器
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

// 主布局（Flex 容器：横向排列）
.main-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

// 侧边栏（Flex 项目）
.sidebar {
  width: $sidebar-width;
  height: 100%;
  background-color: $sidebar-bg;
  transition: all 0.3s ease;
  flex-shrink: 0; // 不收缩
  position: relative;
  z-index: 10;

  // 折叠状态
  &.sidebar-collapsed {
    width: $sidebar-collapsed-width;
  }

  // 移动端隐藏状态
  &.sidebar-hidden {
    width: 0;
    overflow: hidden;
  }

  // 折叠触发器
  .collapse-trigger {
    position: absolute;
    top: 10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background-color: $sidebar-bg;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    z-index: 1;

    .el-icon {
      font-size: 14px;
    }
  }

  // 侧边栏菜单
  .sidebar-menu {
    width: 100%;
    height: 100%;
    padding-top: 40px; // 给折叠按钮留空间
    border: none;
  }
}

// 主内容区（Flex 项目：占满剩余空间）
.main-content {
  flex: 1; // 占满剩余宽度
  display: flex;
  flex-direction: column; // 纵向排列（头部 + 内容）
  height: 100%;
  overflow: hidden;
}

// 头部（Flex 容器：横向排列）
.header {
  height: $header-height;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; // 不收缩

  .header-inner {
    display: flex;
    align-items: center; // 垂直居中
    justify-content: space-between; // 两端对齐
    height: 100%;
    padding: 0 20px;
  }

  // 移动端菜单按钮
  .mobile-menu-btn {
    position: absolute;
    left: 15px;
    z-index: 20;
  }
  .metaNameClass {
    font-size: 24px;
    font-weight: 600;
  }
  // 系统信息（Flex 容器：横向排列）
  .system-info {
    display: flex;
    align-items: center;
    margin-left: 50%; // 给移动端按钮留空间

    .system-name {
      font-size: 20px;
      font-weight: 600;
      margin-left: 10px;

      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
  }

  // 用户操作区
  .user-actions {
    .user-name {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 16px;
      cursor: pointer;
    }
  }
}

// 页面内容区（Flex 项目：占满剩余高度）
.page-content {
  flex: 1; // 占满剩余高度
  background-color: $bg-color;
  padding: 30px;
  overflow-y: auto;
}

// 响应式调整
@media (max-width: 768px) {
  .sidebar {
    position: absolute; // 移动端侧边栏悬浮
    height: 100%;
  }

  .main-content {
    width: 100%;
  }

  .system-info {
    margin-left: 40px !important;
  }
}
</style>
