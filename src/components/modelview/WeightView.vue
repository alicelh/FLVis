<template>
  <div id="weightView" :style="{'width':width+'px'}">
    <svg width="100%" height="100%">
      <g :transform="'translate('+margin.left+','+margin.top+')'">
        <WeightBar
          trans="translate(0,0)"
          :colorScale="colorScale"
          :xscale="xscale"
          :rectHeight="rectHeight"
          :rectWidth="rectWidth"
          :para="paraServer"
          :axisVisable="true"
        />
        <g
          v-for="(para,i) in paraClient"
          :transform="'translate(0,'+(rectHeight+20)+')'"
          :key="'wchart'+i"
        >
          <WeightBar
            :v-for="para in paraClient"
            :trans="'translate(0,'+(rectHeight*i+chartInterval*i)+')'"
            :colorScale="colorDiffScale"
            :xscale="xscale"
            :rectHeight="rectHeight"
            :rectWidth="rectWidth"
            :para="para"
            :axisVisable="false"
          />
        </g>
        <!-- <WeightCanvas
          trans="translate(0,0)"
          :colorScale="colorScale"
          :xscale="xscale"
          :width="chartWidth"
          :rectHeight="serverHeight"
          :rectWidth="rectWidth"
          :para="paraServer"
        />
        <template v-for="(para,i) in paraClient">
          <WeightCanvas
            :trans="'translate(0,'+(serverHeight + rectHeight*i+chartInterval*i)+')'"
            :colorScale="colorScale"
            :xscale="xscale"
            :width="chartWidth"
            :rectHeight="rectHeight"
            :rectWidth="rectWidth"
            :para="para"
            :key="'weightcanvas'+i"
          />
        </template>-->
      </g>
    </svg>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import WeightBar from "./WeightBar";
import WeightCanvas from "./WeightCanvas";

export default {
  name: "WeightView",
  data: function() {
    return {
      margin: {
        left: 50,
        right: 12,
        top: 10,
        bottom: 10
      },
      height: 300,
      serverHeight: 25,
      // width: 800,
      chartInterval: 5,
      colorScale: d3
        .scaleThreshold()
        .range([
          "#67001f",
          "#b2182b",
          "#d6604d",
          "#f4a582",
          "#fddbc7",
          "#d1e5f0",
          "#92c5de",
          "#4393c3",
          "#2166ac",
          "#053061"
        ]),
      colorDiffScale: d3
        .scaleThreshold()
        .range([
          "#67001f",
          "#b2182b",
          "#d6604d",
          "#f4a582",
          "#fddbc7",
          "#d1e5f0",
          "#92c5de",
          "#4393c3",
          "#2166ac",
          "#053061"
        ])
    };
  },
  props: {
    width: Number
  },
  components: {
    WeightBar,
    WeightCanvas
  },
  computed: {
    chartWidth() {
      return this.width - this.margin.left - this.margin.right;
    },
    rectHeight() {
      return (
        (this.height -
          this.margin.top -
          this.margin.bottom -
          this.chartInterval * this.paraClient.length) /
        (this.paraClient.length + 1)
      );
    },
    ...mapState({
      paraCount: state => state.model.paranum,
      layerCount: state => state.model.layernum
    }),
    ...mapState({
      paraServer: state => state.server.serverpara,
      paraClient: state => state.client.clientparalist
    }),
    xscale() {
      return d3
        .scaleLinear()
        .domain([0, this.paraCount])
        .range([0, this.chartWidth]);
    },
    rectWidth() {
      return this.chartWidth / this.paraCount;
    }
  },
  watch: {
    paraServer: function(newvalue, oldvalue) {
      this.setColorScale(newvalue);
    },
    paraClient: function(newvalue, oldvalue) {
      this.setColorDiffScale([].concat.apply([], newvalue));
    }
  },
  methods: {
    setColorScale(newvalue) {
      let [min, max] = d3.extent(this.paraServer);
      this.colorScale.domain([
        min,
        (3 * min) / 4,
        min / 2,
        min / 4,
        0,
        max / 4,
        max / 2,
        (max * 3) / 4,
        max
      ]);
    },
    setColorDiffScale(newvalue) {
      let [min, max] = d3.extent(newvalue);
      this.colorDiffScale.domain([
        min,
        (3 * min) / 4,
        min / 2,
        min / 4,
        0,
        max / 4,
        max / 2,
        (max * 3) / 4,
        max
      ]);
    }
  }
};
</script>

<style scoped>
#weightView {
  height: 100%;
}
</style>
