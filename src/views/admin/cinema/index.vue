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
    <EditCinemaForm
        v-if="showEditDialog"
        v-model:showEditDialog="showEditDialog"
        :cinemaItem="currentRow"
     />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as screenApi from "@/api/screen"
import { useUserStore } from '@/stores'
import EditCinemaForm from './component/EditCinemaForm.vue'

// 响应式数据
const showEditDialog = ref(false)
const searchTableTemplateRef = ref(null)
const screenFormRef = ref(null)
const currentRow = ref(null)
const handleType = ref('add')
const title = ref('')

// 用户角色
const userStore = useUserStore()
const roleId = ref(userStore.roleId)

// 表格配置
const tableParamsList = ref([
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '座位数',
    prop: 'seatCount',
    width: 100
  },
  {
    label: '类型',
    prop: 'type',
    renderText: (value: any) => {
      return value + 'D'
    },
    width: 100
  },
  {
    label: '介绍',
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
const pageQueryApi = ref('')
const showSearchForm = ref(true)

const searchParamsList = ref([
  {
    label: '放映类型',
    prop: 'type',
    type: 'select',
    placeholder: '请选择放映类型',
    options: [
      {
        label: '2D',
        value: 2
      },
      {
        label: '3D',
        value: 3
      },
      {
        label: '4D',
        value: 4
      }
    ]
  }
])




// 生命周期
onMounted(() => {
  pageQueryApi.value = screenApi.pageQueryScreen
})

// 方法
const showAddForm = () => {
  showEditDialog.value = true
  handleType.value = 'add'
  title.value = '新增放映厅'
  // 重置表单
  Object.assign(screenForm, {
    id: '',
    name: '',
    seatCount: '',
    type: '',
    description: ''
  })
}

const showUpdateForm = async (row: any) => {
  showEditDialog.value = true
  handleType.value = 'update'
  title.value = '修改放映厅'
  await getScreenById(row.id)
}

const getScreenById = async (id: number) => {
  const res = await screenApi.getScreenById(id)
  Object.assign(screenForm, res)
}

const handleAddOrUpdate = async () => {
  if (!screenFormRef.value) return

  await screenFormRef.value.validate()
  if (handleType.value === 'add') {
    await handleAdd()
  } else {
    await handleUpdate()
  }

}

const handleAdd = async () => {
  await screenApi.addScreen(screenForm)
  ElMessage.success('添加放映厅成功')
  resetForm()
  searchTableTemplateRef.value.pageQueryData()

}

const handleUpdate = async () => {
  await screenApi.updateScreen(screenForm)
  ElMessage.success('修改放映厅成功')
  resetForm()
  searchTableTemplateRef.value.pageQueryData()

}

const resetForm = () => {
  showEditDialog.value = false
  if (screenFormRef.value) {
    screenFormRef.value.resetFields()
  }
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

    await screenApi.deleteScreen(row.id)
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

<style >
.w80 {
  width: 80%;
}

.descText {
  white-space: nowrap;  /* 强制文本在一行显示，不换行 */
  overflow: hidden; /* 隐藏超出容器的部分 */
  text-overflow: ellipsis; /* 超出部分用省略号代替 */
}
</style>