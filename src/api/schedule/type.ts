
export type OptionsType = {
  label: string | number;
  value: any;
  [key: string]: any;
}

export interface ScheduleFormType {
  cinemaId: number;
  screenRoomId: number;
  filmId: number;
  language: string;
  screeningDate: string;
  startTime: string;
  endTime: string;
  price: number;
  time: string[]; // 保存开始时间和结束时间的数组
  id?: string | number;
}


