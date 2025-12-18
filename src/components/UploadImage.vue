<template>
  <el-upload class="avatar-uploader" action="" :show-file-list="false" :before-upload="beforeAvatarUpload"
     v-loading="isUploading">
    <img v-if="modelValue" :style="imageStyle" :src="modelValue" alt="上传预览" class="upload-image">
    <el-icon v-else :style="imageStyle" class="avatar-uploader-icon">
      <Plus />
    </el-icon>

  </el-upload>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'  // 显式导入图标
import { upload } from "@/api/common"

// 定义 props 类型
interface Props {
  modelValue: string; // 图片src的值
  width?: number; // 图片的宽
  height?: number; // 图片的高
}

// 配置默认值
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  width: 160,
  height: 220
})

const imageStyle = { width: `${props.width / 10}rem`, height: `${props.height / 10}rem` }

// 定义 emits 类型
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'upload-error': [error: unknown]  // 新增错误回调，方便父组件处理
}>()

// 上传状态管理（防止重复上传）
const isUploading = ref(false)

/**
 * 上传前校验
 * @param file 上传的文件对象
 * @returns 是否允许上传
 */
const beforeAvatarUpload = (file: File): boolean => {
  // 校验文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片格式文件（JPG、PNG等）')
    return false
  }

  // 校验文件大小
  const maxSize = 1 * 1024 * 1024  // 1MB
  const isLt2M = file.size <= maxSize
  if (!isLt2M) {
    ElMessage.error(`上传图片大小不能超过 ${maxSize / 1024 / 1024}MB!`)
    return false
  }

  // 防止重复上传
  if (isUploading.value) {
    ElMessage.warning('正在上传中，请稍候...')
    return false
  }

  // 执行上传
  const formData = new FormData()  // 使用FormData标准格式
  formData.append('file', file)
  handleUpload(formData)

  return false  // 阻止默认上传行为
}

/**
 * 处理文件上传逻辑
 * @param formData 包含文件的表单数据
 */
const handleUpload = async (formData: FormData) => {
  try {
    isUploading.value = true
    const res = await upload(formData)

    // 假设upload接口返回的是图片URL字符串，若返回格式不同需调整
    if (typeof res === 'string') {
      emit('update:modelValue', res)
      ElMessage.success('上传成功')
    } else {
      throw new Error('上传接口返回格式不正确')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
    emit('upload-error', error)  // 向外抛出错误
  } finally {
    isUploading.value = false  // 无论成功失败都重置状态
  }
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

/* 上传图标容器基础样式 */
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
