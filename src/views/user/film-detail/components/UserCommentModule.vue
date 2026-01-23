<template>
  <div class="static-comment">
    <!-- 评论列表 -->
    <div v-if="commentsData.length" class="comment-list">
      <div
        v-for="comment in commentsData"
        :key="comment.id"
        class="comment-item"
      >
        <!-- 根评论 -->
        <UserCommentItem
          :commentItem="comment"
          :getUsernameByCommentId="getUsernameByCommentId"
          @likeOrUnLike="handleLikeOrUnLike"
          @showReplyInput="showReplyText"
        />

        <!-- 回复列表 -->
        <div v-if="comment.replies?.length" class="comment-row-2">
          <div class="replies-container">
            <div class="replies-header" @click="toggleReplies(comment)">
              <span class="replies-count">
                共 {{ comment.replies.length }} 条回复
                <el-icon
                  class="replies-expand-icon"
                  :class="{ expanded: comment.showAllReplies }"
                >
                  <ArrowDown />
                </el-icon>
              </span>
            </div>

            <div class="replies-content">
              <!-- 折叠 -->
              <div v-if="!comment.showAllReplies" class="view-more">
                展开 {{ comment.replies.length }} 条回复
              </div>

              <!-- 展开 -->
              <div v-else class="replies-expanded">
                <UserCommentItem
                  v-for="reply in comment.replies.slice(0, comment.showCount)"
                  :key="reply.id"
                  :commentItem="reply"
                  :avatarSize="30"
                  :getUsernameByCommentId="getUsernameByCommentId"
                  @likeOrUnLike="handleLikeOrUnLike"
                  @showReplyInput="showReplyText"
                />

                <el-button
                  v-if="comment.showCount < comment.replies.length"
                  type="primary"
                  link
                  @click="comment.showCount! += 3"
                >
                  展开更多回复
                </el-button>

                <div class="view-less" @click="toggleReplies(comment)">
                  <el-icon><ArrowUp /></el-icon>
                  收起回复
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 回复框 -->
        <div v-if="isShowReplyInput(comment)" class="reply-box">
          <div class="reply-input">
            <el-avatar
              v-if="userStore.userInfo?.avatar"
              :src="userStore.userInfo.avatar"
              :size="45"
            />
            <el-avatar v-else :size="45">
              {{ userStore.userInfo?.username?.charAt(0).toUpperCase() }}
            </el-avatar>

            <el-input
              type="textarea"
              v-model="replyContent"
              :placeholder="`回复 @${replyUsername}`"
              :rows="2"
              class="reply-textarea"
            />
          </div>

          <div class="reply-actions">
            <button class="cancel-btn" @click="cancelReply">取消</button>
            <button class="submit-btn" @click="submitReply(comment.id)">
              回复
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-comment">
      <el-empty :image-size="200" description="暂无用户评论" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from "vue";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import UserCommentItem from "./UserCommentItem.vue";
import { useUserStore } from "@/stores";
import { getCommentByFilmIdApi } from "@/api/comment";
import {
  CommentItemType,
  CommentReactionResType,
  CommentWsEnum,
  ReactionEnum,
  ReplyCommentType,
} from "@/api/comment/type";
import { useWebSocket } from "@/utils/useWebSocket";
import { useRoute } from "vue-router";

/* store */
const userStore = useUserStore();

/* 数据源（唯一） */
const flatComments = reactive<CommentItemType[]>([]);

/* 回复状态 */
const activeReplyTargetId = ref<number | null>(null);
const replyContent = ref("");
const replyUsername = ref("");
const route = useRoute();

/* WebSocket */
const handleWsMessage = (msg: any) => {
  const { type, data } = msg;
  console.log("接收到后端的消息：",msg)
  
  if(type === CommentWsEnum.FirstComment) handleFirstComment(data)
  if (type === CommentWsEnum.Reply) handleReplyMsg(data);
  if (type === CommentWsEnum.CommentLike) handleLikeMsg(data);
};

const { initWebSocket, send, close } = useWebSocket(
  "/ws/comment",
  handleWsMessage,
);

onMounted(() => {
  getCommentList();
  initWebSocket();
});

onUnmounted(() => {
  close?.();
});

const filmId = computed(() => Number(route.params.filmId));
console.log(filmId.value,'filmId.value')

const handleFirstComment = (comment: CommentItemType) => {
  console.log(comment,'handleFirstComment data')
  console.log(comment.filmId,filmId.value,'===id')
  if(comment.filmId !== filmId.value) return 
  flatComments.unshift(comment)
  console.log(flatComments,'handleFirstComment flatComments')

}

/* 获取评论 */
const getCommentList = async () => {
  const res = await getCommentByFilmIdApi(filmId.value);
  res.forEach(initCommentUIState);
  flatComments.splice(0, flatComments.length, ...res);
};

/* 初始化 UI 状态 */
const initCommentUIState = (c: CommentItemType) => {
  c.replies = [];
  c.showAllReplies = false;
  c.showCount = 3;
};

/* 评论树（不复制对象）flatComments和commentsData里的对象指向同一地址 */
const commentsData = computed(() => {
  const map = new Map<number, CommentItemType>();
  const roots: CommentItemType[] = [];
  console.log(flatComments,'commentsData flatComments')
  flatComments.forEach((c) => {
    c.replies = [];
    map.set(c.id, c);
  });

  flatComments.forEach((c) => {
    if (c.parentId === -1) {
      roots.push(c);
    } else {
      map.get(c.parentId)?.replies!.push(c);
    }
  });
  // console.log(roots,'roots')
  return roots;
});

const isShowReplyInput = (comment: CommentItemType) => {
  if(activeReplyTargetId.value === null) return false
  if(comment.id === activeReplyTargetId.value) return true
  const ids = comment.replies?.map(item => item.id)
  return ids?.includes(activeReplyTargetId.value)
}
 
const handleReplyMsg = (reply: CommentItemType) => {
  if(reply.filmId !== filmId.value) return 

  if (flatComments.some((c) => c.id === reply.id)) return;

  initCommentUIState(reply);
  flatComments.unshift(reply);

  const parent = flatComments.find((c) => c.id === reply.parentId);
  // 如果是当前用户的评论，则展开评论消息
  if (parent && reply.userId === userStore.userId) parent.showAllReplies = true;
};

/* 点赞 */
const handleLikeMsg = (data: CommentReactionResType) => {
  console.log(data,'handleLikeMsg data')
  const item = flatComments.find((c) => c.id === data.commentId);
  if (!item) return;

  item.likes = data.likes;
  item.unLikes = data.unLikes;

  if (data.userId === userStore.userId) {
    item.liked = data.liked;
    item.unLiked = data.unLiked;
  }
};

/* UI 行为 */
const toggleReplies = (comment: CommentItemType) => {
  comment.showAllReplies = !comment.showAllReplies;
};

const showReplyText = (commentId: number) => {
  activeReplyTargetId.value = commentId;
  replyUsername.value = getUsernameByCommentId(commentId);
};

const cancelReply = () => {
  activeReplyTargetId.value = null;
  replyContent.value = "";
};

const getUsernameByCommentId = (id: number) => {
  return flatComments.find((c) => c.id === id)?.username || "";
};

/* 点赞操作 */
const handleLikeOrUnLike = (
  comment: CommentItemType,
  reactionType: ReactionEnum,
) => {
  send({
    type: CommentWsEnum.CommentLike,
    data: {
      commentId: comment.id,
      reactionType,
      userId: userStore.userId,
    },
  });
};

/* 提交回复 */
const submitReply = (parentId: number) => {
  if (!replyContent.value.trim()) {
    return ElMessage.warning("回复内容不能为空");
  }

  const params: ReplyCommentType = {
    type: CommentWsEnum.Reply,
    data: {
      userId: userStore.userId,
      filmId: filmId.value,
      parentId,
      replyId: activeReplyTargetId.value,
      content: replyContent.value,
    },
  };

  send(params);
  replyContent.value = "";
  activeReplyTargetId.value = null;
};

/* 暴露 */
defineExpose({ getCommentList });
</script>

<style scoped lang="scss">
.static-comment {
  font-size: 14px;
  color: #303133;

  .comment-list {
    .comment-item {
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      /* 二级评论区域 */
      .comment-row-2 {
        margin-top: 12px;

        .replies-container {
          margin-left: 66px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          position: relative;

          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 12px;
            bottom: 12px;
            width: 3px;
            background: #e5eaf3;
            border-radius: 2px;
          }
        }

        .replies-header {
          margin-bottom: 6px;
          cursor: pointer;

          .replies-count {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            color: #409eff;

            .replies-expand-icon {
              font-size: 12px;
              transition: transform 0.25s;

              &.expanded {
                transform: rotate(180deg);
              }
            }
          }
        }

        .replies-content {
          .replies-expanded {
            margin-top: 8px;
          }

          .view-more,
          .view-less {
            margin-top: 8px;
            padding: 6px 0;
            text-align: center;
            font-size: 13px;
            color: #409eff;
            cursor: pointer;
            border-radius: 4px;

            &:hover {
              background: rgba(64, 158, 255, 0.08);
            }
          }

          .view-less {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
        }
      }

      /* 回复输入框 */
      .reply-box {
        margin-left: 66px;
        margin-top: 10px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
        font-size: 24px;
        .reply-input {
          display: flex;
          align-items: center;
          gap: 10px;
          ::v-deep .el-avatar {
            font-size: 24px;
          }
          .reply-textarea {
            font-size: 14px;
            flex: 1;
          }
        }

        .reply-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;

          .cancel-btn,
          .submit-btn {
            padding: 5px 14px;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            border: none;
          }

          .cancel-btn {
            background: #e4e7ed;
            color: #606266;
          }

          .submit-btn {
            background: #409eff;
            color: #fff;
          }
        }
      }
    }
  }

  .empty-comment {
    padding: 40px 0;
  }
}
</style>
