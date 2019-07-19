<template>
  <g :transform="trans">
    <Axis
      v-if="axisVisable"
      :scale="xscale"
      :trans="'translate(0,'+(rectHeight)+')'"
      orient="Bottom"
    />
    <g>
      <rect
        :x="xscale(i)"
        :y="0"
        :width="rectWidth"
        :height="rectHeight"
        v-for="(w,i) in para"
        :fill="colorScale(w)"
        :key="'rect-'+i"
      />
    </g>
  </g>
</template>

<script>
import Axis from "../common/Axis";

export default {
  name: "WeightBar",
  components: {
    Axis
  },
  props: {
    trans: String,
    colorScale: Function,
    rectHeight: Number,
    rectWidth: Number,
    xscale: Function,
    para: Array,
    axisVisable: Boolean
  },
  updated() {
    console.log(this.colorScale(this.para[0]));
  }
};
</script>
