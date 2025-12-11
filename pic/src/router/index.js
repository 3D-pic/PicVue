import Vue from 'vue'
import VueRouter from 'vue-router'
import EditorView from '../views/EditorView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Editor',
    component: EditorView
  },
]

const router = new VueRouter({
  routes
})

export default router
