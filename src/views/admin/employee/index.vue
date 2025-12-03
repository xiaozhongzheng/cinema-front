<template>
  <div id="employee">
    <SearchTableTemplate
      ref="searchTableTemplateRef"
      :extra-params="extraParams"
      :table-params-list="tableParamsList"
      :search-params-list="searchParamsList"
      :show-search-form="showSearchForm"
      :getTableData="getTableData"
    >
      <template #handle>
        <!-- <el-button type="" @click="exportExcel">导出文件</el-button>
        <el-button type="" @click="dialogVisible = true">导入文件</el-button> -->
      </template>
    </SearchTableTemplate>

    <ImportEmployee
      @handleSuccess="handleSuccess"
      v-model:visible="dialogVisible"
      :import-excel-api="importExcelApi"
      v-if="dialogVisible"
    ></ImportEmployee>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from "vue";
import { ElButton, ElMessage, ElMessageBox } from "element-plus";
import FileSaver from "file-saver";
import ImportEmployee from "./components/ImportEmployee.vue";
import * as emp from "@/api/employee";
import { accountStatusOptions, userRoleOptions } from "@/utils/constant";
import SearchTableTemplate, { PagerType, SearchParamType, TableParamType } from "@/components/SearchTableTemplate.vue";
import { pageQueryUserApi, updateUserApi } from "@/api/user";
// 响应式数据
const dialogVisible = ref(false);
const searchTableTemplateRef = ref<typeof SearchTableTemplate>();

const tableParamsList = ref<TableParamType[]>([
  {
    label: "ID",
    prop: "id",
    width: 60,
  },
  {
    label: "用户名",
    prop: "username",
    width: 120,
  },
  {
    label: "电话号码",
    prop: "phone",
    width: 160,
  },
  {
    label: "角色",
    prop: "roleId",
    renderText: (value: number) => {
      return userRoleOptions.find((item: any) => item.value === value)?.label || '';
    },
    width: 100,
  },
  {
    label: "账号状态",
    prop: "status",
    renderText: (value: any) => {
      return accountStatusOptions.find((item: any) => item.value === value)
        ?.label || '';
    },
    width: 120,
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: 200,
  },
  {
    label: "更新时间",
    prop: "updateTime",
    width: 200,
  },
  {
    label: "操作",
    width: 150,
    prop: "option",
    fixed: "right",
    render: (_: any, row: any) => {
      return h("div", { class: "action-buttons" }, [
        h(
          ElButton,
          {
            type: row.status === 0 ? "success" : "danger",
            size: "small",
            onClick: () => openDialog(row),
          },
          () => accountStatusOptions[row.status]?.label
        ),
      ]);
    },
  },
]);

const extraParams = ref({});
const showSearchForm = ref(true);
const importExcelApi = ref(null);

const searchParamsList = ref<SearchParamType[]>([
  {
    label: "用户名",
    prop: "username",
    type: "input",
    placeholder: "请输入用户名",
  },

  {
    label: "角色",
    prop: "roleId",
    type: "select",
    placeholder: "请选择角色",
    options: userRoleOptions,
  },
  {
    label: "状态",
    prop: "status",
    type: "select",
    placeholder: "请选择账号状态",
    options: accountStatusOptions,
  },
]);

const reloadData = () => {
  searchTableTemplateRef.value?.pageQuery();
};

const openDialog = (row: any) => {
  console.log(row, "row");
  const newStatus = row.status === 0 ? 1 : 0;
  const text =
    newStatus === 1
      ? "确定要启用该用户的账号吗?启用后，账号可以正常使用"
      : "确定要禁用该用户的账号吗？禁用后账号无法使用";
  ElMessageBox.confirm(`${text}`, "状态确认弹框", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      handleUpdate(row,newStatus);
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消状态修改",
      });
    });
};

// 生命周期
onMounted(() => {
  // importExcelApi.value = emp.importExcel;
});
const getTableData = async (
  pageParams: PagerType,
  searchParams: Record<string, any>
) => {
  const res = await pageQueryUserApi({
    ...pageParams,
    ...searchParams,
  });

  return {
    data: res.records,
    total: res.total,
  };
};
// 方法
const handleSuccess = () => {
  ElMessage.success("上传成功");
};

const exportExcel = async () => {
  try {
    const res = await emp.exportExcel();
    console.log(res, "export");
    FileSaver.saveAs(res.data, "员工信息表.xlsx");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败");
  }
};

const handleUpdate = async (row: any, status: number) => {
  await updateUserApi({ ...row, status });
  reloadData();
  ElMessage({
    type: "success",
    message: "操作成功",
  });
};
</script>

<style scoped>
.w80 {
  width: 80%;
}
</style>
