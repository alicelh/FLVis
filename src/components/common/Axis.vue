<template>
  <g :transform="trans">
    <g ref="axis"></g>
    <!-- <text class="axis-text" :style="{'text-anchor': textAnchor}">123</text> -->
  </g>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Axis',
  props: {
    scale: Function,
    trans: String,
    orient: String,
    ticks: Number,
    deleteDomainPath: Boolean,
    useTickValues: Boolean,
    tickValues: Array
  },
  methods: {
    createAxis () {
      let node = this.$refs.axis;
      let axis;
      if (this.useTickValues) {
        axis = d3['axis' + this.orient](this.scale).tickValues(this.tickValues);
      } else {
        axis = d3['axis' + this.orient](this.scale).ticks(this.ticks);
      }
      d3.select(node).call(axis);
      if (this.deleteDomainPath) {
        d3.select(node).selectAll('.domain').remove();
      }
    }
  },
  watch: {
    scale: function (newVal, oldVal) {
      this.createAxis();
    }
  },
  mounted () {
    this.createAxis();
  }
};
</script>