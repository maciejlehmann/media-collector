import { createRouter, createWebHistory } from 'vue-router'
import ProductionsListView from '@/views/ProductionsListView.vue'
import ProductionCastView from '@/views/ProductionCastView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'productions-list', component: ProductionsListView },
    {
      path: '/production/:id',
      name: 'production-cast',
      component: ProductionCastView,
    },
  ],
})

export default router
