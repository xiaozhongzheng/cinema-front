import request from '@/utils/request'

export function pageQueryScreen(params: any): Promise<any> {
  return request({
    url: '/screen/page',
    method: 'get',
    params
  })
}

export function addScreen(data: any): Promise<any> {
  return request({
    url: '/screen/save',
    method: 'post',
    data
  })
}

export function getScreenById(id: number): Promise<any> {
  return request({
    url: `/screen/single/${id}`,
    method: 'get'
  })
}

export function updateScreen(data: any): Promise<any> {
  return request({
    url: '/screen/edit',
    method: 'put',
    data
  })
}

export function deleteScreen(id: number): Promise<any> {
  return request({
    url: `/screen/${id}`,
    method: 'delete'
  })
}

export function getScreenRoomList(): Promise<any> {
  return request({
    url: '/screen/list',
    method: 'get'
  })
}
