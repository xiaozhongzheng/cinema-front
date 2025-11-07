<template>
  <div class="block" style="margin-top: 20px">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNo"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// 定义 props
interface Props {
  pageNo?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  pageNo: 1,
  pageSize: 10,
  total: 0,
  pageSizes: () => [5, 10, 20, 50]
})

// 定义 emits
const emit = defineEmits<{
  changePageSize: [val: number]
  changePageNo: [val: number]
}>()

// 方法
const handleSizeChange = (val: number) => {
  emit('changePageSize', val)
}

const handleCurrentChange = (val: number) => {
  emit('changePageNo', val)
}
</script>

<style lang="scss" scoped>
.block {
  display: flex;
  justify-content: center;
}
</style>