<template>
  <div class="client-panel">
    <div class="title">
      <div class="title-iter" @click="updateIterForProj">iter {{iterId}}</div>
      <div>{{clientNumAll}}</div>
      <div>
        <img src="../../assets/delete.png" @click="deletePanel" />
      </div>
    </div>
    <div class="client-content scroll-box">
      <div class="clientnum-slider">
        <span style="left:0px; top:9px">{{minIterCount}}</span>
        <div id="slider-bar" @contextmenu="preventDefault"></div>
        <div v-for="(triangle, i) in sliderTrianglesPos" :key="i">
          <span :style="'left:' + (Math.round(triangle.countValue) < 10? triangle.pos+2:triangle.pos) +'px'">{{Math.round(triangle.countValue)}}</span>
          <img
            src="../../assets/triangle.png"
            class="triangle-img"
            :id="'slider-triangle-' + i"
            :style="'left:' + triangle.pos +'px'"
            @mousedown="handleSlide"
          />
        </div>
        <span style="right:0px; top:9px">{{maxIterCount}}</span>
        <div id="shortline-left"></div>
        <div id="shortline-right"></div>
      </div>
      <!-- svg高度要确定好 才能做scroll -->
      <svg :height="svgHeight" width="100%">
        <!-- to modify -->
        <g class="client-segment" v-for="(segment, segmentIndex) in clientNumSegments" :key="'segement-'+segmentIndex">
          <g class="client-count">
            <rect
              class="num-rect"
              x="0"
              :y="((segmentIndex === 0) ? 0 : rectGroupHeight[segmentIndex - 1])"
              width="35"
              height="14" />
            <text fill="#fff" x="0"
              :y="10 + ((segmentIndex === 0) ? 0 :rectGroupHeight[segmentIndex - 1])">{{segment[0]}} -{{ segment[1]}}</text>
            <text x="40"
              :y="10 + ((segmentIndex === 0) ? 0 :rectGroupHeight[segmentIndex - 1])">{{countNum[segment[1] - minIterCount].endIndex - countNum[segment[0] - minIterCount].startIndex + 1}}</text>
          </g>
          <g class="rect-group">
            <g
              v-for="(val, i) in dataSort.slice(countNum[segment[0] - minIterCount].startIndex, countNum[segment[1] - minIterCount].endIndex + 1)"
              :key="'rect-'+i"
              @mouseover="showTooltip"
              @mouseout="hideTooltip">
              <rect
                :fill="computeColor(colorLinear(parseInt(val.num)))"
                class="client-rect"
                :x="i % rectNumLine * rectSize + rectGap * (i % rectNumLine) + (isOutlier(val.index) === 'none'?0:2)"
                :y="Math.floor(i / rectNumLine) * rectSize + 15 + rectGap * Math.floor(i / rectNumLine) + 
                ((segmentIndex === 0) ? 0 : rectGroupHeight[segmentIndex - 1]) + (isOutlier(val.index) === 'none'?0:2)"
                :width="rectSize - (isOutlier(val.index) === 'none'?0:4)"
                :height="rectSize - (isOutlier(val.index) === 'none'?0:4)"
                :data-index="val.index"
                :data-count="val.count"
                :data-acc="val.acc"
                :data-loss="val.loss"
                :data-iter="val.iter"
                :data-datanum="val.num"
                :style="{'stroke': isOutlier(val.index), 'stroke-width': '4px'}"
                @click="handleRectClick"
              />
              <rect
                v-if="isTooltipShow && (val.index.toString() === tooltipData.index.toString())"
                class="client-rect-outer"
                :width="rectSize"
                :height="rectSize"
                :x="i % rectNumLine * rectSize + rectGap * (i % rectNumLine)"
                :y="Math.floor(i / rectNumLine) * rectSize + 15 + rectGap * Math.floor(i / rectNumLine) + 
                ((segmentIndex === 0) ? 0 : rectGroupHeight[segmentIndex - 1])"
              ></rect>
              <rect
                v-if="doubleOutlierArr.indexOf(val.index) > -1"
                style="stroke:#3983c0; stroke-width:2px; fill: none"
                :width="8"
                :height="8"
                :data-index="val.index"
                :data-count="val.count"
                :data-acc="val.acc"
                :data-loss="val.loss"
                :data-iter="val.iter"
                :data-datanum="val.num"
                :x="i % rectNumLine * rectSize + rectGap * (i % rectNumLine) + 3"
                :y="Math.floor(i / rectNumLine) * rectSize + 15 + rectGap * Math.floor(i / rectNumLine) + 
                ((segmentIndex === 0) ? 0 : rectGroupHeight[segmentIndex - 1]) + 3"
                @click="handleRectClick"
              ></rect>
            </g>
          </g>
        </g>
      </svg>
    </div>
    <div class="tooltip-container">
      <!-- <svg width="85" height="80" id="svg-tooltip"> -->
        <Tooltip
          :clientData="tooltipData"
          :isMouseHover="isTooltipShow"
          :transform="'translate('+(parseInt(tooltipPos[0]) + rectSize)+','+(tooltipPos[1] - 380)+')'"
        />
      <!-- </svg> -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";
import Tooltip from "../common/Tooltip";

export default {
  name: "ClientIterPanel",
  props: {
    iterId: Number,
    data: Array,
    panelId: Number,// 为了计算小三角形的偏移
    colorLinear: Function
  },
  data() {
    return {
      rectSize: 14,
      rectNumLine: 0, // 一行显示多少个
      rectGap: 0,// rect间距
      minIterCount: 0,
      maxIterCount: 0,
      dataSort: [], // 按count排序
      // clientDataNumMinMax: [],//数据量的最大最小 编码小矩形的绿色
      clientNumAll: 0,
      clientNumSlider: [], // slider上的分段，初始的分段为[min, maxcount],
      clientNumSegments: [],
      countNum: [],//每个count对应的数量,起始下标
      tooltipData: {},
      tooltipPos: [0, 0],
      isTooltipShow: false,
      sliderTrianglesPos: [], // 滑动条上的三角形位置
      svgHeight: 0,
      rectGroupHeight: [],// 存储每个group的y坐标
      doubleOutlierArr: [],
      outlierClientLoss: [],
      outlierClientAcc: []
    };
  },
  components: {
    Tooltip
  },
  computed: {
    ...mapState({
      // clientInfo: state => state.client.clientInfo[this.iterId],
      brushedClientStastics: (state) => state.server.brushedClientStastics
    })
  },
  watch: {
    iterId: function () {
      this.getMinMaxIterCount();
      this.getClientSegments();
      this.updateSvgHeight();
    }
  },
  methods: {
    computeColor (num) {
      let compute = d3.interpolate(d3.rgb(240,249,232), d3.rgb(144,194,151));
      return compute(num);
    },
    // getClientRectColor (datanum) {
    //   let rectColorLinear = d3.scaleLinear()
		// 		.domain(this.clientDataNumMinMax)
    //     .range([0,1]);
    //   let compute = d3.interpolate(d3.rgb(240,249,232), d3.rgb(144,194,151));
    //   return compute(rectColorLinear(datanum));
    // },
    getOutliers () {
      this.outlierClientLoss = this.brushedClientStastics[this.iterId]['outlierClient-loss'];
      this.outlierClientAcc = this.brushedClientStastics[this.iterId]['outlierClient-acc'];
      this.doubleOutlierArr = [];
      for (let i = 0; i < this.outlierClientLoss.length; i++) {
        if(this.outlierClientAcc.indexOf(this.outlierClientLoss[i]) > -1)
          this.doubleOutlierArr.push(this.outlierClientLoss[i]);
      }
    },
    isOutlier (index) {
      if (this.outlierClientLoss.indexOf(index) > -1 && this.outlierClientAcc.indexOf(index) > -1) {
          // this.doubleOutlierArr.push(index);
          return "#dd5041";
        } else if (this.outlierClientLoss.indexOf(index) > -1) {      
          return '#3983c0';
        } else if (this.outlierClientAcc.indexOf(index) > -1)
          return '#dd5041';
        return 'none';
      // 当iter面板有内容时 重新刷选 显示的iter已不在显示的盒须图中 所以不用高亮outlier
      // if (Object.keys(this.brushedClientStastics).indexOf(this.iterId.toString()) !== -1) {
      //   let outlierClientLoss = this.brushedClientStastics[this.iterId]['outlierClient-loss'];
      //   let outlierClientAcc = this.brushedClientStastics[this.iterId]['outlierClient-acc'];
      //   // this.doubleOutlierArr = [];
      //   if (outlierClientLoss.indexOf(index) > -1 && outlierClientAcc.indexOf(index) > -1) {
      //     // this.doubleOutlierArr.push(index);
      //     return "#dd5041";
      //   } else if (outlierClientLoss.indexOf(index) > -1) {      
      //     return '#3983c0';
      //   } else if (outlierClientAcc.indexOf(index) > -1)
      //     return '#dd5041';
      //   return 'none';
      // } else {
      //   return 'none';
      // }
    },
    compare(property) {
      return function(obj1, obj2) {
        let value1 = obj1[property];
        let value2 = obj2[property];
        return value1 - value2; // 升序
      };
    },
    deletePanel() {
      this.$store.dispatch("client/deleteClientInfoByIter", this.iterId);
    },
    updateIterForProj() {
      this.$store.dispatch("client/updataIterChoosedForProjection", this.iterId);
      this.$store.dispatch("server/getServerPara", this.iterId); // 更新server色带图
    },
    getMinMaxIterCount() {
      // 把读入的data按count属性进行排序
      this.clientNumAll = this.data.length;
      this.dataSort = this.data.sort(this.compare("count"));
      // console.log(this.dataSort);
      if (this.clientNumAll !== 0) {
        this.minIterCount = this.dataSort[0].count;
        this.maxIterCount = this.dataSort[this.clientNumAll - 1].count;
        this.clientNumSlider = [this.minIterCount, this.maxIterCount];
        this.clientNumSegments = [[this.minIterCount, this.maxIterCount]];
      }
      // 找到每个count的分布
      this.countNum = [];
      // 初始化
      for (let i = this.minIterCount; i <= this.maxIterCount; i++) {
        this.countNum.push({'count': i, 'num': 0, 'startIndex': -1, 'endIndex': -1});
      }
      // 遍历datasort 存储各个count的分布信息
      for (let i = 0; i < this.clientNumAll; i++) {
        let countNumIndex = this.dataSort[i].count - this.minIterCount;
        this.countNum[countNumIndex].num += 1;
      }
      for(let i = 0; i < this.countNum.length; i++) {
        if (i === 0) {
          this.countNum[i].startIndex = 0;
          this.countNum[i].endIndex = this.countNum[i].num - 1;
        } else {
          this.countNum[i].startIndex = this.countNum[i-1].endIndex + 1;
          this.countNum[i].endIndex = this.countNum[i].startIndex + this.countNum[i].num - 1;
        }
      }
      this.sliderTrianglesPos = [];
      // // 找到训练数据量的最大最小 做图例 和颜色的映射
      // let clientDataNum = this.data.map(d => d.num);
      // // console.log(clientDataNum);
      // this.clientDataNumMinMax = d3.extent(clientDataNum);
    },
    initialSvgHeight () {
      // 计算每行的rect个数
      let sliderDom = document.getElementsByClassName("clientnum-slider")[0];
      let sliderWidth = sliderDom.offsetWidth;
      // this.rectGap = 2;
      // this.rectNumLine = Math.floor((sliderWidth + this.rectGap)  / (this.rectSize+ this.rectGap));
      this.rectNumLine = Math.floor(sliderWidth / this.rectSize);
      if (this.rectNumLine > 7) this.rectNumLine = 7;
      this.rectGap = 0.83;// (sliderWidth - this.rectNumLine * this.rectSize) / (this.rectNumLine - 1);
      // 更新svg高度(未分段的情况)
      this.svgHeight = Math.ceil(this.clientNumAll / this.rectNumLine) * this.rectSize + 15 + this.rectGap * Math.floor(this.clientNumAll / this.rectNumLine);
    },
    showTooltip(e) {
      this.tooltipData.index = e.target.getAttribute("data-index");
      this.tooltipData.count = e.target.getAttribute("data-count");
      let iter = e.target.getAttribute("data-iter");
      this.tooltipData.acc = parseFloat(
        e.target.getAttribute("data-acc")
      ).toFixed(2);
      this.tooltipData.loss = parseFloat(
        e.target.getAttribute("data-loss")
      ).toFixed(2);
      this.tooltipPos = [
        e.target.getAttribute("x"),
        e.clientY
      ];
      this.isTooltipShow = true;
      // 高亮投影视图里对应的client
      this.$store.dispatch('client/updateClientHoveredInMain', this.tooltipData.index);
      // 高亮盒须图里的异常值
      // this.$store.dispatch('client/updataClientChoosed', [parseInt(this.tooltipData.index), parseInt(iter)]);
    },
    hideTooltip() {
      this.isTooltipShow = false;
      this.$store.dispatch('client/updateClientHoveredInMain', -1);
    },
    // 移动三角形
    handleSlide(ev) {
      // e.preventDefault();
      let e = ev || window.event;
      let triangleDom = e.toElement; // 当前移动的小三角形
      let barDom = document.getElementById("slider-bar");
      let triangleX = triangleDom.offsetLeft;
      let mouseX = e.clientX;
      let rest =
        barDom.offsetWidth - triangleDom.offsetWidth + barDom.offsetLeft;
      let deleteFlag = true;
      let currentTriangleId = parseInt(
        triangleDom.getAttribute("id").split("-")[2]
      );
      let me = this;
      // 保存之前的移动之前的countValue
      let prevCountValue = parseFloat(me.sliderTrianglesPos[currentTriangleId].countValue);
      window.onmousemove = function(ev) {
        let e = ev || window.event;
        // 浏览器当前位置减去鼠标按下的位置
        let moveLength = e.clientX - mouseX; //鼠标移动的距离
        // 有移动
        if (moveLength >= 0.1 || moveLength <= -0.1) {
          deleteFlag = false; // 如果有移动 就不删除小三角形
        }
        let newPos = triangleX + moveLength; //left
        // 判断最大值和最小值
        if (newPos < barDom.offsetLeft) {
          newPos = barDom.offsetLeft;
        }
        if (newPos >= rest) {
          newPos = rest;
        }
        // 更新pos
        me.sliderTrianglesPos[currentTriangleId].pos = newPos;
        let ratio = (newPos - barDom.offsetLeft) / (rest - barDom.offsetLeft);
        let countValue = (
          me.minIterCount +
          ratio * (me.maxIterCount - me.minIterCount)
        ).toFixed(1);
        me.sliderTrianglesPos[currentTriangleId].countValue = countValue;
        return false; // 取消默认事件
      };
      window.onmouseup = function() {
        if (deleteFlag) {
          // 删除更新分段
          let deleteCountValue = parseFloat(me.sliderTrianglesPos[currentTriangleId].countValue);
          let deleteClienNumIndex = me.clientNumSlider.indexOf(deleteCountValue);
          if(deleteClienNumIndex > -1) {
            me.clientNumSlider.splice(deleteClienNumIndex, 1);
          }
          me.getClientSegments();
          me.updateSvgHeight();
          // 删除小三角形
          me.sliderTrianglesPos.splice(currentTriangleId, 1);
        } else {
          // 更新分段
          if(me.sliderTrianglesPos[currentTriangleId]) {
            let newCountValue = parseFloat(me.sliderTrianglesPos[currentTriangleId].countValue);
            let clienNumIndex = me.clientNumSlider.indexOf(prevCountValue);
            if(clienNumIndex > -1) {
              me.clientNumSlider[clienNumIndex] = newCountValue;
            }
            // 重新排序 因为可能有些三角形会交叉
            me.clientNumSlider.sort(d3.ascending);
            me.getClientSegments();
            me.updateSvgHeight();
          }
        }
        deleteFlag = false;
        window.onmousemove = false; // 解绑移动事件
        return false;
      };
      return false;
    },
    // 取消右键点击的默认事件
    preventDefault (e) {
      e.preventDefault();
      this.addTriangle(e);
    },
    // 添加分段的小三角形
    addTriangle(e) {
      let sliderDom = document.getElementsByClassName("clientnum-slider")[0];
      let sliderWidth = sliderDom.offsetWidth;
      let barDom = document.getElementById("slider-bar");
      let mouseX = e.clientX;
      let rest = barDom.offsetWidth - 10 + barDom.offsetLeft; // 10是三角形的clientwidth
      let left =
        mouseX - barDom.offsetLeft - 50 - this.panelId * (sliderWidth + 12 + 5); // 10是panel间的gap间距 2是panel的border  5是滚动条的宽度
      if (left < barDom.offsetLeft) {
        left = barDom.offsetLeft;
      }
      if (left >= rest) {
        left = rest;
      }
      // 计算count值
      let ratio = (left - barDom.offsetLeft) / (rest - barDom.offsetLeft);
      let countValue = (
        this.minIterCount +
        ratio * (this.maxIterCount - this.minIterCount)
      ).toFixed(1);
      this.sliderTrianglesPos.push({ countValue: countValue, pos: left });// 三角形位置信息
      let insertId = 0;
      while (this.clientNumSlider[insertId] < countValue) {
        insertId++;
      }
      this.clientNumSlider.splice(insertId, 0, parseFloat(countValue)); //更新分段
      // 处理一下clientNumSlider
      this.getClientSegments();
      this.updateSvgHeight();
    },
    getClientSegments () {
      this.clientNumSegments = [];
      for(let i = 0; i < this.clientNumSlider.length - 1; i++) {
        let count1 = Math.ceil(this.clientNumSlider[i]);
        let count2 = Math.floor(this.clientNumSlider[i+1]);
        if (count1 <= count2) {
          if(count1 === this.maxIterCount) {
            this.clientNumSegments.push([count1, count1]);
            break;
          }
          if(count2 === this.maxIterCount && i < this.clientNumSlider.length - 2) {
            this.clientNumSegments.push([count1, count2 - 1]);
          } else {
            this.clientNumSegments.push([count1, count2]);
          }
        }
      }
      // console.log(this.clientNumSegments);
    },
    // 计算rectgroup的高度
    getRectGroupHeight (rectNum) {
      return Math.ceil(rectNum / this.rectNumLine) * this.rectSize + 20 + this.rectGap * Math.floor(rectNum / this.rectNumLine);
    },
    updateSvgHeight () {
      this.rectGroupHeight = [];
      let newSvgHeight = 0;
      for (let i = 0; i < this.clientNumSegments.length; i++) {
        let segement = this.clientNumSegments[i];
        let rectNum = this.countNum[segement[1] - this.minIterCount].endIndex
          - this.countNum[segement[0] - this.minIterCount].startIndex + 1;
        let height = this.getRectGroupHeight(rectNum);
        this.rectGroupHeight.push(newSvgHeight + height);
        newSvgHeight += height;
      }
      // 更新svg的新高度
      this.svgHeight = newSvgHeight;
    },
    // 点击面板中的小矩形 高亮该次迭代中的异常值circle
    handleRectClick (e) {
      let clickedClientIndex = e.target.getAttribute('data-index');
      let clickedIter = this.iterId;
      // 高亮盒须图里的异常值
      this.$store.dispatch('client/updataClientChoosed', [parseInt(clickedClientIndex), parseInt(clickedIter)]);
      // 更新client view
      this.$store.dispatch('client/getClientInfoByIndex', clickedClientIndex);
      // 暂时不用更新混淆矩阵
      // this.$store.dispatch('client/getConfusionMatrix', clickedClientIndex);
    }
  },
  mounted() { 
    this.getMinMaxIterCount();
    this.initialSvgHeight();
    this.getOutliers();
  }
};
</script>

<style lang="scss">
.client-panel {
  height: 100%;
  position: relative;
  .tooltip-container {
    position: absolute;
    z-index: 999;
    #svg-tooltip{
      z-index: 999;
    }
  }
  img {
    width: 20px;
    cursor: pointer;
  }
  .title {
    line-height: 20px;
    height: 19px;
    display: grid;
    grid-template-columns: 7fr 4fr 1fr;
    border-bottom: 1px solid #979797;
    font-size: 12px;
    color: #000;
    // position: absolute;
    background: #d8d8d8;
    .title-iter {
      border-right: 1px solid #979797;
      height: inherit;
      cursor: pointer;
    }
  }
  .client-content {
    background: #fff;
    height: 310px;
    // border: 1px solid #979797;
    border-radius: 0px 0px 5px 5px;
    overflow-y: auto;
    .client-count {
      font-size: 12px;
    }
    .client-rect {
      // fill: #90c297;
    }
    .client-rect-outer {
      fill: none;
      stroke-width: 1px;
      stroke:rgba(0,0,0,0.50);
    }
    .num-rect {
      fill: rgba(26, 26, 26, 0.56);
    }
    // 滑动条
    .clientnum-slider {
      width: 100%;
      height: 30px;
      position: relative;
      img {
        width: 10px;
        position: absolute;
        bottom: 0;
        top: 8px;
        margin: auto 0;
        cursor: pointer;
      }
      span {
        position: absolute;
        font-size: 10px;
      }
      #slider-bar {
        width: 73%;
        height: 2px;
        border-radius: 10px;
        background: #B1B1B1;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        cursor: pointer;
      }
      #shortline-left {
        position: absolute;
        left: 14px;
        top: 11px;
        width: 2px;
        height: 8px;
        background: #B1B1B1;
      }
      #shortline-right {
        position: absolute;
        right: 14px;
        top: 11px;
        width: 2px;
        height: 8px;
        background: #B1B1B1;
      }
    }
  }
  .scroll-box::-webkit-scrollbar {  
    width: 5px;  
    height:10px;
    background-color:#333;
  }  
  .scroll-box::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color:#f6f1f1;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    -ms-border-radius: 10px;
    -o-border-radius: 10px;
  }
  .scroll-box::-webkit-scrollbar-thumb {  
    border-radius: 10px;  
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);  
    background-color:#a6a3a3;
  } 
}
</style>
