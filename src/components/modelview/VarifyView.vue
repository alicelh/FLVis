<template>
  <div class="VarifyView">
    <svg width="100%" height="100%" ref="varifyView">
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
        left: 100,
        right: 30,
        top: 40,
        bottom: 20
      },
      height: 0,
      colorLinear: '',
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
      let domain = [999999, -999999];
      for (let i = 0; i < this.clientConfusionMatrix.length; i++) {
        let temp = d3.extent(this.clientConfusionMatrix[i]);
        if (temp[0] < domain[0]) domain[0] = temp[0];
        if (temp[1] > domain[1]) domain[1] = temp[1];
      }
      this.colorLinear = d3.scaleLinear()
				.domain(domain)
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
.axis-text {
  text-anchor: middle;
  font-size: 15px;
}
</style>
