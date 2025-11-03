<template>
  <div
    class="common-echarts"
    ref="lineRef"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// 类型定义
interface ChartItem {
  name: string
  value: number
}

interface EchartsOption {
  title?: any
  grid?: any
  xAxis?: any
  yAxis?: any
  [key: string]: any
}

interface Props {
  type?: string
  itemArr?: ChartItem[]
  echartsOption?: EchartsOption
}

// Props 定义
const props = withDefaults(defineProps<Props>(), {
  type: 'pie',
  itemArr: () => [],
  echartsOption: () => ({})
})

// 响应式数据
const lineRef = ref<HTMLElement>()
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
  if (!lineRef.value) return
  
  // 初始化图表对象
  echartsInstance.value = echarts.init(lineRef.value)
  
  const option: echarts.EChartsOption = {
    title: {
      ...props.echartsOption.title,
      text: '每月售票量统计'
    },
    grid: props.echartsOption.grid,
    xAxis: props.echartsOption.xAxis,
    yAxis: props.echartsOption.yAxis,
    series: [
      {
        type: 'line',
        label: {
          show: true,
          position: 'top',
          color: 'black'
        }
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `月份：${params.name}<br />售票量：${params.data}`
      }
    }
  }
  
  echartsInstance.value.setOption(option)
  updateCharts()
}

const updateCharts = () => {
  if (!echartsInstance.value) return
  
  const xAxisData = props.itemArr.map((item) => item.name)
  const yAxisData = props.itemArr.map((item) => item.value)
  
  const option: echarts.EChartsOption = {
    xAxis: {
      data: xAxisData
    },
    series: [
      {
        data: yAxisData
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
  min-height: 400px;
}
</style>