import request from '@/utils/request'

export function addCommentApi(data: any): Promise<any> {
  return request({
    url: `/comment/save`,
    method: 'post',
    data
  })
}

export function getCommentByFilmIdApi(id: number): Promise<any> {
  return request({
    url: '/comment/get',
    method: 'get',
    params: { filmId: id }
  })
}
