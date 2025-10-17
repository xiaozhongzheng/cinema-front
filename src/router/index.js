
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// const whiteList = ['/login','/404','/register','/test']
// router.beforeEach(async (to, from, next) => {
// router.beforeEach(async (to, from, next) => {
//   const s = useUserStore()
//   const token = s.token
//   const roleId = s.roleId
//   await s.getUserInfoByRoleId(s.roleId)
//   if(to.path === '/404'){
//     next()
//     return
//   }
//   if(token){ // user has token
//     const flag = (roleId === 0 && to.path.includes('/admin')) || (roleId !== 0 && to.path.includes('/user'))
//     if(flag){
//       next('/404')
//     }
//     else if(to.path === '/login' || to.path === '/register'){
//       roleId === 0 ? next('/user') : next('/admin')
//     }else{
//       await store.dispatch('getUserInfoByRoleId',store.getters.roleId)
//       next()
//     }
//   }else{
//     if(whiteList.includes(to.path)){
//       next()
//     }else{
//       next('/login')
//     }
//   }
// })

export default router
