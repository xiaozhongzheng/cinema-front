
export interface CommentFormType { // 评论表单类型
    id?: string;
    content: string;
    score: number;
    filmId?: number;
    userId?: number;
}

export interface ReplyCommentType {
    filmId: number; // 影片ID
    parentId: number; // 主评论ID
    replyId: number | null; // 被回复人的评论ID
    content: string; // 回复内容
}

export type CommentItemType = {
  id: number;
  parentId?: number;
  replyId?: number;
  userId: number;
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