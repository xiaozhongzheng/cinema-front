<template>
  <div class="user-comment">
    <div class="main">
      <el-avatar
        v-if="comment.avatar"
        :src="comment.avatar"
        size="50"
      ></el-avatar>
      <el-avatar v-else icon="el-icon-user-solid" size="50"></el-avatar>

      <div class="body">
        <div class="head">
          <span class="username">{{ comment.username }}</span>
          <el-rate
            v-if="typeof comment.score === 'number'"
            :model-value="comment.score"
            disabled
            text-color="#ff9900"
            class="rate"
          ></el-rate>
        </div>

        <div class="content">{{ comment.content || "暂无内容" }}</div>
        <div class="meta">
          <span class="time">{{ comment.createTime }}</span>
          <el-button type="text" class="likeBtn" @click="toggleLike">
            <UserLikeIcon />
            <span class="likes">{{ likesCount }}</span>
          </el-button>
          <el-icon><like-twotone /></el-icon>
          <el-button type="text" @click="toggleReply">回复</el-button>
          <el-button
            v-if="String(userStore.userId) === String(comment.userId)"
            type="text"
            @click="removeComment"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>

        <div v-if="showReply" class="replyBox">
          <el-input
            type="textarea"
            v-model="replyContent"
            :rows="2"
            placeholder="回复内容"
          ></el-input>
          <div class="replyActions">
            <el-button @click="toggleReply">取消</el-button>
            <el-button type="primary" @click="submitReply">回复</el-button>
          </div>
        </div>

        <div v-if="comment.replies && comment.replies.length" class="replies">
          <div
            class="replyItem"
            v-for="reply in comment.replies"
            :key="reply.id"
          >
            <el-avatar
              v-if="reply.avatar"
              :src="reply.avatar"
              size="36"
            ></el-avatar>
            <el-avatar v-else icon="el-icon-user-solid" size="36"></el-avatar>
            <div class="replyContent">
              <div class="replyHead">
                <span class="username">{{ reply.username }}</span>
                <span class="time">{{ reply.createTime }}</span>
              </div>
              <div class="replyText">{{ reply.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { addCommentApi, deleteCommentApi, likeCommentApi } from "@/api/comment";
import { Delete } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores";
import UserLikeIcon from "./UserLikeIcon.vue";

interface CommentItem {
  id?: number | string;
  userId?: number | string;
  username: string;
  avatar?: string;
  content: string;
  score?: number;
  createTime?: string;
  likes?: number;
  liked?: boolean;
  replies?: CommentItem[];
}

const props = defineProps<{
  comment: CommentItem;
  filmId?: number | string;
}>();

const emits = defineEmits(["posted"]);

const showReply = ref(false);
const replyContent = ref("");
const likesCount = ref<number>(props.comment.likes || 0);
const liked = ref<boolean>(!!props.comment.liked);

const userStore = useUserStore();

const toggleReply = () => {
  showReply.value = !showReply.value;
  if (!showReply.value) replyContent.value = "";
};

const submitReply = async () => {
  const content = replyContent.value && replyContent.value.trim();
  if (!content) {
    ElMessage.error("回复内容不能为空");
    return;
  }

  const payload: any = {
    content,
    parentId: props.comment.id,
    // 当前登录用户 id
    userId: userStore.userId,
    // 被回复的用户 id（若后端需要）
    toUserId: props.comment.userId || undefined,
  };

  if (props.filmId) payload.filmId = props.filmId;

  try {
    await addCommentApi(payload);
    ElMessage.success("回复成功");
    replyContent.value = "";
    showReply.value = false;
    emits("posted");
  } catch (err) {
    ElMessage.error("回复失败");
  }
};

const toggleLike = async () => {
  const userId = userStore.userId;
  if (!userId) {
    ElMessage.error("请先登录再点赞");
    return;
  }

  try {
    await likeCommentApi(props.comment.id as any, userId);
    // 简单切换本地状态，后端可返回精确值以覆盖
    if (liked.value) {
      likesCount.value = Math.max(0, likesCount.value - 1);
    } else {
      likesCount.value = likesCount.value + 1;
    }
    liked.value = !liked.value;
  } catch (err) {
    ElMessage.error("点赞失败");
  }
};

const removeComment = async () => {
  // 仅允许评论作者删除
  if (String(userStore.userId) !== String(props.comment.userId)) {
    ElMessage.error("无权删除该评论");
    return;
  }

  try {
    await ElMessageBox.confirm("此操作将删除该评论，是否继续?", "提示", {
      type: "warning",
    });
    await deleteCommentApi(props.comment.id as any);
    ElMessage.success("删除成功");
    emits("posted");
  } catch (err) {
    // 如果用户取消，err 会被抛出，无需额外处理
  }
};
</script>

<style scoped lang="scss">
.user-comment {
  .main {
    display: flex;
    gap: 12px;

    .body {
      flex: 1;
    }

    .head {
      display: flex;
      align-items: center;
      gap: 12px;

      .username {
        font-weight: 600;
        font-size: 16px;
      }
    }

    .content {
      margin: 8px 0;
      color: #333;
    }

    .meta {
      color: #999;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .replyBox {
      margin-top: 8px;
    }

    .replies {
      margin-top: 10px;
      .replyItem {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 8px 0;
        border-top: 1px solid #f3f3f3;

        .replyContent {
          .replyHead {
            display: flex;
            gap: 8px;
            .username {
              font-weight: 600;
            }
            .time {
              color: #999;
              font-size: 12px;
            }
          }
          .replyText {
            margin-top: 6px;
          }
        }
      }
    }
  }
}
</style>
