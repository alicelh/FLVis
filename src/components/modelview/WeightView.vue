<template>
  <div id="weightView" :style="{'width':chartWidth+'px'}">
    <svg width="100%" height="100%">
      <g :transform="'translate('+margin.left+','+margin.top+')'">
        <WeightBar
          trans="translate(0,0)"
          :colorScale="colorScale"
          :xscale="xscale"
          :rectHeight="rectHeight"
          :rectWidth="rectWidth"
          :para="paraArrayServer"
        />
        <WeightBar
          :trans="'translate(0,'+(rectHeight+chartInterval)+')'"
          :colorScale="colorScale"
          :xscale="xscale"
          :rectHeight="rectHeight"
          :rectWidth="rectWidth"
          :para="paraArrayClient"
        />
      </g>
    </svg>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";
import WeightBar from "./WeightBar";

export default {
  name: "WeightView",
  data: function() {
    return {
      margin: {
        left: 50,
        right: 50,
        top: 10,
        bottom: 20
      },
      height: 300,
      chartInterval: 20,
      paraArrayServer: [],
      paraArrayClient: [],
      colorScale: d3
        .scaleThreshold()
        .range([
          "#a50026",
          "#d73027",
          "#f46d43",
          "#fdae61",
          "#fee090",
          "#e0f3f8",
          "#abd9e9",
          "#74add1",
          "#4575b4",
          "#313695"
        ])
    };
  },
  props: {
    width: Number
  },
  components: {
    WeightBar
  },
  computed: {
    chartWidth() {
      return this.width - this.margin.left - this.margin.right;
    },
    rectHeight() {
      return (
        (this.height -
          this.margin.top -
          this.margin.left -
          this.chartInterval) /
        2
      );
    },
    ...mapState({
      paraServer: state => state.client.paradata.server,
      paraClient: state => state.client.paradata.client,
      paraCount: state => state.model.paranum,
      layerCount: state => state.model.layernum
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
    paraServer: function(oldvalue, newvalue) {
      this.getParaServer();
      this.setColorScale();
    },
    paraClient: function(oldvalue, newvalue) {
      this.getParaClient();
    }
  },
  methods: {
    getParaServer() {
      let para = [];
      let paratmp, len;
      for (let i = 0; i < this.layerCount; i++) {
        para = [].concat(...this.paraServer["w" + (i + 1)]);
        paratmp = this.paraServer["b" + (i + 1)];
        len = paratmp.length;
        for (let j = 0; j < len; j++) {
          para.push(...paratmp[j]);
        }
      }
      this.paraArrayServer = para;
    },
    getParaClient() {
      let para = [];
      let paratmp, len;
      for (let i = 0; i < this.layerCount; i++) {
        para = [].concat(...this.paraClient["w" + (i + 1)]);
        paratmp = this.paraClient["b" + (i + 1)];
        len = paratmp.length;
        for (let j = 0; j < len; j++) {
          para.push(...paratmp[j]);
        }
      }
      this.paraArrayClient = para;
    },
    setColorScale() {
      let [min, max] = d3.extent(this.paraArrayServer);
      this.colorScale = this.colorScale.domain([
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
