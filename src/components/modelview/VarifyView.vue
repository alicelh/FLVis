<template>
  <div class="VarifyView">
    <svg width="100%" height="100%" ref="varifyView">
      <defs>
        <linearGradient id="red_linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#e34a33"/>
        </linearGradient>
        <linearGradient id="green_linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#2ca25f"/>
        </linearGradient>
      </defs>
      <g id="matrix-legends" :transform="'translate('+(margin.left+chartHeight/2 - 40)+','+(15)+')'">
        <text y="13" x="-5" style="text-anchor: end;">{{clientConfusionMatrix.length === 0?0:domain[0]}}</text>
        <rect width="80" height="5" fill="url(#green_linear)"></rect>
        <rect y="10" width="80" height="5" fill="url(#red_linear)"></rect>
        <text x="85" y="13" style="text-anchor: start;">{{clientConfusionMatrix.length === 0?0:domain[1]}}</text>
      </g>
      <Axis
        :scale="xscale"
        :trans="'translate('+margin.left+','+(margin.top)+')'"
        orient="Top"
        :deleteDomainPath="true"
      />
      <text class="axis-text" :transform="'translate('+(margin.left+chartHeight/2)+','+(margin.top-20)+')'">Actual</text>      
      <Axis
        :scale="yscale"
        :trans="'translate('+margin.left+','+(margin.top)+')'"
        orient="Left"
        :deleteDomainPath="true"
      />
      <text class="axis-text" :transform="'translate('+(margin.left-20)+','+(margin.top+chartHeight/2)+') rotate(-90)'">Predicted</text>      
      <g :transform="'translate('+margin.left+','+(margin.top)+')'">
        <g v-for="(rowvalue, rowi) in temp" :key="'row-' + rowi">
          <rect
            :x="xscale(rectvalue)"
            :y="yscale(rowvalue)"
            :width="xscale.bandwidth()"
            :height="xscale.bandwidth()"
            :fill="clientConfusionMatrix.length === 0? 'none' : getColor(rowi, recti)"
            stroke="black"
            v-for="(rectvalue, recti) in temp" :key="'rect-'+recti"
          ></rect>
        </g> 
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import Axis from "../common/Axis";
import { mapState } from 'vuex';

export default {
  name: "VarifyView",
  data () {
    return {
      temp: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      margin: {
        left: 70,
        right: 30,
        top: 80,
        bottom: 20
      },
      height: 0,
      colorLinear: '',
      domain: [0, 0]
    }
  },
  components: {
    Axis
  },
  computed: {
    ...mapState({
      clientConfusionMatrix: state => state.client.clientConfusionMatrix,
    }),
    // chartwidth和height相等
    chartHeight () {
      return this.height - this.margin.top - this.margin.bottom;
    },
    xscale () {
      return d3
        .scaleBand()
        .domain(this.temp)
        .range([0, this.chartHeight])
        .paddingInner(0);
    },
    yscale () {
      return d3
        .scaleBand()
        .domain(this.temp)
        .range([0, this.chartHeight])
        .paddingInner(0);;
    },
  },
  methods: {
    getColorLinear () {
      this.domain = [999999, -999999];
      for (let i = 0; i < this.clientConfusionMatrix.length; i++) {
        let temp = d3.extent(this.clientConfusionMatrix[i]);
        if (temp[0] < this.domain[0]) this.domain[0] = temp[0];
        if (temp[1] > this.domain[1]) this.domain[1] = temp[1];
      }
      this.colorLinear = d3.scaleLinear()
				.domain(this.domain)
        .range([0,1]);
    },
    getColor (i, j) {
      let compute = '';
      if(i === j) {
        compute = d3.interpolate(d3.rgb(255, 255, 255), '#2ca25f');
      } else {
        compute = d3.interpolate(d3.rgb(255, 255, 255), '#e34a33');
      }
      return compute(this.colorLinear(this.clientConfusionMatrix[i][j]));
    }
  },
  mounted() {
    let svgnode = this.$refs.varifyView;
    this.height = svgnode.clientHeight;
    this.getColorLinear();
  },
  watch: {
    clientConfusionMatrix: function (newvalue, oldvalue) {
      this.getColorLinear();
    }
  }
}
</script>

<style lang="scss">
.VarifyView {
  .axis-text {
    text-anchor: middle;
    font-size: 15px;
  }
  #matrix-legends {
    text {
      font-size: 15px;
    }
  }
}
</style>
