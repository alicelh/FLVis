<template>
  <g :transform="transform">
    <g ref="brush"></g>
  </g>
</template>

<script>
import * as d3 from 'd3';
import { mapState } from 'vuex';

export default {
  name: 'Brush',
  props: {
    transform: String,
    brushArea: Array,
    xscale: Function,
  },
  // ...mapState() {

  // }
  // data() {
  //   return {
  //     brushstart: 0,
  //     brushend: 0
  //   };
  // },
  methods: {
    createBrush () {
      let node = this.$refs.brush;
      let brush = d3.brushX()
        .extent(this.brushArea)
        // .on('brush', this.brushed)
        // .on('start', this.brushstart)
        .on('end', this.brushend);
      d3.select(node)
        .attr('class', 'brush')
        .call(brush)
        // .call(brush.move, this.xscale.range());
    },
    // brushstart () {
    //   const selection = d3.event.selection;
    //   this.brushstart = Math.floor(this.xscale.invert(selection[0]));
    //   // console.log(Math.floor(this.xscale.invert(selection[0])), Math.ceil(this.xscale.invert(selection[0])));
    //   // x.domain(selection.map(x2.invert, x2));
    //   // focus.selectAll('.dot')
    //   //   .attr('cx', d => x(d.date))
    //   //   .attr('cy', d => y(d.price));
    //   // focus.select('.axis--x').call(xAxis);
    // },
    brushend () {
      const selection = d3.event.selection;
      // console.log(Math.floor(this.xscale.invert(selection[0])), Math.ceil(this.xscale.invert(selection[1])));
      let invertSelection = [Math.floor(this.xscale.invert(selection[0])), Math.ceil(this.xscale.invert(selection[1]))];
      this.$store.dispatch('server/getClientStasticsRange', invertSelection);
    }
  },
  watch: {
    brushArea: function (newVal, oldVal) {
      this.createBrush();
    }
  },
  // mounted () {
  //   this.createBrush();
  // }
};
</script>