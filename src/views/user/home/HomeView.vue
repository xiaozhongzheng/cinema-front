<template>
  <div id="userHome">
    <el-carousel indicator-position="outside" :interval="3000" class="carousel" height="500px">
      <el-carousel-item v-for="url in urlArr" :key="url">
        <el-image class="img" :src="url" fit="cover"></el-image>
      </el-carousel-item>
    </el-carousel>

    <div class="mainHome">
      <div class="left">
        <UserHome :film-arr="hotFilmArr" :status="2" />
        <UserHome :film-arr="upcomingArr" :status="1" />
      </div>

      <article>
        <div class="title">热门榜单Top{{ num }}</div>
        <div v-if="topFilmArr.length" class="rankList">
          <div class="top01" @click="toShowFilmDetail(topFilmArr[0].id)">
            <img :src="topFilmArr[0].image" :alt="topFilmArr[0].title">
            <div class="box">
              <span>{{ topFilmArr[0].title }}</span>
              <span class="score">
                {{ (topFilmArr[0].averageScore * 2).toFixed(1) }} 分
              </span>
              <img class="top1-icon" :src="top1Icon" alt="Top 1">
            </div>
          </div>
          <div 
            v-for="(film, i) in topFilmArr.slice(1)" 
            :key="film.id" 
            class="filmTop6" 
            @click="toShowFilmDetail(film.id)"
          >
            <div>
              <span class="rank">{{ i + 2 }}</span>
              <span class="name">{{ film.title }}</span>
            </div>
            <span class="score" v-if="film.averageScore != null">
              {{ (film.averageScore * 2).toFixed(1) }} 分
            </span>
            <span v-else>
              暂无评分
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import film from "@/api/film"
import UserHome from './components/UserHome.vue'

const router = useRouter()

// 响应式数据
const urlArr = ref([
  new URL('@/assets/images/lun01.jpg', import.meta.url).href,
  new URL('@/assets/images/lun02.jpg', import.meta.url).href,
  new URL('@/assets/images/lun03.jpg', import.meta.url).href,
])
const hotFilmArr = ref([])
const upcomingArr = ref([])
const topFilmArr = ref([])
const num = ref(6)
const top1Icon = ref(new URL('@/assets/images/top1.png', import.meta.url).href)

// 方法
const toShowAllFilm = () => {
  router.push({
    name: "movies"
  })
}

const getFilmes = async () => {
  try {
    // 获取正在上映的电影
    hotFilmArr.value = await film.getFilmesByStatus(2)
    // 获取即将上映的影片
    upcomingArr.value = await film.getFilmesByStatus(1)
    // 获取排名前几的影片（根据评分排名）
    topFilmArr.value = await film.getFilmListByScore(num.value)
  } catch (error) {
    console.error('获取电影数据失败:', error)
  }
}

const toShowFilmDetail = (filmId) => {
  router.push({
    name: "showDetail",
    params: {
      filmId,
    }
  })
}

const toBuyFilm = (filmId) => {
  router.push({
    name: "buy",
    query: {
      filmId,
    }
  })
}

// 生命周期
onMounted(() => {
  getFilmes()
})
</script>

<style scoped lang="scss">
#userHome {
  box-sizing: border-box;
  width: 1200px;
  margin: auto;
}

.mainHome {
  display: flex;

  .left {
    width: 65%;
  }

  article {
    flex: 1;
    text-align: left;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 25px;

    .title {
      color: rgb(226, 107, 64);
      font-size: 24px;
      font-weight: 500;
    }

    .rankList {
      display: flex;
      gap: 20px;
      flex-direction: column;

      .score {
        font-size: 18px;
        color: rgb(226, 190, 108);
      }

      .top01 {
        display: flex;
        gap: 20px;
        position: relative;
        border: 1px solid pink;
        padding: 10px;
        border-radius: 8px;

        &>img {
          width: 120px;
          height: 160px;
          object-fit: cover;
          border-radius: 4px;
        }

        .top1-icon {
          position: absolute;
          left: 0;
          top: 0;
          width: 40px;
          height: 40px;
        }

        .box {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          font-size: 18px;
        }

        &:hover {
          background-color: rgb(234, 238, 243);
          cursor: pointer;
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
      }

      .filmTop6 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-radius: 4px;

        .rank {
          color: rgb(207, 207, 207);
          font-size: 22px;
          font-weight: bold;
        }

        .name {
          font-size: 16px;
          margin-left: 10px;
        }

        &:hover {
          background-color: rgb(234, 238, 243);
          cursor: pointer;
          transform: translateX(5px);
          transition: all 0.3s ease;
        }
      }
    }
  }
}

.carousel {
  margin-bottom: 30px;
  
  .img {
    width: 100%;
    height: 100%;
  }
}

// Element Plus 轮播图样式调整
:deep(.el-carousel__item) {
  h3 {
    color: #475669;
    font-size: 18px;
    opacity: 0.75;
    line-height: 300px;
    margin: 0;
  }
  
  &:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  &:nth-child(2n + 1) {
    background-color: #d3dce6;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  #userHome {
    width: 100%;
    padding: 0 20px;
  }
  
  .mainHome {
    flex-direction: column;
    
    .left {
      width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .carousel {
    height: 300px !important;
  }
  
  .mainHome article {
    padding: 10px;
    
    .title {
      font-size: 20px;
    }
    
    .rankList {
      .top01 {
        flex-direction: column;
        text-align: center;
        
        .box {
          gap: 10px;
        }
      }
    }
  }
}
</style>