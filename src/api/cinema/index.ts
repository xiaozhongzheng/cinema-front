import request from '@/utils/request'
import { CinemaFormType } from './type'

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

export function getCinemaByIdApi(id: number): Promise<any> {
  return request<CinemaFormType>({
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


