<!-- <template>
    <UserComment />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import LikedIcon from '@/components/LikedIcon.vue'
import UserComment from '@/components/UserComment.vue'

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

// 静态数据
const staticComments: CommentItem[] = [
    {
        id: 1,
        userId: 101,
        username: '张三',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        content: '这部电影真的很精彩，特效做得非常棒！',
        score: 4.5,
        createTime: '2024-01-15 14:30',
        likes: 24,
        liked: true,
        replies: [
            {
                id: 11,
                userId: 102,
                username: '李四',
                avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
                content: '我也这么觉得，特别是最后那场戏！',
                createTime: '2024-01-15 15:20',
                likes: 5,
                liked: false
            }
        ],
        showAllReplies: false
    },
    {
        id: 2,
        userId: 103,
        username: '王五',
        content: '剧情有点拖沓，但演员演技在线',
        score: 3,
        createTime: '2024-01-14 09:15',
        likes: 12,
        liked: false,
        replies: [],
        showAllReplies: false
    },
    {
        id: 3,
        userId: 104,
        username: '赵六',
        avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
        content: '强烈推荐！值得一看的好电影',
        score: 5,
        createTime: '2024-01-13 20:45',
        likes: 36,
        liked: true,
        showAllReplies: false
    },
    {
        id: 4,
        userId: 105,
        username: '钱七',
        content: '画面很美，配乐也很好听',
        createTime: '2024-01-12 16:10',
        likes: 8,
        liked: false,
        showAllReplies: false,
        replies: [
            {
                id: 41,
                userId: 106,
                username: '孙八',
                content: '是的，原声带真的很不错',
                createTime: '2024-01-12 17:30',
                likes: 2,
                liked: true
            },
            {
                id: 42,
                userId: 107,
                username: '周九',
                avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
                content: '尤其是主题曲，很有感染力',
                createTime: '2024-01-12 18:45',
                likes: 3,
                liked: false
            },
            {
                id: 43,
                userId: 108,
                username: '吴十',
                content: '看了三遍了，每次都有新感受',
                createTime: '2024-01-12 19:30',
                likes: 1,
                liked: true
            },
            {
                id: 44,
                userId: 109,
                username: '郑十一',
                content: '配乐确实是亮点',
                createTime: '2024-01-12 20:15',
                likes: 0,
                liked: false
            }
        ]
    }
]

// 响应式数据
const comments = ref<CommentItem[]>([])
const activeReplyId = ref<number | null>(null)
const replyContent = ref<string>('')

// 初始化数据
onMounted(() => {
    comments.value = staticComments.map(comment => ({
        ...comment,
        showAllReplies: false
    }))
})

// 切换回复折叠/展开
const toggleReplies = (commentId: number) => {
    const comment = comments.value.find(c => c.id === commentId)
    if (comment?.replies?.length) {
        comment.showAllReplies = !comment.showAllReplies
    }
}

// 点赞逻辑
const handleLike = (commentId: number) => {
    const comment = comments.value.find(c => c.id === commentId)
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
    const comment = comments.value.find(c => c.id === commentId)
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

<style scoped lang="scss">
.static-comment {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.comment-list {
    .comment-item {
        padding: 20px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
            border-bottom: none;
        }

        // ========== 第一行：头像+评论信息 ==========
        .comment-row-1 {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            width: 100%;
            margin-bottom: 16px;
            background-color: pink;
            // 头像区域（固定宽度）
            .avatar-section {
                flex-shrink: 0;
                width: 50px;
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
                        font-weight: 600;
                        color: #333;
                        font-size: 16px;
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
                        .reply-item {
                            display: flex;
                            gap: 12px;
                            padding: 12px 0;
                            border-bottom: 1px dashed #f0f0f0;

                            &:last-child {
                                border-bottom: none;
                            }

                            .reply-avatar {
                                flex-shrink: 0;
                                width: 36px;
                            }

                            .reply-content {
                                flex: 1;

                                .reply-header {
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    margin-bottom: 4px;

                                    .reply-username {
                                        font-weight: 500;
                                        color: #333;
                                        font-size: 14px;
                                    }

                                    .reply-time {
                                        color: #999;
                                        font-size: 12px;
                                    }
                                }

                                .reply-text {
                                    color: #333;
                                    line-height: 1.5;
                                    font-size: 14px;
                                }
                            }
                        }

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
    }
}

.empty-comment {
    text-align: center;
    padding: 40px 0;
}

// 点赞动画
@keyframes like-pop {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}
</style> -->