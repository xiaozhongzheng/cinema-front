import request from '@/utils/request'

export function addSchedule(data: any): Promise<any> {
  return request({
    url: '/schedule/save',
    method: 'post',
    data
  })
}

export function updateSchedule(data: any): Promise<any> {
  return request({
    url: '/schedule',
    method: 'put',
    data
  })
}

export function pageQueryScheduleApi(params: any): Promise<any> {
  return request({
    url: '/schedule/page',
    method: 'get',
    params
  })
}

export function getScheduleDateList(id: number): Promise<any> {
  return request({
    url: '/schedule/list/showDate',
    method: 'get',
    params: { filmId: id }
  })
}

export function getScheduleListByDate(date: string, id: number): Promise<any> {
  return request({
    url: '/schedule/list/showBuy',
    method: 'get',
    params: { time: date, filmId: id }
  })
}

export function getFilmAndScheduleById(params: any): Promise<any> {
  return request({
    url: '/schedule/filmSchedule',
    method: 'get',
    params
  })
}
