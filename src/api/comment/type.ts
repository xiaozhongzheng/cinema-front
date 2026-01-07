
export interface CommentFormType { // 评论表单类型
    id?: string;
    content: string;
    score: number;
    filmId?: number;
    userId?: number;
}
