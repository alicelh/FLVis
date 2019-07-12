<template>
  <g :transform="trans">
    <g ref="bars">
    </g>
  </g>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Bars',
  props: {
    scale: Function,
    trans: String,
    bars: Array,
    height: Number
  },
  methods: {
    createBars () {
      console.log(this.bars);
      let node = this.$refs.bars;
      d3.select(node)
        .selectAll('rect').remove();
      d3.select(node)
        .selectAll('iterRect')
        .data(this.bars)
        .enter().append('rect')
        .attr('class', 'iterRect')
        .attr('x', (d) => this.scale(d))
        .attr('y', 0)
        .attr('width', this.scale.bandwidth())
        .attr('height', this.height);
    }
  },
  watch: {
    scale: function (newVal, oldVal) {
      this.createBars();
    }
  },
  mounted () {
    this.createBars();
  }
};
</script>

<style lang="scss">
.iterRect {
  fill: #FFF1D9 ;
}
</style>
