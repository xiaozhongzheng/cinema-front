<template>
  <el-dialog width="800px"  :title="handelType === 'add' ? '新增影片' : '修改影片'" :model-value="visible" @close="handleClose">
    <el-form :model="filmForm" :rules="rules" ref="filmFormRef" label-width="120px" class="form">
      <el-form-item class="w80" label="影片标题" prop="title">
        <el-input v-model="filmForm.title" placeholder="请填写影片标题"></el-input>
      </el-form-item>

      <el-form-item class="w80" label="导演名" prop="director">
        <el-input v-model="filmForm.director" placeholder="请填写导演名"></el-input>
      </el-form-item>

      <el-form-item class="w80" label="主演名" prop="actors">
        <el-input v-model="filmForm.actors" placeholder="请填写主演名(用逗号分隔)"></el-input>
      </el-form-item>

      <el-form-item  label="上映日期" prop="releaseDate">
        <el-date-picker v-model="filmForm.releaseDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
      </el-form-item>

      <el-form-item class="w80" label="类型" prop="type">
        <el-select v-model="filmForm.type" placeholder="请选择类型">
          <el-option v-for="(item, i) in filmTypeList" :key="i" :label="item" :value="i" />
        </el-select>
      </el-form-item>

      <el-form-item class="w80" label="地区" prop="region">
        <el-select v-model="filmForm.region" placeholder="请选择地区">
          <el-option v-for="(item, i) in regionList" :key="i" :label="item" :value="i" />
        </el-select>
      </el-form-item>

      <el-form-item class="w80" label="价格" prop="price">
        <el-input v-model="filmForm.price" autocomplete="off" placeholder="请输入价格(单位：元)" />
      </el-form-item>

      <el-form-item class="w80" label="时长" prop="duration">
        <el-input v-model.number="filmForm.duration" placeholder="请填写影片时长(单位：分钟)" />
      </el-form-item>

      <el-form-item  label="图片" prop="image">
        <UploadImage v-model="filmForm.image" />
      </el-form-item>

      <el-form-item class="w80" label="简介" prop="plot">
        <el-input type="textarea" v-model="filmForm.plot" placeholder="请输入剧情简介" :autosize="{ minRows: 2, maxRows: 30 }"
           />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitForm">
        {{ handelType === 'add' ? '添加' : '修改' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFilmById, addFilm, updateFilm } from "@/api/film"
import UploadImage from "@/components/UploadImage.vue"
import { filmTypeList, regionList } from '@/utils/constant'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  filmItem: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:visible', 'handleSuccess'])

// 响应式数据
const filmFormRef = ref()
const handelType = ref('add')

const filmForm = reactive({
  id: "",
  title: "",
  image: "",
  director: "", // 导演姓名
  actors: "", // 主演姓名
  releaseDate: "", // 上映日期
  type: "", // 影片类型
  region: "", // 地区
  duration: "", // 时长
  plot: "", // 简介
  price: "", // 价格
})

// 验证规则
const validatePrice = (rule, value, callback) => {
  if (value < 5) {
    callback(new Error("影片的价格不能低于5元"))
  } else if (value > 1000) {
    callback(new Error("影片的价格不能高于1000元"))
  } else {
    callback()
  }
}

const validateDate = (rule, value, callback) => {
  if (new Date(value) < new Date()) {
    callback(new Error("上映日期不能早于当前日期"))
  } else {
    callback()
  }
}

const rules = reactive({
  title: [{ required: true, message: "请填写影片标题" }],
  image: [
    {
      required: true,
      message: "请上传图片",
      trigger: "blur",
    },
  ],
  director: [{ required: true, message: "请填写导演姓名" }],
  actors: [{ required: true, message: "请填写主演姓名" }],
  releaseDate: [{ required: true, message: "请选择上映日期" }],
  type: [{ required: true, message: "请选择影片类型" }],
  region: [{ required: true, message: "请选择上映地区" }],
  duration: [
    { required: true, message: "请填写影片时长" },
    { type: "number", message: "时长必须为整数" },
    { pattern: /^[0-9]*$/, message: "只能输入正整数" },
  ],
  plot: [{ required: true, message: "请填写剧情简介" }],
  price: [
    { required: true, message: "请填写价格" },
    {
      pattern: /^\d+(\.\d{0,2})?$/,
      message: "价格只能是整数或小数",
    },
    { validator: validatePrice },
  ],
})
const resetForm = () => {
  if (filmFormRef.value) {
    filmFormRef.value.resetFields()
  }
  Object.assign(filmForm, {
    id: "",
    title: "",
    image: "",
    director: "",
    actors: "",
    releaseDate: "",
    type: "",
    region: "",
    duration: "",
    plot: "",
    price: "",
  })
}

// 方法
const getFilmByIdData = async (id) => {
  try {
    const data = await getFilmById(id)
    Object.assign(filmForm, data)
  } catch (error) {
    console.error('获取影片详情失败:', error)
  }
}

// 监听 props 变化
watch(() => props.filmItem, (newVal) => {
  if (newVal && newVal.id) {
    handelType.value = "update"
    getFilmByIdData(newVal.id)
  } else {
    handelType.value = "add"
    resetForm()
  }
}, { immediate: true })



const submitForm = () => {
  filmFormRef.value.validate((valid) => {
    if (valid) {
      if (handelType.value === "add") {
        addFilmData()
      } else {
        updateFilmData()
      }
    }
  })
}

const addFilmData = async () => {
  try {
    const data = { ...filmForm }
    await addFilm(data)
    ElMessage.success("添加影片成功")
    handleClose()
    emit('handleSuccess')
  } catch (error) {
    console.error('添加影片失败:', error)
  }
}

const updateFilmData = async () => {
  try {
    await updateFilm(filmForm)
    ElMessage.success("修改影片成功")
    handleClose()
    emit('handleSuccess')
  } catch (error) {
    console.error('修改影片失败:', error)
  }
}

const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}




</script>

<style lang="scss" scoped>
.el-textarea__inner {
  /* 去除文本框的滚动条 */
  overflow: hidden;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>