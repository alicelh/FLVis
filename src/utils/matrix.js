import * as d3 from 'd3';
import $ from 'jquery';
import d3Tip from 'd3-tip';

d3.tip = d3Tip;

var rectInMatrixWave = 10; // 每个小矩形的边长
var dataInStep = [];

var Matrix = function (data) {
  this.divId = 'matrixWave';
  console.log(data);
  dataInStep = data;
  this.nodeGroupDiv = 'nodeGroupSvgDiv';
  this.selectedElements = {};
  this.selectedElements['elements'] = [];
  this.selectedElements['eventInSetA'] = [];
  this.selectedElements['eventInSetB'] = [];
  this.selectedElements['relatedNode'] = {};
  this.selectedElements['relatedLink'] = {};
  this.clickStrokeColor = 'yellow';
  this.durationTime = 1000;
  this.labelColor = d3.scaleOrdinal(d3.schemeCategory10);
  this.config();
  this.init();
  // this.zoomPan();

  this.drawLabel();
  this.getStepPlace();
  this.getNodeRectSize();
  this.drawMatrixWave();
};

Matrix.prototype.config = function () {
  let self = this;
  self.nodeLabelDivId = 'nodeLabel';
  self.nodeColorDivId = 'nodeColorLabel';
  self.nodeMaxText = 'nodeMaxText';
  self.linkLabelDivId = 'linkLabel';
  self.linkColorDivId = 'linkColorLabel';
  self.linkMaxText = 'linkMaxText';
  self.nodeTip();
  self.linkTip();

  self.rectFill = 'rgb(115, 118, 115)';

  self.width = $('#' + self.divId).width() * 0.98;
  self.height = $('#' + self.divId).height() * 0.98;
  self.margin = {
    'top': self.height * 0.15,
    'bottom': self.height * 0.05,
    'left': self.width * 0.1,
    'right': self.width * 0.05
  };
  self.rect = rectInMatrixWave;
  self.labelRect = 10; // 中间小方框最大宽度
  self.textRectWidth = self.rect * 2; // 神经元图形宽度
  self.textRectHeight = self.rect;
  self.stepCircleSize = self.rect * 1.0;
};

Matrix.prototype.zoomPan = function () {
  window.panZoomInstance = svgPanZoom('#matrixwaveSvg', {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: true,
    center: true,
    minZoom: 0.1,
    zoomScaleSensitivity: 0.1,
    panEnabled: true,
    onZoom: function (newZoom) {},
    onPan: function (newPan) {}
  });
};

Matrix.prototype.init = function () {
  let self = this;
  self.getDragBoxSize();
  d3.select('#' + self.divId).selectAll('svg').remove();

  self.svg = d3.select('#' + self.divId)
    .append('svg')
    .attr('id', 'matrixwaveSvg')
    .attr('width', self.width)
    .attr('height', self.height);

  // self.dragBox = self.svg.append('rect')
  //   .attr('id', 'dragBox')
  //   .attr('width', self.dragBoxWidth)
  //   .attr('height', self.dragBoxHeight)
  //   // .attr("cursor", "move")
  //   .attr('fill-opacity', 0);

  self.gMatrixWave = self.svg.append('g')
    .attr('class', 'gMatrixWave')
    .attr('transform', function () {
      return 'translate(' + (self.margin.left) + ',' + (self.height * 0.4) + ') ' + 'rotate(-45)';
    });
};

Matrix.prototype.drawLabel = function () {
  let self = this;
  // 绘制Label. 因为表格中每列的大小会随着绘画的东西发生变化。因此，画完所有的内容之后，调用一次drawNodeLabel。
  // 这里的调用顺序不要动。可以将每个div的大小输出，查看div的大小变化情况。
  self.getNodeScale();
  self.getLinkScale();
  self.drawNodeLabel();
  self.drawNodeColorLabel();
  self.drawLinkColorLabel();
  // self.drawLinkLabel();
  self.drawNodeLabel();
};

Matrix.prototype.nodeTip = function () {
  let self = this;
  self.nodeTip = d3.tip()
    .attr('class', function (d) {
      return 'd3-tip';
    })
    .offset([10, 60])
    .direction('s')
    .html(function (d) {
      let textMessage;
      if (d['volume']['percentage'] == undefined) {
        let percentage = (d['volume']['setA'] - d['volume']['setB']) / (d['volume']['setA'] + d['volume']['setB']);

        percentage = percentage * 100;
        if (percentage > 0) {
          percentage = percentage.toFixed(2);
          percentage = '+' + percentage + '%';
          d['volume']['percentage'] = percentage;
        }
        if (percentage < 0) {
          percentage = percentage.toFixed(2);
          percentage = percentage + '%';
          d['volume']['percentage'] = percentage;
        }
        if (percentage == 0) {
          percentage = percentage + '%';
          d['volume']['percentage'] = percentage;
        }
      }

      textMessage = '<p>Pages: ' + d['id'] + '</p>';
      textMessage += '<p>Visitors: ' + d['volume']['setA'] + ' ' + d['volume']['setB'] +
        ' (' + d['volume']['percentage'] + ') </p>';
      return textMessage;
    });
};

Matrix.prototype.linkTip = function () {
  let self = this;
  self.linkTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([10, 60])
    .direction('s')
    .html(function (d) {
      let textMessage;
      let percentage;
      if (d['volume']['percentage'] == undefined) {
        percentage = (d['volume']['setA'] - d['volume']['setB']) / (d['volume']['setA'] + d['volume']['setB']);
        percentage = percentage * 100;
        if (percentage > 0) {
          percentage = percentage.toFixed(2);
          percentage = '+' + percentage + '%';
        }
        if (percentage == 0) {
          percentage = percentage + '%';
        }
        if (percentage < 0) {
          percentage = percentage.toFixed(2);
          percentage = percentage + '%';
        }
        d['volume']['percentage'] = percentage;
      }
      textMessage = '<p>From: ' + d['source'] + ' To: ' + d['target'] + '</p>';
      textMessage += '<p>Visitors: ' + d['volume']['setA'] + ' ' + d['volume']['setB'] +
        ' (' + d['volume']['percentage'] + ') </p>';
      return textMessage;
    });
};

Matrix.prototype.getDragBoxSize = function () {
  let self = this;
  let len;
  self.dragBoxWidth = 0;
  self.dragBoxHeight = 0;
  if (dataInStep.length === 0) {
    self.dragBoxWidth = self.width;
    self.dragBoxHeight = self.height;
  } else {
    for (let i = 0; i < dataInStep.length; i++) {
      len = dataInStep[i]['nodes'].length;
      if (i % 2 === 1) {
        self.dragBoxWidth += len * self.rect;
        self.dragBoxWidth += self.textRectWidth;
      }
      if (i % 2 === 0) {
        self.dragBoxHeight += len * self.rect;
        self.dragBoxHeight += self.textRectWidth;
      }
    }
    self.dragBoxWidth = self.dragBoxWidth + self.margin.left + self.margin.right;
    self.dragBoxHeight = self.dragBoxHeight + self.margin.top + self.margin.bottom;
  }

  if (self.dragBoxWidth < self.width) {
    self.dragBoxWidth = self.width;
  }
  if (self.dragBoxHeight < self.height) {
    self.dragBoxHeight = self.height;
  }
};

Matrix.prototype.getStepPlace = function () {
  let self = this;
  let width = self.textRectWidth * 2;
  let height = 0;
  let len = dataInStep.length - 1;
  for (let i = 0; i < len; i++) {
    if (dataInStep[i]['place'] === undefined) {
      dataInStep[i]['place'] = {};
    }
    dataInStep[i]['place']['x'] = width;
    dataInStep[i]['place']['y'] = height;
    if (i % 2 === 0) {
      height += (dataInStep[i]['nodes'].length * self.rect + self.textRectWidth * 2);
    }
    if (i % 2 === 1) {
      width += (dataInStep[i]['nodes'].length * self.rect + self.textRectWidth * 2);
    }
  }
};

Matrix.prototype.getNodeScale = function () {
  let self = this;
  self.getNodeVolumeMax();
  let max = d3.max([Math.abs(self.nodeVolumeMin), self.nodeVolumeMax]);
  self.nodeScale = d3.scaleLinear()
    .domain([-max, 0, max])
    .range([self.labelRect * 2.5, 0, self.labelRect * 2.5]);
};

Matrix.prototype.getLinkScale = function () {
  let self = this;
  self.getlinkVolumeMax();
  let min = self.linkVolumeMin;
  let max = self.linkVolumeMax;
  self.linkColorScale = d3.scaleThreshold()
    .domain([min, 3 * min / 4, min / 2, min / 4, 0, max / 4, max / 2, max * 3 / 4, max])
    .range(['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'])
};

Matrix.prototype.getNodeVolumeMax = function () {
  let self = this;
  let nodeSet = Array.prototype.concat(...dataInStep.map(ns => {
    return Array.prototype.concat(...ns.nodes.map(n => Object.values(n.bias)));
  }));
  self.nodeVolumeMax = d3.max(nodeSet);
  self.nodeVolumeMin = d3.min(nodeSet);
}

Matrix.prototype.getlinkVolumeMax = function () {
  let self = this;
  let edgeSet = Array.prototype.concat(...dataInStep.map(es => Array.prototype.concat(...es.edges.map(e => Object.values(e.weight)))));
  self.linkVolumeMax = d3.max(edgeSet);
  self.linkVolumeMin = d3.min(edgeSet);
}

Matrix.prototype.drawNodeLabel = function () {
  let self = this;
  // 这里先设置一个最小bias,否则legend里面画不出来最短的那个
  let minBias = 0.1;
  if (document.getElementById(self.nodeMaxText) != null) {
    document.getElementById(self.nodeMaxText).innerHTML = self.nodeVolumeMax;
  }
  // 表格中每列的大小会随着你绘画的东西发生变化。好烦。
  if (self.nodeLabel !== undefined) {
    self.nodeLabel.svg.remove();
  } else {
    self.nodeLabel = {};
  }
  self.nodeLabel.width = $('#' + self.nodeLabelDivId).width() - 3;
  self.nodeLabel.margin = {
    'top': 2,
    'bottom': 2,
    'left': 0,
    'right': 5
  };
  self.nodeLabel.xScale = d3.scaleLinear()
    .domain([0, 10]) // 长条宽度只有10种
    .range([0, self.nodeLabel.width - self.nodeLabel.margin.right]);
  if (self.nodeColorLabel !== undefined) {
    self.nodeLabel.xScale = self.nodeColorLabel.xScale;
  }

  d3.select('#' + self.nodeLabelDivId).selectAll('svg').remove();

  self.nodeLabel.svg = d3.select('#' + self.nodeLabelDivId)
    .append('svg')
    .attr('width', self.nodeLabel.width + self.nodeLabel.margin.left + self.nodeLabel.margin.right)
    .attr('height', self.nodeLabel.margin.top + self.nodeLabel.margin.bottom + self.textRectWidth * 2);
  self.nodeLabel.gLabel = self.nodeLabel.svg.append('g')
    .attr('class', 'gNodeLabel')
    .attr('transform', 'translate(' + self.nodeLabel.margin.left + ',' + self.nodeLabel.margin.top + ')');
  for (let i = 0; i < 10; i++) {
    self.nodeLabel.gLabel.append('rect')
      .datum(i)
      .attr('x', function (d) {
        return self.labelRect * i;
      })
      .attr('y', function (d, i) {
        if (d === 0) {
          return self.labelRect * 2.5 - self.nodeScale(minBias);
        } else {
          return self.labelRect * 2.5 - self.nodeScale(self.nodeVolumeMax / 10 * d);
        }
      })
      .attr('width', self.labelRect)
      .attr('height', function (d, i) {
        if (d === 0) {
          return self.nodeScale(minBias) * 2;
        } else {
          return self.nodeScale(self.nodeVolumeMax / 10 * d) * 2;
        }
      })
      .attr('fill', 'white')
      .attr('stroke', 'black');
  }
};

Matrix.prototype.drawNodeColorLabel = function () {
  let self = this;
  if (self.nodeColorLabel !== undefined) {
    self.nodeColorLabel.svg.remove();
  } else {
    self.nodeColorLabel = {};
    self.nodeColorLabel.width = $('#' + self.nodeColorDivId).width() - 3;

    self.nodeColorLabel.margin = {
      'top': 10,
      'bottom': 2,
      'left': 0,
      'right': 5
    };
    self.nodeColorLabel.xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, self.nodeColorLabel.width - self.nodeColorLabel.margin.right - 3]);
  }

  d3.select('#' + self.nodeColorDivId).selectAll('svg').remove();
  self.nodeColorLabel.svg = d3.select('#' + self.nodeColorDivId)
    .append('svg')
    .attr('width', self.nodeColorLabel.margin.left + self.nodeColorLabel.margin.right + self.nodeColorLabel.width)
    .attr('height', self.nodeColorLabel.margin.top + self.nodeColorLabel.margin.bottom + self.labelRect);
  self.nodeColorLabel.gNodeColor = self.nodeColorLabel.svg.append('g')
    .attr('class', 'gNodeColor')
    .attr('transfrom', 'translate(' + self.nodeColorLabel.margin.left + ',' + self.nodeColorLabel.margin.top + ')');
  for (let i = 0; i <= 10; i++) {
    self.nodeColorLabel.gNodeColor.append('rect')
      .datum(i)
      .attr('x', function (d, i) {
        return self.nodeColorLabel.xScale(d);
      })
      .attr('y', function (d, i) {
        return 0;
      })
      .attr('width', function (d, i) {
        return self.labelRect;
      })
      .attr('height', function (d, i) {
        return self.labelRect;
      })
      .attr('stroke', 'black')
      .attr('fill', function (d, i) {
        // d = (+d);
        // let num = 2 * d - 10;
        // num = num * 0.1;
        // num = num.toFixed(1);
        // return colorSelected['selection'][num];
        return 'red';
      });
  }
};

// legend
Matrix.prototype.drawLinkColorLabel = function () {
  let self = this;
  if (self.linkColorLabel !== undefined) {
    self.linkColorLabel.svg.remove();
    self.linkColorLabel = {};
  }
  self.linkColorLabel = {};
  self.linkColorLabel.width = $('#' + self.linkColorDivId).width() - 3;
  self.linkColorLabel.margin = {
    'top': 2,
    'bottom': 2,
    'left': 0,
    'right': 5
  };
  self.linkColorLabel.xScale = self.nodeColorLabel.xScale;

  d3.select('#' + self.linkColorDivId).selectAll('svg').remove();
  self.linkColorLabel.svg = d3.select('#' + self.linkColorDivId)
    .append('svg')
    .attr('width', self.linkColorLabel.margin.left + self.linkColorLabel.margin.right + self.nodeColorLabel.width)
    .attr('height', self.linkColorLabel.margin.top + self.linkColorLabel.margin.bottom + self.labelRect);
  self.linkColorLabel.gNodeColor = self.linkColorLabel.svg.append('g')
    .attr('class', 'gNodeColor')
    .attr('transfrom', 'translate(' + self.linkColorLabel.margin.left + ',' + self.nodeColorLabel.margin.top + ')');
  for (let i = 0; i <= 10; i++) {
    self.linkColorLabel.gNodeColor.append('rect')
      .datum(i)
      .attr('x', function (d, i) {
        return self.linkColorLabel.xScale(d);
      })
      .attr('y', function (d, i) {
        return 0;
      })
      .attr('width', function (d, i) {
        return self.labelRect;
      })
      .attr('height', function (d, i) {
        return self.labelRect;
      })
      .attr('stroke', 'black')
      .attr('fill', function (d, i) {
        // d = (+d);
        // let num = 2 * d - 10;
        // num = num * 0.1;
        // num = num.toFixed(1);
        // return colorSelected['selection'][num];
        return 'red';
      });
  }
};

Matrix.prototype.drawLinkLabel = function () {
  let self = this;
  let minWeight = 0.1;
  if (document.getElementById(self.linkMaxText) != null) {
    document.getElementById(self.linkMaxText).innerHTML = self.linkVolumeMax;
  }

  if (self.linkLabel !== undefined) {
    self.linkLabel.svg.remove();
    self.linkLabel = {};
  }
  self.linkLabel = {};
  self.linkLabel.width = $('#' + self.linkLabelDivId).width() - 3;
  self.linkLabel.margin = {
    'top': 2,
    'bottom': 2,
    'left': 0,
    'right': 5
  };
  self.linkLabel.xScale = self.nodeColorLabel.xScale;

  d3.select('#' + self.linkLabelDivId).selectAll('svg').remove();
  self.linkLabel.svg = d3.select('#' + self.linkLabelDivId)
    .append('svg')
    .attr('width', self.linkLabel.width + self.linkLabel.margin.left + self.linkLabel.margin.right)
    .attr('height', self.labelRect + self.linkLabel.margin.top + self.linkLabel.margin.bottom);
  self.linkLabel.gLinkLabel = self.linkLabel.svg.append('g')
    .attr('class', 'gLinkLabel')
    .attr('transform', 'translate(' + self.linkLabel.margin.left + ',' + self.linkLabel.margin.top + ')');
  for (let i = 0; i <= 10; i++) {
    self.linkLabel.gLinkLabel.append('rect')
      .datum(i)
      .attr('x', function (d, i) {
        return self.linkLabel.xScale(d);
      })
      .attr('y', function (d, i) {
        if (d === 0) {
          return self.labelRect / 2 - self.linkScale(minWeight) / 2;
        } else {
          return self.labelRect / 2 - self.linkScale(self.linkVolumeMax / 10 * d) / 2;
        }
      })
      .attr('width', function (d, i) {
        return self.labelRect;
      })
      .attr('height', function (d, i) {
        if (d === 0) {
          return self.linkScale(minWeight);
        } else {
          return self.linkScale(self.linkVolumeMax / 10 * d);
        }
      })
      .attr('stroke', 'black')
      .attr('fill', 'whitesmoke');
  }
};

Matrix.prototype.drawMatrixWave = function () {
  let self = this;
  self.matrixWave = [];
  let len = dataInStep.length - 1;
  for (let i = 0; i < len; i++) {
    self.matrixWave.push(self.drawMatrix(i, i + 1));
    self.drawMatrixRect(i); // 这个操作在drawMatrix中已进行,重复画是为了颜色加重
    self.drawLink(i);
  }
  self.drawNodeRect();

  self.drawMatrixWaveLabel();

  // self.isShowMatrixGrid();
  // self.isShowMatrixWaveLabel();

  self.drawStepCircleLabel();
};

Matrix.prototype.getStepMatrixSize = function (step1, step2) {
  let self = this;
  step1 = (+step1);
  step2 = (+step2);
  let lenRealStep1 = dataInStep[step1]['nodes'].length;
  let lenRealStep2 = dataInStep[step2]['nodes'].length;
  let lenStep1 = 0;
  let lenStep2 = 0;
  let node;
  // for (let i = 0; i < lenRealStep1; i++) {
  //   node = dataInStep[step1]['nodes'][i]['id'];
  //   if (nodeSet[node] !== undefined) {
  //     lenStep1++;
  //   }
  // }

  // for (let i = 0; i < lenRealStep2; i++) {
  //   node = dataInStep[step2]['nodes'][i]['id'];
  //   if (nodeSet[node] !== undefined) {
  //     lenStep2++;
  //   }
  // }
  lenStep1 = lenRealStep1;
  lenStep2 = lenRealStep2;

  // let step = 'step' + step1;
  dataInStep[step1]['rectWidth'] = 0;
  dataInStep[step1]['rectHeight'] = 0;
  if (step1 % 2 === 0) {
    dataInStep[step1]['rectWidth'] = lenStep2 * self.rect;
    dataInStep[step1]['rectHeight'] = lenStep1 * self.rect;
  }
  if (step1 % 2 === 1) {
    dataInStep[step1]['rectWidth'] = lenStep1 * self.rect;
    dataInStep[step1]['rectHeight'] = lenStep2 * self.rect;
  }
};

Matrix.prototype.drawMatrix = function (step1, step2) {
  let self = this;
  let name;
  let node1, node2;
  step1 = (+step1);
  step2 = (+step2);
  self.getStepMatrixSize(step1, step2); // 计算每个矩阵大小

  let lenStep1 = dataInStep[step1]['nodes'].length;
  let lenStep2 = dataInStep[step2]['nodes'].length;

  let step = 'step' + step1;

  let gMatrix = self.gMatrixWave.append('g')
    .attr('class', 'step' + step1)
    .attr('transform', 'translate(' + dataInStep[step1]['place']['x'] + ',' + dataInStep[step1]['place']['y'] + ')');
  // 画每个step的大框框
  gMatrix.append('rect')
    .attr('class', 'matrix' + step1)
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', function (d, i) {
      return dataInStep[step1]['rectWidth'];
    })
    .attr('height', function (d, i) {
      return dataInStep[step1]['rectHeight'];
    })
    .attr('fill-opacity', 0)
    .attr('stroke', 'black')
    .attr('stroke-dasharray', '8 8');

  // 画每个小矩形
  if (step1 % 2 === 0) {
    for (let i = 0; i < lenStep1; i++) {
      node1 = dataInStep[step1]['nodes'][i];
      for (let j = 0; j < lenStep2; j++) {
        node2 = dataInStep[step2]['nodes'][j];
        gMatrix.append('g')
          .call(self.linkTip)
          .attr('class', step + 's' + node1['id'] + 't' + node2['id'] + ' linkCell')
          .classed('s' + node1['id'], true)
          .classed('t' + node2['id'], true)
          .attr('step', step1)
          .attr('transform', function () {
            // dataInStep[step1]['nodes'][i]['orderIndex'] = (+dataInStep[step1]['nodes'][i]['orderIndex']);
            let y = node1['orderIndex'] * self.rect;
            // dataInStep[step2]['nodes'][j]['orderIndex'] = (+dataInStep[step2]['nodes'][j]['orderIndex']);
            let x = node2['orderIndex'] * self.rect;
            return 'translate(' + x + ',' + y + ')';
          })
          .append('rect')
          .attr('class', step + 's' + node1['id'] + 't' + node2['id'] + ' linkCell')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', self.rect)
          .attr('height', self.rect)
          .attr('fill', 'blue')
          .attr('stroke', 'blue');
        // }
      }
      // }
    }
  } else {
    for (let i = 0; i < lenStep2; i++) {
      node1 = dataInStep[step2]['nodes'][i];
      for (let j = 0; j < lenStep1; j++) {
        node2 = dataInStep[step1]['nodes'][j];
        // if (nodeSet[node] != undefined) {
        name = step + 's' + node2['id'] + 't' + node1['id'] + ' linkCell';
        gMatrix.append('g')
          .call(self.linkTip)
          .attr('class', name)
          .classed('s' + node2['id'], true)
          .classed('t' + node1['id'], true)
          .attr('step', step1)
          .attr('transform', function () {
            // dataInStep[step2]['nodes'][i]['orderIndex'] = (+dataInStep[step2]['nodes'][i]['orderIndex']);
            let y = node2['orderIndex'] * self.rect;
            // dataInStep[step1]['nodes'][j]['orderIndex'] = (+dataInStep[step1]['nodes'][j]['orderIndex']);
            let x = node1['orderIndex'] * self.rect;
            return 'translate(' + x + ',' + y + ')';
          })
          .append('rect')
          .attr('class', name)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', self.rect)
          .attr('height', self.rect)
          .attr('fill', 'rgb(255, 255, 255)')
          .attr('stroke', 'white')
          .append('title')
          .text(name);
        // }
      }
      // }
    }
  }
  return gMatrix;
};

Matrix.prototype.getLinkSizeAndColor = function (step1) {
  let self = this;
  step1 = (+step1);
  let lenLink = dataInStep[step1]['edges'].length;
  let size;
  let difference;
  for (let i = 0; i < lenLink; i++) {
    // size = (dataInStep[step1]['edges'][i]['volume']['setA'] + dataInStep[step1]['edges'][i]['volume']['setB']) / 2;
    // dataInStep[step1]['edges'][i]['size'] = self.linkScale(size);
    // difference = (dataInStep[step1]['edges'][i]['volume']['setA'] - dataInStep[step1]['edges'][i]['volume']['setB']) / (dataInStep[step1]['edges'][i]['volume']['setA'] + dataInStep[step1]['edges'][i]['volume']['setB']);
    // difference = difference.toFixed(1);
    // difference = difference * 10;
    // if (difference % 2 != 0) {
    //   difference++;
    // }
    // difference = difference / 10;
    // difference = difference.toFixed(1);
    // dataInStep[step1]['edges'][i]['color'] = colorSelected['selection'][difference];
    // dataInStep[step1]['edges'][i]['colorSize'] = difference;
    // dataInStep[step1]['edges'][i]['size'] = self.linkScale(dataInStep[step1]['edges'][i]['weight']['server']);
    dataInStep[step1]['edges'][i]['color'] = 'red';
    dataInStep[step1]['edges'][i]['colorSize'] = 1;
  }
};

Matrix.prototype.drawLink = function (step1) {
  let self = this;
  step1 = (+step1);
  self.getLinkSizeAndColor(step1);
  let lenLink = dataInStep[step1]['edges'].length;
  let name;
  let sourceNode;
  let targetNode;
  let edge;
  for (let i = 0; i < lenLink; i++) {
    let tmpdata = dataInStep[step1]['edges'][i];
    sourceNode = tmpdata['source'];
    targetNode = tmpdata['target'];
    edge = tmpdata['id'];
    // if (nodeSet[sourceNode] != undefined && nodeSet[targetNode] != undefined && edgeSet[edge] != undefined) {
    name = 'step' + step1 + 's' + tmpdata['source'] + 't' + tmpdata['target'];
    self.matrixWave[step1].select('g.' + name)
      .append('rect')
      .datum(tmpdata)
      .attr('class', 'rectInRect' + name)
      .attr('x', function (d, i) {
        return 0.5;
      })
      .attr('y', function (d, i) {
        return 0.5;
      })
      .attr('width', function (d, i) {
        return self.rect / 2 - 0.5;
      })
      .attr('height', function (d, i) {
        return self.rect - 1;
      })
      .attr('fill', function (d, i) {
        console.log(d.weight['client']);
        return self.linkColorScale(d.weight['client']);
      })
    // .attr('stroke', 'white');

    self.matrixWave[step1].select('rect.' + name)
      .datum(dataInStep[step1]['edges'][i])
      .attr('fill', function (d, i) {
        return self.linkColorScale(d.weight['server']);
      })
      .attr('stroke', 'white');

    // 交互就先不加了
    // self.matrixWave[step1].select('g.' + name)
    //   .datum(dataInStep[step1]['edges'][i])
    //   .on('mouseover', function (d, i) {
    //     self.linkTip.show(d);
    //     let index;
    //     index = d3.select(this).attr('step');
    //     index = (+index);
    //     self.linkHoverHighlight(d['source'], d['target'], index);
    //   })
    //   .on('mouseout', function (d, i) {
    //     self.linkTip.hide(d);
    //     self.linkHoverOut();
    //   })
    //   .on('click', function (d, i) {
    //     let index;
    //     index = d3.select(this).attr('step');
    //     index = (+index);
    //     console.log('select link : from ' + d['source'] + ' to ' + d['target'] + ' step : ' + index);
    //     self.linkClick(d['source'], d['target'], index);
    // });
    // }
  }
};

Matrix.prototype.drawMatrixRect = function (step1) {
  let self = this;
  step1 = (+step1);
  self.matrixWave[step1].append('rect')
    .attr('class', 'matrix' + step1)
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', function (d, i) {
      return dataInStep[step1]['rectWidth'];
    })
    .attr('height', function (d, i) {
      return dataInStep[step1]['rectHeight'];
    })
    .attr('fill-opacity', 0)
    .attr('stroke', 'rgb(98, 97, 97)')
    .attr('stroke-dasharray', '8 8');
};

Matrix.prototype.drawNodeRect = function () {
  let self = this;
  self.matrixWaveNodeRect = [];
  let lenDataInStep = dataInStep.length - 1;
  for (let i = 0; i < lenDataInStep; i++) {
    self.matrixWaveNodeRect[i] = self.gMatrixWave.append('g')
      .attr('class', 'nodeStep' + i)
      .attr('transform', function () {
        return 'translate(' + dataInStep[i]['place']['x'] + ',' + dataInStep[i]['place']['y'] + ')';
      });
  }
  // 画最后一层
  if (lenDataInStep % 2 === 1) {
    self.matrixWaveNodeRect[lenDataInStep] = self.gMatrixWave.append('g')
      .attr('class', 'nodeStep' + lenDataInStep)
      .attr('transform', function (d, i) {
        return 'translate(' + dataInStep[lenDataInStep - 1]['place']['x'] + ',' +
          (dataInStep[lenDataInStep - 1]['place']['y'] + dataInStep[lenDataInStep - 1]['rectHeight'] + self.textRectWidth * 2) + ')';
      });
  }
  if (lenDataInStep % 2 === 0 && lenDataInStep !== 0) {
    self.matrixWaveNodeRect[lenDataInStep] = self.gMatrixWave.append('g')
      .attr('class', 'nodeRect' + lenDataInStep)
      .attr('transform', function (d, i) {
        return 'translate(' + (dataInStep[lenDataInStep - 1]['place']['x'] + dataInStep[lenDataInStep - 1]['rectWidth'] + self.textRectWidth * 2) + ',' +
          dataInStep[lenDataInStep - 1]['place']['y'] + ')';
      });
  }

  // draw each nodeRect
  lenDataInStep = dataInStep.length;
  let len;
  let node;
  for (let i = 0; i < lenDataInStep; i++) {
    len = dataInStep[i]['nodes'].length;
    for (let j = 0; j < len; j++) {
      node = dataInStep[i]['nodes'][j];
      self.matrixWaveNodeRect[i]
        .append('g')
        .datum(node)
        .attr('class', 'nodeRect' + i + ' ' + node['id'])
        .attr('transform', function (d) {
          let x, y;
          if (i % 2 === 0) {
            x = -(self.textRectWidth + d['nodeRectWidth']);
            y = self.rect * d['orderIndex'];
            x = x + d['nodeRectWidth'];
          } else {
            x = self.rect * d['orderIndex'];
            y = -(self.textRectWidth + d['nodeRectWidth']);
            y = y + d['nodeRectWidth'];
          }
          return 'translate(' + x + ',' + y + ')';
        });

      self.matrixWaveNodeRect[i].select('g.' + node['id'])
        .append('rect')
        .datum(node)
        .attr('class', d => 'rect' + i + ' ' + d['id'])
        .attr('x', function (d) {
          if (i % 2 === 0) {
            return -d['nodeRectWidth'];
          } else {
            return 0;
          }
        })
        .attr('y', function (d) {
          if (i % 2 === 1) {
            return -d['nodeRectWidth'];
          } else {
            return 0;
          }
        })
        .attr('width', function (d) {
          if (i % 2 === 0) {
            return d['nodeRectWidth'] * 2;
          } else {
            return self.rect;
          }
        })
        .attr('height', function (d) {
          if (i % 2 === 0) {
            return self.rect;
          } else {
            return d['nodeRectWidth'] * 2;
          }
        })
        .attr('fill', function (d) {
          return d['nodeRectColor'];
        })
        .attr('stroke', 'black');
      // self.matrixWaveNodeRect[i].select('g.' + dataInStep[i]['nodes'][j]['id'])
      //   .call(self.nodeTip)
      //   .on('mouseover', function () {
      //     let index;
      //     let p;
      //     let id;
      //     let idPlace;
      //     index = d3.select(this).attr('class');
      //     p = index.indexOf(' ');
      //     id = index.substring(p + 1);

      //     index = index.substring(p - 1, p);
      //     idPlace = self.findIdIndex(index, id);
      //     d = dataInStep[index]['nodes'][idPlace];
      //     self.nodeTip.show(d);
      //     self.nodeHoverHighlight(id, index);
      //   })
      //   .on('mouseout', function () {
      //     let index;
      //     let p;
      //     let id;
      //     let idPlace;
      //     index = d3.select(this).attr('class');
      //     p = index.indexOf(' ');
      //     id = index.substring(p + 1);

      //     index = index.substring(p - 1, p);
      //     idPlace = self.findIdIndex(index, id);
      //     d = dataInStep[index]['nodes'][idPlace];
      //     self.nodeTip.hide(d);
      //     self.nodeHoverOut(d['id']);
      //   })
      //   .on('click', function () {
      //     let index;
      //     let p;
      //     let id;
      //     let idPlace;
      //     index = d3.select(this).attr('class');
      //     p = index.indexOf(' ');
      //     id = index.substring(p + 1);

      //     index = index.substring(p - 1, p);
      //     idPlace = self.findIdIndex(index, id);
      //     d = dataInStep[index]['nodes'][idPlace];
      //     console.log('select the node: ' + d['id'] + ' step: ' + index);
      //     self.nodeClick(d['id'], index);
      //   });
      // }
    }
  }
};

Matrix.prototype.findIdIndex = function (step, id) {
  let self = this;
  step = (+step);
  let len = dataInStep[step]['nodes'].length;
  for (let i = 0; i < len; i++) {
    if (dataInStep[step]['nodes'][i]['id'] == id) {
      return i;
      break;
    }
  }
};

Matrix.prototype.getNodeRectSize = function () {
  let self = this;
  let lenDataInStep = dataInStep.length;
  let len;
  let size;
  let volumeA;
  let volumeB;
  for (let i = 0; i < lenDataInStep; i++) {
    len = dataInStep[i]['nodes'].length;
    for (let j = 0; j < len; j++) {
      // dataInStep[i]['nodes'][j]['volume']['setA'] = (+dataInStep[i]['nodes'][j]['volume']['setA']);
      // volumeA = dataInStep[i]['nodes'][j]['volume']['setA'];
      // dataInStep[i]['nodes'][j]['volume']['setB'] = (+dataInStep[i]['nodes'][j]['volume']['setB']);
      // volumeB = dataInStep[i]['nodes'][j]['volume']['setB'];
      // size = (volumeA + volumeB) / 2;
      // dataInStep[i]['nodes'][j]['nodeRectWidth'] = self.nodeScale(size);
      dataInStep[i]['nodes'][j]['nodeRectWidth'] = self.nodeScale(dataInStep[i]['nodes'][j]['bias']['server']);
      // size = (volumeA - volumeB) / (volumeA + volumeB);
      // size = size.toFixed(1);
      // size = size * 10;
      // if (size % 2 !== 0) {
      //   size = size + 1;
      // }
      // size = size / 10;
      // size = size.toFixed(1);
      // dataInStep[i]['nodes'][j]['nodeRectColor'] = colorSelected['selection'][size];
      dataInStep[i]['nodes'][j]['nodeRectColor'] = 'red';
      // dataInStep[i]['nodes'][j]['nodeRectColorSize'] = size;
      dataInStep[i]['nodes'][j]['nodeRectColorSize'] = dataInStep[i]['nodes'][j]['bias']['server'];
    }
  }
};

// draw step circle label
Matrix.prototype.drawStepCircleLabel = function () {
  let self = this;
  let len = self.matrixWaveNodeRect.length;
  for (let i = 0; i < len; i++) {
    self.matrixWaveNodeRect[i].append('g')
      .attr('class', 'stepIndexCircle stepIndex' + dataInStep[i]['stepIndex'])
      .attr('id', 'stepIndex' + dataInStep[i]['stepIndex'])
      .attr('stepIndex', dataInStep[i]['stepIndex'])
      .attr('transform', function () {
        if (i % 2 === 0) {
          return 'translate(' + (-self.textRectWidth) + ',' + (-self.stepCircleSize) + ')';
        } else {
          return 'translate(' + (-self.stepCircleSize) + ',' + (-self.textRectWidth) + ')';
        }
      })
      .attr('cursor', 'pointer')
      .append('circle')
      .attr('x', 0)
      .attr('y', 0)
      .attr('r', self.stepCircleSize)
      .attr('stroke', 'black')
      .attr('fill', 'white');
    self.matrixWaveNodeRect[i].select('#stepIndex' + dataInStep[i]['stepIndex'])
      .append('text')
      .attr('transform', function () {
        return 'translate(' + (-self.stepCircleSize * 0.3) + ',' + (self.stepCircleSize * 0.32) + ')';
      })
      .text(dataInStep[i]['stepIndex'])
      .attr('font-size', function () {
        return self.stepCircleSize * 0.9 + 'px';
      });

    // 点击圆圈交互
    // $('#stepIndex' + dataInStep[i]['stepIndex']).click(function (event) {
    //   if (event.shiftKey === false) {
    //     let stepSelected = d3.select(this).attr('stepIndex');
    //     stepSelected = (+stepSelected);
    //     if (unshowDataStep[stepSelected + 1] == undefined) {
    //       alert('This is the last step!');
    //     } else {
    //       if (unshowDataStep[stepSelected + 1] == false) {
    //         alert('The next step has been showed!');
    //       } else {
    //         unshowDataStep[stepSelected + 1] = false;
    //         if ((stepSelected + 1) > filterFactor['step2']) {
    //           filterFactor['step2'] = stepSelected + 1;
    //         }
    //         getShowData('update');
    //         setBar(0);
    //       }
    //     }
    //   } else {
    //     let stepSelected = d3.select(this).attr('stepIndex');
    //     stepSelected = (+stepSelected);
    //     let num = 0;
    //     for (let i = 1; i < unshowDataStep.length; i++) {
    //       if (unshowDataStep[i] == false) {
    //         num++;
    //       }
    //     }
    //     if (num > 2) {
    //       unshowDataStep[stepSelected] = true;
    //       if (stepSelected == filterFactor['step1']) {
    //         while (unshowDataStep[stepSelected + 1] == true && unshowDataStep[stepSelected + 1] != undefined) {
    //           stepSelected++;
    //         }
    //         if (unshowDataStep[stepSelected + 1] != undefined && unshowDataStep[stepSelected + 1] == false) {
    //           filterFactor['step1'] = stepSelected + 1;
    //         }
    //       } else {
    //         if (stepSelected == filterFactor['step2']) {
    //           while (unshowDataStep[stepSelected - 1] == true && unshowDataStep[stepSelected - 1] != undefined) {
    //             stepSelected--;
    //           }
    //           if (unshowDataStep[stepSelected - 1] != undefined && unshowDataStep[stepSelected - 1] == false) {
    //             filterFactor['step2'] = stepSelected - 1;
    //           }
    //         }
    //       }
    //       getShowData('update');
    //       setBar(0);
    //     } else {
    //       alert('Can`t delete the steps!');
    //     }
    //   }
    // });
  }
};

Matrix.prototype.updateLabel = function () {
  let self = this;
  self.getNodeScale();
  self.getLinkScale();
  document.getElementById(self.nodeMaxText).innerHTML = self.nodeVolumeMax;
  document.getElementById(self.linkMaxText).innerHTML = self.linkVolumeMax;
};

Matrix.prototype.updateLayout = function () {
  let self = this;

  self.gMatrixWave.selectAll('g').remove();

  self.updateLabel();
  self.getStepPlace();
  self.getNodeRectSize();
  self.drawMatrixWave();
};

// hover on the nodeRect, highlight related nodeRects and links
Matrix.prototype.nodeHoverHighlight = function (nodeId, step) {
  let self = this;
  step = (+step);
  let setARelatedArr = nodeSet[nodeId]['event']['setA'];
  let setALen = setARelatedArr.length;
  let setBRelatedArr = nodeSet[nodeId]['event']['setB'];
  let setBLen = setBRelatedArr.length;
  let index;
  let sequence;
  let name;

  if (self.svg.selectAll('rect.unselected')[0].length == 0) {
    self.svg.selectAll('rect').classed('unselected', 'true');
  }

  for (let i = 0; i < setALen; i++) {
    index = setARelatedArr[i];
    index = (+index);
    sequence = datasetA[index]['sequence'];
    if (sequence[step] == nodeId) {
      self.rectHighLighting(sequence);
    }
  }

  for (let i = 0; i < setBLen; i++) {
    index = setBRelatedArr[i];
    index = (+index);
    sequence = datasetB[index]['sequence'];
    if (sequence[step] == nodeId) {
      self.rectHighLighting(sequence);
    }
  }
};

Matrix.prototype.nodeHoverOut = function () {
  let self = this;
  self.svg.selectAll('rect').classed('unselected', false);

  // but the click selected elements should be highlight.
  self.elementsHighlighting();
};

Matrix.prototype.linkHoverHighlight = function (sourceId, targetId, step) {
  let self = this;
  step = (+step);
  let step1 = step;
  let step2 = step + 1;
  let linkId = sourceId + targetId;

  let setAEventArr = edgeSet[linkId]['event']['setA'];
  let setBEventArr = edgeSet[linkId]['event']['setB'];
  let setALen = setAEventArr.length;
  let setBLen = setBEventArr.length;
  let index;
  let name;
  let sequence;
  let sequenceLen;

  /* self.svg.selectAll("rect").classed("unselected", true);
  //the selected elements should be highlight.
  self.elementsHighlighting(); */
  if (self.svg.selectAll('rect.unselected')[0].length == 0) {
    self.svg.selectAll('rect').classed('unselected', true);
  }

  for (let i = 0; i < setALen; i++) {
    index = setAEventArr[i];
    index = (+index);
    sequence = datasetA[index]['sequence'];
    if (sequence[step1] == sourceId && sequence[step2] == targetId) {
      sequenceLen = sequence.length;
      for (let j = 0; j < sequenceLen - 1; j++) {
        self.matrixWaveNodeRect[j].select('rect.' + sequence[j])
          .classed('unselected', false);
        name = name = 'step' + j + 's' + sequence[j] + 't' + sequence[j + 1];
        self.matrixWave[j].select('rect.' + name)
          .classed('unselected', false);
        name = 'rectInRect' + name;
        self.matrixWave[j].select('rect.' + name)
          .classed('unselected', false);
      }
      self.matrixWaveNodeRect[sequenceLen - 1].select('rect.' + sequence[sequenceLen - 1])
        .classed('unselected', false);
    }
  }

  for (let i = 0; i < setBLen; i++) {
    index = setBEventArr[i];
    index = (+index);
    sequence = datasetB[index]['sequence'];
    if (sequence[step1] == sourceId && sequence[step2] == targetId) {
      sequenceLen = sequence.length;
      for (let j = 0; j < sequenceLen - 1; j++) {
        self.matrixWaveNodeRect[j].select('rect.' + sequence[j])
          .classed('unselected', false);
        name = name = 'step' + j + 's' + sequence[j] + 't' + sequence[j + 1];
        self.matrixWave[j].select('rect.' + name)
          .classed('unselected', false);
        name = 'rectInRect' + name;
        self.matrixWave[j].select('rect.' + name)
          .classed('unselected', false);
      }
      self.matrixWaveNodeRect[sequenceLen - 1].select('rect.' + sequence[sequenceLen - 1])
        .classed('unselected', false);
    }
  }
};

Matrix.prototype.linkHoverOut = function () {
  let self = this;
  self.svg.selectAll('rect').classed('unselected', false);

  // but the click selected elements should be highlight.
  self.elementsHighlighting();
};

Matrix.prototype.nodeClick = function (nodeId, step) {
  let self = this;
  step = (+step);
  let len = self.selectedElements['elements'].length;
  let i;
  for (i = 0; i < len; i++) {
    // The node has been selected, now delete it
    if (self.selectedElements['elements'][i]['id'] == nodeId && self.selectedElements['elements'][i]['step'] == step) {
      self.nodeUnselectDelHighlight(nodeId, step);
      break;
    }
  }
  // The node has not been selected, now select it
  if (i == len) {
    self.nodeSelectHighlight(nodeId, step);
  }

  self.drawEventPath();
  console.log('relatedElementsNodeVis');
  if (iconPanel['specificVolumeShow'] == true || relatedElementsVis['node'] == true) {
    console.log('hello, here');
    self.drawRelatedNode();
  }
  if (iconPanel['specificVolumeShow'] == true || relatedElementsVis['link'] == true) {
    self.drawRelatedLink();
  }
};

Matrix.prototype.linkClick = function (sourceId, targetId, step) {
  let self = this;
  step = (+step);
  let len = self.selectedElements['elements'].length;
  let i;
  for (i = 0; i < len; i++) {
    if (self.selectedElements['elements'][i]['sourceId'] == sourceId &&
      self.selectedElements['elements'][i]['targetId'] == targetId &&
      self.selectedElements['elements'][i]['step'] == step) {
      self.linkUnselectDelHighlight(sourceId, targetId, step);
      break;
    }
  }
  if (i == len) {
    self.linkSelectHighlight(sourceId, targetId, step);
  }

  self.drawEventPath();
  if (iconPanel['specificVolumeShow'] == true || relatedElementsVis['node'] == true) {
    self.drawRelatedNode();
  }
  if (iconPanel['specificVolumeShow'] == true || relatedElementsVis['link'] == true) {
    self.drawRelatedLink();
  }
};

Matrix.prototype.selectNode = function (nodeId, step) {
  let self = this;
  let obj = {};
  let relatedArrInSetA;
  let relatedArrInSetB;
  let id;
  let indexInSame = {};
  step = (+step);
  indexInSame['setA'] = [];
  indexInSame['setB'] = [];
  obj['type'] = 'node';
  obj['id'] = nodeId;
  obj['step'] = step;
  obj['volume'] = {};
  obj['volume']['setA'] = 0;
  obj['volume']['setB'] = 0;
  obj['volume']['sum'] = 0;
  self.selectedElements['elements'].push(obj);
  self.setStrokeColor(obj);
  relatedArrInSetA = self.getNodeEvents(nodeSet[nodeId]['event']['setA'], nodeId, step, 'A');
  relatedArrInSetB = self.getNodeEvents(nodeSet[nodeId]['event']['setB'], nodeId, step, 'B');

  // there is no any anthor selected elements except nodeId.
  if (self.selectedElements['elements'].length == 1) {
    for (let i = 0; i < relatedArrInSetA.length; i++) {
      // console.log("A:" + relatedArrInSetA[i]);
      relatedArrInSetA[i] = (+relatedArrInSetA[i]);
      self.selectedElements['eventInSetA'].push(relatedArrInSetA[i]);
      /* self.selectedElements["elements"][0]["volume"]["setA"] += datasetA[relatedArrInSetA[i]]["volume"]; */
      self.setElementsInSelection(datasetA[relatedArrInSetA[i]], 'A');
    }
    for (let j = 0; j < relatedArrInSetB.length; j++) {
      /* console.log("B:" + relatedArrInSetB[j]); */
      relatedArrInSetB[j] = (+relatedArrInSetB[j]);
      self.selectedElements['eventInSetB'].push(relatedArrInSetB[j]);
      /* self.selectedElements["elements"][0]["volume"]["setB"] += datasetB[relatedArrInSetB[i]]["volume"]; */
      self.setElementsInSelection(datasetB[relatedArrInSetB[j]], 'B');
    }
  }
  // There are some other selected elements
  else {
    indexInSame['setA'] = [];
    for (let i = 0; i < relatedArrInSetA.length; i++) {
      relatedArrInSetA[i] = (+relatedArrInSetA[i]);
      for (let k = 0; k < self.selectedElements['eventInSetA'].length; k++) {
        if (self.selectedElements['eventInSetA'][k] == relatedArrInSetA[i]) {
          indexInSame['setA'].push(relatedArrInSetA[i]);
        }
      }
    }
    indexInSame['setB'] = [];
    for (let j = 0; j < relatedArrInSetB.length; j++) {
      relatedArrInSetB[j] = (+relatedArrInSetB[j]);
      for (let k = 0; k < self.selectedElements['eventInSetB'].length; k++) {
        if (self.selectedElements['eventInSetB'][k] == relatedArrInSetB[j]) {
          indexInSame['setB'].push(relatedArrInSetB[j]);
        }
      }
    }
    self.selectedElements['eventInSetA'] = [];
    self.selectedElements['eventInSetB'] = [];
    self.selectedElements['relatedNode'] = {};
    self.selectedElements['relatedLink'] = {};
    self.unselectDelHighlight();
    for (let i = 0; i < indexInSame['setA'].length; i++) {
      self.selectedElements['eventInSetA'].push(indexInSame['setA'][i]);
      self.setElementsInSelection(datasetA[indexInSame['setA'][i]], 'A');
    }
    for (let j = 0; j < indexInSame['setB'].length; j++) {
      self.selectedElements['eventInSetB'].push(indexInSame['setB'][j]);
      self.setElementsInSelection(datasetB[indexInSame['setB'][j]], 'B');
    }
  }
  /* self.getSelectedElementsMessage(); */
  self.getRelatededElementsMessage();
};

// Get the related event in set(A/B).
// The function returns an array with related index in dataSet.
Matrix.prototype.getNodeEvents = function (dataSet, nodeId, step, type) {
  let self = this;
  step = (+step);
  let relatedArr = [];
  let relatedEventArr = dataSet;
  let len = relatedEventArr.length;
  let index;
  for (let i = 0; i < len; i++) {
    index = relatedEventArr[i];
    index = (+index);
    if (type == 'A' || type == 'a') {
      if (datasetA[index]['sequence'][step] == nodeId) {
        relatedArr.push(index);
      }
    } else {
      if (type == 'B' || type == 'b') {
        if (datasetB[index]['sequence'][step] == nodeId) {
          relatedArr.push(index);
        }
      }
    }
  }
  return relatedArr;
};

// Set the related nodes and links
// type == A, means SetA. type == B, means SetB;
Matrix.prototype.setElementsInSelection = function (dataSet, type) {
  let self = this;
  let len = dataSet['sequence'].length;
  let id;
  let node;
  let sourceNode;
  let targetNode;
  let edge;
  // related node
  for (let i = 0; i < len; i++) {
    node = dataSet['sequence'][i];
    if (nodeSet[node] != undefined) {
      id = 'step' + i + 'id' + dataSet['sequence'][i]; // e.g. step0idA;
      if (self.selectedElements['relatedNode'][id] == undefined) {
        self.selectedElements['relatedNode'][id] = {};
        self.selectedElements['relatedNode'][id]['id'] = dataSet['sequence'][i];
        self.selectedElements['relatedNode'][id]['step'] = i;
        self.selectedElements['relatedNode'][id]['volume'] = {};
        self.selectedElements['relatedNode'][id]['volume']['setA'] = 0;
        self.selectedElements['relatedNode'][id]['volume']['setB'] = 0;
        self.selectedElements['relatedNode'][id]['volume']['sum'] = 0;
      }
      if (type == 'A' || type == 'a') {
        self.selectedElements['relatedNode'][id]['volume']['setA'] += dataSet['volume'];
      }
      if (type == 'B' || type == 'b') {
        self.selectedElements['relatedNode'][id]['volume']['setB'] += dataSet['volume'];
      }
      self.selectedElements['relatedNode'][id]['volume']['sum'] += dataSet['volume'];
    }
  }
  // related link
  for (let i = 0; i < len - 1; i++) {
    sourceNode = dataSet['sequence'][i];
    targetNode = dataSet['sequence'][i + 1];
    edge = sourceNode + targetNode;
    if (nodeSet[sourceNode] != undefined && nodeSet[targetNode] != undefined && edgeSet[edge] != undefined) {
      id = 'step' + i + 'id' + dataSet['sequence'][i] + dataSet['sequence'][i + 1];
      if (self.selectedElements['relatedLink'][id] == undefined) {
        self.selectedElements['relatedLink'][id] = {};
        self.selectedElements['relatedLink'][id]['step'] = i;
        self.selectedElements['relatedLink'][id]['sourceId'] = dataSet['sequence'][i];
        self.selectedElements['relatedLink'][id]['targetId'] = dataSet['sequence'][i + 1];
        self.selectedElements['relatedLink'][id]['volume'] = {};
        self.selectedElements['relatedLink'][id]['volume']['setA'] = 0;
        self.selectedElements['relatedLink'][id]['volume']['setB'] = 0;
        self.selectedElements['relatedLink'][id]['volume']['sum'] = 0;
      }
      if (type == 'A' || type == 'a') {
        self.selectedElements['relatedLink'][id]['volume']['setA'] += dataSet['volume'];
      }
      if (type == 'B' || type == 'b') {
        self.selectedElements['relatedLink'][id]['volume']['setB'] += dataSet['volume'];
      }
      self.selectedElements['relatedLink'][id]['volume']['sum'] += dataSet['volume'];
    }
  }
};

Matrix.prototype.selectLink = function (sourceId, targetId, step) {
  let self = this;
  let obj = {};
  step = (+step);
  obj['type'] = 'link';
  obj['sourceId'] = sourceId;
  obj['targetId'] = targetId;
  obj['step'] = step;
  obj['volume'] = {};
  obj['volume']['setA'] = 0;
  obj['volume']['setB'] = 0;
  obj['volume']['sum'] = 0;
  self.selectedElements['elements'].push(obj);
  self.setStrokeColor(obj);
  let indexInSame = {};
  indexInSame['setA'] = [];
  indexInSame['setB'] = [];
  let relatedArrInSetA;
  let relatedArrInSetB;
  let linkId = sourceId + targetId;
  console.log('linkId: ' + linkId);
  relatedArrInSetA = self.getLinkEvents(edgeSet[linkId]['event']['setA'], sourceId, targetId, step, 'A');
  relatedArrInSetB = self.getLinkEvents(edgeSet[linkId]['event']['setB'], sourceId, targetId, step, 'B');
  // There is no any other selected element
  if (self.selectedElements['elements'].length == 1) {
    for (let i = 0; i < relatedArrInSetA.length; i++) {
      relatedArrInSetA[i] = (+relatedArrInSetA[i]);
      self.selectedElements['eventInSetA'].push(relatedArrInSetA[i]);
      self.setElementsInSelection(datasetA[relatedArrInSetA[i]], 'A');
    }
    for (let j = 0; j < relatedArrInSetB.length; j++) {
      relatedArrInSetB[j] = (+relatedArrInSetB[j]);
      self.selectedElements['eventInSetB'].push(relatedArrInSetB[j]);
      self.setElementsInSelection(datasetB[relatedArrInSetB[j]], 'B');
    }
  }
  // There are some other selected elements
  else {
    indexInSame['setA'] = [];
    for (let i = 0; i < relatedArrInSetA.length; i++) {
      relatedArrInSetA[i] = (+relatedArrInSetA[i]);
      for (let k = 0; k < self.selectedElements['eventInSetA'].length; k++) {
        if (self.selectedElements['eventInSetA'][k] == relatedArrInSetA[i]) {
          indexInSame['setA'].push(relatedArrInSetA[i]);
        }
      }
    }
    indexInSame['setB'] = [];
    for (let j = 0; j < relatedArrInSetB.length; j++) {
      relatedArrInSetB[i] = (+relatedArrInSetB[i]);
      for (let k = 0; k < self.selectedElements['eventInSetB'].length; k++) {
        if (self.selectedElements['eventInSetB'][k] == relatedArrInSetB[j]) {
          indexInSame['setB'].push(relatedArrInSetB[j]);
        }
      }
    }
    self.selectedElements['eventInSetA'] = [];
    self.selectedElements['eventInSetB'] = [];
    self.selectedElements['relatedNode'] = {};
    self.selectedElements['relatedLink'] = {};
    self.unselectDelHighlight();
    for (let i = 0; i < indexInSame['setA'].length; i++) {
      self.selectedElements['eventInSetA'].push(indexInSame['setA'][i]);
      self.setElementsInSelection(datasetA[indexInSame['setA'][i]], 'A');
    }
    for (let j = 0; j < indexInSame['setB'].length; j++) {
      self.selectedElements['eventInSetB'].push(indexInSame['setB'][j]);
      self.setElementsInSelection(datasetB[indexInSame['setB'][j]], 'B');
    }
  }
  /* self.getSelectedElementsMessage(); */
  self.getRelatededElementsMessage();
};

// Get the events related with the selected link.
// The function would return an array.
Matrix.prototype.getLinkEvents = function (dataSet, sourceId, targetId, step, type) {
  let self = this;
  step = (+step);
  let relatedArr = [];
  let len = dataSet.length;
  let index;
  for (let i = 0; i < len; i++) {
    index = dataSet[i];
    index = (+index);
    if (type == 'A' || type == 'a') {
      if (datasetA[index]['sequence'][step] == sourceId && datasetA[index]['sequence'][step + 1] == targetId) {
        relatedArr.push(index);
      }
    }
    if (type == 'B' || type == 'b') {
      if (datasetB[index]['sequence'][step] == sourceId && datasetB[index]['sequence'][step + 1] == targetId) {
        relatedArr.push(index);
      }
    }
  }
  return relatedArr;
};

Matrix.prototype.nodeSelectHighlight = function (nodeId, step) {
  let self = this;
  self.selectNode(nodeId, step);
  // High light related elements
  self.elementsHighlighting();
};

Matrix.prototype.linkSelectHighlight = function (sourceId, targetId, step) {
  let self = this;
  self.selectLink(sourceId, targetId, step);
  // High light related elements
  self.elementsHighlighting();
};

// In selection, high light related elements
Matrix.prototype.elementsHighlighting = function () {
  let self = this;
  let eventInSetA = self.selectedElements['eventInSetA'];
  let eventInSetALen = eventInSetA.length;
  let eventInSetB = self.selectedElements['eventInSetB'];
  let eventInSetBLen = eventInSetB.length;
  let selectedElements = self.selectedElements['elements'];
  let selectedElementsLen = selectedElements.length;
  let step;
  let type;
  let name;

  if (self.selectedElements['elements'].length == 0) {
    self.svg.selectAll('rect').classed('unselected', false);
  } else {
    // set all the elements with class unselected
    self.svg.selectAll('rect').classed('unselected', true);
    // deal with the related event in set A
    for (let i = 0; i < eventInSetALen; i++) {
      eventInSetA[i] = (+eventInSetA[i]);
      self.rectHighLighting(datasetA[eventInSetA[i]]['sequence']);
    }
    // deal with th related event in set B
    for (let i = 0; i < eventInSetBLen; i++) {
      eventInSetB[i] = (+eventInSetB[i]);
      self.rectHighLighting(datasetB[eventInSetB[i]]['sequence']);
    }
    // highlight the selected elements
    for (let i = 0; i < selectedElementsLen; i++) {
      step = selectedElements[i]['step'];
      step = (+step);
      type = selectedElements[i]['type'];
      if (type == 'node') {
        self.matrixWaveNodeRect[step].selectAll('rect.' + selectedElements[i]['id'])
          .classed('unselected', false);
      }
      if (type == 'link') {
        name = 'step' + step + 's' + selectedElements[i]['sourceId'] + 't' + selectedElements[i]['targetId'];
        self.matrixWave[step].selectAll('rect.' + name)
          .classed('unselected', false);
        name = 'rectInRect' + name;
        self.matrixWave[step].selectAll('rect.' + name)
          .classed('unselected', false);
      }
    }
  }
};

// A inner function of function elementsHighlighting.
Matrix.prototype.rectHighLighting = function (sequence) {
  let self = this;
  let sequenceLen = sequence.length;
  let node;
  let sourceNode;
  let targetNode;
  let edge;
  for (let j = 0; j < sequenceLen - 1; j++) {
    node = sequence[j];
    if (nodeSet[node] != undefined) {
      self.matrixWaveNodeRect[j].selectAll('rect.' + sequence[j])
        .classed('unselected', false);
    }

    sourceNode = sequence[j];
    targetNode = sequence[j + 1];
    edge = sourceNode + targetNode;
    if (nodeSet[sourceNode] != undefined && nodeSet[targetNode] != undefined && edgeSet[edge] != undefined) {
      name = 'step' + j + 's' + sequence[j] + 't' + sequence[j + 1];
      self.matrixWave[j].selectAll('rect.' + name)
        .classed('unselected', false);
      name = 'rectInRect' + name;
      self.matrixWave[j].selectAll('rect.' + name)
        .classed('unselected', false);
    }
  }
  node = sequence[sequenceLen - 1];
  if (nodeSet[node] != undefined) {
    self.matrixWaveNodeRect[sequenceLen - 1].selectAll('rect.' + sequence[sequenceLen - 1])
      .classed('unselected', false);
  }
};

Matrix.prototype.unselectDelHighlight = function (nodeId, step) {
  let self = this;
  // delete all highlighting
  self.svg.selectAll('rect').classed('unselected', false);
  self.removeRelatedNodeVis();
  self.removeRelatedLinkVis();
  // highlight the exist selected elements
  self.elementsHighlighting();
};

// delete the unselected node in selectedElements
Matrix.prototype.nodeUnselectDelHighlight = function (nodeId, step) {
  let self = this;
  step = (+step);
  let selectedElementsArr = [];
  let selectedElementsLen = self.selectedElements['elements'].length;
  let obj;

  for (let i = 0; i < selectedElementsLen; i++) {
    obj = {};
    obj['step'] = self.selectedElements['elements'][i]['step'];
    obj['type'] = self.selectedElements['elements'][i]['type'];
    if (self.selectedElements['elements'][i]['type'] == 'node') {
      if (self.selectedElements['elements'][i]['id'] != nodeId || self.selectedElements['elements'][i]['step'] != step) {
        obj['id'] = self.selectedElements['elements'][i]['id'];
        selectedElementsArr.push(obj);
      }
    }
    if (self.selectedElements['elements'][i]['type'] == 'link') {
      obj['sourceId'] = self.selectedElements['elements'][i]['sourceId'];
      obj['targetId'] = self.selectedElements['elements'][i]['targetId'];
      selectedElementsArr.push(obj);
    }
  }

  self.selectedElements['elements'] = [];
  self.selectedElements['eventInSetA'] = [];
  self.selectedElements['eventInSetB'] = [];
  self.selectedElements['relatedNode'] = {};
  self.selectedElements['relatedLink'] = {};
  self.svg.selectAll('rect').classed('clickStrokeColor', false);
  for (let i = 0; i < selectedElementsArr.length; i++) {
    if (selectedElementsArr[i]['type'] == 'node') {
      self.selectNode(selectedElementsArr[i]['id'], selectedElementsArr[i]['step']);
    }
    if (selectedElementsArr[i]['type'] == 'link') {
      self.selectLink(selectedElementsArr[i]['sourceId'], selectedElementsArr[i]['targetId'], selectedElementsArr[i]['step']);
    }
  }

  self.unselectDelHighlight();
};

// delete the unselected link in selectedElements
Matrix.prototype.linkUnselectDelHighlight = function (sourceId, targetId, step) {
  let self = this;
  step = (+step);
  let selectedElementsArr = [];
  let selectedElementsLen = self.selectedElements['elements'].length;
  let obj;

  for (let i = 0; i < selectedElementsLen; i++) {
    obj = {};
    obj['step'] = self.selectedElements['elements'][i]['step'];
    obj['type'] = self.selectedElements['elements'][i]['type'];
    if (self.selectedElements['elements'][i]['type'] == 'link') {
      if (self.selectedElements['elements'][i]['sourceId'] != sourceId ||
        self.selectedElements['elements'][i]['targetId'] != targetId ||
        self.selectedElements['elements'][i]['step'] != step) {
        obj['sourceId'] = self.selectedElements['elements'][i]['sourceId'];
        obj['targetId'] = self.selectedElements['elements'][i]['targetId'];
        selectedElementsArr.push(obj);
      }
    }
    if (self.selectedElements['elements'][i]['type'] == 'node') {
      obj['id'] = self.selectedElements['elements'][i]['id'];
      selectedElementsArr.push(obj);
    }
  }

  self.selectedElements['elements'] = [];
  self.selectedElements['eventInSetA'] = [];
  self.selectedElements['eventInSetB'] = [];
  self.selectedElements['relatedNode'] = {};
  self.selectedElements['relatedLink'] = {};
  self.svg.selectAll('rect').classed('clickStrokeColor', false);

  for (let i = 0; i < selectedElementsArr.length; i++) {
    if (selectedElementsArr[i]['type'] == 'node') {
      self.selectNode(selectedElementsArr[i]['id'], selectedElementsArr[i]['step']);
    }
    if (selectedElementsArr[i]['type'] == 'link') {
      self.selectLink(selectedElementsArr[i]['sourceId'], selectedElementsArr[i]['targetId'], selectedElementsArr[i]['step']);
    }
  }

  self.unselectDelHighlight();
};

// set the selected elements with color yellow
Matrix.prototype.setStrokeColor = function (dataObject) {
  let self = this;
  let step;
  let name;
  let type;
  type = dataObject['type'];
  step = dataObject['step'];
  step = (+step);
  if (type == 'node') {
    name = dataObject['id'];
    self.matrixWaveNodeRect[step].select('rect.' + name)
      .classed('clickStrokeColor', true);
  }
  if (type == 'link') {
    name = 'step' + step + 's' + dataObject['sourceId'] + 't' + dataObject['targetId'];
    self.matrixWave[step].select('rect.' + name)
      .classed('clickStrokeColor', true);
  }
};

Matrix.prototype.delStrokeColor = function (dataObject) {
  let self = this;
  let step;
  let name;
  let type;
  type = dataObject['type'];
  step = dataObject['step'];
  step = (+step);
  if (type == 'node') {
    name = dataObject['id'];
    self.matrixWaveNodeRect[step].select('rect.' + name);
    classed('clickStrokeColor', false);
  }
  if (type == 'link') {
    name = 'step' + step + 's' + dataObject['sourceId'] + 't' + dataObject['targetId'];
    self.matrixWave[step].select('rect.' + name)
      .classed('clickStrokeColor', false);
  }
};

Matrix.prototype.drawEventPath = function () {
  let self = this;
  let eventInSetA = self.selectedElements['eventInSetA'];
  let eventInSetALen = eventInSetA.length;
  let eventInSetB = self.selectedElements['eventInSetB'];
  let eventInSetBLen = eventInSetB.length;
  let name;
  let place_str;
  let place;
  self.svg.selectAll('g.clickSelected').remove();
  for (let i = 0; i < eventInSetALen; i++) {
    eventInSetA[i] = (+eventInSetA[i]);
    self.drawEventPathDetail(datasetA[eventInSetA[i]]['sequence']);
  }
  for (let i = 0; i < eventInSetBLen; i++) {
    eventInSetB[i] = (+eventInSetB[i]);
    self.drawEventPathDetail(datasetB[eventInSetB[i]]['sequence']);
  }
};

Matrix.prototype.drawEventPathDetail = function (dataSet) {
  let self = this;
  let place_str;
  let place;
  let name;
  let len = dataSet.length;
  let sourceNode;
  let targetNode;
  let edge;

  for (let i = 0; i < len - 1; i++) {
    sourceNode = dataSet[i];
    targetNode = dataSet[i + 1];
    edge = sourceNode + targetNode;
    if (nodeSet[sourceNode] != undefined && nodeSet[targetNode] != undefined && edgeSet[edge] != undefined) {
      name = 'step' + i + 's' + dataSet[i] + 't' + dataSet[i + 1];
      place_str = self.matrixWave[i].select('g.' + name)
        .attr('transform');
      place = self.getLinkPlace(place_str);
      if (i % 2 == 0) {
        self.matrixWave[i].append('g')
          .attr('class', 'clickSelected')
          .datum(place)
          .attr('transform', function (d, i) {
            return 'translate(0, ' + (place['y'] + self.rect / 2) + ')';
          })
          .append('path')
          .attr('d', function () {
            return 'M 0 0 L ' + (place['x']) + ' 0';
          })
          .attr('stroke', 'blue');
        self.matrixWave[i].append('g')
          .attr('class', 'clickSelected')
          .datum(place)
          .attr('transform', function (d, i) {
            return 'translate(' + (place['x'] + self.rect / 2) + ', ' + (place['y'] + self.rect) + ')';
          })
          .append('path')
          .attr('d', function () {
            return 'M 0 0 L 0 ' + (dataInStep[i]['rectHeight'] - place['y'] - self.rect);
          })
          .attr('stroke', 'blue');
      }
      if (i % 2 == 1) {
        self.matrixWave[i].append('g')
          .attr('class', 'clickSelected')
          .datum(place)
          .attr('transform', function (d, i) {
            return 'translate(' + (place['x'] + self.rect / 2) + ' ,0)';
          })
          .append('path')
          .attr('d', function () {
            return 'M 0 0 L 0 ' + (place['y']);
          })
          .attr('stroke', 'blue');
        self.matrixWave[i].append('g')
          .attr('class', 'clickSelected')
          .datum(place)
          .attr('transform', function (d, i) {
            return 'translate(' + (place['x'] + self.rect) + ' , ' + (place['y'] + self.rect / 2) + ')';
          })
          .append('path')
          .attr('d', function () {
            return 'M 0 0 L ' + (dataInStep[i]['rectWidth'] - place['x'] - self.rect) + ' 0';
          })
          .attr('stroke', 'blue');
      }
    }
  }
};

// get the element`s transform
Matrix.prototype.getLinkPlace = function (place_str) {
  let self = this;
  let place = {};
  let p1, p2, p3;
  p1 = place_str.indexOf('(');
  p2 = place_str.indexOf(',');
  p3 = place_str.indexOf(')');
  place['x'] = place_str.substring(p1 + 1, p2);
  place['y'] = place_str.substring(p2 + 1, p3);
  place['x'] = (+place['x']);
  place['y'] = (+place['y']);
  return place;
};

// get the selected elements`s message, such as volume, width, color and so on.
Matrix.prototype.getRelatededElementsMessage = function () {
  let self = this;
  self.getRelatedNodesSizeAndColor();
  self.getRelatedLinksSizeAndColor();
};

// get related nodes`size and color
Matrix.prototype.getRelatedNodesSizeAndColor = function () {
  let self = this;
  let keys = Object.keys(self.selectedElements['relatedNode']);
  let lenKeys = keys.length;
  let volumeA;
  let volumeB;
  let size;
  for (let i = 0; i < lenKeys; i++) {
    volumeA = self.selectedElements['relatedNode'][keys[i]]['volume']['setA'];
    volumeB = self.selectedElements['relatedNode'][keys[i]]['volume']['setB'];
    size = (volumeA + volumeB) / 2;
    self.selectedElements['relatedNode'][keys[i]]['size'] = self.nodeScale(size);
    size = (volumeA - volumeB) / (volumeA + volumeB);
    size = size.toFixed(1);
    size = size * 10;
    if (size % 2 != 0) {
      size = size + 1;
    }
    size = size * 0.1;
    size = size.toFixed(1);
    self.selectedElements['relatedNode'][keys[i]]['color'] = colorSelected['selection'][size];
    self.selectedElements['relatedNode'][keys[i]]['colorSize'] = size;
  }
};

Matrix.prototype.getRelatedLinksSizeAndColor = function () {
  let self = this;
  let keys = Object.keys(self.selectedElements['relatedLink']);
  let lenKeys = keys.length;
  let size;
  let volumeA;
  let volumeB;
  for (let i = 0; i < lenKeys; i++) {
    volumeA = self.selectedElements['relatedLink'][keys[i]]['volume']['setA'];
    volumeB = self.selectedElements['relatedLink'][keys[i]]['volume']['setB'];
    size = (volumeA + volumeB) / 2;
    self.selectedElements['relatedLink'][keys[i]]['size'] = self.linkScale(size);
    size = (volumeA - volumeB) / (volumeA + volumeB);
    size = size.toFixed(1);
    size = size * 10;
    if (size % 2 != 0) {
      size = size + 1;
    }
    size = size * 0.1;
    size = size.toFixed(1);
    self.selectedElements['relatedLink'][keys[i]]['colorSize'] = size;
    self.selectedElements['relatedLink'][keys[i]]['color'] = colorSelected['selection'][size];
  }
};

Matrix.prototype.drawRelatedNode = function () {
  let self = this;
  let keys = Object.keys(self.selectedElements['relatedNode']);
  let lenKeys = keys.length;
  let step;
  let id;
  for (let i = 0; i < lenKeys; i++) {
    step = self.selectedElements['relatedNode'][keys[i]]['step'];
    id = self.selectedElements['relatedNode'][keys[i]]['id'];
    self.matrixWaveNodeRect[step].select('g.nodeRect' + step + '.' + id)
      .append('rect')
      .attr('class', 'rect' + step + ' ' + id + ' smallRect')
      .attr('x', function () {
        if (step % 2 == 0) {
          return -self.selectedElements['relatedNode'][keys[i]]['size'] / 2;
        } else {
          return 0;
        }
      })
      .attr('y', function () {
        if (step % 2 == 1) {
          return -self.selectedElements['relatedNode'][keys[i]]['size'] / 2;
        } else {}
      })
      .attr('width', function () {
        if (step % 2 == 0) {
          return self.selectedElements['relatedNode'][keys[i]]['size'];
        } else {
          return self.rect;
        }
      })
      .attr('height', function () {
        if (step % 2 == 0) {
          return self.rect;
        } else {
          return self.selectedElements['relatedNode'][keys[i]]['size'];
        }
      })
      .attr('fill', function () {
        let size = self.selectedElements['relatedNode'][keys[i]]['colorSize'];
        return colorSelected['selection'][size];
      })
      .attr('stroke', 'black');
  }
};

Matrix.prototype.drawRelatedLink = function () {
  let self = this;
  let keys = Object.keys(self.selectedElements['relatedLink']);
  let lenKeys = keys.length;
  let step;
  let sourceId;
  let targetId;
  let name;
  for (let i = 0; i < lenKeys; i++) {
    step = self.selectedElements['relatedLink'][keys[i]]['step'];
    sourceId = self.selectedElements['relatedLink'][keys[i]]['sourceId'];
    targetId = self.selectedElements['relatedLink'][keys[i]]['targetId'];
    name = 'step' + step + 's' + sourceId + 't' + targetId;
    self.matrixWave[step].select('g.' + name)
      .append('path')
      .attr('class', name + ' smallTriangle')
      .attr('d', function () {
        return 'M 0 ' + self.rect + ' L ' + self.rect + ' ' + self.rect + ' L ' + self.rect + ' 0' + ' L 0 ' + self.rect;
      })
      .attr('fill', function () {
        return self.selectedElements['relatedLink'][keys[i]]['color'];
      })
      .attr('stroke', 'white');
    /* .attr("stroke", "rgb(234, 233, 233)"); */

    self.matrixWave[step].select('g.' + name)
      .append('path')
      .attr('class', 'triInTri' + name + ' smallTriangle')
      .attr('d', function () {
        let triSize = self.selectedElements['relatedLink'][keys[i]]['size'];
        return 'M ' + (self.rect / 2 - triSize / 2) + ' ' + (self.rect / 2 + triSize / 2) + ' L' + (self.rect / 2 + triSize / 2) + ' ' +
          (self.rect / 2 + triSize / 2) + ' L ' + (self.rect / 2 + triSize / 2) + ' ' + (self.rect / 2 - triSize / 2) +
          ' L ' + (self.rect / 2 - triSize / 2) + ' ' + (self.rect / 2 + triSize / 2);
      })
      .attr('fill', self.rectFill);
  }
};

Matrix.prototype.removeRelatedNodeVis = function () {
  let self = this;
  self.svg.selectAll('.smallRect').remove();
};

Matrix.prototype.removeRelatedLinkVis = function () {
  let self = this;
  self.svg.selectAll('.smallTriangle').remove();
};

Matrix.prototype.orderSelectionChange = function (value) {
  let self = this;
  self.orderSelection = value;
  if (value == 'alphabetion') {
    console.log(value);
    self.orderValueAlpha();
  }
  if (value == 'volume') {
    console.log(value);
    self.orderValueVolume();
  }
  if (value == 'difference') {
    console.log(value);
    self.orderValueDifference();
  }
  if (value == 'any') {
    console.log(value);
    self.orderValueAny();
  }
  self.orderUpdateNodeRect();
  self.orderUpdateNodeLabel();
  self.orderUpdateMatrixRect();
}

Matrix.prototype.orderValueAlpha = function () {
  let self = this;
  let len = dataInStep.length;
  for (let i = 0; i < len; i++) {
    self.alphaOrder(dataInStep[i]['nodes']);
  }
}

Matrix.prototype.orderValueDifference = function () {
  let self = this;
  let len = dataInStep.length;
  for (let i = 0; i < len; i++) {
    self.differenceOrder(dataInStep[i]['nodes']);
  }
}

Matrix.prototype.orderValueVolume = function () {
  let self = this;
  let len = dataInStep.length;
  for (let i = 0; i < len; i++) {
    self.volumeOrder(dataInStep[i]['nodes']);
  }
}

Matrix.prototype.orderValueAny = function () {
  let self = this;
  let len = dataInStep.length;
  for (let i = 0; i < len; i++) {
    self.anyOrder(dataInStep[i]['nodes']);
  }
}

Matrix.prototype.alphaOrder = function (dataSet) {
  let self = this;
  let len = dataSet.length;
  let obj;
  let keys;
  let keysLen;
  let node;
  let index = 0;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      obj = {};
      if (dataSet[j]['id'] > dataSet[j + 1]['id']) {
        keys = Object.keys(dataSet[j]);
        keysLen = keys.length;
        for (let k = 0; k < keysLen; k++) {
          obj[keys[k]] = dataSet[j][keys[k]];
          dataSet[j][keys[k]] = dataSet[j + 1][keys[k]];
          dataSet[j + 1][keys[k]] = obj[keys[k]];
        }
      }
    }
  }

  for (let i = 0; i < len; i++) {
    node = dataSet[i]['id'];
    if (nodeSet[node] != undefined) {
      dataSet[i]['orderIndex'] = index;
      index++;
    }
  }
}

Matrix.prototype.volumeOrder = function (dataSet) {
  let self = this;
  let len = dataSet.length;
  let obj;
  let keys;
  let keysLen;
  let node;
  let index = 0;

  for (let i = 0; i < len; i++) {
    if (dataSet[i]['volume']['sum'] == undefined) {
      dataSet[i]['volume']['sum'] = dataSet[i]['volume']['setA'] + dataSet[i]['volume']['setB'];
    }
  }

  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      obj = {};
      if (dataSet[j]['volume']['sum'] > dataSet[j + 1]['volume']['sum']) {
        keys = Object.keys(dataSet[j]);
        keysLen = keys.length;
        for (let k = 0; k < keysLen; k++) {
          obj[keys[k]] = dataSet[j][keys[k]];
          dataSet[j][keys[k]] = dataSet[j + 1][keys[k]];
          dataSet[j + 1][keys[k]] = obj[keys[k]];
        }
      }
    }
  }

  for (let i = 0; i < len; i++) {
    node = dataSet[i]['id'];
    if (nodeSet[node] != undefined) {
      dataSet[i]['orderIndex'] = index;
      index++;
    }
  }
}

Matrix.prototype.differenceOrder = function (dataSet) {
  let self = this;
  let len = dataSet.length;
  let obj;
  let keys;
  let keysLen;
  let node;
  let index = 0;

  for (let i = 0; i < len; i++) {
    if (dataSet[i]['volume']['absDifference'] == undefined) {
      dataSet[i]['volume']['absDifference'] = Math.abs(dataSet[i]['volume']['setA'] - dataSet[i]['volume']['setB']);
    }
  }

  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      obj = {};
      if (dataSet[j]['volume']['absDifference'] > dataSet[j + 1]['volume']['absDifference']) {
        keys = Object.keys(dataSet[j]);
        keysLen = keys.length;
        for (let k = 0; k < keysLen; k++) {
          obj[keys[k]] = dataSet[j][keys[k]];
          dataSet[j][keys[k]] = dataSet[j + 1][keys[k]];
          dataSet[j + 1][keys[k]] = obj[keys[k]];
        }
      }
    }
  }

  for (let i = 0; i < len; i++) {
    node = dataSet[i]['id'];
    if (nodeSet[node] != undefined) {
      dataSet[i]['orderIndex'] = index;
      index++;
    }
  }
}

Matrix.prototype.anyOrder = function (dataSet) {
  let self = this;
  let len = dataSet.length;
  let obj;
  let keys;
  let keysLen;
  let index = 0;
  for (let i = 0; i < len; i++) {
    dataSet[i]['firstIndex'] = (+dataSet[i]['firstIndex']);
    if (dataSet[i]['firstIndex'] != i) {
      obj = {};
      for (let j = i + 1; j < len; j++) {
        dataSet[j]['firstIndex'] = (+dataSet[j]['firstIndex']);
        if (dataSet[j]['firstIndex'] == i) {
          keys = Object.keys(dataSet[j]);
          keysLen = keys.length;
          for (let k = 0; k < keysLen; k++) {
            obj[keys[k]] = dataSet[i][keys[k]];
            dataSet[i][keys[k]] = dataSet[j][keys[k]];
            dataSet[j][keys[k]] = obj[keys[k]];
          }
          break;
        }
      }
    }
  }

  for (let i = 0; i < len; i++) {
    node = dataSet[i]['id'];
    if (nodeSet[node] != undefined) {
      dataSet[i]['orderIndex'] = index;
      index++;
    }
  }
}

Matrix.prototype.orderUpdateNodeRect = function () {
  let self = this;
  let lenStep = dataInStep.length;
  let dataSet;
  let lenDataSet;
  for (let i = 0; i < lenStep; i++) {
    dataSet = dataInStep[i]['nodes'];
    lenDataSet = dataSet.length;
    for (let j = 0; j < lenDataSet; j++) {
      self.matrixWaveNodeRect[i].select('g.' + dataSet[j]['id'])
        .transition()
        .duration(self.durationTime / 3)
        .attr('transform', function (d, i) {
          let x, y;
          if (i % 2 == 0) {
            x = -(self.textRectWidth + dataSet[j]['nodeRectWidth']);
            y = self.rect * dataSet[j]['orderIndex'];
            x = x + dataSet[j]['nodeRectWidth'];
          } else {
            x = self.rect * dataSet[j]['orderIndex'];
            y = -(self.textRectWidth + dataSet[j]['nodeRectWidth']);
            y = y + dataSet[j]['nodeRectWidth'];
          }
          return 'translate(' + x + ',' + y + ')';
        })
    }
  }
}

Matrix.prototype.orderUpdateNodeLabel = function () {
  let self = this;
  let lenStep = dataInStep.length;
  let dataSet;
  let lenDataSet;
  console.log('hello, order update node label!')
  for (let i = 0; i < lenStep; i++) {
    dataSet = dataInStep[i]['nodes'];
    lenDataSet = dataSet.length;
    for (let j = 0; j < lenDataSet; j++) {
      self.matrixWaveNodeLabel[i].select('g.gLabelNode' + dataSet[j]['id'])
        .transition()
        .duration(self.durationTime / 3)
        .attr('transform', function (d, i) {
          if (i % 2 == 0) {
            return 'translate(' + self.rect / 2 + ',' + ((+dataSet[j]['orderIndex']) * self.rect + self.rect / 2) + ')';
          }
          if (i % 2 == 1) {
            return 'translate(' + ((+dataSet[j]['orderIndex']) * self.rect + self.rect / 2) + ',' + self.rect / 2 + ')';
          }
        });
    }
  }
}

Matrix.prototype.orderUpdateMatrixRect = function () {
  let self = this;
  let lenStep = dataInStep.length - 1;
  let sourceSet;
  let targetSet;
  let lenSourceSet;
  let lenTargetSet;
  let node;
  let sourceNode;
  let targetNode;
  let edge;

  for (let i = 0; i < lenStep; i++) {
    sourceSet = dataInStep[i]['nodes'];
    lenSourceSet = sourceSet.length;;
    targetSet = dataInStep[i + 1]['nodes'];
    lenTargetSet = targetSet.length;
    if (i % 2 == 0) {
      for (let j = 0; j < lenSourceSet; j++) {
        sourceNode = sourceSet[j]['id'];
        if (nodeSet[sourceNode] != undefined) {
          self.matrixWave[i].selectAll('g.s' + sourceSet[j]['id'])
            .transition()
            .delay(self.durationTime / 3)
            .duration(self.durationTime / 3)
            .attr('transform', function (d, i) {
              let place_str = d3.select(this).attr('transform');
              let place = self.getLinkPlace(place_str);
              return 'translate(' + place['x'] + ',' + self.rect * (+sourceSet[j]['orderIndex']) + ')';
            });
        }
      }
    }
    if (i % 2 == 1) {
      for (let j = 0; j < lenTargetSet; j++) {
        targetNode = targetSet[j]['id'];
        if (nodeSet[targetNode] != undefined) {
          self.matrixWave[i].selectAll('g.t' + targetSet[j]['id'])
            .transition()
            .delay(self.durationTime / 3)
            .duration(self.durationTime / 3)
            .attr('transform', function (d, i) {
              let place_str = d3.select(this).attr('transform');
              let place = self.getLinkPlace(place_str);
              return 'translate(' + place['x'] + ',' + self.rect * (+targetSet[j]['orderIndex']) + ')';
            })
        }
      }
    }
  }

  for (let i = 0; i < lenStep; i++) {
    sourceSet = dataInStep[i]['nodes'];
    lenSourceSet = sourceSet.length;;
    targetSet = dataInStep[i + 1]['nodes'];
    lenTargetSet = targetSet.length;
    if (i % 2 == 1) {
      for (let j = 0; j < lenSourceSet; j++) {
        for (let k = 0; k < lenTargetSet; k++) {
          sourceNode = sourceSet[j]['id'];
          targetNode = targetSet[k]['id'];
          if (nodeSet[sourceNode] != undefined && nodeSet[targetNode] != undefined) {
            self.matrixWave[i].select('g.step' + i + 's' + sourceSet[j]['id'] + 't' + targetSet[k]['id'])
              .transition()
              .delay(self.durationTime / 3 * 2)
              .duration(self.durationTime / 3)
              .attr('transform', function (d, i) {
                return 'translate(' + self.rect * (+sourceSet[j]['orderIndex']) + ',' + self.rect * (+targetSet[k]['orderIndex']) + ')';
              })
          }
        }
      }
    }
    if (i % 2 == 0) {
      for (let j = 0; j < lenTargetSet; j++) {
        for (let k = 0; k < lenSourceSet; k++) {
          sourceNode = sourceSet[k]['id'];
          targetNode = targetSet[j]['id'];
          if (nodeSet[sourceNode] != undefined && nodeSet[targetNode] != undefined) {
            self.matrixWave[i].select('g.step' + i + 's' + sourceSet[k]['id'] + 't' + targetSet[j]['id'])
              .transition()
              .delay(self.durationTime / 3 * 2)
              .duration(self.durationTime / 3)
              .attr('transform', function (d, i) {
                return 'translate(' + self.rect * (+targetSet[j]['orderIndex']) + ',' + self.rect * (+sourceSet[k]['orderIndex']) + ')';
              })
          }
        }
      }
    }
  }
}

Matrix.prototype.updateColor = function () {
  let self = this;
  self.updateNodeRectColor();
  self.updateMatrixColor();
  self.updateNodeLabelColor();
  self.updateLinkLabelColor();
}

Matrix.prototype.updateNodeRectColor = function () {
  let self = this;
  let lenStep = dataInStep.length;
  let lenNodes;
  let colorSize;
  for (let i = 0; i < lenStep; i++) {
    lenNodes = dataInStep[i]['nodes'].length;
    for (let j = 0; j < lenNodes; j++) {
      colorSize = dataInStep[i]['nodes'][j]['nodeRectColorSize'];

      dataInStep[i]['nodes'][j]['nodeRectColor'] = colorSelected['selection'][colorSize];
      self.matrixWaveNodeRect[i].select('rect.rect' + i + '.' + dataInStep[i]['nodes'][j]['id'])
        .attr('fill', colorSelected['selection'][colorSize]);
    }
  }
}

Matrix.prototype.updateMatrixColor = function () {
  let self = this;
  let lenStep = dataInStep.length;
  let lenEdegs;
  let colorSize;
  for (let i = 0; i < lenStep; i++) {
    lenEdges = dataInStep[i]['edges'].length;
    for (let j = 0; j < lenEdges; j++) {
      colorSize = dataInStep[i]['edges'][j]['colorSize'];
      dataInStep[i]['edges'][j]['color'] = colorSelected['selection'][colorSize];
      self.matrixWave[i].select('rect.step' + i + 's' + dataInStep[i]['edges'][j]['source'] +
          't' + dataInStep[i]['edges'][j]['target'])
        .attr('fill', colorSelected['selection'][colorSize]);
    }
  }
}

Matrix.prototype.updateNodeLabelColor = function () {
  let self = this;
  let colorSize;
  let firstNum = -1.0;
  self.nodeColorLabel.gNodeColor.selectAll('rect')
    .attr('fill', function (d, i) {
      d = (+d);
      colorSize = firstNum + d * 0.2;
      colorSize = colorSize * 10;
      colorSize = Math.round(colorSize);
      colorSize = colorSize * 0.1;
      colorSize = colorSize.toFixed(1);
      return colorSelected['selection'][colorSize];
    })
}

Matrix.prototype.updateLinkLabelColor = function () {
  let self = this;
  let colorSize;
  let firstNum = -1.0;
  self.linkColorLabel.gNodeColor.selectAll('rect')
    .attr('fill', function (d, i) {
      d = (+d);
      colorSize = firstNum + d * 0.2;
      colorSize = colorSize * 10;
      colorSize = Math.round(colorSize);
      colorSize = colorSize * 0.1;
      colorSize = colorSize.toFixed(1);
      return colorSelected['selection'][colorSize];
    })
}

// input: node id
// output: make the related nodes in selectedElements
Matrix.prototype.searchElement = function (value) {
  console.log('searchElement: ' + value);
  let self = this;
  let lenStep = dataInStep.length;
  let lenNodes;
  let nodes;
  for (let i = 0; i < lenStep; i++) {
    nodes = dataInStep[i]['nodes'];
    lenNodes = nodes.length;
    for (let j = 0; j < lenNodes; j++) {
      if (nodes[j]['id'] == value) {
        self.nodeClick(value, i);
        break;
      }
    }
  }
}

// use the labelColor to show the color, use the attribute name if existed, if not, then use attribute id
Matrix.prototype.drawMatrixWaveLabel = function () {
  // console.log("drawLabel start")
  let self = this;
  self.matrixWaveNodeLabel = [];
  let lenStep = dataInStep.length;
  let lenNodes;
  for (let i = 0; i < lenStep - 1; i++) {
    self.matrixWaveNodeLabel[i] = self.gMatrixWave.append('g')
      .datum(i)
      .attr('class', 'labelStep' + i)
      .attr('transform', function () {
        if (i % 2 === 0) {
          return 'translate(' + (dataInStep[i]['place']['x'] + dataInStep[i + 1]['nodes'].length * self.rect + self.rect * 0.3) + ',' + dataInStep[i]['place']['y'] + ')';
        } else {
          return 'translate(' + dataInStep[i]['place']['x'] + ',' + (dataInStep[i]['place']['y'] + dataInStep[i + 1]['nodes'].length * self.rect + self.rect * 0.3) + ')';
        }
      });

    d3.select('g.labelStep' + i)
      .selectAll('g')
      .data(dataInStep[i]['nodes'])
      .enter()
      .append('g')
      .attr('class', function (d, i) {
        return 'gLabelNode' + d['id'] + ' ' + d['id'];
      })
      .attr('transform', function (d) {
        if (i % 2 === 0) {
          return 'translate(' + self.rect / 2 + ',' + ((+d['orderIndex']) * self.rect + self.rect / 2) + ')';
        }
        if (i % 2 === 1) {
          return 'translate(' + ((+d['orderIndex']) * self.rect + self.rect / 2) + ',' + self.rect / 2 + ')';
        }
      });

    lenNodes = dataInStep[i]['nodes'].length;
    for (let j = 0; j < lenNodes; j++) {
      d3.select('g.labelStep' + i)
        .select('.gLabelNode' + dataInStep[i]['nodes'][j]['id'])
        .append('circle')
        .datum(dataInStep[i]['nodes'][j])
        .attr('r', self.rect / 2)
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', function (d, i) {
          return self.labelColor(d['id']);
        });

      d3.select('g.labelStep' + i)
        .select('.gLabelNode' + dataInStep[i]['nodes'][j]['id'])
        .append('text')
        .datum(dataInStep[i]['nodes'][j])
        .text(function (d, i) {
          if (d['name'] !== undefined) {
            return d['name'];
          } else {
            return d['id'];
          }
        })
        .attr('transform', function (d) {
          if (i % 2 === 0) {
            return 'translate(' + self.rect * 0.8 + ',' + self.rect * 0.2 + ')';
          } else {
            return 'translate(' + (-self.rect * 0.2) + ',' + self.rect * 0.8 + ') rotate(90)';
          }
        })
        .attr('font-size', function (d, i) {
          return self.rect / 2 + 'px';
        })
    }
  }
  self.matrixWaveNodeLabel[lenStep - 1] = self.gMatrixWave.append('g')
    .datum(lenNodes - 1)
    .attr('class', 'labelStep' + (lenStep - 1))
    .attr('transform', function () {
      if (lenStep % 2 === 1) {
        return 'translate(' + (dataInStep[lenStep - 2]['nodes'].length * self.rect + dataInStep[lenStep - 2]['place']['x'] + self.textRectWidth * 1.8 + self.rect * 0.3) + ',' + dataInStep[lenStep - 2]['place']['y'] + ')';
      } else {
        return 'translate(' + dataInStep[lenStep - 2]['place']['x'] + ',' + (dataInStep[lenStep - 2]['place']['y'] + dataInStep[lenStep - 2]['nodes'].length * self.rect + self.textRectWidth * 1.8 + self.rect * 0.3) + ')';
      }
    });

  d3.select('g.labelStep' + (lenStep - 1))
    .selectAll('g')
    .data(dataInStep[lenStep - 1]['nodes'])
    .enter()
    .append('g')
    .attr('class', function (d, i) {
      return 'gLabelNode' + d['id'] + ' ' + d['id'];
    })
    .attr('transform', function (d) {
      if ((lenStep - 1) % 2 === 0) {
        return 'translate(' + self.rect / 2 + ',' + ((+d['orderIndex']) * self.rect + self.rect / 2) + ')';
      }
      if ((lenStep - 1) % 2 === 1) {
        return 'translate(' + ((+d['orderIndex']) * self.rect + self.rect / 2) + ',' + self.rect / 2 + ')';
      }
    });

  lenNodes = dataInStep[lenStep - 1]['nodes'].length;
  for (let j = 0; j < lenNodes; j++) {
    d3.select('g.labelStep' + (lenStep - 1))
      .select('.gLabelNode' + dataInStep[lenStep - 1]['nodes'][j]['id'])
      .append('circle')
      .datum(dataInStep[lenStep - 1]['nodes'][j])
      .attr('r', self.rect / 2)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', function (d) {
        return self.labelColor(d['id']);
      });

    d3.select('g.labelStep' + (lenStep - 1))
      .select('.gLabelNode' + dataInStep[lenStep - 1]['nodes'][j]['id'])
      .append('text')
      .datum(dataInStep[lenStep - 1]['nodes'][j])
      .text(function (d, i) {
        if (d['name'] !== undefined) {
          return d['name'];
        } else {
          return d['id'];
        }
      })
      .attr('transform', function (d, i) {
        if (i % 2 === 0) {
          return 'translate(' + self.rect * 0.8 + ',' + self.rect * 0.2 + ')';
        } else {
          return 'translate(' + (-self.rect * 0.2) + ',' + self.rect * 0.8 + ') rotate(90)';
        }
      })
      .attr('font-size', function (d, i) {
        return self.rect / 2 + 'px';
      })
  }

  // console.log("draw label end!")
}

// is show the matrixwave label?
Matrix.prototype.isShowMatrixWaveLabel = function () {
  let self = this;
  let len = self.matrixWaveNodeLabel.length;
  if (iconPanel.icon['nodeLabelShow'] == false) {
    for (let i = 0; i < len; i++) {
      self.matrixWaveNodeLabel[i].classed('nodeLabelShow', false);
      self.matrixWaveNodeLabel[i].classed('nodeLabelUnshow', true);
    }
  } else {
    for (let i = 0; i < len; i++) {
      self.matrixWaveNodeLabel[i].classed('nodeLabelShow', true);
      self.matrixWaveNodeLabel[i].classed('nodeLabelUnshow', false);
    }
  }
}

// is show the matrix grid ?
Matrix.prototype.isShowMatrixGrid = function () {
  let self = this;
  if (iconPanel.icon['matrixGridShow'] == true) {
    self.svg.selectAll('.linkCell').classed('matrixGridShow', true);
  } else {
    self.svg.selectAll('.linkCell').classed('matrixGridShow', false);
  }
}

export default Matrix;
