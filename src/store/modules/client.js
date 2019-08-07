import * as types from '../types'
import api from '@/fetch/api'
import model from './model'
import server from './server'

const state = {
  paradata: {},
  clientparalist: [],
  w1: [],
  b1: [],
  projectdata: {
    "pos": [],
    "idList": []
  },
  choosedclient: 0,
  choosedclientiter: 0, // 在哪一次迭代选择的client
  choosediter: 2, // 选择盒须图上的某一次迭代
  choosedIterForProjection: 0, // 选择迭代面板中的某一次
  clientInfo: {}, // main view中的
  deleteiter: -1,
  selectedClientInfo: []
}

const getters = {}

const actions = {
  getClientPara({
    commit
  }, context) {
    api.ClientParaByIterIndex(context[0], context[1])
      .then(res => {
        commit(types.GET_CLIENT_PARA, res)
      })
  },
  getClientParaList({
    commit
  }, {
    iter,
    indexarr
  }) {
    api.ClientParaByIterIndexarr(iter, indexarr)
      .then(res => {
        commit(types.GET_CLIENT_PARA_ARR, res)
      })
  },
  getClientProject({
    commit
  }, context) {
    commit(types.RESET_PROJECT_POS, [])
    api.ClientParaByIter(context)
      .then(res => {
        commit(types.GET_CLIENT_PROJECT, res)
      })
  },
  getClientInfoByIter({
    commit
  }, context) {
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
  },
  getClientInfoByIndex({
    commit
  }, context) {
    api.ClientInfoByIndex(context)
      .then(res => {
        commit(types.GET_CLIENT_INFO_BY_INDEX, res);
      })
  }
}

const mutations = {
  [types.GET_CLIENT_PARA](state, data) {
    state.paradata = data;
  },
  [types.GET_CLIENT_PARA_ARR](state, data) {
    let tmp = server.state.serverpara;
    let len = tmp.length;
    let count = data.length;
    for (let k = 0; k < count; k++) {
      for (let i = 0; i < len; i++) {
        data[k][i] = data[k][i] - tmp[i];
      }
    }
    state.clientparalist = data;
  },
  [types.GET_CLIENT_PROJECT](state, data) {
    state.projectdata = data;
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
  [types.UPDATE_CLIENT_CHOOSED](state, data) {
    let clientIndex = data[0];
    let iter = data[1];
    state.choosedclient = clientIndex;
    state.choosedclientiter = iter;
  },
  [types.UPDATE_ITER_CHOOSED_FOR_PROJ](state, iterIndex) {
    state.choosedIterForProjection = iterIndex;
  },
  [types.RESET_PROJECT_POS](state, initValue) {
    state.projectdata = {
      "pos": [],
      "idList": []
    };
  },
  [types.GET_CLIENT_INFO_BY_INDEX] (state, data) {
    state.selectedClientInfo = data;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
