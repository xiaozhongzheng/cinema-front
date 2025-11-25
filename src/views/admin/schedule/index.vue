<template>
  <div id="schedule">
    <SearchTableTemplate
      ref="searchTableTemplateRef"
      :table-params-list="tableParamsList"
      :search-params-list="searchParamsList"
      :show-search-form="true"
      :getTableData="getTableData"
      :tableProps="tableProps"
    >
      <template #handle>
        <el-button type="primary" @click="showAddDialog">新增排片</el-button>
      </template>
    </SearchTableTemplate>

    <EditScheduleDialog
      v-if="dialogFormVisible"
      v-model="dialogFormVisible"
      :actionType="actionType"
      :schedule="scheduleForm"
      :filmOptions="filmOptions"
      :cinemaOptions="cinemaOptions"
      ref="addScheduleRef"
      @handleSuccess="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed, h } from "vue";
import { getScreenRoomListApi, getScreensByCinemaIdApi } from "@/api/screen";
import { pageQueryScheduleApi, updateScheduleApi } from "@/api/schedule";
import EditScheduleDialog from "./components/EditScheduleDialog.vue";
import SearchTableTemplate from "@/components/SearchTableTemplate.vue";
import type {
  Pager,
  PagerType,
  SearchParamType,
  TableParamType,
} from "@/components/SearchTableTemplate.vue";
import { languageList, shceduleStatusOptions } from "@/utils/constant";
import { ElButton } from "element-plus";
import { getCinemaListApi } from "@/api/cinema";
import { OptionsType } from "@/api/schedule/type";
import { getFilmListApi } from "@/api/film/index";
import { ElTag } from "element-plus";
import { ElMessage } from "element-plus";

// 类型定义
interface ScheduleItem {
  filmTitle: string;
  screenRoomName: string;
  language: string;
  duration: number;
  startTime: string;
  endTime: string;
  createTime: string;
  id?: string | number;
  time?: string[];
  [key: string]: any;
}
export type ScheduleActionType = "add" | "update";
// 响应式数据
const dialogFormVisible = ref(false);
const actionType = ref<ScheduleActionType>("add");
const addScheduleRef = ref<InstanceType<typeof EditScheduleDialog>>();
const searchTableTemplateRef = ref<InstanceType<typeof SearchTableTemplate>>();

const screenRoomOptions = ref<OptionsType[]>([]);
const cinemaOptions = ref<OptionsType[]>([]);
const filmOptions = ref<OptionsType[]>([]);

const scheduleForm = ref<ScheduleItem>({
  filmTitle: "",
  screenRoomName: "",
  language: "",
  duration: 0,
  startTime: "",
  endTime: "",
  createTime: "",
});

const handleSelectChange = (val) => {
  console.log(val,'val')
}

const tableProps = {
  'selection-change': handleSelectChange
}

// 表格列配置
const tableParamsList = ref<TableParamType[]>([
  {
    type: 'selection',
    width: 60
  },
  {
    label: "影院名",
    prop: "cinemaName",
    width: 180,
  },
  {
    label: "影片名",
    prop: "filmName",
    width: 180,
  },
  {
    label: "放映厅",
    prop: "screenRoomName",
    width: 120,
  },
  {
    label: "语言",
    prop: "language",
    width: 100,
  },
  {
    label: "时长(分钟)",
    prop: "duration",
    width: 100,
  },
  {
    label: "放映日期",
    prop: "screeningDate",
  },
  {
    label: "开始时间",
    prop: "startTime",
  },
  {
    label: "结束时间",
    prop: "endTime",
  },
  {
    label: "排片状态",
    width: 100,
    prop: "status",
    render: (val: number) => {
      const { label, type = '' } =
        shceduleStatusOptions.find((item: any) => item.value === val) || {};
      return h(
        ElTag,
        {
          type,
        },
        () => label
      );
    },
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: 180,
  },
  {
    label: "更新时间",
    prop: "updateTime",
    width: 180,
  },
  {
    label: "操作",
    width: 150,
    prop: "option",
    fixed: "right",
    render: (_: any, row: any) => {
      console.log(row.status, "row");

      return h("div", { class: "action-buttons" }, [
        h(
          ElButton,
          {
            type: "warning",
            size: "small",
            onClick: () => showEditDialog(row),
          },
          () => "编辑"
        ),
        row.status === 1
          ? h(
              ElButton,
              {
                type: "success",
                size: "small",
                onClick: () => handlePublish(row),
              },
              () => "发布"
            )
          : null,
      ]);
    },
  },
]);

const handleCinemaChange = async (id: number) => {
  if (!id) return;
  const data = (await getScreensByCinemaIdApi(id)) || [];
  screenRoomOptions.value = data.map((item: any) => ({
    ...item,
    label: item.name as string,
    value: item.id,
  }));
};

// 搜索参数配置
const searchParamsList = ref<SearchParamType[]>([
  {
    label: "影片名",
    prop: "title",
    type: "input",
    placeholder: "请输入影片名",

  },
  {
    label: "影院",
    prop: "cinemaId",
    type: "select",
    placeholder: "请选择影院",
    options: computed(() =>
      cinemaOptions.value.map((item: any) => ({
        label: item.label,
        value: item.value,
      }))
    ),
    attrs: {
      onChange: handleCinemaChange,
      filterable: true,
    },
  },
  {
    label: "放映厅",
    prop: "screenRoomId",
    type: "select",
    placeholder: "请选择放映厅",
    options: computed(() =>
      screenRoomOptions.value.map((item: any) => ({
        label: item.label,
        value: item.value,
      }))
    ),
  },
  {
    label: "影片",
    prop: "filmId",
    type: "select",
    options: computed(() =>
      filmOptions.value.map((item: any) => ({
        label: item.label,
        value: item.value,
      }))
    ),
    attrs: {
      placeholder: "请选择影片",
      multiple: true,
      clearable: true,
      filterable: true,
    },
  },
  {
    label: "语言类型",
    prop: "language",
    type: "select",
    placeholder: "请选择语言类型",
    options: languageList.map((item) => ({
      label: item,
      value: item,
    })),
  },
  {
    label: "排片日期",
    prop: "scheduleDates",
    type: "time",
    attrs: {
      "start-placeholder": "请选择开始时间",
      "end-placeholder": "请选择结束时间",
      type: "daterange",
      format: "YYYY-MM-DD",
      "value-format": "YYYY-MM-DD",
    },
  },
]);

// 生命周期
onMounted(() => {
  getScreenRoomListName();
  initCinemaList();
  initFilmList();
});
const handlePublish = async (row: any) => {
  await updateScheduleApi({ ...row, status: 2 });
  ElMessage.success("发布成功");
  reloadData();
};
const getTableData = async (
  pageParams: PagerType,
  searchParams: Record<string, any>
) => {
  console.log(pageParams, searchParams, "getTableData==");
  const { scheduleDates = [], ...restParams } = searchParams;
  const res = await pageQueryScheduleApi({
    ...pageParams,
    ...restParams,
    startDate: scheduleDates[0],
    endDate: scheduleDates[1],
  });

  return {
    data: res.records,
    total: res.total,
  };
};

const initCinemaList = async () => {
  const data = (await getCinemaListApi()) || [];
  cinemaOptions.value = data.map((item: any) => ({
    ...item,
    label: item.name as string,
    value: item.id,
  }));
};
const initFilmList = async () => {
  const data = (await getFilmListApi()) || [];
  filmOptions.value = data.map((item: any) => ({
    ...item,
    label: item.title as string,
    value: item.id,
  }));
};

const showAddDialog = () => {
  actionType.value = "add";
  dialogFormVisible.value = true;
  scheduleForm.value = {};
};

// 方法
const getScreenRoomListName = async (): Promise<void> => {
  const data = await getScreenRoomListApi();
  screenRoomOptions.value = data.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
};

const showEditDialog = (row: ScheduleItem): void => {
  actionType.value = "edit";
  dialogFormVisible.value = true;
  scheduleForm.value = { ...row };
  scheduleForm.value.startDateTime = `${row.screeningDate}  ${row.startTime}`;
};

const reloadData = () => {
  searchTableTemplateRef.value?.pageQuery();
};

const handleSuccess = (): void => {
  // 刷新表格数据
  reloadData();
};
</script>

<style scoped>
#schedule {
  padding: 20px;
}
</style>
