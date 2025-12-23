<template>
    <!-- 第一行：头像 + 评论主体（用户信息+内容+操作） -->
    <div class="comment-row-1">
        <!-- 头像 -->
        <div class="avatar-section">
            <el-avatar v-if="comment.avatar" :src="comment.avatar" :size="50"></el-avatar>
            <el-avatar v-else :size="50">
                {{ comment.username.charAt(0).toUpperCase() }}
            </el-avatar>
        </div>

        <!-- 评论主体（用户信息+内容+操作） -->
        <div class="comment-body">
            <!-- 用户信息 -->
            <div class="user-info">
                <span class="username">{{ comment.username }}</span>
                <div class="user-meta">
                    <span class="time">{{ comment.createTime }}</span>
                    <el-rate v-if="comment.score" :model-value="comment.score" disabled text-color="#ff9900"
                        size="small" class="comment-rating" />
                </div>
            </div>

            <!-- 评论正文 -->
            <div class="comment-content">
                <p>{{ comment.content }}</p>
            </div>

            <!-- 评论操作 -->
            <div class="comment-actions">
                <span class="like-btn" :class="{ liked: comment.liked }" @click="handleLike(comment.id)">
                    <LikedIcon :size="18" :liked="comment.liked" />
                    <span class="like-count">{{ comment.likes || 0 }}</span>
                </span>
                <span class="reply-btn" @click="toggleReply(comment.id)">
                    回复
                </span>
            </div>

            <!-- 回复框 -->
            <div v-if="activeReplyId === comment.id" class="reply-box">
                <textarea v-model="replyContent" placeholder="写下你的回复..." rows="2" class="reply-textarea"></textarea>
                <div class="reply-actions">
                    <button class="cancel-btn" @click="cancelReply">取消</button>
                    <button class="submit-btn" @click="submitReply(comment.id)">
                        回复
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import LikedIcon from "./LikedIcon.vue"
// 评论类型定义
interface CommentItem {
    id: number
    userId: number
    username: string
    avatar?: string
    content: string
    score?: number
    createTime: string
    likes: number
    liked: boolean
    replies?: CommentItem[]
    showAllReplies?: boolean
}
type PropsType = {
    comment: CommentItem;
    comments: CommentItem[];
    
}
const props = defineProps<PropsType>()
const activeReplyId = ref<number | null>(null)
const replyContent = ref<string>('')

// 点赞逻辑
const handleLike = (commentId: number) => {
    const comment = props.comments.find(c => c.id === commentId)
    if (comment) {
        comment.liked = !comment.liked
        comment.likes += comment.liked ? 1 : -1
        // 点赞动画
        const likeBtn = document.querySelector(`.comment-item[data-comment-id="${commentId}"] .like-btn`)
        likeBtn?.classList.add('liked-animation')
        setTimeout(() => likeBtn?.classList.remove('liked-animation'), 300)
    }
}
// 切换回复框
const toggleReply = (commentId: number) => {
    activeReplyId.value = activeReplyId.value === commentId ? null : commentId
    if (activeReplyId.value !== commentId) replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
    activeReplyId.value = null
    replyContent.value = ''
}
// 提交回复
const submitReply = (commentId: number) => {
    if (!replyContent.value.trim()) return alert('回复内容不能为空')
    const comment = props.comments.find(c => c.id === commentId)
    if (comment) {
        const newReply: CommentItem = {
            id: Date.now(),
            userId: 999,
            username: '我',
            content: replyContent.value,
            createTime: new Date().toLocaleString(),
            likes: 0,
            liked: false
        }
        comment.replies = comment.replies || []
        comment.replies.unshift(newReply)
        if (comment.replies.length > 2) comment.showAllReplies = false
        replyContent.value = ''
        activeReplyId.value = null
    }
}
</script>

<style lang="scss" scoped>
// ========== 第一行：头像+评论信息 ==========
.comment-row-1 {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    width: 100%;
    margin-bottom: 16px;
    font-size: 14px;
    // 头像区域（固定宽度）
    .avatar-section {
        flex-shrink: 0;
    }

    // 评论主体
    .comment-body {
        flex: 1;
        min-width: 0;

        .user-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .username {
                color: #FB7299;
            }

            .user-meta {
                display: flex;
                align-items: center;
                gap: 12px;

                .time {
                    color: #999;
                    font-size: 13px;
                }

                .comment-rating :deep(.el-rate__icon) {
                    font-size: 16px;
                }
            }
        }

        .comment-content {
            margin: 8px 0 12px;
            line-height: 1.6;
            color: #333;
        }

        .comment-actions {
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

        .reply-box {
            margin-top: 12px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;

            .reply-textarea {
                width: 100%;
                padding: 8px;
                border: 1px solid #dcdfe6;
                border-radius: 4px;
                resize: vertical;
                font-family: inherit;
                font-size: 14px;

                &:focus {
                    outline: none;
                    border-color: #409eff;
                }
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
</style>
