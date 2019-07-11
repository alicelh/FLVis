<template>
  <div :style="{'width':mainViewWidth+'px','height':height+'px'}">
    <svg width="100%" height="100%">
      <g>
        <Axis
          :scale="xscale"
          :trans="'translate('+margin.left+','+(margin.top+chartHeight)+')'"
          orient="Bottom"
        />
        <Axis
          :scale="yscaleleft"
          :trans="'translate('+margin.left+','+margin.top+')'"
          orient="Left"
          :ticks="yTicks"
        />
        <Axis
          :scale="yscaleright"
          :trans="'translate('+(margin.left+chartWidth)+','+margin.top+')'"
          orient="Right"
          :ticks="yTicks"
        />
        <g :transform="translate">
          <path :d="lossline" fill="none" stroke="blue" stroke-width="2" />
          <path :d="accline" fill="none" stroke="red" stroke-width="2" />
        </g>
        <g id="brush"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3';
import Axis from '../common/Axis';

export default {
  name: 'ServerOverallView',
  props: {
    mainViewWidth: Number
  },
  data: function () {
    return {
      // width: 900,
      height: 80,
      margin: {
        left: 50,
        right: 50,
        top: 10,
        bottom: 20
      },
      lossline: '',
      accline: '',
      yTicks: 2
    };
  },
  components: {
    Axis
  },
  computed: {
    chartWidth () {
      return this.mainViewWidth - this.margin.left - this.margin.right;
    },
    chartHeight () {
      return this.height - this.margin.top - this.margin.bottom;
    },
    translate () {
      return 'translate(' + this.margin.left + ',' + this.margin.top + ')';
    },
    ...mapState({
      loss: state => state.server.loss,
      acc: state => state.server.acc,
      num: state => state.server.num,
      iternum: state => state.server.iternum
    }),
    xscale () {
      return d3
        .scaleLinear()
        .domain([1, this.iternum])
        .range([0, this.chartWidth]);
    },
    yscaleleft () {
      return d3
        .scaleLinear()
        .domain([0, d3.max(this.loss)])
        .range([this.chartHeight, 0]);
    },
    yscaleright () {
      return d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.chartHeight, 0]);
    }
  },
  methods: {
    getLossPathLine () {
      let losspath = d3
        .line()
        .x((d, i) => {
          return this.xscale(i + 1);
        })
        .y(d => {
          return this.yscaleleft(d);
        });
      this.lossline = losspath(this.loss);
    },
    getAccPathLine () {
      let accpath = d3
        .line()
        .x((d, i) => {
          return this.xscale(i + 1);
        })
        .y(d => {
          return this.yscaleright(d);
        });
      this.accline = accpath(this.acc);
    }
  },
  watch: {
    acc: function (oldvalue, newvalue) {
      this.getAccPathLine();
    },
    loss: function (oldvalue, newvalue) {
      this.getLossPathLine();
    }
  },
  mounted () {
    this.getLossPathLine();
    this.getAccPathLine();
  }
};
</script>

<style>
</style>
