<template>
  <div class="common-echarts" ref="barRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
  type: 'bar',
  itemArr: () => [],
  echartsOption: () => ({})
})


// 响应式数据
const barRef = ref<HTMLElement>()
const echartsInstance = ref<echarts.ECharts>()
const timer = ref<NodeJS.Timeout>()
const startValue = ref(0)

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
  startInterval()
})

onUnmounted(() => {
  clearInterval(timer.value)
  if (echartsInstance.value) {
    echartsInstance.value.dispose()
  }
})

// 方法
const initEcharts = () => {
  if (!barRef.value) return

  // 初始化图表对象
  echartsInstance.value = echarts.init(barRef.value, 'light')

  const initOption: echarts.EChartsOption = {
    title: {
      ...props.echartsOption.title,
      text: '每月销售额统计'
    },
    grid: props.echartsOption.grid,
    xAxis: props.echartsOption.yAxis,
    yAxis: props.echartsOption.xAxis,
    series: [
      {
        type: 'bar' as const,
        barWidth: 66,
        label: {
          show: true,
          position: 'right',
          color: 'black'
        },
        itemStyle: {
          barBorderRadius: [5, 5, 0, 0]
        }
      }
    ],
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: any) => {
        return `月份：${params.name}<br />金额：${params.data}元`
      },
      axisPointer: {
        type: 'shadow' as const
      }
    }
  }

  echartsInstance.value.setOption(initOption)

  // 事件监听
  echartsInstance.value.on('mouseover', () => {
    clearInterval(timer.value)
  })

  echartsInstance.value.on('mouseout', () => {
    startInterval()
  })

  // 监听窗口 resize，自动适配
  window.addEventListener('resize', () => {
    echartsInstance.value?.resize()
  });
}

const updateCharts = () => {
  if (!echartsInstance.value) return

  const arr = props.itemArr.slice(startValue.value * 4, startValue.value * 4 + 4)
  const xAxisData = arr.map((item) => item.name)
  const yAxisData = arr.map((item) => item.value)

  const option: echarts.EChartsOption = {
    yAxis: {
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

const startInterval = () => {
  if (timer.value) {
    clearInterval(timer.value)
  }

  timer.value = setInterval(() => {
    startValue.value++
    if (startValue.value * 4 >= props.itemArr.length) {
      startValue.value = 0
    }
    updateCharts()
  }, 3000)
}

// 暴露方法给父组件（可选）
defineExpose({
  updateCharts,
  startInterval
})
</script>

<style lang="scss" scoped>
.common-echarts {
  width: 100%;
  height: 100%;

  // 确保图表容器有最小高度
  min-height: 400px;
}
</style>