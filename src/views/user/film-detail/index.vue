<template>
  <div id="show">
    <div class="top">
      <header>
        <img :src="film.poster" width="100%" alt="电影海报" />
        <div class="filmItem">
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
              @click="dialogVisible = true"
              :icon="Star"
            >
              评分
            </el-button>
          </div>

          <el-dialog
            title="评分"
            v-model="dialogVisible"
            width="30%"
            style="text-align: center"
            @close="cancel"
          >
            <div
              style="color: rgb(238, 188, 74); height: 30px; font-size: 20px"
            >
              <span v-if="scoreValue" style="text-align: center">
                {{ scoreValue * 2 }} 分
              </span>
            </div>
            <div style="height: 40px">
              <el-rate
                v-model="scoreValue"
                show-text
                @change="showScore"
                :texts="textArr"
                allow-half
                text-color="rgb(238, 188, 74)"
              ></el-rate>
            </div>
            <el-form :model="commentForm">
              <el-form-item label="">
                <el-input
                  type="textarea"
                  :rows="2"
                  placeholder="说说你的看法"
                  v-model="commentForm.content"
                ></el-input>
              </el-form-item>
            </el-form>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="saveComment">提 交</el-button>
              </div>
            </template>
          </el-dialog>
        </div>
      </header>
    </div>

    <div class="main">
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
      <h3>电影评论</h3>
      <template v-if="userList.length">
        <div v-for="user in userList" :key="user.id">
          <UserComment :comment="user" :filmId="filmId" @posted="getFilmAndComment" />
        </div>
      </template>
      <template v-else>
        <el-empty :image-size="200" description="暂无用户评论"></el-empty>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
// 导入API函数（需确保API返回Promise类型）
import { addCommentApi, getCommentByFilmIdApi } from "@/api/comment";
import { getFilmById } from "@/api/film";
import { ShoppingCart, Star } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores";
import UserComment from '@/components/UserComment.vue'

// ========== 类型定义 ==========
// 电影信息类型
interface Film {
  id: string | number;
  poster: string;
  title: string;
  averageScore?: number; // 可选
  director: string;
  actors: string;
  types: string;
  regions: string;
  duration: number;
  releaseDate: string;
  status: number; // 1:未上映 2:热映
  plot: string;
}

// 评论表单类型
interface CommentForm {
  content: string;
  score: number;
  filmId: string | number;
}

// 用户评论类型
interface UserComment {
  id?: string | number;
  username: string;
  avatar?: string;
  content: string;
  score: number;
  createTime: string;
}

const route = useRoute();
const router = useRouter();

// 电影ID（从路由参数获取）
const filmId = computed(() => Number(route.params.filmId));

// 电影信息（初始化为空对象，指定类型）
const film = ref<Film>({
  id: "",
  poster: "",
  title: "",
  director: "",
  actors: "",
  types: "",
  regions: "",
  duration: 0,
  releaseDate: "",
  status: 0,
  plot: "",
});

// 评分相关
const scoreValue = ref<number>(0); // 评分值
const textArr = ref<string[]>(["非常差", "比较差", "一般般", "比较好", "完美"]);
const dialogVisible = ref<boolean>(false); // 评分弹窗显隐

// 评论表单
const commentForm = reactive<CommentForm>({
  content: "",
  score: 0,
  filmId: "",
});

const userStore = useUserStore();

// 用户评论列表
const userList = ref<UserComment[]>([]);

// ========== 方法定义 ==========
// 获取电影和评论数据
const getFilmAndComment = async () => {
  // 获取电影详情
  const filmRes = await getFilmById(filmId.value);
  film.value = filmRes;

  // 获取评论列表
  const commentRes = await getCommentByFilmIdApi(filmId.value);
  userList.value = commentRes;
};

// 保存评论
const saveComment = async () => {
  const userId = userStore.userId;
  // console.log(userId,userStore.userId,userStore.username,userStore.userInfo,'userId')

  if (scoreValue.value === 0) {
    ElMessage.error("请选择评分");
    return;
  }

  await addCommentApi({
    ...commentForm,
    score: scoreValue.value,
    filmId: filmId.value,
    userId,
  });
  ElMessage.success("评价成功");
  cancel(); // 重置弹窗
  getFilmAndComment(); // 重新加载评论
};

// 取消评分（重置状态）
const cancel = () => {
  scoreValue.value = 0;
  commentForm.content = "";
  dialogVisible.value = false;
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
  filmId.value && getFilmAndComment();
});
</script>

<style scoped lang="scss">
#show {
  .top {
    width: 100%;
    height: 280px;
    background: rgb(99, 134, 247);

    header {
      width: 1200px;
      height: 100%;
      margin: auto;
      display: flex;
      padding-top: 30px;
      & > img {
        width: 200px;
        height: 260px;
        object-fit: cover; // 防止图片变形
      }
    }

    .filmItem {
      height: 200px;
      margin-left: 30px;
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

  .main {
    text-align: left;
    width: 1200px;
    margin: 30px auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-size: 18px;

    .breadcrumb {
      font-size: 22px;
    }

    .desc {
      .plot {
        width: 80%;
        margin-top: 10px;
        line-height: 1.5em;
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
