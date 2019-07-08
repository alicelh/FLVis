import Vue from 'vue'
import Vuex from 'vuex'

import matrix from './modules/matrix'
import server from './modules/server'

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    matrix,
    server
  }
})
