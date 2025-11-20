<template>
  <div id="schedule">
    <SearchTableTemplate
      ref="searchTableTemplateRef"
      :table-list-api="pageQueryScheduleApi"
      :table-params-list="tableParamsList"
      :search-params-list="searchParamsList"
      :show-search-form="true"
      :extra-params="extraParams"
    >
     <template #handle>
        <el-button type="primary" @click="dialogFormVisible=true">新增影片</el-button>
      </template>
    </SearchTableTemplate>

    <EditScheduleDialog
      v-if="dialogFormVisible"
      v-model="dialogFormVisible"
      :type="type"
      :schedule="scheduleForm"
      ref="addScheduleRef"
      @cancel="cancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from "vue";
import { getScreenRoomListApi } from "@/api/screen";
import { pageQueryScheduleApi } from "@/api/schedule";
import EditScheduleDialog from "./components/EditScheduleDialog.vue";
import SearchTableTemplate from "@/components/SearchTableTemplate.vue";
import type {
  SearchParamType,
  TableParamType,
} from "@/components/SearchTableTemplate.vue";
import { languageList } from "@/utils/constant";

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

// 响应式数据
const dialogFormVisible = ref(false);
const type = ref("update");
const addScheduleRef = ref<InstanceType<typeof AddScheduleDialog>>();
const searchTableTemplateRef = ref<InstanceType<typeof SearchTableTemplate>>();

const screenRoomList = ref<string[]>([]);

const scheduleForm = reactive<ScheduleItem>({
  filmTitle: "",
  screenRoomName: "",
  language: "",
  duration: 0,
  startTime: "",
  endTime: "",
  createTime: "",
});

// 计算属性 - 额外参数
const extraParams = computed(() => ({
  employeeId: localStorage.getItem("id"),
}));

// 表格列配置
const tableParamsList = ref<TableParamType[]>([
  {
    label: "影片名",
    prop: "filmTitle",
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
    label: "开始时间",
    prop: "startTime",
  },
  {
    label: "结束时间",
    prop: "endTime",
  },
  {
    label: "排片时间",
    prop: "createTime",
    width: 180,
  },

]);

// 搜索参数配置
const searchParamsList = ref<SearchParamType[]>([
  {
    label: "影片名",
    prop: "title",
    type: "input",
    placeholder: "请输入影片名",
  },
  {
    label: "放映厅",
    prop: "screenRoomName",
    type: "select",
    placeholder: "请选择放映厅",
    options: computed(() =>
      screenRoomList.value.map((item) => ({
        label: item,
        value: item,
      }))
    ),
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
]);

// 生命周期
onMounted(() => {
  getScreenRoomListName();
});

// 方法
const getScreenRoomListName = async (): Promise<void> => {
  try {
    screenRoomList.value = await getScreenRoomList();
  } catch (error) {
    console.error("获取放映厅列表失败:", error);
  }
};

const showEditSchduleForm = (row: ScheduleItem): void => {
  dialogFormVisible.value = true;
  Object.assign(scheduleForm, row);
  scheduleForm.time = [scheduleForm.startTime, scheduleForm.endTime];

  nextTick(() => {
    if (addScheduleRef.value) {
      addScheduleRef.value.init();
    }
  });
};

const cancel = (val: boolean): void => {
  dialogFormVisible.value = val;
  // 重置表单数据
  Object.keys(scheduleForm).forEach((key) => {
    if (key in scheduleForm) {
      if (key === "time") {
        scheduleForm[key] = [];
      } else {
        scheduleForm[key] = "" as any;
      }
    }
  });
  scheduleForm.duration = 0;

  // 刷新表格数据
  if (searchTableTemplateRef.value) {
    searchTableTemplateRef.value.pageQueryData();
  }
};
</script>

<style scoped>
#schedule {
  padding: 20px;
}
</style>
