<template>
  <g :transform="trans" ref="zoom">
    <defs>
      <clipPath id="clipPath">
        <rect x="0" y="0" :width="chartWidth" :height="rectHeight" />
      </clipPath>
    </defs>
    <Axis
      v-if="axisVisable"
      :scale="newxScale"
      :trans="'translate(0,'+(rectHeight)+')'"
      orient="Bottom"
    />
      <!-- :useTickValues="true"
      :tickValues="xscale.domain().filter(function(d,i){ return !(i%1000)})" -->
    <g clip-path="url(#clipPath)">
      <rect
        :x="newxScale(i)"
        :y="0"
        :width="rectWidth"
        :height="rectHeight"
        v-for="(w,i) in para"
        :fill="computeColor(colorScale(w))"
        :key="'rect-'+i"
      />
    </g>
  </g>
</template>

<script>
import Axis from "../common/Axis";
import * as d3 from "d3";
import bus from "./bus";

export default {
  name: "WeightBar",
  components: {
    Axis
  },
  props: {
    trans: String,
    colorScale: Function,
    rectHeight: Number,
    // rectWidth: Number,
    paraCount: Number,
    chartWidth: Number,
    xscale: Function,
    para: Array,
    axisVisable: Boolean,
    createZoomflag: Boolean,
    colors: Array
  },
  data () {
    return {
      newxScale: '',
      newTransX: 0,
      rectWidth: 0
    };
  },
  methods: {
    createZoom () {
      let node = this.$refs.zoom;
      d3.select(node)
        .call(d3.zoom().scaleExtent([1, 10]).translateExtent([[0,0], [this.chartWidth, this.rectHeight]]).on("zoom", this.zoomed))
    },
    zoomed () {
      this.newxScale = d3.event.transform.rescaleX(this.xscale);
      let newDomain = [Math.ceil(this.newxScale.domain()[0]), Math.floor(this.newxScale.domain()[1])];
      if(newDomain[0] < 0) {
        newDomain[1] = this.paraCount;
        newDomain[0] = 0;
      }
      this.rectWidth =  this.chartWidth / (newDomain[1] - newDomain[0]);
      this.newxScale.domain(newDomain);
      bus.$emit('newxScale', this.newxScale);
    },
    computeColor (num) {
      let compute = d3.interpolate(this.colors[0], this.colors[1]);
      return compute(num);
    },
  },
  created () {
    this.newxScale = this.xscale;
    if (this.paraCount !== 0)
      this.rectWidth = this.chartWidth / this.paraCount;
  },
  watch: {
    xscale: function(newv, oldv) {
      this.newxScale= newv;
      this.rectWidth = this.chartWidth / (this.newxScale.domain()[1] - this.newxScale.domain()[0]);
    },
    paraCount: function(newv, oldv) {
      this.newxScale= this.xscale;
      this.rectWidth = this.chartWidth / newv;
    },
  },
  mounted () {
    if(this.createZoomflag) {
      this.createZoom();
    }
  }
};
</script>
