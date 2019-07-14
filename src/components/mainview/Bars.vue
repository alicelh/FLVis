<template>
  <g :transform="trans">
    <rect
      class="iterRect"
      :id="'bar-'+bars[i]"
      :x="scale(bars[i])"
      y=0
      :width="scale.bandwidth()"
      :height="height"
      :fill="getColor(size)"
      @click="getIterClientInfo"
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
    },
    getColor (size) {
      let colorLinear = d3.scaleLinear()
				.domain(d3.extent(this.dataSize))
        .range([0,1]);
      let compute = d3.interpolate(d3.rgb(255, 255, 255), d3.rgb(249, 233, 205));
      return compute(colorLinear(size));
    },
    getIterClientInfo (e) {
      let barId = e.target.getAttribute("id");
      let iterId = barId.split('-')[1];
      console.log(iterId);
      this.$store.dispatch('client/getClientInfoByIter', iterId);
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
