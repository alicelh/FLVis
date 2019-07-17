import store from '@/store'

export function getMatrixData(data, count) {
  let result = [];
  let serverb, serverw, clientb, clientw, tmpresult;
  let i = 0;
  let edges = [];
  let nodes = [];
  for (i = 0; i < count; i++) {
    serverb = data['server']['b' + i];
    serverw = data['server']['w' + (i + 1)];
    clientb = data['client']['b' + i];
    clientw = data['client']['w' + (i + 1)];
    edges = [];
    nodes = [];
    let len1 = serverw.length;
    for (let j = 0; j < len1; j++) {
      let nodetmp = {};
      nodetmp['id'] = '_' + i + '_' + j;
      let bias = {}
      if (i === 0) {
        bias['server'] = 0;
        bias['client'] = 0;
      } else {
        bias['server'] = serverb[j];
        bias['client'] = clientb[j];
      }
      nodetmp['bias'] = bias;
      nodes.push(nodetmp);

      let len2 = serverw[0].length;
      for (let k = 0; k < len2; k++) {
        let edgetmp = {}
        edgetmp['source'] = '_' + i + '_' + j;
        edgetmp['target'] = '_' + (i + 1) + '_' + k;
        let weight = {};
        weight['server'] = serverw[j][k];
        weight['client'] = clientw[j][k];
        edgetmp['weight'] = weight;
        edges.push(edgetmp);
      }
    }
    tmpresult = {
      'nodes': nodes,
      'edges': edges
    };
    result.push(tmpresult);
  }
  serverb = data['server']['b' + i];
  clientb = data['client']['b' + i];
  let len = serverb.length;
  nodes = [];
  for (let j = 0; j < len; j++) {
    let nodetmp = {};
    nodetmp['id'] = '_' + i + '_' + j;
    let bias = {}
    bias['server'] = serverb[j];
    bias['client'] = clientb[j];
    nodetmp['bias'] = bias;
    nodes.push(nodetmp);
  }
  tmpresult = {
    'nodes': nodes,
    'edges': []
  };
  result.push(tmpresult);
  return result;
}
