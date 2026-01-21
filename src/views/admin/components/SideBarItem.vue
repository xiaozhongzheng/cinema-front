<template>
  <div v-if="route.name === 'admin'">
    <!-- 管理员菜单 -->
    <el-menu-item
      v-for="item in route.children"
      :key="item.path"
      :index="`/admin/${item.path}`" 
    >
    <!-- index的值和路由配置的path有关 -->
      <el-icon v-if="item.meta?.icon">
        <component :is="getIconComponent(item.meta.icon)" />
      </el-icon>
      <template #title>{{ item.meta?.title }}</template>
    </el-menu-item>
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

  console.log(props.route,'props.route')

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
