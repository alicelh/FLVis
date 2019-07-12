<template>
  <div :width="mainViewWidth">
    <svg height="100%" width="100%" v-if="currentBrush.length !== 0">
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
      /> 
      <!-- <Boxplot
        :trans="'translate('+margin.left+','+margin.top+')'"
        :index="currentBrush[0]"
        :loss="brushedClientStastics[currentBrush[0]].loss"
        :yscale="yscaleleft"
        :xscale="xscale" -->
      />
    </svg>
  </div>
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
      height: 150,
      margin: {
        left: 50,
        right: 50,
        top: 10,
        bottom: 20
      },
      selection: [],
      brushedLossMean: []
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
    yscaleleft () {
      let yscaleDomain = [0, d3.max(this.brushedLossMean)];
      return d3
        .scaleLinear()
        .domain(yscaleDomain)
        .range([this.chartHeight, 0]);
    },
    // yscaleright () {
    //   return d3
    //     .scaleLinear()
    //     .domain([0, 1])
    //     .range([this.chartHeight, 0]);
    // },
    ...mapState({
      currentBrush: state => state.server.brushedSelection,//(state => state.server.brushedSelection).length === 0? [0, 0] : state => state.server.brushedSelection,
      brushedClientStastics: state => state.server.brushedClientStastics,
      lossMean: state => state.server.loss,
      accMean: state => state.server.acc,
    }),
  },
  methods: {
    computeYScaleLeft () {
      this.brushedLossMean = this.lossMean.slice(this.currentBrush[0], this.currentBrush[1] + 1);
      console.log(this.brushedLossMean);
    }
  },
  watch: {
    currentBrush: function (oldvalue, newvalue) {
      this.computeYScaleLeft();
    }
  },
  mounted () {
    this.computeYScaleLeft();
  }
}
</script>

