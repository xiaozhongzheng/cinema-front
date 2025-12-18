import request, { ApiResponse } from '@/utils/request'
import { CinemaCarouselFormType, CinemaCarouselItemType, CinemaCarouselSearchType } from './type'


export function addCinemaCarouselApi(data: CinemaCarouselFormType): Promise<any> {
  return request({
    url: '/cinema-carousel/save',
    method: 'post',
    data
  })
}

export function pageCinemaCarouselApi(params: CinemaCarouselSearchType): Promise<any> {
  return request({
    url: '/cinema-carousel/page',
    method: 'get',
    params
  })
}

export function deleteCinemaCarouselApi(id: number): Promise<any> {
  return request({
    url: `/cinema-carousel/${id}`,
    method: 'delete',
  })
}

export function getCinemaCarouselListApi(): Promise<any> {
  return request({
    url: `/cinema-carousel/list`,
    method: 'get',
  })
}