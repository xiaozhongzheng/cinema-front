export const userRoutes = {
  path: '/user',
  name: 'user',
  component: () => import('@/views/user/MainView.vue'),
  redirect: '/user/home',
  children: [
    {
      path: '/user/home',
      component: () => import('@/views/user/home/HomeView.vue')
    },
    {
      path: '/user/movies',
      name: 'movies',
      component: () => import('@/views/user/all_movie/MoviesView.vue')
    },
    {
      path: '/user/film-detail/:filmId',
      name: 'showDetail',
      component: () => import('@/views/user/film-detail/index.vue')
    },
    {
      path: '/user/buy-ticket/:filmId',
      name: 'buy',
      component: () => import('@/views/user/buy-ticket/index.vue')
    },
    {
      path: '/user/chooseSeat',
      name: 'chooseSeat',
      component: () => import('@/views/user/buy-ticket/ChooseSeatView.vue')
    },
    {
      path: '/user/me',
      component: () => import('@/views/user/me/MyView.vue'),
      children: [
        {
          path: '/user/me/cart',
          component: () => import('@/views/user/me/CartView.vue')
        },
        {
          path: '/user/me/order',
          component: () => import('@/views/user/me/OrderView.vue')
        },
        {
          path: '/user/me/detail',
          component: () => import('@/views/user/me/MyDetailView.vue')
        }
      ]
    }

  ]
}

