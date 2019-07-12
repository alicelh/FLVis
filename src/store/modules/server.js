import * as types from '../types'
import api from '@/fetch/api'

const state = {
  loss: [],
  num: [],
  acc: [],
  iternum: 0,
  choosediter: 0,
  choosedpara: {},
  brushedSelection: [],
  brushedClientStastics: {}
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
  },
  getClientStasticsRange ({commit}, context) {
    api.ClientStasticsRange(context[0], context[1])
      .then(res => {
        commit(types.GET_CLIENTSTASTICSRANGE, [context, res])
      })
  }
}

const mutations = {
  [types.GET_SERVER_INFO] (state, data) {
    state.loss = data.loss;
    state.num = data.num;
    state.acc = data.acc;
    state.iternum = data.iternum
  },
  [types.GET_CLIENTSTASTICSRANGE] (state, data) {
    state.brushedSelection = data[0];
    state.brushedClientStastics = data[1];
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
