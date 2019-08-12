<template>
  <div class="VarifyView">
    <svg width="100%" height="100%" ref="varifyView">
      <Axis
        :scale="xscale"
        :trans="'translate('+margin.left+','+(margin.top)+')'"
        orient="Top"
        :deleteDomainPath="true"
      />
      <Axis
        :scale="yscale"
        :trans="'translate('+margin.left+','+(margin.top)+')'"
        orient="Left"
        :deleteDomainPath="true"
      />
      <g :transform="'translate('+margin.left+','+(margin.top)+')'">
        <g v-for="(rowvalue, rowi) in temp" :key="'row-' + rowi">
          <rect
            :x="xscale(rectvalue)"
            :y="yscale(rowvalue)"
            :width="xscale.bandwidth()"
            :height="xscale.bandwidth()"
            fill="none"
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

export default {
  name: "VarifyView",
  data () {
    return {
      temp: ['type1', 'type2', 'type3', 'type4', 'type5', 'type6', 'type7', 'type8', 'type9', 'type10'],
      margin: {
        left: 100,
        right: 30,
        top: 20,
        bottom: 10
      },
      height: 0
    }
  },
  components: {
    Axis
  },
  computed: {
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
  mounted() {
    let svgnode = this.$refs.varifyView;
    this.height = svgnode.clientHeight;
  }
}
</script>

<style lang="scss">

</style>
