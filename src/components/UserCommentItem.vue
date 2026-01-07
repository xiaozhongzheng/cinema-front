<template>
  <!-- 头像 + 评论主体（用户信息+内容+操作） -->
  <div class="comment-info">
    <!-- 头像 -->
    <div class="avatar-section">
      <el-avatar
        v-if="commentItem.avatar"
        :src="commentItem.avatar"
        :size="props.avatarSize || 45"
      ></el-avatar>
      <el-avatar v-else :size="50">
        {{ commentItem.username.charAt(0).toUpperCase() }}
      </el-avatar>
    </div>

    <!-- 评论主体（用户信息+内容+操作） -->
    <div class="commentItem-body">
      <!-- 用户信息 -->
      <div class="user-info">
        <div class="usernameText">
          <span>{{ commentItem.username }}</span>
          <span class="replyText" v-if="commentItem.replyId">
            回复
            <span>@{{ getUsernameByCommentId(commentItem.replyId) }}</span>
          </span>
        </div>
        <div class="user-meta">
          <span class="time">{{ commentItem.createTime }}</span>
          <el-rate
            v-if="commentItem.score"
            :model-value="commentItem.score"
            disabled
            text-color="#ff9900"
            size="small"
            class="commentItem-rating"
          />
        </div>
      </div>

      <!-- 评论正文 -->
      <div class="commentItem-content">
        <p>{{ commentItem.content }}</p>
      </div>

      <!-- 评论操作 -->
      <div class="commentItem-actions">
        <div
          class="like-btn"
          :class="{ liked: commentItem.liked }"
          @click="handleLike(commentItem.id)"
        >
          <LikedIcon :size="18" :liked="commentItem.liked" />
          <span class="like-count">{{ commentItem.likes || 0 }}</span>
        </div>
        <div
          class="like-btn"
          :class="{ liked: commentItem.liked }"
          @click="handleUnLike(commentItem.id)"
        >
          <UnLikedIcon :size="18" :unliked="commentItem.unLiked" />
          <span class="like-count">{{ commentItem.unLikes || 0 }}</span>
        </div>
        <span class="reply-btn" @click="toggleReply(commentItem.id)">
          回复
        </span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import LikedIcon from "./icons/LikedIcon.vue";
import UnLikedIcon from "./icons/UnLikedIcon.vue";
import { CommentItemType } from "./UserComment.vue";
import { useUserStore } from "@/stores";

type PropsType = {
  commentItem: CommentItemType;
  commentList: CommentItemType[];
  avatarSize?: number;
};
const props = defineProps<PropsType>();
const emit = defineEmits(["showReplyInput"]);
const userStore = useUserStore();
const activeReplyId = ref<number | null>(null);
const replyContent = ref<string>("");

const getUsernameByCommentId = (commentId: number) => {
  const item = props.commentList.find((item) => item.id === commentId);
  return item?.username || "";
};

// 点赞逻辑
const handleLike = (commentId: number) => {
  const commentItem = props.commentList.find((c) => c.id === commentId);
  if (commentItem) {
    commentItem.liked = !commentItem.liked;
    commentItem.likes += commentItem.liked ? 1 : -1;
  }
};
const handleUnLike = (commentId: number) => {
  const commentItem = props.commentList.find((c) => c.id === commentId);
  if (commentItem) {
    commentItem.unLiked = !commentItem.unLiked;
    commentItem.unLikes += commentItem.unLiked ? 1 : -1;
  }
};
// 切换回复框
const toggleReply = (commentId: number) => {
  emit("showReplyInput", commentId, props.commentList);
};

// 取消回复
const cancelReply = () => {
  activeReplyId.value = null;
  replyContent.value = "";
};
// 提交回复
const submitReply = (commentId: number) => {
  if (!replyContent.value.trim()) return alert("回复内容不能为空");
  const commentItem = props.commentList.find((c) => c.id === commentId);
  if (commentItem) {
    const newReply: CommentItemType = {
      id: Date.now(),
      userId: userStore.userId,
      username: userStore.username,
      content: replyContent.value,
      avatar: userStore.userInfo.avatar,
      createTime: new Date().toLocaleString(),
      likes: 0,
      liked: false,
      unLiked: false,
      unLikes: 0,
      replyId: activeReplyId.value!,
    };
    // commentItem.replies = commentItem.replies || [];
    console.log(newReply, "newReply");
    props.commentList.push(newReply);
    // commentItem.replies.unshift(newReply);
    // if (commentItem.replies.length > 2) commentItem.showAllReplies = false;
    replyContent.value = "";
    activeReplyId.value = null;
  }
  //   emit("handleReply")
};
</script>

<style lang="scss" scoped>
.comment-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  margin-bottom: 16px;
  font-size: 14px;
  // 头像区域（固定宽度）
  .avatar-section {
    flex-shrink: 0;
    ::v-deep .el-avatar {
      font-size: 20px;
    }
  }

  // 评论主体
  .commentItem-body {
    flex: 1;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    gap: 4PX;
    .user-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .usernameText {
        color: #666;
        display: flex;
        gap: 8px;

        .replyText {
          color: #333;

          & > span {
            color: #409eff;
            font-weight: 500;
          }
        }
      }

      .user-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .time {
          color: #999;
          font-size: 13px;
        }

        .commentItem-rating :deep(.el-rate__icon) {
          font-size: 16px;
        }
      }
    }
    .commentItem-content {
      color: #333;
    }

    .commentItem-actions {
      display: flex;
      align-items: center;
      gap: 20px;

      .like-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #999;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover,
        &.liked {
          color: #f56c6c;
        }

        &.liked-animation {
          animation: like-pop 0.3s ease;
        }

        .like-count {
          font-size: 14px;
        }
      }

      .reply-btn {
        color: #409eff;
        cursor: pointer;
        font-size: 14px;

        &:hover {
          color: #79bbff;
        }
      }
    }
  }
}
</style>
