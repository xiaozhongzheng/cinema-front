
export const filmTypeList = ["动作", "动画", "喜剧", "犯罪", "爱情", "科幻", "其他"];
export const filmRegionList = ["内地", "香港", "台湾", "日本", "美国", "其他"];
export const languageList = ['国语', '英语', '粤语', '其他']

export const screenTypeOptions = [
  {
    label: "2D", // 普通二维电影
    value: 1,
  },
  {
    label: "3D", // 立体三维电影
    value: 2,
  },
  {
    label: "IMAX", // 巨幕电影
    value: 3,
  },
  {
    label: "IMAX_3D", // IMAX三维电影
    value: 4,
  },
]

export const filmStatusOptions = [
  {label: '即将上映',value: 1},
  {label: '已上映',value: 2,type: 'success'},
  {label: '已下线',value: 3,type: 'danger'}
]

export const host = 'localhost'
// const host = '47.96.128.212'

export const userRoleList = ['', '员工', '管理员']
export const accountStatusList = ['禁用', '启用']
export const rolePathList = ['/user', '/employee', '/admin']
export const payStatus = ['已取消', '已支付', '已完成']


