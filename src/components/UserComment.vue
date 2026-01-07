<template>
  <div class="static-comment">
    <!-- 评论列表 -->
    <div class="comment-list">
      <div
        class="comment-item"
        v-for="comment in comments"
        :key="comment.id"
        :data-comment-id="comment.id"
      >
        <UserCommentItem
          :commentList="comments"
          :commentItem="comment"
          @showReplyInput="showReplyText"
        />
        <!-- 第二行：回复列表（单独一行，宽度100%） -->
        <div
          v-if="comment.replies && comment.replies.length"
          class="comment-row-2"
        >
          <div class="replies-container">
            <!-- 回复数量标题 -->
            <div class="replies-header" @click="toggleReplies(comment.id)">
              <span class="replies-count">
                共 {{ comment.replies.length }} 条回复
                <el-icon
                  :class="{
                    'replies-expand-icon': true,
                    expanded: comment.showAllReplies,
                  }"
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
                <div v-for="reply in comment.replies" :key="reply.id">
                  <UserCommentItem
                    :commentItem="reply"
                    :commentList="comment.replies"
                    :avatarSize="30"
                    @showReplyInput="showReplyText"
                  />
                </div>
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
        <div v-if="activeReplyId === comment.id" class="reply-box">
          <el-input
            type="textarea"
            v-model="replyContent"
            :placeholder="`回复 @${replyUsername}`"
            :rows="2"
            class="reply-textarea"
          ></el-input>
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
    <div v-if="comments.length === 0" class="empty-comment">
      <el-empty description="暂无评论" :image-size="100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import UserCommentItem from "./UserCommentItem.vue";
import { useUserStore } from "@/stores";
import { ElMessage } from "element-plus";

// 评论类型定义
export interface CommentItemType {
  id: number;
  userId: number;
  username: string;
  avatar?: string;
  content: string;
  score?: number;
  createTime: string;
  likes: number;
  liked: boolean;
  unLikes: number;
  unLiked: boolean;
  replies?: CommentItemType[];
  showAllReplies?: boolean;
  replyId?: number;
}
const replyContent = ref<string>("");
const activeReplyId = ref<number | null>(null);

// 静态数据
const staticComments: CommentItemType[] = [
  {
    id: 1,
    userId: 101,
    username: "张三",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    content: "这部电影真的很精彩，特效做得非常棒！",
    score: 4.5,
    createTime: "2024-01-15 14:30",
    likes: 24,
    liked: true,
    unLikes: 5, // 新增：取消点赞数
    unLiked: false, // 新增：当前用户是否取消点赞
    replies: [
      {
        id: 11,
        userId: 102,
        username: "李四",
        avatar:
          "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        content: "我也这么觉得，特别是最后那场戏！",
        createTime: "2024-01-15 15:20",
        likes: 5,
        liked: false,
        unLikes: 1,
        unLiked: false,
      },
      {
        replyId: 11,
        id: 110,
        userId: 112,
        username: "李四1",
        avatar:
          "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        content: "我也这么觉得，特别是最后那场戏！111",
        createTime: "2024-01-15 15:20",
        likes: 5,
        liked: false,
        unLikes: 1,
        unLiked: false,
      },
    ],
    showAllReplies: false,
  },
  {
    id: 2,
    userId: 103,
    username: "王五",
    content: "剧情有点拖沓，但演员演技在线",
    score: 3,
    createTime: "2024-01-14 09:15",
    likes: 12,
    liked: false,
    unLikes: 3,
    unLiked: true,
    replies: [],
    showAllReplies: false,
  },
  {
    id: 3,
    userId: 104,
    username: "赵六",
    avatar:
      "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png",
    content: "强烈推荐！值得一看的好电影",
    score: 5,
    createTime: "2024-01-13 20:45",
    likes: 36,
    liked: true,
    unLikes: 0,
    unLiked: false,
    replies: [],
    showAllReplies: false,
  },
  {
    id: 4,
    userId: 105,
    username: "钱七",
    content: "画面很美，配乐也很好听",
    createTime: "2024-01-12 16:10",
    likes: 8,
    liked: false,
    unLikes: 2,
    unLiked: true,
    showAllReplies: false,
    replies: [
      {
        id: 41,
        userId: 106,
        username: "孙八",
        content: "是的，原声带真的很不错",
        createTime: "2024-01-12 17:30",
        likes: 2,
        liked: true,
        unLikes: 0,
        unLiked: false,
      },
      {
        id: 42,
        userId: 107,
        username: "周九",
        avatar:
          "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        content: "尤其是主题曲，很有感染力",
        createTime: "2024-01-12 18:45",
        likes: 3,
        liked: false,
        unLikes: 1,
        unLiked: true,
      },
      {
        id: 43,
        userId: 108,
        username: "吴十",
        content: "看了三遍了，每次都有新感受",
        createTime: "2024-01-12 19:30",
        likes: 1,
        liked: true,
        unLikes: 0,
        unLiked: false,
      },
      {
        id: 44,
        userId: 109,
        username: "郑十一",
        content: "配乐确实是亮点",
        createTime: "2024-01-12 20:15",
        likes: 0,
        liked: false,
        unLikes: 0,
        unLiked: false,
      },
    ],
  },
];

// 响应式数据
const comments = ref<CommentItemType[]>([]);

// 初始化数据
onMounted(() => {
  comments.value = staticComments.map((comment) => ({
    ...comment,
    showAllReplies: false,
  }));
});
const userStore = useUserStore();
const replyUsername = ref('')
const showReplyText = (commentId: number,commentList: CommentItemType[]) => {
  activeReplyId.value = activeReplyId.value === commentId ? null : commentId;
  if (activeReplyId.value !== commentId) replyContent.value = "";
  replyUsername.value = commentList.find(item => item.id === activeReplyId.value)?.username || ''
};
// 取消回复
const cancelReply = () => {
  activeReplyId.value = null;
  replyContent.value = "";
};
// 提交回复
const submitReply = (commentId: number) => {
  if (!replyContent.value.trim()) {
    return ElMessage({
      message: "回复内容不能为空.",
      type: "warning",
    });
  }

  const commentItem = comments.value.find((c) => c.id === commentId);
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
    console.log(newReply, "newReply");
    comments.value.push(newReply);
    replyContent.value = "";
    activeReplyId.value = null;
  }
};

// 切换回复折叠/展开
const toggleReplies = (commentId: number) => {
  const comment = comments.value.find((c) => c.id === commentId);
  if (comment?.replies?.length) {
    comment.showAllReplies = !comment.showAllReplies;
  }
};
</script>

<style scoped lang="scss">
.static-comment {
  .comment-list {
    .comment-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      // ========== 第二行：回复列表 ==========
      .comment-row-2 {
        width: 100%;

        .replies-container {
          padding-left: 66px; // 与头像对齐（50px+16px gap）

          .replies-header {
            margin-bottom: 8px;
            cursor: pointer;

            .replies-count {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              color: #409eff;
              font-size: 14px;
              font-weight: 500;

              &:hover {
                color: #79bbff;
              }

              .replies-expand-icon {
                transition: transform 0.3s ease;
                font-size: 12px;

                &.expanded {
                  transform: rotate(180deg);
                }
              }
            }
          }

          .replies-content {
            .replies-collapsed {
              .view-more {
                padding: 8px 12px;
                background: #f8f9fa;
                border-radius: 4px;
                color: #409eff;
                font-size: 14px;
                cursor: pointer;
                text-align: center;
                transition: all 0.3s ease;

                &:hover {
                  background: #e8f3ff;
                  color: #79bbff;
                }
              }
            }

            .replies-expanded {
              .view-less {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                margin-top: 12px;
                padding: 8px;
                color: #409eff;
                font-size: 14px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.3s ease;

                &:hover {
                  background: #f8f9fa;
                  color: #79bbff;
                }

                .el-icon {
                  font-size: 12px;
                }
              }
            }
          }
        }
      }

      .reply-box {
        margin-left: 66px;
        margin-top: 12px;

        .reply-textarea {
          font-size: 14px;
        }

        .reply-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
          .cancel-btn,
          .submit-btn {
            padding: 6px 16px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            border: none;
          }

          .cancel-btn {
            background: #f0f0f0;
            color: #666;

            &:hover {
              background: #e0e0e0;
            }
          }

          .submit-btn {
            background: #409eff;
            color: #fff;

            &:hover {
              background: #79bbff;
            }
          }
        }
      }
    }
  }

  .empty-comment {
    text-align: center;
    padding: 40px 0;
  }
}
</style>
