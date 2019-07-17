import * as types from '../types'
import api from '@/fetch/api'

const state = {
  w1: [],
  b1: [],
  pos: [],
  choosedclient: 0,
  choosediter: 2, // 选择盒须图上的某一次迭代
  choosedIterForProjection: 1, // 选择迭代面板中的某一次
  clientInfo: {},
  deleteiter: -1
}

const getters = {}

const actions = {
  getClientPara({
    commit
  }) {
    api.ClientParaByIterIndex(state.choosediter, state.choosedclient)
      .then(res => {
        commit(types.GET_CLIENT_PARA, res[0])
      })
  },
  getClientProject({
    commit
  }, context) {
    api.ClientParaByIter(context)
      .then(res => {
        commit(types.GET_CLIENT_PROJECT, res)
      })
  },
  getClientInfoByIter({
    commit
  }, context) {
    commit(types.RESET_PROJECT_POS, [])
    api.ClientInfoByIter(context)
      .then(res => {
        commit(types.GET_CLIENT_INFO_BY_ITER, [context, res])
      })
  },
  deleteClientInfoByIter({
    commit
  }, context) {
    commit(types.DELETE_CLIENT_INFO_BY_ITER, context);
  },
  updataClientChoosed({
    commit
  }, context) {
    commit(types.UPDATE_CLIENT_CHOOSED, context);
  },
  updataIterChoosedForProjection({
    commit
  }, context) {
    commit(types.UPDATE_ITER_CHOOSED_FOR_PROJ, context);
  }
}

const mutations = {
  [types.GET_CLIENT_PARA](state, data) {
    state.w1 = data.w1;
    state.b1 = data.b1;
  },
  [types.GET_CLIENT_PROJECT](state, data) {
    state.pos = data;
  },
  [types.GET_CLIENT_INFO_BY_ITER](state, data) {
    state.choosediter = data[0];
    state.clientInfo[data[0]] = data[1];
    state.deleteiter = -1;
  },
  [types.DELETE_CLIENT_INFO_BY_ITER](state, index) {
    state.choosediter = -1;
    state.deleteiter = index;
    delete state.clientInfo[index];
  },
  [types.UPDATE_CLIENT_CHOOSED](state, clientIndex) {
    state.choosedclient = clientIndex;
  },
  [types.UPDATE_ITER_CHOOSED_FOR_PROJ](state, iterIndex) {
    state.choosedIterForProjection = iterIndex;
  },
  [types.RESET_PROJECT_POS](state, initValue) {
    state.pos = initValue;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
