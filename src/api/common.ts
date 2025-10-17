import request from '@/utils/request'

export function login(data: any): Promise<any> {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getUserInfo(roleId: number): Promise<any> {
  return request({
    url: `/info`,
    method: 'get',
    params: {
      roleId: roleId
    }
  })
}

export function logout(data: any): Promise<any> {
  return request({
    url: `/logout`,
    method: 'post',
    data
  })
}

export function updatePassword(data: any): Promise<any> {
  return request({
    url: `/password`,
    method: 'put',
    data
  })
}

export function upload(data: any): Promise<any> {
  return request({
    url: `/upload`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
