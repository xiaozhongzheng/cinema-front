<template>
    <div class="dashboard">
        <EChartCommon width="600px" height="500px" :seriesData="chartData" :xData="xData" :baseOption="baseOption"
            theme="light" />
    </div>
</template>

<script setup lang="ts">
import EChartCommon from '@/components/EchartsCommon.vue';
import { ref } from 'vue';
// 基础配置（坐标轴、图例等固定配置）
const baseOption = {
    title: {
        text: '示例图表12',
    },
    xAxis: {
        type: 'category',
    },
    series: [
        {
            name: 'Access From',
            type: 'pie',
            radius: '50%',
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};

// 动态数据（从接口获取或本地生成）
const chartData = ref([]);
const xData = ref([])
setTimeout(() => {
    chartData.value = [
        [
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
            { value: 484, name: 'Union Ads' },
            { value: 300, name: 'Video Ads' }
        ]
    ]

}, 500)

</script>