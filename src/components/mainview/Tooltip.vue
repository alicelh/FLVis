<template>
  <svg width="80" height="80" class="tooltip" v-show="isMouseHover" :transform="transform">
    <rect width="80" height="80"></rect>
    <g v-for="(value, property, i) in clientData" :key="'tooltip-line-'+i">
      <circle fill="#f3c0ba" r="3" cx="10" :cy="6 + i * 20"></circle>
      <text x="20" :y="10 + i * 20">{{property}}: {{value}}</text>
    </g>
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
  rect {
    fill: #fff;
    // opacity:0.7;
    border-radius: 5px;
    stroke: #f0f3f8;
    stroke-width: 1px;
  }
  text {
    fill: #000;
    font-size: 10px;
  }
}
</style>


