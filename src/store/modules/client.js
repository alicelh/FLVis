import * as types from '../types'
import api from '@/fetch/api'

const state = {
  w1: [],
  b1: [],
  choosedclient: 0,
  choosediter: 2
}

const getters = {}

const actions = {
  getClientPara ({
    commit
  }) {
    api.ClientParaByIterIndex(state.choosediter, state.choosedclient)
      .then(res => {
        commit(types.GET_CLIENT_PARA, res[0])
      })
  }
}

const mutations = {
  [types.GET_CLIENT_PARA] (state, data) {
    state.w1 = data.w1;
    state.b1 = data.b1;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
