<template>
  <div
    class="common-echarts"
    ref="pieRef"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// 类型定义
interface PieItem {
  name: string
  value: number
}

interface Props {
  type?: string
  itemArr?: PieItem[]
}

// Props 定义
const props = withDefaults(defineProps<Props>(), {
  type: 'pie',
  itemArr: () => []
})

// 响应式数据
const pieRef = ref<HTMLElement>()
const echartsInstance = ref<echarts.ECharts>()

// 监听数据变化
watch(
  () => props.itemArr,
  () => {
    if (props.itemArr.length > 0) {
      nextTick(() => {
        updateCharts()
      })
    }
  },
  { deep: true }
)

// 生命周期
onMounted(() => {
  initEcharts()
})

// 方法
const initEcharts = () => {
  if (!pieRef.value) return
  
  // 初始化图表对象
  echartsInstance.value = echarts.init(pieRef.value)
  
  const option: echarts.EChartsOption = {
    title: {
      text: '不同类型影片票房占比',
      textStyle: {
        fontSize: 30,
        color: 'black'
      },
      left: 20,
      top: 20
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}: ${params.value} (${params.percent}%)`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      padding: 20
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '60%',
        top: '40',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: (data: any) => {
            return `${data.name} ${data.value}\n(${data.percent.toFixed(1)}%)`
          }
        }
      }
    ]
  }
  
  echartsInstance.value.setOption(option)
  updateCharts()
}

const updateCharts = () => {
  if (!echartsInstance.value) return
  
  const option: echarts.EChartsOption = {
    series: [
      {
        data: props.itemArr
      }
    ]
  }
  
  echartsInstance.value.setOption(option)
}

// 暴露方法给父组件
defineExpose({
  updateCharts
})
</script>

<style lang="scss" scoped>
.common-echarts {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>