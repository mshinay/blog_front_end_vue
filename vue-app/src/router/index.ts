import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import ArticleDetailView from '@/views/ArticleDetailView.vue'
import EditArticleView from '@/views/EditArticleView.vue'
import LoginView from '@/views/LoginView.vue'
import MainView from '@/views/MainView.vue'
import PersonCenterView from '@/views/PersonCenterView.vue'
import RegisterView from '@/views/RegisterView.vue'
import SearchView from '@/views/SearchView.vue'
import UploadArticleView from '@/views/UploadArticleView.vue'
import UserPageView from '@/views/UserPageView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/main' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/main', name: 'main', component: MainView },
    { path: '/search', name: 'search', component: SearchView },
    { path: '/article/:articleId', name: 'article-detail', component: ArticleDetailView, props: true },
    { path: '/upload', name: 'upload', component: UploadArticleView, meta: { requiresAuth: true } },
    { path: '/edit-article/:articleId', name: 'edit-article', component: EditArticleView, props: true, meta: { requiresAuth: true } },
    { path: '/person', name: 'person-center', component: PersonCenterView, meta: { requiresAuth: true } },
    { path: '/user/:userId', name: 'user-page', component: UserPageView, props: true },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (authStore.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    return { name: 'main' }
  }

  return true
})

export default router
