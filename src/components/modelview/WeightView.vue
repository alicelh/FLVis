<template>
  <div id="weightView" :style="{'width':width+'px'}">
    <svg width="100%" height="100%" ref="weightView">
      <g :transform="'translate('+margin.left+','+margin.top+')'">
        <text :transform="'translate(-10,' + rectHeight / 2 +') rotate(-90)'" class="weightBar-title">Server</text>
        <WeightBar
          trans="translate(0,0)"
          :colorScale="colorScale"
          :xscale="xscale"
          :rectHeight="rectHeight"
          :paraCount="paraCount"
          :chartWidth="chartWidth"
          :para="paraServer"
          :axisVisable="true"
          :createZoomflag="true"
        />
        <g>
          <text :transform="'translate(-20,' + (rectHeight * 3/ 2 + 20) +') rotate(-90)'" class="weightBar-title">Client</text>
          <text :transform="'translate(-5,' + (rectHeight * 3/ 2 + 20) +') rotate(-90)'" class="weightBar-title">Choosed</text>
          <text :transform="'translate(-20,' + (rectHeight * 5/ 2 + 20 + chartInterval) +') rotate(-90)'" class="weightBar-title">Client-Server</text>
          <text :transform="'translate(-5,' + (rectHeight * 5/ 2 + 20 + chartInterval) +') rotate(-90)'" class="weightBar-title">Difference</text>
        </g>
        <WeightBar
          :trans="'translate(0,'+(rectHeight*(i+1)+chartInterval*i + 20)+')'"
          :colorScale="colorScale"
          :xscale="clientXScale === '' ? xscale : clientXScale"
          :rectHeight="rectHeight"
          :chartWidth="chartWidth"     
          :paraCount="paraCount"
          :para="para"
          :axisVisable="false"
          v-for="(para,i) in paraClient"
          :key="'wchart'+i"
          :createZoomflag="false"
        />
        <!-- <g transform="translate(-10,0)" id="legends">
          <rect
            v-for="(color, i) in colors"
            :key="'legend'+i"
            :fill="color"
            :y="i * 5"
            width="5"
            height="5"
          ></rect>
        </g> -->
      </g>
    </svg>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import WeightBar from "./WeightBar";
import bus from "./bus";
import WeightCanvas from "./WeightCanvas";

export default {
  name: "WeightView",
  data: function() {
    return {
      margin: {
        left: 40,
        right: 20,
        top: 20,
        bottom: 40
      },
      height: 100,// 总高度
      rectHeight: 0, // 一个色带高度
      chartInterval: 15,
      clientXScale: '',
      colors: ["#67001f",
          "#b2182b",
          "#d6604d",
          "#f4a582",
          "#fddbc7",
          "#d1e5f0",
          "#92c5de",
          "#4393c3",
          "#2166ac",
          "#053061"],
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
      // colorDiffScale: d3
      //   .scaleThreshold()
      //   .range([
      //     "#67001f",
      //     "#b2182b",
      //     "#d6604d",
      //     "#f4a582",
      //     "#fddbc7",
      //     "#d1e5f0",
      //     "#92c5de",
      //     "#4393c3",
      //     "#2166ac",
      //     "#053061"
      //   ])
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
    ...mapState({
      paraCount: state => state.model.paranum,
      paraServer: state => state.server.serverpara,
      paraClient: state => state.client.clientpara,
      clientChoosed: state => state.client.choosedClientInProjection,
    }),
    xscale() {
      // let bandDomain = [];
      // for (let i = 0; i < this.paraCount; i++) {
      //   bandDomain.push(i);
      // }
      // let scale = d3
      //   .scaleBand()
      //   .domain(bandDomain)
      //   .range([0, this.chartWidth])
      //   .paddingInner(0);
      // console.log(scale.bandwidth());
      // return scale;
      return d3
        .scaleLinear()
        .domain([0, this.paraCount])
        .range([0, this.chartWidth]);
    },
    rectWidth() {
      // return this.xscale.bandwidth();
      return this.chartWidth / this.paraCount;
    }
  },
  watch: {
    paraServer: function(newvalue, oldvalue) {
      this.getRectHeight();
      // 设置新的颜色映射
      this.setColorScale();
    },
    // paraClient: function(newvalue, oldvalue) {
    //   console.log(newvalue, oldvalue);
    //   this.setColorDiffScale([].concat.apply([], newvalue));
    // },
    clientChoosed: function(newvalue, oldvalue) {
      this.getRectHeight();
      // client跟着server一起zoom
      bus.$on("newxScale", data => {
        console.log("new scale client");
        this.clientXScale = data;
        console.log(this.clientXScale === '');
        console.log(this.clientXScale.domain());
      });
    }
  },
  methods: {
    setColorScale() {
      let [min, max] = d3.extent(this.paraServer);
      let colorDomain = [
        min,
        (3 * min) / 4,
        min / 2,
        min / 4,
        0,
        max / 4,
        max / 2,
        (max * 3) / 4,
        max
      ];
      this.colorScale.domain(colorDomain);
      bus.$emit('weightDomain',colorDomain);
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
    },
    getRectHeight () {
      this.rectHeight = (this.height -
          this.margin.top -
          this.margin.bottom -
          this.chartInterval * this.paraClient.length) /
        (this.paraClient.length + 1);
    }
  },
  mounted() {
    let svgnode = this.$refs.weightView;
    this.height = svgnode.clientHeight;
    this.getRectHeight();
    // this.setColorScale();
  },
};
</script>

<style lang="scss">
#weightView {
  height: 100%;
  .weightBar-title {
    text-anchor: middle;
    font-size: 14px
  }
}
</style>
