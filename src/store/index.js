import Vue from 'vue'
import Vuex from 'vuex'

import model from './modules/model'
import server from './modules/server'
import client from './modules/client'

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    model,
    server,
    client
  }
})
