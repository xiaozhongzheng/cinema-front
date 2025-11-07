<template>
  <div id="film">
    <SearchTableTemplate
      ref="searchTableTemplateRef"
      v-if="pageQueryApi"
      :table-list-api="pageQueryApi"
      :extra-params="extraParams"
      :table-params-list="tableParamsList"
      :search-params-list="searchParamsList"
      :show-search-form="showSearchForm"
    >
      <template #handle>
        <el-button
          type="primary"
          @click="showEditDialog()"
        >新增影片</el-button>
      </template>
      <template #columnHandle="{ row }">
        <el-button
          type="success"
          @click="showAddSchduleForm(row)"
        >排片</el-button>

        <el-button
          type="warning"
          @click="showEditDialog(row)"
        >编辑</el-button>

        <el-button
          type="danger"
          @click="handleDelete(row)"
        >删除</el-button>
      </template>
    </SearchTableTemplate>

    <AddScheduleDialog
      :show-dialog="dialogFormVisible"
      :film="film"
      ref="addScheduleRef"
      @cancel="cancel"
    />
    <AddFilmDialog 
      v-if="visible" 
      :filmItem="filmItem" 
      v-model:visible="visible" 
      @handle-success="handleSuccess" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick,h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageQueryFilm, deleteFilmById } from "@/api/film"
import AddScheduleDialog from "../schedule/components/AddScheduleDialog.vue"
import AddFilmDialog from "./component/AddFilmDialog.vue"
import SearchTableTemplate, { SearchParamType, TableParamType } from "@/components/SearchTableTemplate.vue"
import { filmTypeList,regionList } from '@/utils/constant'
// 响应式数据
const visible = ref(false)
const filmItem = ref({})
const dialogFormVisible = ref(false)
const film = ref({})
const searchTableTemplateRef = ref(null)
const addScheduleRef = ref(null)

// 表格配置
const pageQueryApi = ref('')
const extraParams = ref({})
const showSearchForm = ref(false)

const tableParamsList = ref<TableParamType[]>([
  {
    label: "名称",
    prop: "title",
    width: 150,
  },
  {
    label: "图片",
    prop: "image",
    render: (value: string) => {
      return h('img',{src: value,class: 'img'})
    },
    width: 200
  },
  {
    label: "上映日期",
    prop: "releaseDate",
    width: 150
  },
  {
    label: "价格",
    prop: "price",
    width: 80
  },
  {
    label: "类型",
    prop: "type",
    renderText: (value: any) => {
      return filmTypeList[value]
    },
    width: 80
  },
  {
    label: "地区",
    prop: "region",
     renderText: (value: any) => {
      return regionList[value]
    },
    width: 80
  },
  {
    label: "时长",
    prop: "duration",
    width: 100
  },
])

const searchParamsList = ref<SearchParamType[]>([
  {
    label: "影片名",
    prop: "title",
    type: "input",
    placeholder: "请输入影片名",
  },
  {
    label: "类型",
    prop: "type",
    type: "select",
    placeholder: "请选择类型",
    options: filmTypeList.map((item, index) => ({ value: index, label: item }))
  },
  {
    label: "地区",
    prop: "region",
    type: "select",
    placeholder: "请选择地区",
    options: regionList.map((item, index) => ({ value: index, label: item }))
  },
])

// 生命周期
onMounted(() => {
  pageQueryApi.value = pageQueryFilm
  showSearchForm.value = true
})

// 方法
const handleSuccess = () => {
  searchTableTemplateRef.value.pageQueryData()
}

const showEditDialog = (row = {}) => {
  filmItem.value = row
  visible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      "此操作将永久删除该影片, 是否继续?",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    )
    
    await deleteFilmById(row.id)
    ElMessage.success("删除成功")
    searchTableTemplateRef.value.pageQueryData()
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info("已取消删除")
    } else {
      console.error('删除失败:', error)
    }
  }
}

const showAddSchduleForm = (row) => {
  dialogFormVisible.value = true
  film.value = row
  
  nextTick(() => {
    if (addScheduleRef.value) {
      addScheduleRef.value.init()
    }
  })
}

const cancel = () => {
  dialogFormVisible.value = false
}
</script>

<style>
.img {
  width: 120px;
}
</style>