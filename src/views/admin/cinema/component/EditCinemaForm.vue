<template>
    <!-- 新增/编辑影院弹框 -->
    <el-dialog :title="title" :model-value="showEditDialog" @close="handleClose" modal :close-on-click-modal="false" >
        <el-form label-width="120px" :model="cinemaForm" :rules="rules" ref="screenFormRef">
            <el-form-item label="名称"  prop="name" class="w80">
                <el-input v-model="cinemaForm.name" autocomplete="off" placeholder="请输入名称"></el-input>
            </el-form-item>
            <el-form-item label="座位数"  prop="seatCount" class="w80">
                <el-input v-model.number="cinemaForm.seatCount" autocomplete="off" placeholder="请填写座位数"></el-input>
            </el-form-item>
            <el-form-item label="类型"  prop="type" class="w80">
                <el-select v-model="cinemaForm.type" placeholder="请选择放映类型" style="width: 100%">
                    <el-option label="2D" :value="2"></el-option>
                    <el-option label="3D" :value="3"></el-option>
                    <el-option label="4D" :value="4"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="简介"  prop="description" class="w80">
                <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="cinemaForm.description"></el-input>
            </el-form-item>

        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取 消</el-button>
                <el-button type="primary" @click="handleAddOrUpdate">{{ handleType == 'add' ? '添 加' : '修 改'
                    }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
const props = defineProps({
    showEditDialog: {
        type: Boolean,
        default: false
    },
    cinemaItem: {
        type: Object,
        default: () => {}
    }
})
const emit = defineEmits(['update:showEditDialog'])
const cinemaForm = reactive({
  id: '',
  name: '',
  seatCount: '',
  type: '',
  description: ''
})
// 自定义验证规则
const validateValue = (rule: any, value: any, callback: any) => {
  if (value < 20) {
    callback(new Error("座位数不能低于20"))
  } else if (value > 200) {
    callback(new Error("座位数不能高于200"))
  } else {
    callback()
  }
}
// 表单规则
const rules = reactive({
  name: [{ required: true, message: "请填写名称" }],
  seatCount: [
    { required: true, message: "请填写座位数" },
    { type: "number", message: "座位数必须为整数" },
    { pattern: /^[0-9]*$/, message: "只能输入正整数" },
    { validator: validateValue }
  ],
  type: [{ required: true, message: "请选择类型", trigger: "change" }]
})

const handleClose = () => {
    emit('update:showEditDialog',false)
}

</script>

<style lang="scss" scoped></style>
