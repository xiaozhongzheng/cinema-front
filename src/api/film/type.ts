
export interface FilmFormType {
  id?: number;
  title: string;
  poster: string;
  director: string;
  actors: string;
  releaseDate: string; // 若使用Date类型可替换为Date
  endDate: string;     // 若使用Date类型可替换为Date
  types: string;
  regions: string;
  duration: number;
  plot: string;
  dateList: any[];
}


export interface FilmResultType extends FilmFormType {
  status: 1 | 2 |3; // 1-即将上映，2-上映中，3-下线（新增的影片默认是1）
}

export interface FilmTopType {
  id: number;
  title: string;
  poster: string;
  averageScore: number;
}

export interface FilmCardType {
  id: number;
  poster: string;
}