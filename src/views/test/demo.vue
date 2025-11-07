<template>
  <div class="schedule-form">
    <el-steps :active="currentStep" simple>
      <el-step title="选择影院影厅" />
      <el-step title="选择影片" />
      <el-step title="设置时间价格" />
      <el-step title="确认排片" />
    </el-steps>

    <!-- 步骤1：选择影院影厅 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择影院" required>
          <el-select 
            v-model="form.cinemaId" 
            placeholder="请选择影院"
            @change="handleCinemaChange"
            style="width: 300px"
          >
            <el-option
              v-for="cinema in cinemaList"
              :key="cinema.id"
              :label="cinema.name"
              :value="cinema.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选择影厅" required>
          <el-select 
            v-model="form.hallId" 
            placeholder="请先选择影院"
            :disabled="!form.cinemaId"
            style="width: 300px"
          >
            <el-option
              v-for="hall in hallList"
              :key="hall.id"
              :label="`${hall.name} (${hallTypeMap[hall.type]})`"
              :value="hall.id"
            />
          </el-select>
          
          <!-- 影厅信息预览 -->
          <div v-if="selectedHall" class="hall-info">
            <el-descriptions :column="2" size="small">
              <el-descriptions-item label="影厅类型">
                {{ hallTypeMap[selectedHall.type] }}
              </el-descriptions-item>
              <el-descriptions-item label="座位数">
                {{ selectedHall.totalSeats }}个
              </el-descriptions-item>
              <el-descriptions-item label="屏幕类型">
                {{ selectedHall.screenType }}
              </el-descriptions-item>
              <el-descriptions-item label="音响系统">
                {{ selectedHall.soundSystem }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-form-item>
      </el-form>
      
      <div class="step-actions">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="nextStep" :disabled="!form.cinemaId || !form.hallId">
          下一步：选择影片
        </el-button>
      </div>
    </div>

    <!-- 步骤2：选择影片（基于影厅类型过滤） -->
    <div v-if="currentStep === 2" class="step-content">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择影片" required>
          <el-select 
            v-model="form.filmId" 
            placeholder="请选择影片"
            style="width: 300px"
          >
            <el-option
              v-for="film in filteredFilmList"
              :key="film.id"
              :label="film.title"
              :value="film.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- 影片信息预览 -->
        <div v-if="selectedFilm" class="film-info">
          <el-descriptions :column="2" size="small">
            <el-descriptions-item label="影片时长">
              {{ selectedFilm.duration }}分钟
            </el-descriptions-item>
            <el-descriptions-item label="影片类型">
              {{ selectedFilm.type }}
            </el-descriptions-item>
            <el-descriptions-item label="上映日期">
              {{ selectedFilm.releaseDate }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-form>
      
      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep" :disabled="!form.filmId">
          下一步：设置时间价格
        </el-button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 1. 步骤控制相关
const currentStep = ref(1) // 当前步骤，对应1-4

// 2. 表单核心数据
const form = ref({
  cinemaId: '',    // 选中的影院ID
  hallId: '',      // 选中的影厅ID
  filmId: '',      // 选中的影片ID
  showDate: '',    // 后续步骤用：放映日期
  startTime: '',   // 后续步骤用：开始时间
  basePrice: 0     // 后续步骤用：基础票价
})

// 3. 静态数据与映射表
// 影厅类型映射（匹配后端返回的类型标识）
const hallTypeMap = ref({
  '2d': '2D普通厅',
  '3d': '3D厅',
  'imax': 'IMAX厅',
  'vip': 'VIP厅',
  '4dx': '4DX动感厅'
})

// 模拟影院列表（实际项目从接口获取）
const cinemaList = ref([
  { id: 'cinema001', name: '万达影城（朝阳大悦城店）' },
  { id: 'cinema002', name: 'CGV影城（海淀合生汇店）' },
  { id: 'cinema003', name: '大地影院（丰台永旺店）' },
  { id: 'cinema004', name: '博纳影城（通州万达店）' }
])

// 影厅列表（默认空，选择影院后赋值）
const hallList = ref([])

// 模拟影片列表（实际项目从接口获取）
const filmList = ref([
  { 
    id: 'film001', title: '流浪地球3', 
    duration: 178, type: '科幻/冒险', releaseDate: '2025-02-12',
    suitableHallTypes: ['2d', '3d', 'imax'] // 支持的影厅类型
  },
  { 
    id: 'film002', title: '飞驰人生3', 
    duration: 125, type: '喜剧/运动', releaseDate: '2025-02-12',
    suitableHallTypes: ['2d', 'vip'] 
  },
  { 
    id: 'film003', title: '熊出没·逆转时空', 
    duration: 99, type: '动画/儿童', releaseDate: '2025-02-12',
    suitableHallTypes: ['2d', '3d'] 
  },
  { 
    id: 'film004', title: '射雕英雄传：侠之大者', 
    duration: 138, type: '武侠/动作', releaseDate: '2025-03-01',
    suitableHallTypes: ['2d', 'imax', '4dx'] 
  }
])

// 4. 选中项详情（用于预览展示）
const selectedHall = ref(null)  // 选中的影厅详情
const selectedFilm = ref(null)  // 选中的影片详情

// 5. 计算属性：根据选中影厅过滤可用影片
const filteredFilmList = computed(() => {
  // 未选影厅时，显示全部影片
  if (!selectedHall.value) return filmList.value
  // 已选影厅时，只显示支持该影厅类型的影片
  return filmList.value.filter(film => 
    film.suitableHallTypes.includes(selectedHall.value.type)
  )
})

// 6. 方法：选择影院后加载对应影厅
const handleCinemaChange = (cinemaId) => {
  // 清空之前的影厅选择
  form.value.hallId = ''
  selectedHall.value = null

  // 模拟根据影院ID获取影厅列表（实际调用接口）
  if (cinemaId === 'cinema001') {
    hallList.value = [
      { id: 'hall001', name: '1号厅', type: '2d', totalSeats: 120, screenType: '标准银幕', soundSystem: '杜比全景声' },
      { id: 'hall002', name: '2号厅', type: '3d', totalSeats: 150, screenType: 'RealD 3D银幕', soundSystem: 'DTS:X' },
      { id: 'hall003', name: 'IMAX厅', type: 'imax', totalSeats: 280, screenType: 'IMAX巨幕', soundSystem: 'IMAX 6.1声道' }
    ]
  } else if (cinemaId === 'cinema002') {
    hallList.value = [
      { id: 'hall004', name: 'A厅', type: '2d', totalSeats: 100, screenType: '标准银幕', soundSystem: '杜比全景声' },
      { id: 'hall005', name: 'VIP厅', type: 'vip', totalSeats: 40, screenType: '舒适银幕', soundSystem: 'JBL环绕声' },
      { id: 'hall006', name: '4DX厅', type: '4dx', totalSeats: 80, screenType: '4DX专用银幕', soundSystem: '4DX音效系统' }
    ]
  } else {
    // 其他影院默认影厅
    hallList.value = [
      { id: 'hall007', name: '普通厅', type: '2d', totalSeats: 120, screenType: '标准银幕', soundSystem: '立体声' },
      { id: 'hall008', name: '3D厅', type: '3d', totalSeats: 140, screenType: '3D银幕', soundSystem: '杜比音效' }
    ]
  }
}

// 7. 方法：选择影厅后获取影厅详情
const handleHallChange = (hallId) => {
  // 从影厅列表中匹配选中的影厅详情
  selectedHall.value = hallList.value.find(hall => hall.id === hallId) || null
}

// 8. 方法：选择影片后获取影片详情
const handleFilmChange = (filmId) => {
  // 从影片列表中匹配选中的影片详情
  selectedFilm.value = filmList.value.find(film => film.id === filmId) || null
}

// 9. 步骤控制方法
// 下一步
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    // 若进入步骤2，默认选中第一个影片（可选逻辑）
    if (currentStep.value === 2 && filteredFilmList.value.length > 0) {
      form.value.filmId = filteredFilmList.value[0].id
      handleFilmChange(form.value.filmId)
    }
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 取消排片（重置所有数据） 
const cancel = () => {
  currentStep.value = 1
  form.value = {
    cinemaId: '',
    hallId: '',
    filmId: '',
    showDate: '',
    startTime: '',
    basePrice: 0
  }
  selectedHall.value = null
  selectedFilm.value = null
  ElMessage({ type: 'info', message: '已取消排片操作' })
}
</script>