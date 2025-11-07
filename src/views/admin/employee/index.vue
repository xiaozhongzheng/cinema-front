<template>
  <div id="employee">
    <!-- 新增员工弹框 -->
    <el-dialog title="新增员工" v-model="dialogFormVisible" @close="resetForm" modal :close-on-click-modal="false">
      <el-form :model="empForm" :rules="rules" ref="empFormRef">
        <el-form-item label="账号" :label-width="formLabelWidth" prop="username" class="w80">
          <el-input v-model="empForm.username" autocomplete="off" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="password" class="w80">
          <el-input v-model="empForm.password" autocomplete="off" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" :label-width="formLabelWidth" prop="phone" class="w80">
          <el-input v-model="empForm.phone" autocomplete="off" placeholder="请输入手机号"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetForm">取 消</el-button>
          <el-button type="primary" @click="addEmployee">添 加</el-button>
        </div>
      </template>
    </el-dialog>

    <SearchTableTemplate ref="searchTableTemplateRef" v-if="pageQueryApi" :table-list-api="pageQueryApi"
      :extra-params="extraParams" :table-params-list="tableParamsList" :search-params-list="searchParamsList"
      :show-search-form="showSearchForm">
      <template #handle>
        <el-button type="primary" @click="showDialog">新增员工</el-button>
        <!-- <el-button type="" @click="exportExcel">导出文件</el-button>
        <el-button type="" @click="dialogVisible = true">导入文件</el-button> -->
      </template>
      <template #columnHandle="{ row }">
        <el-button @click="updateAdmin(row)" style="width: 100px" type="success" >
          设为{{ row.roleId == 2 ? '员工' : '管理员' }}
        </el-button>
        <el-button type="warning" @click="updateStatus(row)" >
          {{ row.status == 0 ? '启用' : '禁用' }}
        </el-button>
        <el-button type="danger" @click="handleDelete(row)" >删除</el-button>
      </template>
    </SearchTableTemplate>

    <ImportEmployee @handleSuccess="handleSuccess" v-model:visible="dialogVisible" :import-excel-api="importExcelApi"
      v-if="dialogVisible"></ImportEmployee>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileSaver from 'file-saver'
import ImportEmployee from './components/ImportEmployee.vue'
import * as emp from '@/api/employee'
import { accountStatusList, userRoleList } from '@/utils/constant'
// 响应式数据
const dialogVisible = ref(false)
const dialogFormVisible = ref(false)
const searchTableTemplateRef = ref(null)
const empFormRef = ref(null)
const formLabelWidth = '120px'

const empForm = reactive({
  username: '',
  password: '',
  phone: ''
})

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名' },
    { min: 4, max: 8, message: '账号的位数在4到8之间' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 3, max: 10, message: '密码的位数在3到10之间' }
  ],
  phone: [
    { required: true, message: '请输入电话号码' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确' }
  ]
})

const tableParamsList = ref([
  {
    label: '用户名',
    prop: 'username',
    width: 200
  },
  {
    label: '电话号码',
    prop: 'phone',
    width: 150
  },
  {
    label: '身份',
    prop: 'roleId',
    renderText: (value: any) => {
      return userRoleList[value]
    },
    width: 100
  },
  {
    label: '账号状态',
    prop: 'status',
    renderText: (value: any) => {
      return accountStatusList[value]
    },
    width: 100
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: 200
  }
])

const extraParams = ref({})
const pageQueryApi = ref('')
const showSearchForm = ref(true)
const importExcelApi = ref(null)

const searchParamsList = ref([
  {
    label: '用户名',
    prop: 'username',
    type: 'input',
    placeholder: '请输入用户名'
  },

  {
    label: '身份',
    prop: 'roleId',
    type: 'select',
    placeholder: '请选择身份',
    options: [
      {
        label: '管理员',
        value: 2
      },
      {
        label: '员工',
        value: 1
      }
    ]
  },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择账号状态',
    options: [
      {
        label: '启用',
        value: 1
      },
      {
        label: '禁用',
        value: 0
      }
    ]
  }
])

// 生命周期
onMounted(() => {
  pageQueryApi.value = emp.pageQueryEmployee
  importExcelApi.value = emp.importExcel
})

// 方法
const handleSuccess = () => {
  ElMessage.success('上传成功')
  searchTableTemplateRef.value.pageQueryData()
}

const exportExcel = async () => {
  try {
    const res = await emp.exportExcel()
    console.log(res, 'export')
    FileSaver.saveAs(res.data, '员工信息表.xlsx')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const showDialog = () => {
  dialogFormVisible.value = true
}

const addEmployee = async () => {
  if (!empFormRef.value) return

  try {
    await empFormRef.value.validate()
    await emp.addEmployee(empForm)
    ElMessage.success('添加员工成功')
    resetForm()
    searchTableTemplateRef.value.pageQueryData()
  } catch (error) {
    console.error('添加员工失败:', error)
  }
}

const resetForm = () => {
  if (empFormRef.value) {
    empFormRef.value.resetFields()
  }
  dialogFormVisible.value = false
}

const handleDelete = async (row) => {
  const name = row.roleId == 2 ? '管理员' : '员工'

  try {
    await ElMessageBox.confirm(
      `此操作将永久删除${name}, 是否继续?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await emp.deleteEmployee(row.id)
    ElMessage.success('删除成功')
    searchTableTemplateRef.value.pageQueryData()
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消删除')
    } else {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const updateStatus = (row) => {
  if (row.roleId == 2) {
    ElMessage.error('不能禁用管理员账号')
    return
  }

  const data = {
    id: row.id,
    status: row.status == 1 ? 0 : 1
  }
  handleUpdate(data)
}

const handleUpdate = async (data) => {
  try {
    await emp.updateEmployeeById(data)
    ElMessage.success('修改状态成功')
    searchTableTemplateRef.value.pageQueryData()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  }
}

const updateAdmin = async (row) => {
  if (row.status === 0) {
    ElMessage.error('账号被禁用了，请联系管理员解禁')
    return
  }

  if (row.username == 'admin') {
    ElMessage.error('不能将admin管理员修改为员工')
    return
  }

  const name1 = row.roleId === 2 ? '管理员' : '员工'
  const name2 = row.roleId === 2 ? '员工' : '管理员'

  try {
    await ElMessageBox.confirm(
      `此操作将${name1}设置为${name2}, 是否继续?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const data = {
      id: row.id,
      roleId: row.roleId == 2 ? 1 : 2
    }
    handleUpdate(data)
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消更改')
    } else {
      console.error('更新失败:', error)
      ElMessage.error('更新失败')
    }
  }
}
</script>

<style scoped>
.w80 {
  width: 80%;
}
</style>