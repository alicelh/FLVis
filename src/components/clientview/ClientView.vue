<template>
  <div id="clientView-container" ref="clientView">
    <div class="moduleTitle">Client View</div>
    <div id="clientView-content">
      <svg width="100%" height="100%" ref="clientViewChart">
        <Axis
          :scale="xscale"
          :trans="'translate('+margin.left+','+(margin.top+chartHeight)+')'"
          orient="Bottom"
        />
      </svg>
      <svg width="100%" height="100%">
        <Axis
          :scale="xscale"
          :trans="'translate('+margin.left+','+(margin.top+chartHeight)+')'"
          orient="Bottom"
        />
        <Axis
          :scale="yscaleLoss"
          :trans="'translate('+margin.left+','+margin.top+')'"
          orient="Left"
          :ticks="5"
        />
        <circle
          r=3
          fill="#466BB7"
          :cx="xscale(iterArray[i]) + margin.left"
          :cy="yscaleLoss(item) + margin.top"
          v-for="(item, i) in this.loss" :key="i"
          ></circle>
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
        <circle
          r=3
          fill="#D68966"
          :cx="xscale(iterArray[i]) + margin.left"
          :cy="yscaleAcc(item) + margin.top"
          v-for="(item, i) in this.acc" :key="i"
          ></circle>
      </svg>
      <svg width="100%" height="100%">
        <Axis
          :scale="xscale"
          :trans="'translate('+margin.left+','+(margin.top+chartHeight)+')'"
          orient="Bottom"
        />
        <Axis
          :scale="yscaleDataSize"
          :trans="'translate('+margin.left+','+margin.top+')'"
          orient="Left"
          :ticks="5"
        />
        <circle
          r=3
          fill="#90c297"
          :cx="xscale(iterArray[i]) + margin.left"
          :cy="yscaleDataSize(item) + margin.top"
          v-for="(item, i) in this.dataSize" :key="i"
          ></circle>
      </svg>
    </div>
  </div>
</template>

<script>
import Axis from '../common/Axis';
import * as d3 from 'd3';
import { mapState } from 'vuex';

export default {
  name: "ClientView",
  data() {
    return {
      margin: {
        left: 40,
        right: 30,
        top: 10,
        bottom: 20
      },
      clientViewWidth: 0,
      height: 0,
      acc: [],
      loss: [],
      dataSize: [],
      iterArray: []
    };
  },
  components: {
    Axis
  },
  computed:{
    ...mapState({
      clientInfo: state => state.client.selectedClientInfo,
      iternum: state => state.server.iternum
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
      // this.loss = this.clientInfo.map(d=>d.loss);
      return d3
        .scaleLinear()
        .domain([0, d3.max(this.loss)])
        .range([this.chartHeight, 0]);
    },
    yscaleAcc () {
      // this.acc = this.clientInfo.map(d=>d.acc);
      return d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.chartHeight, 0]);
    },
    yscaleDataSize () {
      // this.dataSize = this.clientInfo.map(d=>d.num);
      return d3
        .scaleLinear()
        .domain([0, d3.max(this.dataSize)])
        .range([this.chartHeight, 0]);
    }
  },
  methods: {

  },
  mounted () {
    this.clientViewWidth = this.$refs.clientView.clientWidth;
    this.height = this.$refs.clientViewChart.clientHeight;
    this.iterArray = this.clientInfo.map(d=>d.iter);
  },
  watch: {
    clientInfo: function (newvalue, oldvalue) {
      this.iterArray = this.clientInfo.map(d=>d.iter);
      this.dataSize = this.clientInfo.map(d=>d.num);
      this.loss = this.clientInfo.map(d=>d.loss);
      this.acc = this.clientInfo.map(d=>d.acc);
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
      height: 380px;
      display: grid;
      grid-template-rows: 1fr 1fr 1fr 1fr;
    }
  }
</style>
