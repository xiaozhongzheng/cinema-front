import request from '@/utils/request'

export function exportExcel(): Promise<any> {
  return request({
    url: `/employee/export/excel`,
    method: 'get',
    responseType: 'blob'
  })
}

export function importExcel(data: any): Promise<any> {
  return request({
    url: `/employee/import/excel`,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data
  })
}

export function updateEmployeeById(data: any): Promise<any> {
  return request({
    url: `/employee/edit`,
    method: 'put',
    data
  })
}

export function getEmployeeInfo(): Promise<any> {
  return request({
    url: `/employee`,
    method: 'get'
  })
}

export function getEmployeeById(id: number): Promise<any> {
  return request({
    url: `/employee/single/${id}`,
    method: 'get'
  })
}

export function pageQueryEmployee(params: any): Promise<any> {
  return request({
    url: `/employee/page`,
    method: 'get',
    params
  })
}

export function addEmployee(data: any): Promise<any> {
  return request({
    url: `/employee/save`,
    method: 'post',
    data
  })
}

export function deleteEmployee(id: number): Promise<any> {
  return request({
    url: `/employee/${id}`,
    method: 'delete'
  })
}
