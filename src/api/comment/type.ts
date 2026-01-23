
export interface CommentFormType { // 评论表单类型
    id?: string;
    content: string;
    score: number;
    filmId?: number;
    userId?: number;
}

export type CommentItemType = {
    id: number;
    parentId: number;
    replyId?: number;
    userId: number;
    filmId: number;
    username: string;
    avatar?: string;
    content: string;
    score?: number | null;
    createdTime: string;
    likes: number;
    liked: boolean;
    unLikes: number;
    unLiked: boolean;
    showAllReplies?: boolean;
    replies?: CommentItemType[];
    showCount: number;      // 当前展示多少条
};

export enum ReactionEnum {
    Like = 1,
    UnLike = 0
}

export type CommentReactionType = {
    commentId: number;
    reactionType: ReactionEnum
}

export enum CommentWsEnum {
    FirstComment = 'first_comment', // 首评
    Reply = 'comment_reply', // 回复
    CommentLike = 'comment_like' // 点赞
}

export interface ReplyCommentType {
    type: CommentWsEnum;
    data: {
        userId: number;
        filmId: number; // 影片ID
        parentId: number; // 主评论ID
        replyId: number | null; // 被回复人的评论ID
        content: string; // 回复内容
    }
}

export type CommentWsMessageType = {
    type: CommentWsEnum;
    parentId: number;
    data: CommentItemType & {filmId: number};
}

export type CommentReactionResType = {
    userId: number;
    commentId: number;
    likes: number;
    unLikes: number;
    liked: boolean;
    unLiked: boolean;
}