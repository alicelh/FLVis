<template>
  <div id="clientView-container" ref="clientView">
    <div class="moduleTitle">Client View</div>
    <div id="clientView-content">
      <svg width="100%" height="100%" ref="clientViewChart">
        <Axis
          :scale="xscale"
          :trans="'translate('+margin.left+','+(margin.top+chartHeight+10)+')'"
          orient="Bottom"
        />
        <Axis
          :scale="yscaleIterCount"
          :trans="'translate('+margin.left+','+(margin.top+10)+')'"
          orient="Left"
          :ticks="5"
        />
        <path :transform="'translate('+margin.left+','+(margin.top+10)+')'" :d="iterCountLine" fill="none" stroke="#F6A457" stroke-width="2" />
        <text class="axis-text" :transform="'translate('+margin.left+','+(margin.top-5+10)+')'">Iter count</text>
        <text class="axis-text-x" :transform="'translate('+(margin.left+chartWidth)+','+(margin.top+chartHeight+40)+')'">Iter count(server)</text>
      </svg>
      <svg width="100%" height="100%">
        <Axis
          :scale="xscale"
          :trans="'translate('+margin.left+','+(margin.top+chartHeight+10)+')'"
          orient="Bottom"
        />
        <Axis
          :scale="yscaleDataSize"
          :trans="'translate('+margin.left+','+(margin.top+10)+')'"
          orient="Left"
          :ticks="5"
        />
        <g :transform="'translate('+margin.left+','+(margin.top+10)+')'">
          <circle
            r=4
            fill="#90c297"
            :cx="xscale(iterArray[i])"
            :cy="yscaleDataSize(item)"
            :data-index="i"
            data-content="size"
            v-for="(item, i) in this.dataSize" :key="i"
            @mouseover="showTooltip"
            @mouseout="hideTooltip"
            :stroke="(isTooltipShow&&(parseInt(hoverIndex) === parseInt(i))) ? '#B1B1B1': 'none'"
            stroke-width="2px"
            ></circle>
            <line v-show="isTooltipShow" :x1="hoverLineX" y1="0" :x2="hoverLineX" :y2="chartHeight" stroke-dasharray="5 5" stroke="#B1B1B1"></line>  
            <Tooltip
              :clientData="tooltipData"
              :isMouseHover="isTooltipShow && (hoverSvg === 'size')"
              :transform="'translate(' + (parseFloat(hoverLineX) + 10) + ',-5)'"/>          
        </g>
        <text class="axis-text" :transform="'translate('+margin.left+','+(margin.top-5+10)+')'">Data size</text>
        <text class="axis-text-x" :transform="'translate('+(margin.left+chartWidth)+','+(margin.top+chartHeight+40)+')'">Iter count(server)</text>
        <text class="client-index" :transform="'translate('+(clientViewWidth - 5)+',15)'">Client index: {{(choosedClient === -1) ? 'not chosen' : choosedClient}}</text>
      </svg>
      <svg width="100%" height="100%">
        <Axis
          :scale="xscale"
          :trans="'translate('+margin.left+','+(margin.top+chartHeight)+')'"
          orient="Bottom"
        />
        <Axis
          :scale="yscaleAcc"
          :trans="'translate('+margin.left+','+margin.top+')'"
          orient="Left"
          :ticks="2"
        />
        <path :transform="'translate('+margin.left+','+(margin.top)+')'" :d="accLine" fill="none" stroke="#D68966" stroke-width="2" />
        <g :transform="'translate('+margin.left+','+(margin.top)+')'">
          <circle
            r=4
            fill="#D68966"
            :cx="xscale(iterArray[i])"
            :cy="yscaleAcc(item)"
            :data-index="i"
            data-content="acc"
            v-for="(item, i) in this.acc" :key="i"
            @mouseover="showTooltip"
            @mouseout="hideTooltip"
            :stroke="(isTooltipShow&&(parseInt(hoverIndex) === parseInt(i))) ? '#B1B1B1': 'none'"
            stroke-width="2px"
            ></circle>
            <line v-show="isTooltipShow" :x1="hoverLineX" y1="0" :x2="hoverLineX" :y2="chartHeight" stroke-dasharray="5 5" stroke="#B1B1B1"></line>
            <Tooltip
              :clientData="tooltipData"
              :isMouseHover="isTooltipShow && (hoverSvg === 'acc')"
              :transform="'translate(' + (parseFloat(hoverLineX) + 10) + ',-5)'"/>
        </g>
        <text class="axis-text" :transform="'translate('+margin.left+','+(margin.top - 5)+')'">Accuracy</text>
        <text class="axis-text-x" :transform="'translate('+(margin.left+chartWidth)+','+(margin.top+chartHeight+margin.bottom-5)+')'">Iter count(server)</text>
      </svg>
      <svg width="100%" height="100%">
        <Axis
          :scale="xscale"
          :trans="'translate('+margin.left+','+(margin.top+chartHeight)+')'"
          orient="Bottom"
        />
        <Axis
          :scale="yscaleLoss"
          :trans="'translate('+margin.left+','+(margin.top)+')'"
          orient="Left"
          :ticks="5"
        />
        <path :transform="'translate('+margin.left+','+(margin.top)+')'" :d="lossLine" fill="none" stroke="#466BB7" stroke-width="2" />
        <g :transform="'translate('+margin.left+','+(margin.top)+')'">
          <circle
            r=4
            fill="#466BB7"
            :cx="xscale(iterArray[i])"
            :cy="yscaleLoss(item)"
            :data-index="i"
            data-content="loss"
            v-for="(item, i) in this.loss" :key="i"
            @mouseover="showTooltip"
            @mouseout="hideTooltip"
            :stroke="(isTooltipShow&&(parseInt(hoverIndex) === parseInt(i))) ? '#B1B1B1': 'none'"
            stroke-width="2px"
            ></circle>
            <line v-show="isTooltipShow" :x1="hoverLineX" y1="0" :x2="hoverLineX" :y2="chartHeight" stroke-dasharray="5 5" stroke="#B1B1B1"></line>
            <Tooltip
              :clientData="tooltipData"
              :isMouseHover="isTooltipShow && (hoverSvg === 'loss')"
              :transform="'translate(' + (parseFloat(hoverLineX) + 10) + ',-5)'"/>
        </g>
        <text class="axis-text" :transform="'translate('+margin.left+','+(margin.top-5)+')'">Loss</text>
        <text class="axis-text-x" :transform="'translate('+(margin.left+chartWidth)+','+(margin.top+chartHeight+margin.bottom-5)+')'">Iter count(server)</text>
      </svg>
    </div>
  </div>
</template>

<script>
import Axis from '../common/Axis';
import Tooltip from "./Tooltip";
import * as d3 from 'd3';
import { mapState } from 'vuex';

export default {
  name: "ClientView",
  data() {
    return {
      margin: {
        left: 40,
        right: 30,
        top: 20,
        bottom: 40
      },
      clientViewWidth: 0,
      height: 0,
      acc: [],
      loss: [],
      dataSize: [],
      iterArray: [],
      iterCount: [],
      accLine: '',
      lossLine: '',
      iterCountLine: '',
      hoverLineX: 0,
      hoverSvg: '',
      isTooltipShow: false,
      tooltipData: {},
      hoverIndex: 0
    };
  },
  components: {
    Axis,
    Tooltip
  },
  computed:{
    ...mapState({
      clientInfo: state => state.client.selectedClientInfo,
      iternum: state => state.server.iternum,
      choosedClient: state => state.client.choosedclient
    }),
    chartWidth () {
      return this.clientViewWidth - this.margin.left - this.margin.right;
    },
    chartHeight () {
      return this.height - this.margin.top - this.margin.bottom;
    },
    xscale () {
      return d3
        .scaleLinear()
        .domain([1, this.iternum])
        .range([0, this.chartWidth]);
    },
    yscaleLoss () {
      return d3
        .scaleLinear()
        .domain([0, d3.max(this.loss)])
        .range([this.chartHeight, 0]);
    },
    yscaleAcc () {
      return d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.chartHeight, 0]);
    },
    yscaleIterCount () {
      return d3
        .scaleLinear()
        .domain([0, d3.max(this.iterCount)])
        .range([this.chartHeight, 0]);
    },
    yscaleDataSize () {
      return d3
        .scaleLinear()
        .domain([0, d3.max(this.dataSize)])
        .range([this.chartHeight, 0]);
    }
  },
  methods: {
    getLossPathLine () {
      let losspath = d3
        .line()
        .x((d, i) => {
          return this.xscale(this.iterArray[i]);
        })
        .y(d => {
          return this.yscaleLoss(d);
        });
      this.lossLine = losspath(this.loss);
    },
    getAccPathLine () {
      let accpath = d3
        .line()
        .x((d, i) => {
          return this.xscale(this.iterArray[i]);
        })
        .y(d => {
          return this.yscaleAcc(d);
        });
      this.accLine = accpath(this.acc);
    },
    getIterCountLine () {
      let itercountpath = d3
        .line()
        .x((d, i) => {
          let x;
          if (i === this.iterCount.length - 1) {
            x = this.iternum;
          } else if (i % 2 === 0) {
            x = this.iterArray[i / 2]
          } else {
            x = this.iterArray[(i-1) / 2]
          }
          return this.xscale(x);
        })
        .y(d => {
          return this.yscaleIterCount(d);
        });
      this.iterCountLine = itercountpath(this.iterCount);
    },
    showTooltip(e) {
      this.hoverLineX = e.target.getAttribute('cx');
      this.hoverSvg = e.target.getAttribute('data-content');
      this.isTooltipShow = true;
      let index = e.target.getAttribute('data-index');
      this.hoverIndex=index;
      this.tooltipData.iter = this.iterArray[index];
      this.tooltipData.loss = this.loss[index].toFixed(2);
      this.tooltipData.acc = this.acc[index].toFixed(2);
      this.tooltipData.dataSize = this.dataSize[index];
    },
    hideTooltip() {
      this.isTooltipShow = false;
    },
  },
  mounted () {
    this.clientViewWidth = this.$refs.clientViewChart.clientWidth;
    this.height = this.$refs.clientViewChart.clientHeight;
    this.iterArray = this.clientInfo.map(d=>d.iter);
    this.getLossPathLine();
    this.getAccPathLine();
    this.getIterCountLine();
  },
  watch: {
    clientInfo: function (newvalue, oldvalue) {
      this.iterArray = this.clientInfo.map(d=>d.iter);
      this.dataSize = this.clientInfo.map(d=>d.num);
      this.loss = this.clientInfo.map(d=>d.loss);
      this.acc = this.clientInfo.map(d=>d.acc);
      // this.iterCount = this.clientInfo.map(d=>d.count);
      this.iterCount = [0];
      for (let i = 0; i < this.clientInfo.length; i++) {
        this.iterCount.push(this.clientInfo[i].count);
        this.iterCount.push(this.clientInfo[i].count);
      }
      this.iterCountObject = [];
      this.getLossPathLine();
      this.getAccPathLine();
      this.getIterCountLine();
    }
  }
}
</script>

<style lang="scss">
  #clientView-container {
    border: 1px solid #4A4A4A;
    border-radius: 5px;
    height: 100%;
    .moduleTitle {
      text-align: left;
      line-height: 30px;
      background: #414447;
      font-size: 24px;
      color: #FFFFFF;
      padding-left: 10px;
    }
    #clientView-content {
      height: 270px;
      display: grid;
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr 1fr;
      .axis-text {
        text-anchor: middle;
        font-size: 14px;
      }
      .axis-text-x {
        text-anchor: end;
        font-size: 14px;
      }
      .client-index {
        text-anchor: end;
        font-size: 15px;
        font-weight: bold;
      }
    }
  }
</style>
