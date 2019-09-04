<template>
  <div id="VarifyView">
    <svg width="100%" height="100%" ref="varifyView">
      <Axis
        :scale="xscale"
        :trans="'translate('+margin.left+','+(margin.top)+')'"
        orient="Top"
        :deleteDomainPath="true"
      />
      <text class="axis-text" :transform="'translate('+(margin.left+chartWidth/2)+','+(margin.top-20)+')'">Predicted</text>      
      <Axis
        :scale="yscale"
        :trans="'translate('+margin.left+','+(margin.top)+')'"
        orient="Left"
        :deleteDomainPath="true"
      />
      <text class="axis-text" :transform="'translate('+(margin.left-20)+','+(margin.top+chartHeight/2)+') rotate(-90)'">Actual</text>      
      <g :transform="'translate('+margin.left+','+(margin.top)+')'" id="matrix-g">
        <g v-for="(rowvalue, rowi) in temp" :key="'row-' + rowi">
          <g v-for="(rectvalue, recti) in temp" :key="'rect-'+recti">
            <rect
              :x="xscale(rectvalue)"
              :y="yscale(rowvalue)"
              :width="xscale.bandwidth()"
              :height="yscale.bandwidth()"
              :fill="clientConfusionMatrix.length === 0? 'none' : getColor(rowi, recti)"
              stroke="#333"
            ></rect>
            <text
              :x="xscale(rectvalue) + xscale.bandwidth() / 2"
              :y="yscale(rowvalue) + 13"
            >{{clientConfusionMatrix.length === 0?'':clientConfusionMatrix[rowi][recti]}}</text>
          </g>
        </g> 
      </g>
      <g v-if="recallArr.length !== 0" :transform="'translate('+(margin.left)+','+(margin.top + chartHeight)+')'" id='precision-g'>
        <text transform="translate(-20, 8)rotate(-90)" id="precision-title">Precision</text>
        <g v-for="(value, i) in precisionArr" :key="'precision-'+i" class="precision-content">
          <rect
            :x="xscale(i)"
            y="5"
            :fill="getGreenColor(value)"
            stroke="#333"
            :width="xscale.bandwidth()"
            :height="yscale.bandwidth()"
          ></rect>
          <text :x="xscale(i) + xscale.bandwidth() / 2" y="18">{{Math.round(value * 100)  + '%'}}</text>
        </g>
      </g>
      <g v-if="recallArr.length !== 0" :transform="'translate('+(margin.left+chartWidth)+','+(margin.top)+')'" id='recall-g'>
        <text transform="translate(20, -20)" id="recall-title">Recall</text>
        <g v-for="(value, i) in recallArr" :key="'recall-'+i" class="recall-content">
          <rect
            x="5"
            :y="yscale(i)"
            :fill="getGreenColor(value)"
            stroke="#333"
            :width="xscale.bandwidth()"
            :height="yscale.bandwidth()"
          ></rect>
          <text :x="xscale.bandwidth() / 2 + 5" :y="yscale(i) + 13">{{Math.round(value * 100)  + '%'}}</text>
        </g>
      </g>
      <g v-if="recallArr.length !== 0" :transform="'translate('+(margin.left+chartWidth)+','+(margin.top + chartHeight)+')'" id='acc-g'>
        <rect
          x="5"
          y="5"
          :fill="getGreenColor(accuracy)"
          stroke="#333"
          :width="xscale.bandwidth()"
          :height="yscale.bandwidth()"
        ></rect>
        <text :x="xscale.bandwidth() / 2 + 5" :y="18">{{Math.round(accuracy * 100)  + '%'}}</text>
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
            <linearGradient id="gray_linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#000"/>
            </linearGradient>
            <linearGradient id="weight_linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgb(190,174,212)"/>
              <stop offset="100%" stop-color="rgb(253,192,134)"/>
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
          <!-- <g id="weightBar-legends" :transform="'translate(50, 40)'">
            <text x="50" y="-20" style="text-anchor: middle;">Weight Bars Encodings</text>
            <g
              v-for="(color, i) in weightBarColors"
              :key="'rect-'+i"
              :transform="'translate(10, 0)'"
            >
              <text class='label' v-if="weightLegendValue.length !== 0" :y="9 + i * 13" x="-10" style="text-anchor: end;">{{(i>0)?weightLegendValue[i-1].toFixed(2):'&lt;'+weightLegendValue[i].toFixed(2)}}</text>
              <rect
                width="80"
                height="10"
                :y="i * 13"
                :fill="'url(#linear_'+ i+')'"
                >
              </rect>
              <text class='label' v-if="weightLegendValue.length !== 0" x="90" :y="9 + i * 13" style="text-anchor: start;">{{(i===weightBarColors.length-1)?'>'+weightLegendValue[i-1].toFixed(2):weightLegendValue[i].toFixed(2)}}</text>
            </g>
          </g> -->
          <rect x="4" y="40" width="195" height="205" fill="none" stroke="#333" stroke-dasharray="10 10" stroke-width="1px"></rect>
          <g id="weightBar-legends" :transform="'translate(50, 90)'">
            <text x="50" y="-20" style="text-anchor: middle;">Weight Bars Encodings</text>
            <text x="50" y="3" style="text-anchor: middle;font-size: 12px">Server &amp; Client Selected</text>
            <text x="-20" y="20" style="text-anchor: end;font-size: 12px">Low</text>
            <text x="120" y="20" style="text-anchor: start;font-size: 12px">High</text>
            <rect width="130" height="10" x="-15" y="10" fill="url(#weight_linear)"></rect>
            <text x="50" y="35" style="text-anchor: middle;font-size: 12px">Difference</text>
            <text x="-20" y="50" style="text-anchor: end;font-size: 12px">Low</text>
            <text x="120" y="50" style="text-anchor: start;font-size: 12px">High</text>
            <rect width="130" height="10" x="-15" y="40" fill="url(#gray_linear)"></rect>
          </g>
          <g id="matrix-legends" :transform="'translate(50, 200)'">
            <text x="50" y="-20" style="text-anchor: middle; fill: #333;">Confusion Matrix Encodings</text>
            <text class='label' x="-25" y="15" style="text-anchor: middle;">{{clientConfusionMatrix.length === 0?0:domain[0]}}</text>
            <rect x="-15" width="130" height="10" fill="url(#green_linear)"></rect>
            <rect x="-15" y="13" width="130" height="10" fill="url(#red_linear)"></rect>
            <text class='label' x="125" y="15" style="text-anchor: middle;">{{clientConfusionMatrix.length === 0?0:domain[1]}}</text>
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
        left: 40,
        right: 45,
        top: 40,
        bottom: 40
      },
      height: 0,
      width: 0,
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
      weightLegendValue: [],
      precisionArr: [],
      recallArr: [],
      accuracy: 0,
      greenColor: ["#99d8c9", "#005824"]
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
    chartWidth () {
      return this.width - this.margin.left - this.margin.right;
    },
    xscale () {
      return d3
        .scaleBand()
        .domain(this.temp)
        .range([0, this.chartWidth])
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
    },
    getGreenColor(val) {
      let arrAll = this.precisionArr.concat(this.recallArr);
      let domain = d3.extent(arrAll);
      let colorLinear = d3.scaleLinear()
				.domain(domain)
        .range([0,1]);
      let compute = d3.interpolate(d3.rgb(216, 238, 226), d3.rgb(44, 162, 95));
      return compute(colorLinear(val));
    },
    // 计算precision recall值
    getPrecisionRecall () {
      this.precisionArr = [];
      this.recallArr = [];
      let recallAll = 0;
      let all = 0, accuracyAll = 0;
      for (let i = 0; i < this.clientConfusionMatrix.length; i++) {
        for (let j = 0; j < this.clientConfusionMatrix[i].length; j++) {
          recallAll += this.clientConfusionMatrix[i][j];
          all += this.clientConfusionMatrix[i][j];
        }
        accuracyAll += this.clientConfusionMatrix[i][i];
        if (recallAll === 0)
          this.recallArr.push(0);
        else
          this.recallArr.push(this.clientConfusionMatrix[i][i] / recallAll);
        recallAll = 0;
      }
      this.accuracy = accuracyAll / all;
      let precisionAll = 0;
      for (let i = 0; i < this.clientConfusionMatrix[0].length; i++) {
        for (let j = 0; j < this.clientConfusionMatrix.length; j++) {
          precisionAll += this.clientConfusionMatrix[j][i];
        }
        if (precisionAll === 0)
          this.precisionArr.push(0);
        else
          this.precisionArr.push(this.clientConfusionMatrix[i][i] / precisionAll);
        precisionAll = 0;
      }
    }
  },
  mounted() {
    let svgnode = this.$refs.varifyView;
    this.height = svgnode.clientHeight;
    this.width = svgnode.clientWidth;
    this.getColorLinear();
  },
  watch: {
    clientConfusionMatrix: function (newvalue, oldvalue) {
      this.getColorLinear();
      this.getPrecisionRecall();
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
  grid-template-columns: 2fr 1.1fr;
  align-items: center;
  justify-items: center;
  .axis-text {
    text-anchor: middle;
    font-size: 15px;
    fill: #333;
  }
  #matrix-legends, #weightBar-legends {
    text {
      font-size: 15px;
    }
    .label {
      font-size: 12px;
    }
  }
  #legends-container {
    // border: 1px solid #b1b1b1;
    width: 210px;
    height: 285px;
  }
  #matrix-g {
    font-size: 12px;
    text-anchor: middle;
  }
  #precision-g {
    text-anchor: middle;
    #precision-title {
      font-size: 14px;
    }
    .precision-content {
      font-size: 12px;
    }
  }
  #recall-g {
    text-anchor: middle;
    #recall-title {
      font-size: 15px;
    }
    .recall-content {
      font-size: 12px;
    }
  }
  #acc-g {
    text {
      font-size: 12px;
      text-anchor: middle;
    }
  }
}
</style>
