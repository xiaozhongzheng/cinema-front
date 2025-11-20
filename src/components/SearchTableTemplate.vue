<template>
  <div id="tableTemplate">
    <el-space alignment="start" wrap>
      <el-form ref="searchFormRef" v-if="showSearchForm" :model="searchForm" :inline="true" size="default">
        <template v-for="(item, index) in searchParamsList" :key="index">
          <el-form-item :label="item.label" :prop="item.prop">
            <template v-if="item.type === 'input'">
              <el-input class="w180" v-model="searchForm[item.prop]" :placeholder="item.placeholder"
                clearable></el-input>
            </template>

            <template v-if="item.type === 'select'">
              <el-select v-model.trim="searchForm[item.prop]" :filterable="item.filterable" :multiple="item.multiple" :placeholder="item.placeholder" class="w180" :style="item.style"
                :clearable="!item.clearable">
                <el-option v-for="(option, optionIndex) in item.options" :key="optionIndex" :label="option.label"
                  :value="option.value"></el-option>
              </el-select>
            </template>

            <template v-if="item.type === 'datetime'">
              <el-date-picker v-model="searchForm[item.prop]" class="w180" type="datetime" placeholder="选择日期"
                value-format="yyyy-MM-dd"></el-date-picker>
            </template>

            <template v-if="item.type === 'date'">
              <el-date-picker v-model="searchForm[item.prop]" class="w180" type="datetime" placeholder="选择日期"
                value-format="yyyy-MM-dd"></el-date-picker>
            </template>

            <template v-if="item.type === 'searchSlot'">
              <slot name="searchSlot" :searchForm="searchForm" :itemProp="item.prop"></slot>
            </template>
          </el-form-item>

        </template>
        <el-space :style="{ marginBottom: '20px' }" alignment="start" wrap :size="20">
          <el-button type="info" @click="pageQueryData">查询</el-button>
          <el-button type="info" @click="reset">重置</el-button>
          <!-- 具名插槽，用于插入新增等功能的按钮 -->
          <slot name="handle"></slot>
        </el-space>

      </el-form>
    </el-space>
    <el-table :max-height="800" :data="resultTableList">
      <template v-for="item in tableParamsList" :key="item.prop">
        <el-table-column :fixed="item.fixed" :width="item.width" :label="item.label" :prop="item.prop">
          <template v-if="item.renderText" #default="scope">
            <!-- 渲染文本 -->
            {{ item.renderText(scope.row[item.prop]) }}
          </template>
          <template v-else-if="item.render" #default="scope">
            <!-- 渲染DOM元素 -->
            <component :is="item.render(scope.row[item.prop],scope.row)" />
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
    <Pager :pageNo="pageParams.pager.pageNo" :pageSize="pageParams.pager.pageSize" :total="pageParams.total"
      @changePageSize="handleSizeChange" @changePageNo="handleCurrentChange"></Pager>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, VNode, watch, defineProps, defineEmits, type Ref } from 'vue'
import { debounce } from 'lodash-es'
import Pager from '@/components/Pager.vue'
import type { FormInstance } from 'element-plus'

// 类型定义
interface Option {
  label: string
  value: string | number
}

export interface SearchParamType {
  label: string
  prop: string
  type: 'input' | 'select' | 'datetime' | 'date' | 'searchSlot'
  placeholder?: string
  filterable?: boolean
  multiple?: boolean
  style?: any
  clearable?: boolean
  options?: Option[]
}

export interface TableParamType {
  label: string
  prop: string
  width?: string | number,
  fixed: 'right' | 'left' | '',
  renderText?: (value: any) => string
  render?: (value: any) => VNode
}

interface Pager {
  pageNo: number
  pageSize: number
}

interface PageParams {
  pager: Pager
  total: number
}

interface TableRow {
  [key: string]: any
}

// 定义 props
const props = defineProps<{
  tableParamsList: TableParamType[]
  extraParams?: Record<string, any>
  tableListApi?: (params: any) => Promise<any>
  searchParamsList: SearchParamType[]
  showSearchForm: boolean
}>()

// 定义 emits
const emit = defineEmits<{
  'update:extraParams': [value: Record<string, any>]
}>()

// 响应式数据
const searchFormRef = ref<FormInstance>()
const pageParams = reactive<PageParams>({
  pager: {
    pageNo: 1,
    pageSize: 10
  },
  total: 0
})
const resultTableList = ref<TableRow[]>([])
const searchForm = reactive<Record<string, any>>({})


// 分页查询数据
const pageQueryData = debounce((): void => {
  if (!props.tableListApi) return

  props.tableListApi({
    ...props.extraParams,
    ...pageParams.pager,
    ...searchForm
  }).then((res: any) => {
    resultTableList.value = res.records
    pageParams.total = res.total
  })
}, 300)

// 处理分页大小变化
const handleSizeChange = (val: number): void => {
  pageParams.pager.pageSize = val
  pageQueryData()
}

// 处理当前页码变化
const handleCurrentChange = (val: number): void => {
  pageParams.pager.pageNo = val
  pageQueryData()
}

// 重置表单
const reset = (): void => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  pageParams.pager.pageNo = 1
  pageParams.pager.pageSize = 10
  pageQueryData()
}

// 暴露方法给父组件
defineExpose({
  pageQueryData,
  reset
})

// 生命周期
onMounted(() => {
  pageQueryData()
})

// 监听 extraParams 变化
watch(
  () => props.extraParams,
  () => {
    pageQueryData()
  },
  { deep: true }
)
</script>

<style scoped>
.w180 {
  width: 180px;
}
</style>
