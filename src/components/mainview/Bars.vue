<template>
  <g :transform="trans">
    <rect
      class="iterRect"
      :x="scale(bars[i])"
      y=0
      :width="scale.bandwidth()"
      :height="height"
      :fill="getColor(size)"
      v-for="(size, i) in dataSize" :key="i">
    </rect>
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
    height: Number,
    dataSize: Array
  },
  methods: {
    createBars () {
      // console.log(this.bars);
      // let node = this.$refs.bars;
      // d3.select(node)
      //   .selectAll('rect').remove();
      // d3.select(node)
      //   .selectAll('iterRect')
      //   .data(this.bars)
      //   .enter().append('rect')
      //   .attr('class', 'iterRect')
      //   .attr('x', (d) => this.scale(d))
      //   .attr('y', 0)
      //   .attr('width', this.scale.bandwidth())
      //   .attr('height', this.height);
    },
    getColor (size) {
      console.log(this.dataSize);
      let colorLinear = d3.scaleLinear()
				.domain(d3.extent(this.dataSize))
        .range([0,1]);
      let compute = d3.interpolate(d3.rgb(255, 255, 255), d3.rgb(249, 233, 205));
      return compute(colorLinear(size));
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
</style>
