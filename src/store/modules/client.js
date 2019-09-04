import * as types from '../types'
import api from '@/fetch/api'
import model from './model'
import server from './server'

const state = {
  clientpara: [], // 存选中的client 以及它和server的差值
  clientparalist: [],
  w1: [],
  b1: [],
  projectdata: {
    "pos": [],
    "idList": []
  },
  choosedclient: -1,
  choosedclientiter: 0, // 在哪一次迭代选择的client
  choosedClientInProjection: -1, // 在投影视图中选择的client
  clientConfusionMatrix: [],
  choosediter: 2, // 选择盒须图上的某一次迭代
  choosedIterForProjection: 0, // 选择迭代面板中的某一次
  clientInfo: {}, // main view中的
  deleteiter: -1,
  selectedClientInfo: [],
  clientHoveredInMain: -1,
  // 聚合后的结果
  tempClient: [],
  tempServer: [],
  paranum: 0,
  serverparaTemp: [],
  serverpara: []
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
    console.log(iter, indexarr);
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
  },
  getConfusionMatrix({
    commit
  }, context) {
    api.ConfusionMatrixByIterClientIndex(state.choosedIterForProjection, context)
      .then(res => {
        commit(types.GET_CONFUSION_MATRIX_BY_ITER_CLIENT_INDEX, [context, res]);
      })
  },
  updateClientHoveredInMain({
    commit
  }, context) {
    commit(types.UPDATE_CLIENT_HOVERED_INMAIN, context);
  },
  getServerParaTemp({
    commit
  }, context) {
    api.ServerPara(context[0]).then(res => {
      commit(types.GET_SERVER_PARA_TEMP, res)
    });
    api.ClientParaByIterIndex(context[0], context[1])
      .then(res => {
        commit(types.GET_CLIENT_PARA, res)
      })
  }
}

const mutations = {
  [types.GET_SERVER_PARA_TEMP](state, data) {
    state.serverparaTemp = data;
    state.serverpara = data;
    // state.paranum = state.serverparaTemp.length;
  },
  [types.GET_CLIENT_PARA](state, data) {
    // state.clientpara[0] = data; // 选中的client
    let serverpara = state.serverparaTemp;//server.state.copyserverpara;
    // state.clientpara[1] = [];
    // for (let i = 0; i < serverpara.length; i++) {
    //   state.clientpara[1][i] = data[i] - serverpara[i]; // 与server的差值
    // }
    // 压缩 先取个绝对值
    state.tempServer = [];
    state.tempClient = [];
    let i = 0;
    let len = 10; // 聚合的最大长度
    for (i = 0; i < serverpara.length;) {
      if (Math.abs(data[i] - 0) < 0.1 && Math.abs(serverpara[i] - 0) < 0.1) {
        while (Math.abs(data[i] - 0) < 0.1 && Math.abs(serverpara[i] - 0) < 0.1) {
          i++;
        }
        state.tempServer.push(0);
        state.tempClient.push(0);
      } else if (data[i] > 0 && serverpara[i] > 0) {
        while (data[i] > 0 && serverpara[i] > 0) {
          let tempServerSum = 0;
          let tempClientSum = 0;
          let tempLen = 0;
          while (data[i] > 0 && serverpara[i] > 0 && tempLen < len) {
            tempClientSum += data[i];
            tempServerSum += serverpara[i];
            tempLen++;
            i++;
          }
          state.tempServer.push(tempServerSum);
          state.tempClient.push(tempClientSum);
        }
      } else if (data[i] < 0 && serverpara[i] < 0) {
        while (data[i] < 0 && serverpara[i] < 0) {
          let tempServerSum = 0;
          let tempClientSum = 0;
          let tempLen = 0;
          while (data[i] < 0 && serverpara[i] < 0 && tempLen < len) {
            tempClientSum += data[i];
            tempServerSum += serverpara[i];
            tempLen++;
            i++;
          }
          state.tempServer.push(tempServerSum);
          state.tempClient.push(tempClientSum);
        }
      } else {
        state.tempServer.push(serverpara[i]);
        state.tempClient.push(data[i]);
        i++;
      }
    }
    state.paranum = state.tempServer.length;
    // console.log(j, state.tempServer, state.tempClient, state.paranum);
    state.clientpara[0] = state.tempClient;
    // 选了client之后 改一下server的信息
    state.serverpara = state.tempServer;

    // server.state.serverpara = state.tempServer;
    // server.state.paranum = state.paranum;
    // 求差值
    state.clientpara[1] = [];
    for (let i = 0; i < state.paranum; i++) {
      state.clientpara[1][i] = Math.abs(state.tempClient[i] - state.tempServer[i]); // 与server的差值 取绝对值
    }
  },
  // 暂时没有用
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
  },
  [types.GET_CONFUSION_MATRIX_BY_ITER_CLIENT_INDEX] (state, data) {
    state.choosedClientInProjection = data[0];
    // console.log(data[0], data[1]);
    state.clientConfusionMatrix = data[1];
  },
  [types.UPDATE_CLIENT_HOVERED_INMAIN] (state, data) {
    state.clientHoveredInMain = data;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
