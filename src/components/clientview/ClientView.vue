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
        <Axis
          :scale="yscaleIterCount"
          :trans="'translate('+margin.left+','+margin.top+')'"
          orient="Left"
          :ticks="5"
        />
        <path :transform="'translate('+margin.left+','+(margin.top)+')'" :d="iterCountLine" fill="none" stroke="#F6A457" stroke-width="2" />
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
        <path :transform="'translate('+margin.left+','+(margin.top)+')'" :d="lossLine" fill="none" stroke="#466BB7" stroke-width="2" />
        <g :transform="'translate('+margin.left+','+(margin.top)+')'">
          <circle
            r=3
            fill="#466BB7"
            :cx="xscale(iterArray[i])"
            :cy="yscaleLoss(item)"
            v-for="(item, i) in this.loss" :key="i"
            ></circle>
        </g>
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
            r=3
            fill="#D68966"
            :cx="xscale(iterArray[i])"
            :cy="yscaleAcc(item)"
            v-for="(item, i) in this.acc" :key="i"
            ></circle>
        </g>
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
        <g :transform="'translate('+margin.left+','+(margin.top)+')'">
          <circle
            r=3
            fill="#90c297"
            :cx="xscale(iterArray[i])"
            :cy="yscaleDataSize(item)"
            v-for="(item, i) in this.dataSize" :key="i"
            ></circle>
        </g>
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
      iterArray: [],
      iterCount: [],
      accLine: '',
      lossLine: '',
      iterCountLine: ''
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
    }
  },
  mounted () {
    this.clientViewWidth = this.$refs.clientView.clientWidth;
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
      height: 380px;
      display: grid;
      grid-template-rows: 1fr 1fr 1fr 1fr;
    }
  }
</style>
