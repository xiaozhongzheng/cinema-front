<template>
  <div id="home">
    <Demo />
    <!-- <Demo1 /> -->
    <div class="echarts">
      <!-- 展示每部影片的票房 -->
      <HomeBarTicket v-if="filmList.length" :itemArr="handlefilmList" :echartsOption="echartsOption"></HomeBarTicket>
      <!-- 展示每个月的销量 -->
      <HomeLine v-if="monthTicketList.length" :echartsOption="echartsOption" :itemArr="handleMonthTicketList">
      </HomeLine>
      <!-- 展示不同类型的影片的票房数  -->
      <HomePie v-if="boxOfficeList.length" :itemArr="handleBoxOfficeList"></HomePie>
      <HomeBarAmount v-if="amountList.length" :itemArr="handleMonthAmountList" :echartsOption="echartsOption">
      </HomeBarAmount>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getFilmBoxOfficeApi, getMonthTicketApi, getMonthAmountApi } from "@/api/orders";
import { getBoxOfficeByTypeApi } from "@/api/film";
import HomeBarTicket from "./components/HomeBarTicket.vue";
import HomePie from "./components/HomePie.vue";
import HomeLine from "./components/HomeLine.vue";
import HomeBarAmount from "./components/HomeBarAmount.vue";
import { filmTypeList } from "@/utils/constant";
import Demo from "./components/Demo.vue";
import Demo1 from "./components/Demo1.vue";
// 响应式数据
const filmList = ref([]);
const monthTicketList = ref([]);
const boxOfficeList = ref([]);
const amountList = ref([]);

// 图表配置
const echartsOption = ref({
  title: {
    textStyle: {
      fontSize: 30,
      color: "black",
    },
    left: 20,
    top: 20,
  },
  grid: {
    top: "20%",
    left: "5%",
    right: "6%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: true,
      interval: 0,
    },
  },
  yAxis: {
    type: "value",
    splitLine: {
      show: true,
    },
    axisLine: {
      show: true,
    },
  },
});

// 计算属性
const handlefilmList = computed(() => {
  return filmList.value.map((item) => {
    return {
      name: item.name,
      value: item.boxOffice * 100,
    };
  });
});

const handleMonthTicketList = computed(() => {
  return monthTicketList.value.map((item) => {
    return {
      name: +item.month.split("-")[1] + "月",
      value: item.ticketCount * 100,
    };
  });
});

const handleBoxOfficeList = computed(() => {
  return boxOfficeList.value.map((item) => {
    return {
      name: filmTypeList[item.type],
      value: item.totalBoxOffice * 100,
    };
  });
});

const handleMonthAmountList = computed(() => {
  return amountList.value.map((item) => {
    return {
      name: +item.month.split("-")[1] + "月",
      value: item.totalAmount,
    };
  });
});

// 方法
const getFilmBoxOffice = async () => {
  filmList.value = await getFilmBoxOfficeApi();
  filmList.value.sort((a, b) => b.boxOffice - a.boxOffice);
};

const getMonthTicket = async () => {
  monthTicketList.value = await getMonthTicketApi();
};

const getBoxOfficeByType = async () => {
  boxOfficeList.value = await getBoxOfficeByTypeApi();
};

const getMonthAmount = async () => {
  amountList.value = await getMonthAmountApi();
};

// 生命周期
onMounted(() => {
  getFilmBoxOffice();
  getMonthTicket();
  getBoxOfficeByType();
  getMonthAmount();
});
</script>

<style scoped lang="scss">
#home {
  padding: 10px;

  .echarts {
    display: grid;
    grid-template-columns: repeat(2, 550px);
    grid-template-rows: repeat(2, 550px);
    place-items: center;
    gap: 40px;
    padding: 30px 0;
  }
}
</style>
