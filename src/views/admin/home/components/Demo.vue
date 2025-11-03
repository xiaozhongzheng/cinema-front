<template>
    <div class="dashboard">
        <EChartCommon width="100%" height="500px" :seriesData="chartData" :xData="xData" :baseOption="baseOption"
            theme="light" />
    </div>
</template>

<script setup lang="ts">
import { getFilmBoxOfficeApi } from '@/api/orders';
import EChartCommon from '@/components/EchartsCommon.vue';
import { ref, computed, onMounted, reactive } from 'vue';

// 动态数据（从接口获取或本地生成）
const chartData = ref([]);
const xData = ref([])
// 基础配置（坐标轴、图例等固定配置）
const baseOption = {
    title: {
        text: '票房统计',
    },
    xAxis: {
        type: 'category',
        axisLabel: {
            interval: 0,
            overflow: 'break'
        }
    },
    series: [
        {
            type: 'bar',
            // barWidth: 50,
            label: {
                show: true,
                position: 'top',
                color: 'black'
            },
        },

    ],
    dataZoom: [
        {
            type: 'inside', // 内置型（无滑块，通过鼠标操作）
            xAxisIndex: 0, // 作用于第 0 个 x 轴（若有多个 x 轴）
            start: 0, // 初始可视范围起点（0-100，单位%）
            end: 100, // 初始可视范围终点（0-100，即显示前 30% 数据）
            zoomLock: true // 是否锁定缩放比例（false 允许缩放，true 只允许平移）
        }
    ]
};


// 方法
const getFilmBoxOffice = async () => {
    const list = await getFilmBoxOfficeApi();
    const filmList = list.sort((a, b) => b.boxOffice - a.boxOffice)
    console.log(filmList, 'filmList.value')
    chartData.value = [filmList.map((item) => item.boxOffice)]
    xData.value = filmList.map((item) => item.name)
};

onMounted(() => {
    getFilmBoxOffice()
})


// setTimeout(() => {
//     chartData.value = [...newfilmList.map((item) => item.value)]
//     xData.value = newfilmList.map((item) => item.name)
//     console.log(chartData.value, '**')

// }, 500)

</script>