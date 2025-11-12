export const adminRoutes = {
  path: '/admin',
  name: 'admin',
  component: () => import('@/views/admin/index.vue'),
  redirect: '/admin/home',
  children: [
    {
      path: '/admin/home',
      component: () => import('@/views/admin/home'),
      meta: {
        // 路由元信息 用于存储数据的
        title: '个人中心', // 标题
        icon: 'HomeFilled' // 图标
      }
    },
    {
      path: '/admin/employee',
      component: () => import('@/views/admin/employee'),
      meta: {
        // 路由元信息 用于存储数据的
        title: '员工管理', // 标题
        icon: 'UserFilled' // 图标
      }
    },
    {
      path: '/admin/cinema',
      component: () => import('@/views/admin/cinema'),
      meta: {
        title: '影院管理',
        icon: 'LocationFilled'
      }
    },
    {
      path: '/admin/screen',
      component: () => import('@/views/admin/screen'),
      meta: {
        // 路由元信息 用于存储数据的
        title: '放映厅管理', // 标题
        icon: 'LocationFilled' // 图标
      }
    },
    {
      path: '/admin/film',
      component: () => import('@/views/admin/film'),
      meta: {
        // 路由元信息 用于存储数据的
        title: '影片管理', // 标题
        icon: 'Menu' // 图标
      }
    },
    // {
    //   path: '/admin/addFilm',
    //   name: 'addFilm',
    //   component: () => import('@/views/admin/film/AddFilm.vue'),
    //   hidden: true
    // },
    {
      path: '/admin/orders/show',
      component: () => import('@/views/admin/orders/OrdersView.vue'),
      meta: {
        // 路由元信息 用于存储数据的
        title: '查看所有订单', // 标题
        icon: 'List' // 图标
      }
    },

  ]
}

