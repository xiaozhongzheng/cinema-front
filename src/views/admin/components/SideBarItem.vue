<template>
  <div v-if="!route.hidden">
    <!-- 管理员菜单 -->
    <template v-if="route.name === 'admin'">
      <el-menu-item v-for="item in route.children" :key="item.path" :index="item.path">
        <el-icon v-if="item.meta?.icon">
          <component :is="getIconComponent(item.meta.icon)" />
        </el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>
    </template>

    <!-- 员工菜单
    <template v-if="route.name === 'employee' && roleId === 1">
      <el-menu-item v-for="item in route.children" :key="item.path" :index="item.path">
        <el-icon v-if="item.meta?.icon">
          <component :is="getIconComponent(item.meta.icon)" />
        </el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>
    </template> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import * as ElementPlusIcons from "@element-plus/icons-vue";

// 类型定义
interface RouteMeta {
  title?: string;
  icon?: string;
  [key: string]: any;
}

interface RouteRecord {
  path: string;
  name?: string;
  hidden?: boolean;
  meta?: RouteMeta;
  children?: RouteRecord[];
}

interface Props {
  route: RouteRecord;
}

// Props 定义
const props = defineProps<Props>();

// 图标组件映射
const getIconComponent = (iconName?: string) => {
  if (!iconName) return null;

  const iconComponent = (ElementPlusIcons as any)[iconName];
  return iconComponent || null;
};
</script>

<style lang="scss" scoped>
// 可以添加一些样式优化
:deep(.el-menu-item) {
  display: flex;
  align-items: center;

  .el-icon {
    margin-right: 8px;
  }
}
</style>
