<template>
  <div id="addSchedule">
    <!-- 新增或修改排片弹框 -->
    <el-dialog
      :title="actionType === 'add' ? '新增排片' : '编辑排片'"
      :model-value="modelValue"
      @close="cancel"
      width="600px"
    >
      <el-form
        :model="scheduleForm"
        :rules="rules"
        ref="scheduleFormRef"
        label-width="120px"
      >
        <!-- <el-form-item label="影片名" prop="filmTitle" class="w80">
          <el-input
            v-model="scheduleForm.filmTitle"
            autocomplete="off"
            readonly
          />
        </el-form-item> -->
        <el-form-item label="影院" prop="cinemaId" class="w80">
          <el-select
            v-model="scheduleForm.cinemaId"
            placeholder="请选择影院"
            @change="handleCinemaChange"
            filterable
          >
            <el-option
              v-for="item in cinemaOptions"
              :key="item"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="放映厅" prop="screenRoomId" class="w80">
          <el-select
            v-model="scheduleForm.screenRoomId"
            placeholder="请选择放映厅"
            filterable
          >
            <el-option
              v-for="item in screenRoomOptions"
              :key="item"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="影片" prop="filmId" class="w80">
          <el-select
            v-model="scheduleForm.filmId"
            placeholder="请选择影片"
            filterable
          >
            <el-option
              v-for="item in filmOptions"
              :key="item"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="语言" prop="language" class="w80">
          <el-select
            v-model="scheduleForm.language"
            placeholder="请选择语言类型"
          >
            <el-option
              v-for="name in languageList"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="w80" label="价格" prop="price">
          <el-input
            v-model="scheduleForm.price"
            @input="handlePrice"
            type="number"
            placeholder="请输入影片售卖价格(单位：元)"
          ></el-input>
        </el-form-item>

        <el-form-item label="开始日期" prop="startDateTime" class="w80">
          <el-date-picker
            v-model="scheduleForm.startTimes"
            type="datetime"
            placeholder="选择开始日期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="handleAddSchedule">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  watch,
  nextTick,
  type FormInstance,
  onMounted,
} from "vue";
import { ElMessage } from "element-plus";
import { getScreenRoomListApi, getScreensByCinemaIdApi } from "@/api/screen";
import { addSchedule, updateSchedule } from "@/api/schedule";
import { languageList } from "@/utils/constant";
import { ScheduleActionType } from "../index.vue";
import { ScheduleFormType, type OptionsType } from "@/api/schedule/type";
import { getCinemaListApi } from "@/api/cinema";
import { getFilmListApi } from "@/api/film/index";
import { FilmResultType } from "@/api/film/type";

interface Film {
  id: string | number;
  title: string;
  releaseDate: string;
  duration: number;
  [key: string]: any;
}

interface Props {
  modelValue: boolean;
  film?: Film | null;
  actionType?: ScheduleActionType;
  schedule?: ScheduleFormType | null;
}

// Props 定义
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  film: null,
  actionType: "add",
  schedule: null,
});

// Emits 定义
const emit = defineEmits(["cancel", "update:modelValue"]);

const scheduleFormRef = ref<FormInstance>();
const screenRoomOptions = ref<OptionsType[]>([]);
const cinemaOptions = ref<OptionsType[]>([]);
const filmOptions = ref<OptionsType[]>([]);
const filmItem = ref<FilmResultType>({})
const scheduleForm = reactive<ScheduleFormType>({});
const validateDateTime = (rule: any, value: any, callback: any) => {
  const curTimestamp = new Date(value).getTime()
  const releaseDate =
  // if (!/^\d+(\.\d{0,1})?$/.test(value)) {
  //   callback(new Error("请输入正整数或保留1位小数"));
  //   return;
  // }

  callback();
};
const rules = {
  cinemaId: [{ required: true, message: "请选择影院", trigger: "change" }],
  screenRoomId: [
    { required: true, message: "请选择放映厅", trigger: "change" },
  ],
  filmId: [{ required: true, message: "请选择影片", trigger: "change" }],
  language: [{ required: true, message: "请选择语言", trigger: "change" }],
  price: [
    { required: true, message: "请输入价格", trigger: "change" },
    {
      validator: (rule: any, value: any, callback: any) => {
        // 验证数字格式：正整数或1位小数
        if (!/^\d+(\.\d{0,1})?$/.test(value)) {
          callback(new Error("请输入正整数或保留1位小数"));
          return;
        }

        callback();
      },
    },
  ],
  startDateTime: [
    { required: true, message: "请选择时间", trigger: "change" },
    { validator: validateDateTime },
  ],
};

onMounted(() => {
  initCinemaList();
  initFilmList();
});
const handlePrice = (val: string) => {
  if (!val) return;
  scheduleForm.price = Number(val);
};
const handleCinemaChange = (id: number) => {
  console.log(id, "id");
  getScreensByCinemaId(id);
};

const getScreensByCinemaId = async (id: number) => {
  const data = (await getScreensByCinemaIdApi(id)) || [];
  console.log(data, "data");
  screenRoomOptions.value = data.map((item: any) => ({
    ...item,
    label: item.name,
    value: item.id,
  }));
};

const initCinemaList = async () => {
  const data = (await getCinemaListApi()) || [];
  console.log(data, "data");
  cinemaOptions.value = data.map((item: any) => ({
    ...item,
    label: item.name,
    value: item.id,
  }));
};

const initFilmList = async () => {
  const data = (await getFilmListApi()) || [];
  console.log(data, "data");
  filmOptions.value = data.map((item: any) => ({
    ...item,
    label: item.title,
    value: item.id,
  }));
  console.log(filmOptions.value, "filmOptions");
};

const changeDate = (): void => {};

const handleAddSchedule = async (): Promise<void> => {
  if (!scheduleFormRef.value) return;

  try {
    await scheduleFormRef.value.validate();

    const form = { ...scheduleForm };
    const startTime = form.time[0];
    const endTime = form.time[1];
    const selectedDuration =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) /
      (60 * 1000);

    // // 验证逻辑
    // if (startTime < releaseDate.value) {
    //   ElMessage.error("影片的开始时间不能早于上映时间")
    //   return
    // }

    if (new Date(startTime) <= new Date()) {
      ElMessage.error("影片的开始时间不能早于当前时间");
      return;
    }

    // if (Math.abs(selectedDuration - duration.value) > 1) { // 允许1分钟的误差
    //   ElMessage.error(`影片的时长和选择的时间不一致，影片时长: ${duration.value}分钟，选择时长: ${selectedDuration}分钟`)
    //   return
    // }

    form.startTime = startTime;
    form.endTime = endTime;

    if (props.type === "add") {
      await addSchedule(form);
      ElMessage.success("添加排片成功");
    } else {
      await updateSchedule(form);
      ElMessage.success("修改排片成功");
    }

    cancel();
  } catch (error) {
    console.error("表单验证失败:", error);
  }
};

const cancel = (): void => {
  emit("update:modelValue", false);
  if (scheduleFormRef.value) {
    scheduleFormRef.value.resetFields();
  }
};

// 暴露方法给父组件
defineExpose({});
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
