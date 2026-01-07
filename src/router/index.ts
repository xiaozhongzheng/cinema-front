
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const whiteList = ['/login', '/404', '/register', '/test']

// router.beforeEach(async (to, from, next) => {
//   const userStore = useUserStore()
//   // 支持后端返回 role 字符串或数字 roleId（0 表示管理员）
//   const roleId = userStore.userInfo?.roleId

//   // if (to.path === '/404') {
//   //   next()
//   //   return
//   // }
//   // next()
//   // 路由守卫：拦截后台页面访问

// })

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const roleId = userStore.userInfo?.roleId

  if (to.path.includes("admin") && roleId !== 1) {
    // 非管理员访问后台，跳回首页
    next('/')
  } else {
    next()
  }
})

export default router
