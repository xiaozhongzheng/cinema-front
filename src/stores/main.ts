import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/common'
import { PersistedStateOptions } from 'pinia-plugin-persistedstate' // 需确保安装了该插件

// 定义持久化配置（可选，用于自定义存储行为）
const persistConfig: PersistedStateOptions = {
  key: 'app_store_v1', // 对应原 STORAGE_KEY，自定义存储的键名
  storage: localStorage, // 指定存储方式为 localStorage（默认也是 localStorage）
  paths: ['token', 'roleId', 'userId', 'userInfo'] // 只持久化指定字段，避免冗余
}

type UserInfo = Record<string, any>

interface MainState {
  token: string | null
  roleId: number | null
  userId: number | null
  userInfo: UserInfo
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    token: null,
    roleId: null,
    userId: null,
    userInfo: {}
  }),
  // 启用 Pinia 持久化插件，直接关联配置
  persist: persistConfig,
  getters: {
    tokenState: (state) => state.token,
    roleIdState: (state) => state.roleId,
    userIdState: (state) => state.userId,
    username: (state) => state.userInfo?.username,
    userInfoState: (state) => state.userInfo
  },
  actions: {
    // 移除手动 persist 方法，由插件自动处理状态持久化
    setToken(token: string | null) {
      // 直接操作 state，无需 this 或类型断言
      this.token = token
    },
    setRoleId(roleId: number | string | null) {
      this.roleId = roleId == null ? null : Number(roleId)
    },
    setUserId(userId: number | null) {
      this.userId = userId
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
    clearData() {
      this.token = null
      this.roleId = null
      this.userId = null
      this.userInfo = {}
    },
    async loginAction(data: any) {
      const res: any = await login(data)
      const { id, roleId, token } = res
      this.setToken(token)
      this.setUserId(id)
      this.setRoleId(roleId)
      return res
    },
    async getUserInfoByRoleId(roleId: number) {
      const info: UserInfo = await getUserInfo(roleId)
      this.setUserInfo(info)
      return info
    },
    async logoutAction(data: any) {
      await logout(data)
      this.clearData()
    }
  }
})