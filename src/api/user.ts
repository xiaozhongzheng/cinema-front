import request from '@/utils/request'

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

export function updateUserById(id: number, data: any): Promise<any> {
  return request({
    url: `/user/${id}`,
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
