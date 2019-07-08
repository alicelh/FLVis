import * as types from '../types'
import api from '@/fetch/api'

const state = {
  loss: [],
  num: [],
  acc: [],
  iternum: 0,
  choosediter: 0,
  choosedpara: {}
}

const getters = {}

const actions = {
  getServerInfo ({
    commit
  }) {
    api.ServerInfo()
      .then(res => {
        commit(types.GET_SERVER_INFO, res)
      })
  }
}

const mutations = {
  [types.GET_SERVER_INFO] (state, data) {
    state.loss = data.loss;
    state.num = data.num;
    state.acc = data.acc;
    state.iternum = data.iternum
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
