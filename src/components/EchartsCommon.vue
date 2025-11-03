<template>
    <div ref="chartRef" :style="{ width: width, height: height }" class="echart-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, Ref, computed } from 'vue';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption, SeriesOption } from 'echarts';

// 定义图表数据的类型,支持多类型图表
export type SeriesDataType = (number | string | { value: number;[key: string]: any })[] | SeriesDataType[];

// 组件 props 类型定义
interface EChartProps {
    width?: string;
    height?: string;
    seriesData?: SeriesDataType;
    xData?: any[];
    theme?: string | object;
    baseOption?: EChartsOption;
}

// 组件 props：外部可传入的配置
const props = defineProps<EChartProps>();

// 默认配置
const defaultProps: Required<Pick<EChartProps, 'width' | 'height' | 'theme'>> = {
    width: '100%',
    height: '400px',
    theme: 'default',
};
const commonOptions: Partial<EChartsOption> = {
    title: {
        textStyle: {
            fontSize: 30,
            color: "black",
        },
        left: 20,
        top: 20,
    },
    tooltip: {
        trigger: 'axis',
    }, // 鼠标悬停 x轴的某个位置时，同时显示对应的所有系列数据
    grid: {
        top: "20%",
        left: "5%",
        right: "6%",
        bottom: "3%",
        containLabel: true, // 保证坐标轴的标签可以正常在图表中显示，不会因为内容过长而被遮挡
    },
    xAxis: {
        axisTick: {
            show: false, // 隐藏刻度线(x轴上垂直于轴线的小短线)
        },
    },
    yAxis: {
        type: 'value',
        splitLine: {
            show: true, // 显示y周的水平线
        },
        axisLine: {
            show: true, // 显示y轴的轴线
        },
    },
}
const mergeProps = computed(() => ({ ...defaultProps, ...props }))

console.log(mergeProps.value, 'mergeProps.value')
// ECharts 实例
const chartRef: Ref<HTMLDivElement | null> = ref(null);
let echartsInstance: ECharts | null = null;
const {width,height} = mergeProps.value
const mergeOptions = (options: EChartsOption): EChartsOption => {
    // 合并对象属性
    const newOptions = {} as EChartsOption
    Object.keys(commonOptions).forEach((key: string) => {
        const item1 = commonOptions[key] as any
        const item2 = options[key] as any
        newOptions[key] = {...item1,...item2}
    })
    return {
        ...options,
        ...newOptions
    }
}
// 初始化图表
const initChart = (): void => {
    if (!chartRef.value) return;
    const {
        theme,
        baseOption = {},
    } = mergeProps.value
    // 销毁已有实例，避免重复创建
    if (echartsInstance) {
        echartsInstance.dispose();
    }

    // 创建实例
    echartsInstance = echarts.init(chartRef.value, theme);
    console.log(echartsInstance, 'echartsInstance')
    // 设置基础配置（合并默认动画配置）
     const baseConfig: EChartsOption = mergeOptions(baseOption);
    console.log(baseConfig, 'baseConfig')

    echartsInstance.setOption(baseConfig);

    // 监听窗口 resize，自动适配
    window.addEventListener('resize', handleResize);
};

// 更新图表数据
const updateChart = (): void => {
    const {seriesData=[],xData = []} = mergeProps.value
    if (!echartsInstance || seriesData.length === 0) return
    // 处理数据映射（支持自定义映射函数）
    console.log(seriesData, 'seriesData')
    const series: SeriesOption = seriesData.map((item: SeriesDataType) => {
        return {
            data: [...item],
        }
    })
    console.log(series,'series')
    const option: EChartsOption = {
        xAxis: {
            data: xData
        },
        series,
    };

    echartsInstance.setOption(option);
};

// 处理窗口大小变化
const handleResize = (): void => {
    echartsInstance?.resize();
};

// 生命周期：挂载时初始化
onMounted(() => {
    nextTick(initChart);
});

// 生命周期：卸载时销毁
onUnmounted(() => {
    if (echartsInstance) {
        echartsInstance.dispose();
        echartsInstance = null;
    }
    window.removeEventListener('resize', handleResize);
});

// 监听数据变化，触发更新
watch(
    () => mergeProps.value,
    () => {
        updateChart()
    },
    { deep: true }
);

// 暴露给父组件的方法
defineExpose({
    resize: handleResize,
    getInstance: (): ECharts | null => echartsInstance,
    updateChart, // 暴露更新方法
});
</script>

<style scoped>
.echart-container {
    min-width: 100px;
    min-height: 100px;
}
</style>