<template>
  <div class="static-comment">
    <!-- 评论列表 -->
    <div v-if="commentsData.length" class="comment-list">
      <div v-for="comment in commentsData" :key="comment.id" class="comment-item">
        <!-- 根评论 -->
        <UserCommentItem
          :commentItem="comment"
          :getUsernameByCommentId="getUsernameByCommentId"
          @like="handleLike"
          @unlike="handleUnLike"
          @showReplyInput="showReplyText"
        />

        <!-- 回复列表 -->
        <div v-if="comment.replies?.length" class="comment-row-2">
          <div class="replies-container">
            <div class="replies-header" @click="toggleReplies(comment.id)">
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

            <!-- 回复内容 -->
            <div class="replies-content">
              <!-- 折叠状态 -->
              <div v-if="!comment.showAllReplies" class="replies-collapsed">
                <div class="view-more" @click="toggleReplies(comment.id)">
                  展开 {{ comment.replies.length }} 条回复
                </div>
              </div>

              <!-- 展开状态 -->
              <div v-else class="replies-expanded">
                <UserCommentItem
                  v-for="reply in comment.replies"
                  :key="reply.id"
                  :commentItem="reply"
                  :avatarSize="30"
                  :getUsernameByCommentId="getUsernameByCommentId"
                  @like="handleLike"
                  @unlike="handleUnLike"
                  @showReplyInput="showReplyText"
                />
                <div class="view-less" @click="toggleReplies(comment.id)">
                  <el-icon>
                    <ArrowUp />
                  </el-icon>
                  收起回复
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 回复框 -->
        <div
          v-if="activeReplyId === comment.id || isCurComment(comment.id)"
          class="reply-box"
        >
          <div class="reply-input">
            <el-avatar :src="userStore?.userInfo?.avatar" :size="45"> </el-avatar>
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
            <button class="submit-btn" @click="submitReply(comment.id)">回复</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-comment">
      <el-empty description="暂无评论" :image-size="100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import UserCommentItem from "./UserCommentItem.vue";
import { useUserStore } from "@/stores";
import { ElMessage } from "element-plus";

// 评论类型
export type CommentItemType = {
  id: number;
  parentId?: number;
  replyId?: number;
  userId: number;
  username: string;
  avatar?: string;
  content: string;
  score?: number | null;
  createTime: string;
  likes: number;
  liked: boolean;
  unLikes: number;
  unLiked: boolean;
  showAllReplies?: boolean;
  replies?: CommentItemType[];
};

const flatComments = reactive<CommentItemType[] | []>([
  // 主评论
  {
    id: 1,
    parentId: -1,
    userId: 101,
    username: "张三",
    content: "这部电影真的很精彩",
    score: 4.5,
    createTime: "2024-01-15 14:30",
    likes: 24,
    liked: true,
    unLikes: 5,
    unLiked: false,
  },
  {
    id: 2,
    parentId: -1,
    userId: 103,
    username: "王五",
    content: "剧情有点拖沓",
    score: 3,
    createTime: "2024-01-14 09:15",
    likes: 12,
    liked: false,
    unLikes: 3,
    unLiked: true,
  },
  {
    id: 3,
    parentId: -1,
    userId: 104,
    username: "赵六",
    content: "强烈推荐！",
    score: 5,
    createTime: "2024-01-13 20:45",
    likes: 36,
    liked: true,
    unLikes: 0,
    unLiked: false,
  },

  // 回复
  {
    id: 11,
    parentId: 1,
    userId: 102,
    username: "李四11",
    content: "我也这么觉得",
    createTime: "2024-01-15 15:20",
    likes: 5,
    liked: false,
    unLikes: 1,
    unLiked: false,
    score: null,
  },
  {
    id: 111,
    parentId: 1,
    replyId: 11,
    userId: 112,
    username: "李四111",
    content: "我也这么觉得111",
    createTime: "2024-01-15 15:20",
    likes: 5,
    liked: false,
    unLikes: 1,
    unLiked: false,
    score: null,
  },
  {
    id: 41,
    parentId: 2,
    userId: 106,
    username: "孙八",
    content: "是的，原声带真的很不错",
    createTime: "2024-01-12 17:30",
    likes: 2,
    liked: true,
    unLikes: 0,
    unLiked: false,
    score: null,
  },
]);

const activeReplyId = ref<number | null>(null);
const replyContent = ref("");
const replyUsername = ref("");

// 用户信息
const userStore = useUserStore();
const commentsData = ref<CommentItemType[]>([]);
// 构建评论树
const commentMap = computed(() => {
  const map = new Map<number, CommentItemType[]>();
  flatComments.forEach((item) => {
    const parentId = item.parentId ?? -1;
    if (!map.has(parentId)) map.set(parentId, []);
    map.get(parentId)!.push({ ...item, replies: [] });
  });
  return map;
});

const parentComments = computed(() => {
  return flatComments.filter((c) => c.parentId === -1);
});

onMounted(() => {
  buildCommentsTree();
});

// 根评论 + 子评论挂载
const buildCommentsTree = () => {
  const tree = parentComments.value.map((c) => ({
    showAllReplies: false,
    ...c,
    replies: commentMap.value.get(c.id) || [],
  }));
  commentsData.value = tree;
};

// 判断是否当前评论的回复
const isCurComment = (commentId: number) => {
  const list = commentMap.value.get(commentId) || [];
  return list.some((item) => item.id === activeReplyId.value);
};

// 显示回复框
const showReplyText = (commentId: number) => {
  activeReplyId.value = commentId;
  replyUsername.value = getUsernameByCommentId(commentId);
};

// 取消回复
const cancelReply = () => {
  activeReplyId.value = null;
  replyContent.value = "";
};

const getCommentById = (id: number) => {
  console.log(id, commentsData.value, "commentsData.value");
  return commentsData.value.find((item) => item.id === id);
};

const getUsernameByCommentId = (commentId: number) => {
  const item = flatComments.find((item) => item.id === commentId);
  return item?.username || "";
};

// 点赞逻辑
const handleLike = (commentId: number) => {
  const commentItem = flatComments.find((c) => c.id === commentId);
  console.log(commentsData.value, "commentsData.value");
  console.log(commentId, commentItem);

  if (commentItem) {
    commentItem.liked = !commentItem.liked;
    commentItem.likes += commentItem.liked ? 1 : -1;
    buildCommentsTree();
  }
};

const handleUnLike = (commentId: number) => {
  const commentItem = flatComments.find((c) => c.id === commentId);
  if (commentItem) {
    commentItem.unLiked = !commentItem.unLiked;
    commentItem.unLikes += commentItem.unLiked ? 1 : -1;
    buildCommentsTree();
  }
};

// 提交回复
const submitReply = (commentId: number) => {
  if (!replyContent.value.trim()) {
    return ElMessage.warning("回复内容不能为空.");
  }

  const newReply: CommentItemType = {
    id: Date.now(),
    userId: userStore.userId,
    username: userStore.username || "肖xx",
    content: replyContent.value,
    avatar: userStore.userInfo.avatar,
    createTime: new Date().toLocaleString(),
    likes: 0,
    liked: false,
    unLikes: 0,
    unLiked: false,
    replyId: activeReplyId.value!,
  };

  const comment = getCommentById(commentId);
  if (comment) {
    comment.replies.push(newReply);
    flatComments.push({ ...newReply, parentId: commentId });
    replyContent.value = "";
    activeReplyId.value = null;
  }
};

// 展开/折叠回复
const toggleReplies = (commentId: number) => {
  const comment = flatComments.find((c) => c.id === commentId);
  if (comment) {
    comment.showAllReplies = !comment.showAllReplies;
    buildCommentsTree();
  }
};
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

        .reply-input {
          display: flex;
          align-items: center;
          gap: 10px;
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
