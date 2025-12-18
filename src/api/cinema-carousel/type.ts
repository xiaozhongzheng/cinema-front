
export interface CinemaCarouselFormType {
    id?: number;
    filmId: number | undefined;
    imgUrl: string;
    sort: number | undefined;
    remark?: string;
}

export interface CinemaCarouselSearchType {
    pageNo: number;
    pageSize: number;
    filmId?: number;
}

export interface CinemaCarouselItemType extends CinemaCarouselFormType {
    createTime: string;
    updateTime: string;
}