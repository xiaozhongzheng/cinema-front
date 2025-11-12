<template>
    <!-- 新增/编辑影院弹框 -->
    <el-dialog :title="isAdd ? '新增影院' : '修改影院'" :model-value="showEditDialog" @close="handleClose" modal
        :close-on-click-modal="false">
        <el-form label-width="120px" :model="cinemaForm" :rules="rules" ref="screenFormRef">
            <el-form-item label="名称" prop="name" class="w80">
                <el-input v-model="cinemaForm.name" autocomplete="off" placeholder="请输入名称"></el-input>
            </el-form-item>
            <el-form-item label="所在省份" prop="provinceName" class="w80">
                <el-select @change="handleProvinceChange" v-model="cinemaForm.provinceName" placeholder="请选择省份"
                    style="width: 100%">
                    <el-option v-for="item in provinceOptions" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="cityOptions.length" label="所在城市" prop="cityName" class="w80">
                <el-select @change="handleCityChange" v-model="cinemaForm.cityName" placeholder="请选择城市"
                    style="width: 100%">
                    <el-option v-for="item in cityOptions" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="areaOptions.length" label="所在区域" prop="areaName" class="w80">
                <el-select @change="" v-model="cinemaForm.areaName" placeholder="请选择地区" style="width: 100%">
                    <el-option v-for="item in areaOptions" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="详细地址" prop="address" class="w80">
                <el-input v-model="cinemaForm.address" autocomplete="off" placeholder="请输入详细地址"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="phone" class="w80">
                <el-input v-model="cinemaForm.phone" autocomplete="off" placeholder="请输入联系电话"></el-input>
            </el-form-item>
            <el-form-item label="简介" prop="description" class="w80">
                <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="cinemaForm.description"></el-input>
            </el-form-item>

        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取 消</el-button>
                <el-button type="primary" @click="handleAddOrUpdate">{{ isAdd ? '添 加' : '修 改'
                    }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted } from "vue"
import { provinceOptions, getCityDataByProvince, getCityOptions, getAreaByProvinceAndCity } from "@/utils/area"
import { ElMessage } from "element-plus"
import { CinemaFormType } from "@/api/cinema/type"
import { addCinemaApi, getCinemaByIdApi, updateCinemaApi } from "@/api/cinema"
const props = defineProps({
    showEditDialog: {
        type: Boolean,
        default: false
    },
    currentRow: {
        type: Object,
        default: () => { }
    },
    isAdd: {
        type: Boolean,
        default: true
    }
})
console.log(provinceOptions, 'provinceList')
const emit = defineEmits(['update:showEditDialog'])
const cinemaForm = reactive<CinemaFormType>({
    name: '',
    provinceName: '',
    cityName: '',
    areaName: '',
    address: '',
    phone: '',
    description: ''
})
const screenFormRef = ref(null)

const cityOptions = ref([])
const areaOptions = ref([])

const handleProvinceChange = (val: string) => {
    areaOptions.value = []
    cityOptions.value = []
    cinemaForm.cityName = ''
    cinemaForm.areaName = ''
    const cityData = getCityDataByProvince(val)
    console.log(cityData, 'cityData')
    const name = '市辖区'
    if (name in cityData) {
        // 显示省和区
        // console.log(cityData[name])
        areaOptions.value = cityData[name].map((val: string) => ({ label: val, value: val }))
    } else {
        // 显示省市区
        cityOptions.value = getCityOptions(cityData)
        console.log(val)
    }
}
const handleCityChange = (val: string) => {
    cinemaForm.areaName = ''
    const areaData = getAreaByProvinceAndCity(cinemaForm.provinceName, val)
    console.log(areaData, 'areaData')
    areaOptions.value = areaData.map((val: string) => ({ label: val, value: val }))
}

// 表单规则
const rules = {
    name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 1, max: 50, message: '名称长度在1-50个字符之间', trigger: 'blur' }
    ],
    provinceName: [
        { required: true, message: '请选择所在省份', trigger: 'change' }
    ],
    cityName: [
        { required: true, message: '请选择所在城市', trigger: 'change' }
    ],
    areaName: [
        { required: true, message: '请选择所在区域', trigger: 'change' }
    ],
    address: [
        { required: true, message: '请输入详细地址', trigger: 'blur' },
        { min: 1, max: 200, message: '详细地址长度在1-200个字符之间', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号', trigger: 'blur' }
    ],
    description: [
        { max: 500, message: '简介长度不超过500个字符', trigger: 'blur' }
    ]
};

const handleClose = () => {
    emit('update:showEditDialog', false)
}

onMounted(() => {
    const id = props.currentRow?.id
    if(id){
        getCinemaById(id)
    }
})

const getCinemaById = async (id: number) => {
    const res = await getCinemaByIdApi(id)
    cinemaForm.value = res
}

const handleAddOrUpdate = async () => {
    if (!screenFormRef.value) return

    await screenFormRef.value.validate()
    if (props.isAdd) {
        await handleAdd()
    } else {
        await handleUpdate()
    }
    resetForm()

}

const resetForm = () => {
    screenFormRef?.value.resetFields()
}

const handleAdd = async () => {
    await addCinemaApi(cinemaForm)
    ElMessage.success('添加影院成功')

}

const handleUpdate = async () => {
    await updateCinemaApi(cinemaForm)
    ElMessage.success('修改影院成功')

}

</script>

<style lang="scss" scoped></style>
