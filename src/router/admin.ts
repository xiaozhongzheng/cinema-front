export const adminRoutes = {
  path: '/admin',
  name: 'admin',
  meta: {
    requiresAdmin: true
  },
  component: () => import('@/views/admin/index.vue'),
  redirect: '/admin/home',
  children: [
    {
      path: 'home',
      component: () => import('@/views/admin/home/index.vue'),
      meta: {
        title: '个人中心',
        icon: 'HomeFilled'
      }
    },
    {
      path: 'users',
      component: () => import('@/views/admin/users/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'UserFilled'
      }
    },
    {
      path: 'cinema',
      component: () => import('@/views/admin/cinema'),
      meta: {
        title: '影院管理',
        icon: 'Camera'
      }
    },
    {
      path: 'screen',
      component: () => import('@/views/admin/screen'),
      meta: {
        title: '放映厅管理',
        icon: 'Box'
      }
    },
    {
      path: 'film',
      component: () => import('@/views/admin/film'),
      meta: {
        title: '影片管理',
        icon: 'Film'
      }
    },
    {
      path: 'schedule',
      component: () => import('@/views/admin/schedule'),
      meta: {
        title: '排片管理',
        icon: 'Aim'
      }
    },
    {
      path: 'cinema-carousel',
      component: () => import('@/views/admin/cinema-carousel'),
      meta: {
        title: '影片轮播图管理',
        icon: 'Menu'
      }
    },
    {
      path: 'orders',
      component: () => import('@/views/admin/orders/OrdersView.vue'),
      meta: {
        title: '查看所有订单',
        icon: 'List'
      }
    }
  ]
}
