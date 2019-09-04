<template>
  <!-- <div :width="mainViewWidth"> -->
    <svg height="100%" width="100%">
      <Axis
        :scale="xscale"
        :trans="'translate('+margin.left+','+(margin.top+chartHeight)+')'"
        orient="Bottom"
      />
      <Bars
        :trans="'translate('+margin.left+','+margin.top+')'"
        :scale="xscale"
        :bars="selection"
        :height="chartHeight"
        :dataSize="brushedDataSize"
      />
      <g class="boxplots-loss">
        <Boxplot
        :trans="'translate('+margin.left+','+margin.top+')'"
        :index="parseInt(iterId)"
        :data="brushedClientStastics[iterId].loss"
        :clientIndex="brushedClientStastics[iterId].index"
        :yscale="yscaleleft"
        :xscale="xscale"
        type="loss"
        v-for="(iterId, i) in selection" :key="i">
        </Boxplot>
      </g>
      <g class="boxplots-acc">
        <Boxplot
        :trans="'translate('+margin.left+','+margin.top+')'"
        :index="parseInt(iterId)"
        :data="brushedClientStastics[iterId].acc"
        :clientIndex="brushedClientStastics[iterId].index"
        :yscale="yscaleright"
        :xscale="xscale"
        type="acc"
        v-for="(iterId, i) in selection" :key="i">
        </Boxplot>
      </g>
      <g :transform="'translate('+margin.left+','+margin.top+')'">
        <path :transform="'translate('+xBandwidth * 0.25+',0)'" :d="brushedLossline" fill="none" stroke="#466BB7" stroke-width="2" />
        <path :transform="'translate('+xBandwidth * 0.75+',0)'" :d="brushedAccline" fill="none" stroke="#D68966" stroke-width="2" />
      </g>
      <g class="legends" :transform="'translate('+(mainViewWidth - 200)+',5)'">
        <rect width="10" height="10" x="10" fill="#8cb1cf" stroke="#3983c0" stroke-width="2"></rect>
        <text x="25" y="10">Loss</text>
        <rect width="10" height="10" x="75" fill="#f3c0ba" stroke="#dd5041" stroke-width="2"></rect>
        <text x="90" y="10">Accuracy</text>
      </g>
      <Axis
        :scale="yscaleleft"
        :trans="'translate('+margin.left+','+margin.top+')'"
        orient="Left"
        :ticks="5"
      />
      <Axis
        :scale="yscaleright"
        :trans="'translate('+(margin.left+chartWidth)+','+margin.top+')'"
        orient="Right"
        :ticks="5"
      />
    </svg>
  <!-- </div> -->
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3';
import Axis from '../common/Axis';
import Bars from './Bars';
import Boxplot from './Boxplot';

export default {
  name: 'ClientBrushView',
  props: {
    mainViewWidth: Number
  },
  data () {
    return {
      height: 210,
      margin: {
        left: 50,
        right: 50,
        top: 20,
        bottom: 20
      },
      selection: [],// 当前刷选的迭代
      brushedDataSize: [],// 当前刷选的每次迭代的数据量大小
      brushedLoss: [],// 平均值画折线
      brushedAcc: [],
      brushedAccline: '',
      brushedLossline: '',
      xBandwidth: 0,
      yLossMax: 0
    }
  },
  components: {
    Axis,
    Bars,
    Boxplot
  },
  computed: {
    chartWidth () {
      return this.mainViewWidth - this.margin.left - this.margin.right;
    },
    chartHeight () {
      return this.height - this.margin.top - this.margin.bottom;
    },
    xscale () {
      this.selection = Object.keys(this.brushedClientStastics);
      return d3
        .scaleBand()
        .domain(this.selection)
        .range([0, this.chartWidth])
        .paddingInner(0.1);
    },
    // loss
    yscaleleft () {
      let yscaleDomain = [0, this.yLossMax];
      return d3
        .scaleLinear()
        .domain(yscaleDomain)
        .range([this.chartHeight, 0]);
    },
    // acc
    yscaleright () {
      return d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.chartHeight, 0]);
    },
    ...mapState({
      currentBrush: state => state.server.brushedSelection,//(state => state.server.brushedSelection).length === 0? [0, 0] : state => state.server.brushedSelection,
      brushedClientStastics: state => state.server.brushedClientStastics,
      lossMean: state => state.server.loss,
      accMean: state => state.server.acc,
      dataSize: state => state.server.num
    }),
  },
  methods: {
    updateBarColor () {
      this.brushedDataSize = this.dataSize.slice(this.currentBrush[0] - 1, this.currentBrush[1]);
    },
    updateYLossMax () {
      // 算最大值要把刷选的迭代的所有值拿出来
      this.yLossMax = -99;
      for (let i = this.currentBrush[0]; i <= this.currentBrush[1]; i++) {
        let temp = d3.max(this.brushedClientStastics[i].loss);
        if (temp > this.yLossMax)
          this.yLossMax = temp;
      }
      // console.log(this.currentBrush, this.yLossMax);
    },
    getLossPathLine () {
      this.brushedLoss = this.lossMean.slice(this.currentBrush[0] - 1, this.currentBrush[1]);
      let me = this;
      let losspath = d3
        .line()
        .x((d, i) => {
          return this.xscale(me.currentBrush[0] + i);
        })
        .y(d => {
          return this.yscaleleft(d);
        });
      this.brushedLossline = losspath(this.brushedLoss);
    },
    getAccPathLine () {
      this.brushedAcc = this.accMean.slice(this.currentBrush[0] - 1, this.currentBrush[1]);
      let me = this;
      let accpath = d3
        .line()
        .x((d, i) => {
          return this.xscale(me.currentBrush[0] + i);
        })
        .y(d => {
          return this.yscaleright(d);
        });
      this.brushedAccline = accpath(this.brushedAcc);
    }
  },
  watch: {
    currentBrush: function (oldvalue, newvalue) {
      this.updateYLossMax();
      this.xBandwidth = this.xscale.bandwidth();
      this.getLossPathLine();
      this.getAccPathLine();
      this.updateBarColor();
    }
  },
  mounted () {
    this.updateYLossMax();
    this.getLossPathLine();
    this.getAccPathLine();
    this.updateBarColor();
  },

}
</script>

<style lang="scss">

</style>
