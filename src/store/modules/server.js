import * as types from '../types'
import api from '@/fetch/api'
import model from './model'

const state = {
  loss: [],
  num: [],
  acc: [],
  iternum: 0,
  choosediter: 0,
  serverpara: {},
  brushedSelection: [],
  brushedClientStastics: {}
}

const getters = {
  serverparaarray: state => {
    let para = [];
    let serverparatmp = state.serverpara;
    if (typeof (serverparatmp) === 'object' && Object.keys(serverparatmp).length !== 0) {
      let layerCount = model.state.layernum
      let paratmp, len;
      for (let i = 0; i < layerCount; i++) {
        para = [].concat(...serverparatmp['w' + (i + 1)]);
        paratmp = serverparatmp['b' + (i + 1)];
        len = paratmp.length;
        for (let j = 0; j < len; j++) {
          para.push(...paratmp[j]);
        }
      }
    }
    return para;
  }
}

const actions = {
  getServerInfo ({
    commit
  }) {
    api.ServerInfo()
      .then(res => {
        commit(types.GET_SERVER_INFO, res)
      })
  },
  getClientStasticsRange ({
    commit
  }, context) {
    api.ClientStasticsRange(context[0], context[1])
      .then(res => {
        commit(types.GET_CLIENT_STASTICS_RANGE, [context, res])
      })
  },
  updateClientOutlier ({
    commit
  }, context) {
    commit(types.UPDATE_CLIENT_OUTLIER, context)
  },
  getServerPara ({
    commit
  }, context) {
    api.ServerPara(context).then(res => {
      commit(types.GET_SERVER_PARA, res)
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
  [types.GET_CLIENT_STASTICS_RANGE] (state, data) {
    state.brushedSelection = data[0];
    state.brushedClientStastics = data[1];
  },
  [types.GET_SERVER_PARA] (state, data) {
    state.serverpara = data[0];
  },
  [types.UPDATE_CLIENT_OUTLIER] (state, data) {
    let type = data[2];
    let propertyName = 'outlierClient-' + type;
    state.brushedClientStastics[data[0]][propertyName] = data[1];
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
