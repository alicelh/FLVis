<template>
  <g :transform="trans">
    <Axis :scale="xscale" :trans="'translate(0,'+(rectHeight)+')'" orient="Bottom" />
    <foreignObject :height="rectHeight" :width="width" y="0" x="0">
      <MyCanvas style="width: 100%; height: 100%;">
        <template v-for="(w,i) in para">
          <MyBox
            :x1="xscale(i)"
            :x2="xscale(i+1)"
            :y1="0"
            :y2="rectHeight"
            :color="colorScale(w)"
            :value="0"
            :key="'rect-'+i"
          ></MyBox>
        </template>
      </MyCanvas>
    </foreignObject>
  </g>
</template>

<script>
import Axis from "../common/Axis";
import MyCanvas from "./MyCanvas";
import MyBox from "./MyBox";

export default {
  name: "WeightCanvas",
  components: {
    Axis,
    MyCanvas,
    MyBox
  },
  props: {
    trans: String,
    width: Number,
    colorScale: Function,
    rectHeight: Number,
    rectWidth: Number,
    xscale: Function,
    para: Array
  }
};
</script>
