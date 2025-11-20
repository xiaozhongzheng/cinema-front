<template>
  <div id="addSchedule">
    <!-- 新增或修改排片弹框 -->
    <el-dialog
      :title="dialogTitle"
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
        <el-form-item
          label="影片名"
          prop="filmTitle"
          class="w80"
        >
          <el-input
            v-model="scheduleForm.filmTitle"
            autocomplete="off"
            readonly
          />
        </el-form-item>

        <el-form-item
          label="放映厅"
          prop="screenRoomName"
          class="w80"
        >
          <el-select
            v-model="scheduleForm.screenRoomName"
            placeholder="请选择放映厅"
          >
            <el-option
              v-for="item in screenRoomList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="语言"
          prop="language"
          class="w80"
        >
          <el-select
            v-model="scheduleForm.language"
            placeholder="请选择语言类型"
          >
            <el-option
              v-for="item in languageList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="日期"
          prop="time"
          class="w80"
        >
          <el-date-picker
            v-model="scheduleForm.time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="changeDate"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button
            type="primary"
            @click="handleAddSchedule"
          >确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, type FormInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { getScreenRoomListApi } from "@/api/screen"
import { addSchedule, updateSchedule } from "@/api/schedule"
import { languageList } from '@/utils/constant'

// 类型定义
interface ScheduleForm {
  filmId?: string | number
  filmTitle: string
  screenRoomName: string
  language: string
  startTime: string
  endTime: string
  time: string[] // 保存开始时间和结束时间的数组
  id?: string | number
}

interface Film {
  id: string | number
  title: string
  releaseDate: string
  duration: number
  [key: string]: any
}

interface Props {
  modelValue: boolean
  film?: Film | null
  type?: string
  schedule?: ScheduleForm | null
}

// Props 定义
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  film: null,
  type: 'add',
  schedule: null
})

// Emits 定义
const emit = defineEmits(['cancel','update:modelValue'])

const scheduleFormRef = ref<FormInstance>()
const screenRoomList = ref<string[]>([])
const releaseDate = ref('')
const duration = ref(0)
const dialogTitle = ref('')


const scheduleForm = reactive<ScheduleForm>({
  filmId: '',
  filmTitle: '',
  screenRoomName: '',
  language: '',
  startTime: '',
  endTime: '',
  time: []
})

const rules = {
  screenRoomName: [{ required: true, message: "请选择放映厅", trigger: "change" }],
  language: [{ required: true, message: "请选择语言", trigger: "change" }],
  time: [{ required: true, message: "请选择时间", trigger: "change" }],
}



watch(() => props.film, (newFilm) => {
  if (newFilm) {
    initForm()
  }
})

watch(() => props.schedule, (newSchedule) => {
  if (newSchedule) {
    initForm()
  }
})

// 方法
const getScreenRoomListName = async (): Promise<void> => {
  try {
    screenRoomList.value = await getScreenRoomListApi()
  } catch (error) {
    console.error('获取放映厅列表失败:', error)
    ElMessage.error('获取放映厅列表失败')
  }
}

const changeDate = (): void => {
  // Vue 3 中通常不需要强制更新，如果需要可以使用 nextTick
  nextTick(() => {
    // 如果需要额外的处理可以在这里添加
  })
}

const init = (): void => {
  initForm()
}

const initForm = (): void => {
  // 重置表单
  if (scheduleFormRef.value) {
    scheduleFormRef.value.resetFields()
  }

  Object.assign(scheduleForm, {
    filmId: '',
    filmTitle: '',
    screenRoomName: '',
    language: '',
    startTime: '',
    endTime: '',
    time: []
  })

  if (props.film) {
    scheduleForm.filmId = props.film.id
    scheduleForm.filmTitle = props.film.title
    releaseDate.value = props.film.releaseDate
    duration.value = props.film.duration
    dialogTitle.value = "新增排片"
  }

  if (props.schedule) {
    Object.assign(scheduleForm, props.schedule)
    releaseDate.value = props.schedule.releaseDate || ''
    duration.value = props.schedule.duration || 0
    dialogTitle.value = "修改排片"
  }
}

const handleAddSchedule = async (): Promise<void> => {
  if (!scheduleFormRef.value) return

  try {
    await scheduleFormRef.value.validate()

    const form = { ...scheduleForm }
    const startTime = form.time[0]
    const endTime = form.time[1]
    const selectedDuration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (60 * 1000)

    // 验证逻辑
    if (startTime < releaseDate.value) {
      ElMessage.error("影片的开始时间不能早于上映时间")
      return
    }

    if (new Date(startTime) <= new Date()) {
      ElMessage.error("影片的开始时间不能早于当前时间")
      return
    }

    if (Math.abs(selectedDuration - duration.value) > 1) { // 允许1分钟的误差
      ElMessage.error(`影片的时长和选择的时间不一致，影片时长: ${duration.value}分钟，选择时长: ${selectedDuration}分钟`)
      return
    }

    form.startTime = startTime
    form.endTime = endTime

    if (props.type === "add") {
      await addSchedule(form)
      ElMessage.success("添加排片成功")
    } else {
      await updateSchedule(form)
      ElMessage.success("修改排片成功")
    }

    cancel()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const cancel = (): void => {
  emit('update:modelValue', false)
  if (scheduleFormRef.value) {
    scheduleFormRef.value.resetFields()
  }
}

// 初始化
getScreenRoomListName()

// 暴露方法给父组件
defineExpose({
  init
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
