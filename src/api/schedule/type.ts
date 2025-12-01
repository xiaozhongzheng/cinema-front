
export type OptionsType = {
  label: string | number;
  value: any;
  [key: string]: any;
}
export enum ScheduleStatus {
    // 状态码 = 描述（或使用对象映射同时存储code和desc）
    Canceled = 0, //"已取消"
    Unpubilshed = 1, // "未发布"
    Published = 2, //"已发布"
    Expired = 3, //"已结束"
}

export type StatusType = ScheduleStatus.Canceled | ScheduleStatus.Unpubilshed | ScheduleStatus.Published | ScheduleStatus.Expired
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
  startDateTime?: string;
  status: StatusType;
}

