<template>
  <div id="weightView" :style="{'width':width+'px'}">
    <svg width="100%" height="100%" ref="weightView">
      <text id="corner" transform="translate(580, 15)">Iter: {{choosedIterForProjection === 0 ? 'not chosen' : choosedIterForProjection}}</text>
      <g :transform="'translate('+margin.left+','+margin.top+')'">
        <!-- <text
          :transform="'translate(-10,' + rectHeight / 2 +') rotate(-90)'"
          class="weightBar-title"
        >Server</text>
        <WeightBar
          trans="translate(0,0)"
          :colorScale="colorLinear"
          :xscale="xscale"
          :rectHeight="rectHeight"
          :paraCount="paraCount"
          :chartWidth="chartWidth"
          :para="paraServer"
          :axisVisable="true"
          :createZoomflag="true"
          :colors="colors"
        /> -->
        <g>
          <!-- <text
            :transform="'translate(-20,' + (rectHeight * 3/ 2 + 20) +') rotate(-90)'"
            class="weightBar-title"
          >Client</text>
          <text
            :transform="'translate(-5,' + (rectHeight * 3/ 2 + 20) +') rotate(-90)'"
            class="weightBar-title"
          >{{choosedclientinmain}}</text> -->
          <text
            :transform="'translate(-20,' + (rectHeight / 2 + 20) +') rotate(-90)'"
            class="weightBar-title"
          >Client ({{choosedclientinmain}}) - Server</text>
          <text
            :transform="'translate(-5,' + (rectHeight / 2 +20) +') rotate(-90)'"
            class="weightBar-title"
          >Difference</text>
        </g>
        <!-- <WeightBar
          :trans="'translate(0,'+(rectHeight*(i+1)+chartInterval*i + 20)+')'"
          :colorScale="i===0?colorLinear:colorDiffLinear"
          :colors="i===0?colors:diffColors"
          :xscale="clientXScale === '' ? xscale : clientXScale"
          :rectHeight="rectHeight"
          :chartWidth="chartWidth"
          :paraCount="paraCount"
          :para="para"
          :axisVisable="false"
          v-for="(para,i) in paraClient"
          :key="'wchart'+i"
          :createZoomflag="false"
        /> -->
        <WeightBar
          :trans="'translate(0,'+(20)+')'"
          :colorScale="colorDiffLinear"
          :colors="diffColors"
          :xscale="clientXScale === '' ? xscale : clientXScale"
          :rectHeight="rectHeight"
          :chartWidth="chartWidth"
          :paraCount="paraCount"
          :para="paraClient"
          :axisVisable="false"
          :createZoomflag="false"
        />
      </g>
    </svg>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import * as d3 from 'd3';
import WeightBar from './WeightBar';
import bus from './bus';
import WeightCanvas from './WeightCanvas';

export default {
  name: 'WeightView',
  data: function () {
    return {
      margin: {
        left: 40,
        right: 20,
        top: 20,
        bottom: 40
      },
      height: 100, // 总高度
      rectHeight: 0, // 一个色带高度
      chartInterval: 15,
      clientXScale: '',
      colorScale: d3
        .scaleThreshold()
        .range([
          '#67001f',
          '#b2182b',
          '#d6604d',
          '#f4a582',
          '#fddbc7',
          '#d1e5f0',
          '#92c5de',
          '#4393c3',
          '#2166ac',
          '#053061'
        ]),
      colorDiffScale: d3
        .scaleThreshold()
        .range([
          // '#67001f',
          // '#b2182b',
          // '#d6604d',
          // '#f4a582',
          // '#fddbc7',
          // '#d1e5f0',
          // '#92c5de',
          // '#4393c3',
          // '#2166ac',
          // '#053061'

          // '#7f3b08',
          // '#b35806',
          // '#e08214',
          // '#fdb863',
          // '#fee0b6',
          // '#d8daeb',
          // '#b2abd2',
          // '#8073ac',
          // '#542788',
          // '#2d004b',
          '#000000',
          '#333333',
          '#6F6F6F',
          '#BBBBBB',
          '#EEEEEE',
          '#EEEEEE',
          '#BBBBBB',
          '#6F6F6F',
          '#333333',
          '#000000',
        ]),
      colorLinear: d3.scaleLinear()
          // .domain(this.clientDataNumMinMax)
          .range([0,1]),
      colors: [d3.rgb(190,174,212), d3.rgb(253,192,134)],
      colorDiffLinear: d3.scaleLinear()
          // .domain(this.clientDataNumMinMax)
          .range([0,1]),
      diffColors: [d3.rgb(255,255,255), d3.rgb(0,0,0)]
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
    chartWidth () {
      return this.width - this.margin.left - this.margin.right;
    },
    ...mapState({
      paraCount: state => state.client.paranum,
      paraServer: state => state.client.serverpara,
      paraClient: state => state.client.clientpara,
      clientChoosed: state => state.client.choosedClientInProjection,
      choosedclientinmain: state=>state.client.choosedclient,
      choosedIterForProjection: state=>state.client.choosedIterForProjection
    }),
    xscale () {
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
    rectWidth () {
      // return this.xscale.bandwidth();
      return this.chartWidth / this.paraCount;
    }
  },
  watch: {
    paraServer: function (newvalue, oldvalue) {
      this.getRectHeight();
      // 设置新的颜色映射
      this.setColorScale();
    },
    // paraClient: function (newvalue, oldvalue) {
      // console.log(newvalue, oldvalue);
      // this.setColorDiffScale(newvalue[1]);
    // },
    clientChoosed: function (newvalue, oldvalue) {
      this.getRectHeight();
      // 换了client后server的颜色映射也要变
      this.setColorScale();
      // 差值的颜色映射
      this.setColorDiffScale(this.paraClient);
      this.clientXScale = '';
      // client跟着server一起zoom
      bus.$on('newxScale', data => {
        this.clientXScale = data;
      });
    },
    paraCount: function (newvalue, oldvalue) {
      this.getRectHeight();
      this.clientXScale = '';
      // 差值的颜色映射
      // if (oldvalue !== 0 && this.paraClient.length !== 0)
        this.setColorDiffScale(this.paraClient);
      // client跟着server一起zoom
      bus.$on('newxScale', data => {
        this.clientXScale = data;
      });
    }
  },
  methods: {
    setColorScale () {
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
      this.colorLinear.domain([min, max]);
      bus.$emit('weightDomain', colorDomain);
    },
    setColorDiffScale (newvalue) {
      let [min, max] = d3.extent(newvalue);
      let initMin = 0, initMax = 0.1;
      if(min < initMin) initMin = min;
      if(max > initMax) initMax = max;
      console.log("", min, max);
      console.log(initMin, initMax);
      // this.colorDiffScale.domain([
      //   min,
      //   (3 * min) / 4,
      //   min / 2,
      //   min / 4,
      //   0,
      //   max / 4,
      //   max / 2,
      //   (max * 3) / 4,
      //   max
      // ]);
      this.colorDiffLinear.domain([initMin, initMax]);
    },
    getRectHeight () {
      this.rectHeight = 100;
        // (this.height -
        //   this.margin.top -
        //   this.margin.bottom -
        //   this.chartInterval * this.paraClient.length) /
        // (this.paraClient.length + 1);
    }
  },
  mounted () {
    let svgnode = this.$refs.weightView;
    this.height = svgnode.clientHeight;
    this.getRectHeight();
    // this.setColorScale();
  }
};
</script>

<style lang="scss">
#weightView {
  height: 100%;
  #corner {
    text-anchor: end;
    font-size: 15px;
    font-weight: bold;
    fill: #333;
  }
  .weightBar-title {
    text-anchor: middle;
    font-size: 14px;
  }
}
</style>
