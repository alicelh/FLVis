import * as types from '../types'
import api from '@/fetch/api'
import model from './model'
import client from './client'

const state = {
  loss: [],
  num: [],
  acc: [],
  iternum: 0,
  choosediter: 0,
  serverpara: [],
  brushedSelection: [],
  brushedClientStastics: {},
  outlierClientLoss: {},
  outlierClientInfoLength: [],
  outlierClientAcc: {},
  paranum: 0
}

const getters = {}

const actions = {
  getServerInfo({
    commit
  }) {
    api.ServerInfo()
      .then(res => {
        commit(types.GET_SERVER_INFO, res)
      })
  },
  getClientStasticsRange({
    commit
  }, context) {
    api.ClientStasticsRange(context[0], context[1])
      .then(res => {
        commit(types.GET_CLIENT_STASTICS_RANGE, [context, res])
      })
  },
  updateClientOutlier({
    commit
  }, context) {
    commit(types.UPDATE_CLIENT_OUTLIER, context)
  },
  // 不用了
  getServerPara({
    commit
  }, context) {
    api.ServerPara(context).then(res => {
      commit(types.GET_SERVER_PARA, res)
    })
  }
}

const mutations = {
  [types.GET_SERVER_INFO](state, data) {
    state.loss = data.loss;
    state.num = data.num;
    state.acc = data.acc;
    state.iternum = data.iternum
  },
  [types.GET_CLIENT_STASTICS_RANGE](state, data) {
    state.brushedSelection = data[0];
    state.brushedClientStastics = data[1];
    for (let i in state.brushedClientStastics) {
      state.brushedClientStastics[i]['outlierClient-loss'] = [];
      state.brushedClientStastics[i]['outlierClient-acc'] = [];
    }
  },
  [types.GET_SERVER_PARA](state, data) {
    console.log("get server para")
    state.copyserverpara = data;// 存一份
    // state.serverpara = data;
    // server聚合一下
    // state.serverpara = [];
    // let i = 0;
    // let len = 10;
    // for (i = 0; i < data.length;) {
    //   if (Math.abs(data[i] - 0) < 0.1) {
    //     while (Math.abs(data[i] - 0) < 0.1) {
    //       i++;
    //     }
    //     state.serverpara.push(0);
    //   } else if (data[i] > 0) {
    //     while (data[i] > 0) {
    //       let tempServerSum = 0;
    //       let tempLen = 0;
    //       while (data[i] > 0 && tempLen < len) {
    //         tempServerSum += data[i];
    //         tempLen++;
    //         i++;
    //       }
    //       state.serverpara.push(tempServerSum);
    //     }
    //   } else if (data[i] < 0) {
    //     while (data[i] < 0) {
    //       let tempServerSum = 0;
    //       let tempLen = 0;
    //       while (data[i] < 0 && tempLen < len) {
    //         tempServerSum += data[i];
    //         tempLen++;
    //         i++;
    //       }
    //       state.serverpara.push(tempServerSum);
    //     }
    //   } else {
    //     state.serverpara.push(data[i]);
    //   }
    // }
    client.state.clientpara = [];
    // state.paranum = state.serverpara.length;// data.length;
  },
  [types.UPDATE_CLIENT_OUTLIER](state, data) {
    let type = data[2];
    let propertyName = 'outlierClient-' + type;
    state.brushedClientStastics[data[0]][propertyName] = data[1];
    if (type === 'loss') {
      state.outlierClientLoss[data[0]] = data[1];
    } else {
      state.outlierClientAcc[data[0]] = data[1];
    }
    let outlierClientLossLength = Object.keys(state.outlierClientLoss).length;
    let outlierClientAccLength = Object.keys(state.outlierClientAcc).length;
    state.outlierClientInfoLength = [outlierClientLossLength, outlierClientAccLength];
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
