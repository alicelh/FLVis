<template>
  <svg width="85" height="80" class="tooltip" v-show="isMouseHover" :transform="transform">
  <!-- <g class="tooltip" v-show="isMouseHover" :transform="transform"> -->
    <rect width="85" height="80"></rect>
    <g v-for="(value, property, i) in clientData" :key="'tooltip-line-'+i">
      <circle fill="#676666" r="3" cx="10" :cy="8 + i * 20"></circle>
      <text x="20" :y="12 + i * 20">{{property}}: {{value}}</text>
    </g>
  <!-- </g> -->
  </svg>
</template>

<script>
export default {
  name: "Tooltip",
  props: {
    clientData: Object,
    isMouseHover: Boolean,
    transform: String
  },
}
</script>

<style lang="scss">
.tooltip {
  // z-index: 999;
  rect {
    fill: #FFFFFF;
    // border-radius: 4px;
    stroke: #353535;
    stroke-width: 1px;
    rx: 4px;
    ry: 4px;
    opacity: 0.77;
    // border: 1px solid #353535;
  }
  text {
    fill: #000;
    font-size: 12px;
  }
}
</style>


