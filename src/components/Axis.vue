<template>
  <g :transform="trans">
    <g ref="axis"></g>
  </g>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Axis',
  props: {
    scale: Function,
    trans: String,
    orient: String
  },
  methods: {
    createAxis () {
      let node = this.$refs.axis;
      let axis = d3['axis' + this.orient](this.scale);
      d3.select(node).call(axis);
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
