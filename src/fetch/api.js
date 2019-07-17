import axios from 'axios'

axios.defaults.timeout = 10000;
axios.defaults.baseURL = 'http://localhost:8000';

// axios请求拦截器，统一处理request
axios.interceptors.request.use((config) => {
  return config;
}, (error) => {
  return Promise.reject(error);
});

// axios返回结果拦截器，返回状态判断
axios.interceptors.response.use((res) => {
  return res;
}, (error) => {
  return Promise.reject(error);
});

function fetchGet (url, param) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: param
    })
      .then(response => {
        if ((typeof response.data) === 'string') {
          resolve(JSON.parse(response.data))
        }
        resolve(response.data)
      }, err => {
        reject(err)
      })
      .catch((error) => {
        reject(error);
      })
  })
}

export default {
  ServerInfo () {
    return fetchGet('/serverinfo');
  },
  ServerPara (iter) {
    return fetchGet(`/serverparabyiter/${iter}`);
  },

  ClientInfoByIndex (index) {
    return fetchGet(`/clientinfobyindex/${index}`);
  },

  ClientInfoByIter (iter) {
    return fetchGet(`/clientinfobyiter/${iter}`);
  },

  ClientStasticsRange (miniter, maxiter) {
    return fetchGet(`/clientstastics/${miniter}/${maxiter}`);
  },
  ClientParaByIterIndex (iter, index) {
    return fetchGet(`/clientparabyiterindex/${iter}/${index}`);
  }
}
