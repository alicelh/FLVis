<template>
  <g :transform="trans" ref="boxplot">
  </g>
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3';
export default {
  name: "Boxplot",
  props: {
    // scale: Function,
    trans: String,
    index: Number,
    loss: Array,
    yscale: Function,
    xscale: Function
  },
  data () {
    return {

    };
  },
  computed: {
    quantileData () {
      let q1 = d3.quantile(this.loss, 0.25);
      let q2 = d3.quantile(this.loss, 0.5);
      let q3 = d3.quantile(this.loss, 0.75);
      return [q1.toFixed(2), q2.toFixed(2), q3.toFixed(2)];
    },
    // ...mapState({
    //   loss: state => state.server.brushedClientStastics[this.index].loss,
    //   acc: state => state.server.brushedClientStastics[this.index].acc
    // })
  },
  methods: {
    geneBoxplot () {
      console.log(this.loss);
      console.log(this.quantileData);
      let node = this.$refs.boxplot;
      d3.selectAll(node)
        .data([this.quantileData])
        .enter()
        .append("rect")
        .attr("class", "box")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 50);  
    }
  },
  // watch: {
  //   xscale: function (oldvalue, newvalue) {
  //     this.geneBoxplot();
  //   }
  // },
  mounted () {
    // this.geneBoxplot();
  }
}
</script>
<style lang="scss">
.box {
  fill: rgb(68, 147, 212);
  }
</style>

