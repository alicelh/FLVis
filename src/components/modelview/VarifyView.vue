<template>
  <div id="VarifyView">
    <svg width="100%" height="100%" ref="varifyView">
      <g id="matrix-legends" :transform="'translate('+(margin.left+chartHeight+margin.right)+','+(margin.top)+')'">
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
      <text class="axis-text" :transform="'translate('+(margin.left+chartHeight/2)+','+(margin.top-20)+')'">Predicted</text>      
      <Axis
        :scale="yscale"
        :trans="'translate('+margin.left+','+(margin.top)+')'"
        orient="Left"
        :deleteDomainPath="true"
      />
      <text class="axis-text" :transform="'translate('+(margin.left-20)+','+(margin.top+chartHeight/2)+') rotate(-90)'">Actual</text>      
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
    <div>
      <div id ="legends-container">
        <svg width="100%" height="100%">
          <defs>
            <linearGradient id="red_linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#e34a33"/>
            </linearGradient>
            <linearGradient id="green_linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#2ca25f"/>
            </linearGradient>
            <linearGradient
              :id="'linear_' + i" x1="0%" y1="0%" x2="100%" y2="0%"
              v-for="(color, i) in weightBarColors"
              :key="'color-'+i"
            >
              <stop offset="0%" :stop-color="color"/>
              <stop offset="100%" :stop-color="weightBarColors[i+1]"/>
            </linearGradient>
          </defs>
          <g id="weightBar-legends" :transform="'translate(90, 40)'">
            <text x="50" y="-20" style="text-anchor: middle;">Weight Bars Encodings</text>
            <g
              v-for="(color, i) in weightBarColors"
              :key="'rect-'+i"
            >
              <text class='label' v-if="weightLegendValue.length !== 0" :y="9 + i * 13" x="-10" style="text-anchor: end;">{{(i>0)?weightLegendValue[i-1].toFixed(2):'&lt;'+weightLegendValue[i].toFixed(2)}}</text>
              <rect
                width="100"
                height="10"
                :y="i * 13"
                :fill="'url(#linear_'+ i+')'"
                >
              </rect>
              <text class='label' v-if="weightLegendValue.length !== 0" x="110" :y="9 + i * 13" style="text-anchor: start;">{{(i===weightBarColors.length-1)?'>'+weightLegendValue[i-1].toFixed(2):weightLegendValue[i].toFixed(2)}}</text>
            </g>
          </g>
          <g id="matrix-legends" :transform="'translate(90, 220)'">
            <text x="50" y="-10" style="text-anchor: middle;">Confusion Matrix Encodings</text>
            <text class='label' y="15" x="-10" style="text-anchor: end;">{{clientConfusionMatrix.length === 0?0:domain[0]}}</text>
            <rect width="100" height="10" fill="url(#green_linear)"></rect>
            <rect y="13" width="100" height="10" fill="url(#red_linear)"></rect>
            <text class='label' x="110" y="15" style="text-anchor: start;">{{clientConfusionMatrix.length === 0?0:domain[1]}}</text>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import Axis from "../common/Axis";
import bus from "./bus";
import { mapState } from 'vuex';

export default {
  name: "VarifyView",
  data () {
    return {
      temp: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      margin: {
        left: 50,
        right: 60,
        top: 40,
        bottom: 20
      },
      height: 0,
      colorLinear: '',
      domain: [0, 0],
      weightBarColors: ["#67001f",
          "#b2182b",
          "#d6604d",
          "#f4a582",
          "#fddbc7",
          "#d1e5f0",
          "#92c5de",
          "#4393c3",
          "#2166ac",
          "#053061"],
      weightLegendValue: []
    }
  },
  components: {
    Axis
  },
  computed: {
    ...mapState({
      clientConfusionMatrix: state => state.client.clientConfusionMatrix,
      choosedIter: state => state.client.choosedIterForProjection,
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
    },
    choosedIter: function (newvalue, oldvalue) {
      bus.$on("weightDomain", data => {
        this.weightLegendValue = data;
      });
    },
  }
}
</script>

<style lang="scss">
#VarifyView {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-items: center;
  .axis-text {
    text-anchor: middle;
    font-size: 15px;
  }
  #matrix-legends, #weightBar-legends {
    text {
      font-size: 15px;
    }
    .label {
      font-size: 13px;
    }
  }
  #legends-container {
    // border: 1px solid #b1b1b1;
    width: 300px;
    height: 285px;
  }
}
</style>
