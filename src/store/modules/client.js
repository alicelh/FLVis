import * as types from '../types'
import api from '@/fetch/api'

const state = {
  w1: [],
  b1: [],
  choosedclient: 0,
  choosediter: 2,
  clientInfo: {},
  deleteiter: -1
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
  },
  getClientInfoByIter ({commit}, context) {
    api.ClientInfoByIter(context)
      .then(res => {
        commit(types.GET_CLIENT_INFO_BY_ITER, [context, res])
      })
  },
  deleteClientInfoByIter ({commit}, context) {
    commit(types.DELETE_CLIENT_INFO_BY_ITER, context);
  }
}

const mutations = {
  [types.GET_CLIENT_PARA] (state, data) {
    state.w1 = data.w1;
    state.b1 = data.b1;
  },
  [types.GET_CLIENT_INFO_BY_ITER] (state, data) {
    state.choosediter = data[0];
    state.clientInfo[data[0]] = data[1];
    state.deleteiter = -1;
  },
  [types.DELETE_CLIENT_INFO_BY_ITER] (state, index) {
    state.choosediter = -1;
    state.deleteiter = index;
    delete state.clientInfo[index];
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
