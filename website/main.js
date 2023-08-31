import Vue, { createApp } from "vue"

import { createStore } from "vuex";

import App from "./App.vue"

import Playground from "./components/Playground.vue";
import Creator from "./components/Creator.vue";

const routes = [
  { path: '/playground', component: Playground },
  { path: '/creator', component: Creator },
]
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes,
  mode: 'history'
})

const moduleA = {
  state() {
    return {
      output: ""
    }
  },
  mutations: {
    changeOutput(state, output) {
      state.output = output;
    }
  }
}

const moduleB = {
  state() {
    return {
      keywords: {}
    }
  },
  mutations: {
    addKeyword(state, key, value) {
      state.keywords[key] = value;
    },
    removeKeyword(state, key) {
      delete state.keywords[key];
    }
  }
}

const store = createStore({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

// new Vue({
//     components: { App },
//     template: "<App />",
// }).$mount("#app");

const app = createApp(App).use(store).use(router).mount("#app");
