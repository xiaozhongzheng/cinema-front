<template>
  <div id="screen_room">
    <SearchTableTemplate ref="searchTableTemplateRef" v-if="pageQueryApi" :table-list-api="pageQueryApi"
      :extra-params="extraParams" :table-params-list="tableParamsList" :search-params-list="searchParamsList"
      :show-search-form="showSearchForm">
      <template #handle>
        <el-button type="primary" @click="showAddForm">新增影院</el-button>
      </template>
      <template #columnHandle="{ row }">
        <el-button type="warning" @click="showUpdateForm(row)">修改</el-button>
        <el-button type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </SearchTableTemplate>
    <EditCinemaForm v-if="showEditDialog" v-model:showEditDialog="showEditDialog" :currentRow="currentRow"
      :isAdd="isAdd" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EditCinemaForm from './component/EditCinemaForm.vue'
import { deleteCinemaApi, pageQueryCinemaApi } from '@/api/cinema'
import { SearchParamType } from '@/components/SearchTableTemplate.vue'
import { provinceOptions } from '@/utils/area'

// 响应式数据
const showEditDialog = ref(false)
const searchTableTemplateRef = ref(null)
const currentRow = ref(null)
const isAdd = ref(true)

// 表格配置
const tableParamsList = ref([
  {
    label: '影院名',
    prop: 'name'
  },
  {
    label: '所在地区',
    prop: 'pcaName',
    width: 200
  },
  {
    label: '详细地址',
    prop: 'address',
    width: 200
  },
  {
    label: '状态',
    prop: 'type',
    renderText: (value: any) => {
      return value === 1 ? '正常' : '停业'
    },
    width: 100
  },
  {
    label: '营业时间',
    prop: 'openingHours',
    width: 200
  },
  {
    label: '简介',
    prop: 'description',
    render: (value: string) => {
      return h('div', { class: 'descText' }, value) // 构建DOM元素
    }
  },
  {
    label: '创建日期',
    prop: 'createTime',
    width: 200
  },
  {
    label: '更新日期',
    prop: 'updateTime',
    width: 200
  }
])

const extraParams = ref({})
const pageQueryApi = ref(null)
const showSearchForm = ref(true)

const searchParamsList = ref([
  {
    label: '影院名',
    prop: 'name',
    type: 'input',
    placeholder: '请输入影院名',
  },
  {
    label: '所在省份',
    prop: 'province',
    type: 'select',
    placeholder: '请选择所在省份',
    options: provinceOptions
  }
]) as SearchParamType[]

// 生命周期
onMounted(() => {
  pageQueryApi.value = pageQueryCinemaApi
})

// 方法
const showAddForm = () => {
  showEditDialog.value = true
  isAdd.value = true

}

const showUpdateForm = async (row: any) => {
  showEditDialog.value = true
  isAdd.value = false
  currentRow.value = row
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除放映厅, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteCinemaApi(row.id)
    ElMessage.success('删除放映厅成功')
    searchTableTemplateRef.value.pageQueryData()
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消删除')
    } else {
      console.error('删除放映厅失败:', error)
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style>
.w80 {
  width: 80%;
}

.descText {
  white-space: nowrap;
  /* 强制文本在一行显示，不换行 */
  overflow: hidden;
  /* 隐藏超出容器的部分 */
  text-overflow: ellipsis;
  /* 超出部分用省略号代替 */
}
</style>