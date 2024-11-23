import '@/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Material from '@primevue/themes/material'
import { Icon } from '@iconify/vue'
import ToastService from 'primevue/toastservice'
import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { theme: { preset: Material } })
app.component('IconifyIcon', Icon)
app.use(ToastService)

app.mount('#app')
