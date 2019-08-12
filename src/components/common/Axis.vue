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
    deleteDomainPath: Boolean
  },
  // data () {
  //   return {
  //     textAnchor: 'end'
  //   };
  // },
  methods: {
    createAxis () {
      let node = this.$refs.axis;
      let axis = d3['axis' + this.orient](this.scale).ticks(this.ticks);
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