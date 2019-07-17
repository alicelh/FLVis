<template>
  <div class="client-panel">
    <div class="title">
      <div class="title-iter" @click="updateIterForProj">iter {{iterId}}</div>
      <div>{{clientNum}}</div>
      <div>
        <img src="../../assets/delete.png" @click="deletePanel">
      </div>
    </div>
    <div class="client-content">
      <div class="clientnum-slider">
        <div class="slider-bar"></div>
        <div class="slider-triangle"></div>
      </div>
      <svg height="100%" width="100%">
        <!-- to modify -->
        <g class="client-count">
          <rect
            class="num-rect"
            x="0"
            y="25"
            width="30"
            height="10">
          </rect>
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
            v-for="(val, i) in dataSort" :key="'rect-'+i"
            >
          </rect>
        </g>
        <Tooltip
            :clientData="tooltipData"
            :isMouseHover="isTooltipShow"
            :transform="'translate('+(parseInt(tooltipPos[0]) + rectSize)+','+tooltipPos[1]+')'"/>
      </svg>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3';
import Tooltip from './Tooltip';

export default {
  name: "ClientIterPanel",
  props: {
    iterId: Number,
    data: Array
  },
  data () {
    return {
      rectSize: 20,
      rectNumLine: 4,// 一行显示多少个
      minIterCount: 0,
      maxIterCount: 0,
      dataSort: [],// 按count排序
      clientNum: 0,
      clientNumSegment: [], // 初始的分段为[min, maxcount],
      tooltipData: {},
      tooltipPos: [0, 0],
      isTooltipShow: false
    };
  },
  components:{
    Tooltip
  },
  computed: {
    ...mapState({
      clientInfo: state => state.client.clientInfo[this.iterId]
    }),
    // min
  },
  methods: {
    compare (property) {
      return function(obj1, obj2) {
        let value1 = obj1[property];
        let value2 = obj2[property];
        return value1 - value2; // 升序
      }
    },
    deletePanel () {
      this.$store.dispatch('client/deleteClientInfoByIter', this.iterId);
    },
    updateIterForProj () {
      this.$store.dispatch('client/updataIterChoosedForProjection', this.iterId);
    },
    getMinMaxIterCount () {
      // 把读入的data按count属性进行排序
      this.clientNum = this.data.length;
      this.dataSort = this.data.sort(this.compare('count'));
      if (this.clientNum !== 0) {
        this.minIterCount = this.dataSort[0].count;
        this.maxIterCount = this.dataSort[this.clientNum - 1].count;
        this.clientNumSegment = [this.minIterCount, this.maxIterCount];
      }
      console.log(this.minIterCount, this.maxIterCount);
      console.log(this.dataSort);
    },
    showTooltip (e) {
      this.tooltipData.index = e.target.getAttribute('data-index');
      this.tooltipData.count = e.target.getAttribute('data-count');
      this.tooltipData.acc = parseFloat(e.target.getAttribute('data-acc')).toFixed(2);
      this.tooltipData.loss = parseFloat(e.target.getAttribute('data-loss')).toFixed(2);
      this.tooltipPos = [e.target.getAttribute('x'), e.target.getAttribute('y')];
      // console.log(this.tooltipData);
      this.isTooltipShow = true;
    },
    hideTooltip () {
      // console.log("out");
      this.isTooltipShow = false;
    }
  },
  mounted() {
    this.getMinMaxIterCount();
  }
}
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
    background: #D8D8D8;
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
      fill: rgba(26,26,26,0.56);
    }
    // 滑动条
    .clientnum-slider {
      .slider-bar {

      }
      .slider-triangle {

      }
    }
  }
}

</style>
