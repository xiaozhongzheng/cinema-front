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
      <el-avatar v-else :size="props.avatarSize || 45">
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
            <span>@{{ props.getUsernameByCommentId(commentItem.replyId) }}</span>
          </span>
        </div>
        <div class="user-meta">
          <span class="time">{{ commentItem.createdTime }}</span>
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
        <span class="reply-btn" @click="toggleReply(commentItem.id)"> 回复 </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import LikedIcon from "@/components/icons/LikedIcon.vue";
import UnLikedIcon from "@/components/icons/UnLikedIcon.vue";
import { CommentItemType, ReactionEnum } from "@/api/comment/type";

type PropsType = {
  commentItem: CommentItemType;
  avatarSize?: number;
  getUsernameByCommentId: (commentId: number) => string;
};
const props = defineProps<PropsType>();
const emit = defineEmits(["showReplyInput", "likeOrUnLike"]);

const handleLike = (commentId: number) => {
  emit("likeOrUnLike", commentId,ReactionEnum.Like);
};

const handleUnLike = (commentId: number) => {
  emit("likeOrUnLike", commentId,ReactionEnum.UnLike);
};

// 切换回复框
const toggleReply = (commentId: number) => {
  emit("showReplyInput", commentId);
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
    gap: 4px;

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
