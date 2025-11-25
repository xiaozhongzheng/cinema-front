<template>
  <div id="tableTemplate">
    <el-space alignment="start" wrap>
      <el-form
        ref="searchFormRef"
        v-if="showSearchForm"
        :model="searchForm"
        :inline="true"
        size="default"
      >
        <template v-for="(item, index) in searchParamsList" :key="index">
          <el-form-item :label="item.label" :prop="item.prop">
            <template v-if="item.type === 'input'">
              <el-input
                class="w180"
                v-model="searchForm[item.prop]"
                :placeholder="item.placeholder"
                clearable
                v-bind="item.attrs"
              ></el-input>
            </template>

            <template v-if="item.type === 'select'">
              <el-select
                v-model.trim="searchForm[item.prop]"
                class="w180"
                clearable
                v-bind="item.attrs"
              >
                <el-option
                  v-for="(option, optionIndex) in item.options as OptionType[]"
                  :key="optionIndex"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </el-select>
            </template>

            <template v-if="item.type === 'time'">
              <el-date-picker
                v-model="searchForm[item.prop]"
                class="w180"
                type="date"
                v-bind="item.attrs"
              ></el-date-picker>
            </template>

            <template v-if="item.type === 'searchSlot'">
              <slot
                name="searchSlot"
                :searchForm="searchForm"
                :itemProp="item.prop"
              ></slot>
            </template>
          </el-form-item>
        </template>
        <el-space
          :style="{ marginBottom: '20px' }"
          alignment="start"
          wrap
          :size="20"
        >
          <el-button type="info" @click="pageQuery">查询</el-button>
          <el-button type="info" @click="reset">重置</el-button>
          <!-- 具名插槽，用于插入新增等功能的按钮 -->
          <slot name="handle"></slot>
        </el-space>
      </el-form>
    </el-space>
    <el-table :max-height="800" :data="resultTableList" v-bind="tableProps">
      <template v-for="item in tableParamsList" :key="item.prop">
        <el-table-column
          :fixed="item?.fixed"
          :width="item?.width"
          :label="item?.label"
          :prop="item?.prop"
          :type="item?.type"
        >
          <template v-if="item.renderText" #default="scope">
            <!-- 渲染文本 -->
            {{ item.renderText(scope.row[item.prop]) }}
          </template>
          <template v-else-if="item.render" #default="scope">
            <!-- 渲染DOM元素 -->
            <component :is="item.render!(scope.row[item.prop], scope.row)" />
          </template>
        </el-table-column>
      </template>

      <!-- <el-table-column label="操作">
        <template #default="scope">
          <template v-if="scope.row.username != 'admin'">
            <slot name="columnHandle" :row="scope.row" :index="scope.$index"></slot>
          </template>
        </template>
      </el-table-column> -->
    </el-table>
    <Pager
      :pageNo="pageParams.pager.pageNo"
      :pageSize="pageParams.pager.pageSize"
      :total="pageParams.total"
      @changePageSize="handleSizeChange"
      @changePageNo="handleCurrentChange"
    ></Pager>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  VNode,
  defineProps,
  defineEmits,
  toRaw,
  type ComputedRef,
  type DefineComponent,
} from "vue";
import { debounce } from "lodash-es";
import Pager from "@/components/Pager.vue";
import type { FormInstance } from "element-plus";
import type { TableProps } from "element-plus";

// 更精确的类型定义
interface OptionType {
  label: string;
  value: any;
}

export interface SearchParamType {
  label: string;
  prop: string;
  type: "input" | "select" | "time" | "searchSlot";
  placeholder?: string;
  style?: Record<string, any>;
  // options 可以是普通数组或计算属性数组
  options?: OptionType[] | ComputedRef<OptionType[]>;
  // attrs 兼容任意额外属性（按需可进一步细化）
  attrs?: Record<string, any>;
}

export interface TableParamType {
  label?: string;
  prop?: string;
  width?: string | number;
  fixed?: "right" | "left" | "";
  type?: "selection" | "index" | "expand";

  renderText?: (value: any, row?: Record<string, any>) => string;
  render?: (
    value: any,
    row?: Record<string, any>
  ) => VNode | DefineComponent | string | Record<string, any>;
}

export interface PagerType {
  pageNo: number;
  pageSize: number;
}

interface PageParamsType {
  pager: PagerType;
  total: number;
}

interface TableRow {
  [key: string]: any;
}

// Props（更精确的泛型）
const props = defineProps<{
  tableParamsList: TableParamType[];
  tableProps?: TableProps<TableRow>;
  extraParams?: Record<string, any>;
  searchParamsList: SearchParamType[];
  showSearchForm?: boolean;
  getTableData: (
    pageParams: PagerType,
    searchParams: Record<string, any>
  ) => Promise<{ data: TableRow[]; total: number }>;
}>();

// Emits（签名风格）
const emit = defineEmits<{
  "update:extraParams": (value: Record<string, any>) => void;
}>();

// 响应式数据
const searchFormRef = ref<FormInstance | null>(null);
const pageParams = reactive<PageParamsType>({
  pager: {
    pageNo: 1,
    pageSize: 10,
  },
  total: 0,
});
const resultTableList = ref<TableRow[]>([]);
const searchForm = reactive<Record<string, any>>({});

// 分页处理
const handleSizeChange = (val: number): void => {
  pageParams.pager.pageSize = val;
  pageQuery();
};

const handleCurrentChange = (val: number): void => {
  pageParams.pager.pageNo = val;
  pageQuery();
};

const reset = (): void => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields();
  }
  pageParams.pager = {
    pageNo: 1,
    pageSize: 10,
  };
  pageQuery();
};

onMounted(() => {
  pageQuery();
});

const pageQuery = debounce(async () => {
  const res = await props.getTableData(
    { ...pageParams.pager },
    toRaw(searchForm)
  );
  resultTableList.value = res?.data ?? [];
  pageParams.total = res?.total ?? 0;
}, 300);

// 对外暴露
defineExpose({
  reset,
  searchForm,
  pageQuery,
});
</script>

<style scoped>
.w180 {
  width: 180px;
}
</style>
