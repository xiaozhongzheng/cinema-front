<template>
  <div id="filmHome">
    <div class="head">
      <span class="title">
        {{ status === 2 ? '正在热映' : '即将上映' }}
        ({{ filmArr.length }})
      </span>
      <el-link type="primary" style="float: right;" @click="toShowAllFilm()">
        全部
        <i class="el-icon-arrow-right"></i>
      </el-link>
    </div>

    <div class="box">
      <template v-for="item in handleFilmArr" :key="item.id">
        <FilmItem :item="item" />
      </template>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import FilmItem from '@/views/user/components/FilmItem.vue';

// 定义 props
const props = defineProps<{
  filmArr: any[];  // 实际项目中建议定义具体的电影数据类型接口
  status: number;
}>();

// 计算属性 - 只显示前8条数据
const handleFilmArr = computed(() => {
  return props.filmArr.slice(0, 8);
});

// 路由跳转
const router = useRouter();
const toShowAllFilm = () => {
  router.push({
    name: "movies",
  });
};
</script>


<style scoped lang="scss">
#filmHome {
  margin-top: 20px;

  .head {
    text-align: left;
    height: 30px;
    line-height: 30px;
    margin-bottom: 20px;

    .title {
      color: rgb(231, 209, 121);
      font-size: 24px
    }
  }

  .box {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

.lightgreen-box {
  background-color: lightgreen;
  height: 24px;
}

.orange-box {
  background-color: orange;
  height: 24px;
}
</style>
    