import request, { ApiResponse } from '@/utils/request'
import { CinemaFormType, CinemaType } from './type'

export function pageQueryCinemaApi(params: any): Promise<any> {
  return request({
    url: '/cinema/page',
    method: 'get',
    params
  })
}

export function addCinemaApi(data: CinemaFormType): Promise<any> {
  return request({
    url: '/cinema/save',
    method: 'post',
    data
  })
}

export function getCinemaByIdApi(id: number): Promise<CinemaFormType> {
  return request({
    url: `/cinema/single/${id}`,
    method: 'get'
  })
}

export function updateCinemaApi(data: CinemaFormType): Promise<any> {
  return request({
    url: '/cinema/edit',
    method: 'put',
    data
  })
}

export function deleteCinemaApi(id: number): Promise<any> {
  return request({
    url: `/cinema/${id}`,
    method: 'delete'
  })
}

export function getCinemaListApi(): Promise<CinemaType[]> {
  return request({
    url: `/cinema/list`,
    method: 'get'
  })
}


