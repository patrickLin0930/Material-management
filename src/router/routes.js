const routes = [
  {
    path: '/',
    component: () => import('layouts/DrawerMenu.vue'),
    children: [
      { path: '', redirect: '/calendar' },
      { path: 'calendar', component: () => import('pages/Calendar Page.vue') },
      { path: 'form', component: () => import('pages/DailyForm.vue') },
      { path: 'summary', component: () => import('pages/Summary Page.vue') },
      { path: 'inventory', component: () => import('pages/Inventory Summary.vue') },
      { path: 'style', component: () => import('pages/StyleManager.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
