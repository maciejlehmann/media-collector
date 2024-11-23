import ProductionsListView from '@/views/ProductionsListView.vue'
import ProductionCastView from '@/views/ProductionCastView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'productions-list', component: ProductionsListView },
    { path: '/production/:id', name: 'production-cast', component: ProductionCastView },
    { path: '/login', name: 'login-page', component: LoginView },
    { path: '/register', name: 'register-page', component: RegisterView }
  ]
})

export default router
