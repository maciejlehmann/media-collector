import ProductionsListView from '@/views/ProductionsListView.vue'
import ProductionCastView from '@/views/ProductionCastView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'productions-list', component: ProductionsListView },
    { path: '/production/:id', name: 'production-cast', component: ProductionCastView },
    { path: '/login', name: 'login-page', component: LoginView },
    { path: '/register', name: 'register-page', component: RegisterView }
  ]
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();
  if (!authStore.user.id && to.name !== 'login-page' && to.name !== 'register-page' && to.name !== 'productions-list') {
    return { name: 'login-page' }
  }

  if (authStore.user.id && (to.name === 'login-page' || to.name === 'register-page' && to.name !== 'productions-list')) {
    return false
  }
})

export default router
