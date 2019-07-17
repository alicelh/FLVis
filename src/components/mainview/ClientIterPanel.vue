<template>
  <div class="client-panel">
    <div class="title">
      <div class="title-iter" @click="updateIterForProj">iter {{iterId}}</div>
      <div>{{clientNum}}</div>
      <div>
        <img src="../../assets/delete.png" @click="deletePanel" />
      </div>
    </div>
    <div class="client-content">
      <div class="clientnum-slider">
        <span style="left:0px; top:9px">{{minIterCount}}</span>
        <div id="slider-bar" @click="addTriangle"></div>
        <div v-for="(triangle, i) in sliderTrianglesPos" :key="i">
          <span :style="'left:' + (triangle.pos) +'px'">{{triangle.countValue}}</span>
          <img
            src="../../assets/triangle.png"
            class="triangle-img"
            :id="'slider-triangle-' + i"
            :style="'left:' + triangle.pos +'px'"
            @mousedown="handleSlide"
          />
        </div>
        <span style="right:0px; top:9px">{{maxIterCount}}</span>
      </div>
      <svg height="100%" width="100%">
        <!-- to modify -->
        <g class="client-count">
          <rect class="num-rect" x="0" y="25" width="30" height="10" />
          <!-- to mpdify -->
          <text fill="#fff" x="0" y="35">{{clientNumSegment[0]}}-{{clientNumSegment[1]}}</text>
          <text x="35" y="35">{{clientNum}}</text>
        </g>
        <g class="rect-group">
          <rect
            class="client-rect"
            :x="i % rectNumLine * rectSize + rectNumLine * (i % rectNumLine)"
            :y="Math.floor(i / rectNumLine) * rectSize + 40 + rectNumLine * Math.floor(i / rectNumLine)"
            :width="rectSize"
            :height="rectSize"
            :data-index="val.index"
            :data-count="val.count"
            :data-acc="val.acc"
            :data-loss="val.loss"
            @mouseover="showTooltip"
            @mouseout="hideTooltip"
            v-for="(val, i) in dataSort"
            :key="'rect-'+i"
          />
        </g>
        <Tooltip
          :clientData="tooltipData"
          :isMouseHover="isTooltipShow"
          :transform="'translate('+(parseInt(tooltipPos[0]) + rectSize)+','+tooltipPos[1]+')'"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";
import Tooltip from "./Tooltip";

export default {
  name: "ClientIterPanel",
  props: {
    iterId: Number,
    data: Array,
    panelId: Number
  },
  data() {
    return {
      rectSize: 15,
      rectNumLine: 4, // 一行显示多少个
      minIterCount: 0,
      maxIterCount: 0,
      dataSort: [], // 按count排序
      clientNum: 0,
      clientNumSegment: [], // 初始的分段为[min, maxcount],
      tooltipData: {},
      tooltipPos: [0, 0],
      isTooltipShow: false,
      sliderTrianglesPos: [] // 滑动条上的三角形位置
    };
  },
  components: {
    Tooltip
  },
  computed: {
    ...mapState({
      clientInfo: state => state.client.clientInfo[this.iterId]
    })
    // min
  },
  methods: {
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
      this.$store.dispatch(
        "client/updataIterChoosedForProjection",
        this.iterId
      );
    },
    getMinMaxIterCount() {
      // 把读入的data按count属性进行排序
      this.clientNum = this.data.length;
      this.dataSort = this.data.sort(this.compare("count"));
      if (this.clientNum !== 0) {
        this.minIterCount = this.dataSort[0].count;
        this.maxIterCount = this.dataSort[this.clientNum - 1].count;
        this.clientNumSegment = [this.minIterCount, this.maxIterCount];
      }
    },
    showTooltip(e) {
      this.tooltipData.index = e.target.getAttribute("data-index");
      this.tooltipData.count = e.target.getAttribute("data-count");
      this.tooltipData.acc = parseFloat(
        e.target.getAttribute("data-acc")
      ).toFixed(2);
      this.tooltipData.loss = parseFloat(
        e.target.getAttribute("data-loss")
      ).toFixed(2);
      this.tooltipPos = [
        e.target.getAttribute("x"),
        e.target.getAttribute("y")
      ];
      this.isTooltipShow = true;
    },
    hideTooltip() {
      // console.log("out");
      this.isTooltipShow = false;
    },
    // 移动三角形
    handleSlide(ev) {
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
      // console.log(triangleDom);
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
        console.log(ratio, countValue);
        return false; // 取消默认事件
      };
      window.onmouseup = function() {
        if (deleteFlag) {
          me.sliderTrianglesPos.splice(currentTriangleId, 1);
          console.log(me.sliderTrianglesPos);
        }
        deleteFlag = false;
        window.onmousemove = false; // 解绑移动事件
        return false;
      };
      return false;
    },
    // 添加分段的小三角形
    addTriangle(e) {
      let sliderDom = document.getElementsByClassName("clientnum-slider")[0];
      let sliderWidth = sliderDom.offsetWidth;
      let barDom = document.getElementById("slider-bar");
      let mouseX = e.clientX;
      let rest = barDom.offsetWidth - 10 + barDom.offsetLeft; // 10是三角形的clientwidth
      let left =
        mouseX - barDom.offsetLeft - 55 - this.panelId * (sliderWidth + 12); // 10是panel间的gap间距
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
      this.sliderTrianglesPos.push({ countValue: countValue, pos: left });
      // console.log(this.sliderTrianglesPos);
    }
  },
  mounted() {
    this.getMinMaxIterCount();
  }
};
</script>

<style lang="scss">
.client-panel {
  height: 100%;
  position: relative;
  img {
    width: 20px;
    cursor: pointer;
  }
  .title {
    line-height: 20px;
    height: 19px;
    display: grid;
    grid-template-columns: 4fr 4fr 1fr;
    border-bottom: 1px solid #979797;
    font-size: 10px;
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
    height: 280px;
    // border: 1px solid #979797;
    border-radius: 0px 0px 5px 5px;
    .client-count {
      font-size: 10px;
    }
    .client-rect {
      fill: #90c297;
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
        width: 80%;
        height: 2px;
        border-radius: 10px;
        background: #474747;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        cursor: pointer;
      }
    }
  }
}
</style>
