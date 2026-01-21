<template>
  <div class="filmDetailModule">
    <div class="topBox">
      <div class="headerBox">
        <img :src="film.poster" alt="电影海报" />
        <div class="filmInfoBox">
          <div class="title">
            <span class="name">{{ film.title }}</span>
            <div class="averageScore">
              <template v-if="film.averageScore">
                <el-rate
                  v-model="film.averageScore"
                  disabled
                  text-color="#ff9900"
                  score-template="{value}"
                ></el-rate>
                <span class="score">{{ film.averageScore * 2 }}</span>
              </template>
              <template v-else>
                <span class="emptyText">暂无评分</span>
              </template>
            </div>
          </div>
          <div>导演：{{ film.director }}</div>
          <div>主演：{{ film.actors }}</div>
          <div>电影类型：{{ film.types.split(",").join("，") }}</div>
          <div>上映地区：{{ film.regions.split(",").join("，") }}</div>
          <div>时长：{{ film.duration }} 分钟</div>
          <div>上映日期：{{ film.releaseDate }} 上映</div>
          <div class="btnBox">
            <el-button
              type="danger"
              class="btn"
              :icon="ShoppingCart"
              @click="toBuyFilm"
            >
              特惠购票
            </el-button>
            <!-- 正在热映的电影才可以评论 -->
            <el-button
              type="danger"
              class="btn"
              v-if="film.status === 2"
              @click="toRate"
              :icon="Star"
            >
              评分
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="mainBox">
      <el-breadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/user/home' }"
          >首页</el-breadcrumb-item
        >
        <el-breadcrumb-item>电影详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="desc">
        <h3>剧情简介</h3>
        <p class="plot">{{ film.plot }}</p>
      </div>
      <div>
        <h3>电影评论</h3>

        <UserCommentModule v-if="isLogin" ref="commentRef" :filmId="filmId" />
        <el-empty
          v-else
          :image-size="200"
          description="登录后查看用户评论"
        ></el-empty>
      </div>
    </div>

    <AddCommentDialog
      v-if="dialogVisible"
      v-model:dialogVisible="dialogVisible"
      :commentValue="commentForm"
      @submit="saveComment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
// 导入API函数（需确保API返回Promise类型）
import {
  addCommentApi,
  getCommentByFilmAndUserIdApi,
  getCommentByFilmIdApi,
} from "@/api/comment";
import { getFilmById } from "@/api/film";
import { ShoppingCart, Star } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores";
import AddCommentDialog from "./components/AddCommentDialog.vue";
import { CommentFormType } from "@/api/comment/type";
import { FilmType } from "@/api/film/type";
import UserCommentModule from "./components/UserCommentModule.vue";

const route = useRoute();
const router = useRouter();

// 电影ID（从路由参数获取）
const filmId = computed(() => Number(route.params.filmId));

// 电影信息（初始化为空对象，指定类型）
const film = ref<FilmType>({
  id: 0,
  poster: "",
  title: "",
  director: "",
  actors: "",
  types: "",
  regions: "",
  duration: 0,
  releaseDate: "",
  status: 1,
  plot: "",
  averageScore: 0,
});

const dialogVisible = ref<boolean>(false); // 评分弹窗显隐

// 评论表单
const commentForm = ref<CommentFormType | null>(null);

const userStore = useUserStore();

const commentRef = ref<any>();

const isLogin = computed(() => {
  return !!userStore?.token;
});

// ========== 方法定义 ==========
// 获取电影和评论数据
const getNewFilmInfo = async () => {
  // 获取电影详情
  const filmRes = await getFilmById(filmId.value);
  film.value = filmRes;

  // // 获取评论列表
  // const commentRes = await getCommentByFilmIdApi(filmId.value);
  // userList.value = commentRes;
};

const toRate = async () => {
  if (!isLogin.value) {
    return ElMessage.warning("只有登录后的用户才可以评分噢~");
  }
  const data = await getCommentByFilmAndUserIdApi({
    filmId: filmId.value,
    userId: userStore.userId,
  });
  commentForm.value = data;
  dialogVisible.value = true;
};

// 保存评论
const saveComment = async (values: any) => {
  const userId = userStore.userId;
  await addCommentApi({
    ...values,
    filmId: filmId.value,
    userId,
  });
  dialogVisible.value = false;
  ElMessage.success("评价成功");
  getNewFilmInfo(); // 重新加载评论
  commentRef.value?.getCommentList();
};

// 跳转到购票页面
const toBuyFilm = () => {
  router.push({
    name: "buy",
    params: {
      filmId: filmId.value,
    },
  });
};

// 评分变化回调（原show方法，避免关键字冲突）
const showScore = (val: number) => {
  console.log("当前评分：", val);
  // 可添加评分变化后的逻辑
};

// ========== 生命周期 ==========
// 组件挂载时加载数据（替代created）
onMounted(() => {
  filmId.value && getNewFilmInfo();
});
</script>

<style scoped lang="scss">
$width: 900px;
.filmDetailModule {
  padding: 0 30px;
  .topBox {
    height: 280px;
    background: rgb(99, 134, 247);
    padding: 0 20px;
    & > .headerBox {
      width: $width;
      height: 100%;
      margin: auto;
      display: flex;
      padding-top: 30px;

      & > img {
        width: 180px;
        height: 260px;
        object-fit: cover; // 防止图片变形
        margin: 0 16px 0 0;
      }
      .filmInfoBox {
        height: 200px;
        text-align: left;
        color: white;
        display: flex;
        flex-direction: column;
        gap: 3px;

        .title {
          display: flex;
          height: 40px;
          align-items: center;
          gap: 20px;

          .name {
            font-size: 24px;
            font-weight: 600;
          }

          .averageScore {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 20px;

            :deep(.el-rate__icon) {
              // 样式穿透
              font-size: 26px;
            }

            .score {
              color: rgb(238, 188, 74);
            }
          }

          .emptyText {
            margin-left: 40px;
            color: rgb(201, 199, 199);
            font-weight: 400;
            font-size: 20px;
          }
        }

        .btnBox {
          display: flex;
          margin-top: 10px;
        }
      }
    }
  }

  .mainBox {
    text-align: left;
    width: $width;
    margin: 30px auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-size: 16px;
    .breadcrumb {
      font-size: 20px;
    }

    .desc {
      .plot {
        margin-top: 10px;
        line-height: 1.5;
        font-size: 16px;
      }
    }

    .userContent {
      color: rgb(199, 199, 199);
      display: flex;
      justify-content: space-between;

      .left {
        flex: 1;
        .avater {
          float: left;
          width: 60px;
          height: 60px;
          margin-right: 10px;
        }

        .username {
          font-size: 24px;
        }
      }
    }
  }
}
</style>
