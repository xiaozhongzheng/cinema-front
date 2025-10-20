import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/common'
import { PersistenceOptions } from 'pinia-plugin-persistedstate' // 需确保安装了该插件

// 定义持久化配置（可选，用于自定义存储行为）
const persistConfig: PersistenceOptions = {
  key: 'app_store_v1', // 对应原 STORAGE_KEY，自定义存储的键名
  storage: localStorage, // 指定存储方式为 localStorage（默认也是 localStorage）
}

type UserInfo = Record<string, any>

interface UserState {
  token: string | null
  userInfo: UserInfo
}

export const useUserStore = defineStore('local_user_info', {
  state: (): UserState => ({
    token: null,
    userInfo: {}
  }),
  getters: {
    tokenState: (state) => state.token,
    username: (state) => state.userInfo?.username,
    userInfoState: (state) => state.userInfo
  },
  actions: {
    setToken(token: string | null) {
      // 直接操作 state，无需 this 或类型断言
      this.token = token
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
    clearData() {
      this.token = null
      this.userInfo = {}
    },
    async loginAction(data: any) {
      const res: any = await login(data)
      const { user, token } = res
      this.setToken(token)
      this.setUserInfo(user)
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
  },
  // 启用 Pinia 持久化插件，直接关联配置
  persist: true,
})
