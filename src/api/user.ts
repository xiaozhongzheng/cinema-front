import request from '@/utils/request'

export function pageQueryUserApi(params: any): Promise<any> {
  return request({
    url: '/user/page',
    method: 'get',
    params
  })
}

export function register(data: any): Promise<any> {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export function getUserById(id: number): Promise<any> {
  return request({
    url: '/user/single',
    params: { id }
  })
}

export function updateUserApi( data: any): Promise<any> {
  return request({
    url: `/user/edit`,
    method: 'put',
    data
  })
}

export function recharge(data: any): Promise<any> {
  return request({
    url: `/user/recharge`,
    method: 'put',
    data
  })
}
