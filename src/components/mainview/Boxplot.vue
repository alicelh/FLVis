<template>
  <g
    :transform="trans"
    ref="boxplot"
    class="single-boxplot"
    :id="'boxplot-' + this.index"
    @click="getIterClientInfo">
    <line
      class="center"
      :x1="xscale(this.index) + this.boxplotWidth * 0.5 + this.boxplotWidth / 3.0 + this.xOffset"
      :y1="yscale(this.whiskerData[0])"
      :x2="xscale(this.index) + this.boxplotWidth * 0.5 + this.boxplotWidth / 3.0 + this.xOffset"
      :y2="yscale(this.whiskerData[1])">
    </line>
    <rect
      :class="'box-' + this.type"
      :x="xscale(this.index) + this.boxplotWidth / 3.0 + this.xOffset"
      :y="yscale(this.quantileData[2])"
      :width="this.boxplotWidth"
      :height="yscale(this.quantileData[0]) - yscale(this.quantileData[2])">
    </rect>
    <line
      class="median"
      :x1="xscale(this.index) + this.boxplotWidth / 3.0 + this.xOffset"
      :y1="yscale(this.quantileData[1])"
      :x2="xscale(this.index) + this.boxplotWidth + this.boxplotWidth / 3.0 + this.xOffset"
      :y2="yscale(this.quantileData[1])">
    </line>
    <line
      class="whisker"
      :x1="xscale(this.index) + this.boxplotWidth / 3.0 + this.xOffset"
      :y1="yscale(this.whiskerData[0])"
      :x2="xscale(this.index) + this.boxplotWidth + this.boxplotWidth / 3.0 + this.xOffset"
      :y2="yscale(this.whiskerData[0])">
    </line>
    <line
      class="whisker"
      :x1="xscale(this.index) + this.boxplotWidth / 3.0 + this.xOffset"
      :y1="yscale(this.whiskerData[1])"
      :x2="xscale(this.index) + this.boxplotWidth + this.boxplotWidth / 3.0 + this.xOffset"
      :y2="yscale(this.whiskerData[1])">
    </line>
    <circle
      class="outlier"
      :style="isOutlierSelected(outlierClientIndex[i])"
      :data-index="outlierId"
      :data-clientIndex="outlierClientIndex[i]"
      r=3
      :cx="xscale(index) + boxplotWidth * 0.5 + boxplotWidth / 3.0 + xOffset"
      :cy="yscale(dataSort[outlierId])"
      v-for="(outlierId, i) in this.outlierIndices" :key="i">
      >
    </circle>
  </g>
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3';
export default {
  name: "Boxplot",
  props: {
    trans: String,
    index: Number,// iter index
    data: Array, //当前盒须图的数据数组
    clientIndex: Array, //对应的client index
    yscale: Function,
    xscale: Function,
    type: String // loss or acc
  },
  data () {
    return {
      quantileData: [],// 中位数、上下四分位
      whiskerData: [], // q1 - iqr;q3 + iqr
      outlierIndices: [], //outliers的下标
      boxplotWidth: 0,
      xOffset: 0,
      dataSort: [],// 只存了value 升序
      dataSortObject: [],// 存了client index和value, 按value升序
      outlierClientIndex: [],
      choosedClient: -1
    };
  },
  computed: {
    ...mapState({
      choosedclient: state => state.client.choosedclient,
      choosediter: state => state.client.choosedclientiter
    })
  },
  methods: {
    compare(property) {
      return function(obj1, obj2) {
        let value1 = obj1[property];
        let value2 = obj2[property];
        return value1 - value2; // 升序
      };
    },
    updateBoxplotData () {
      // 把client index和对应的值组成一个对象数组
      let clientIndexArray = this.clientIndex;
      let dataObject = this.data.map(function(value, index) {
        return {"clientIndex": clientIndexArray[index], 'value': value}
      });
      // console.log(dataObject)
      let dataSortObject = dataObject.sort(this.compare('value'));
      let dataSort = dataSortObject.map(d=>d.value);
      let dataLength = dataSort.length;
      let q1 = d3.quantile(dataSort, 0.25);
      let q2 = d3.quantile(dataSort, 0.5);
      let q3 = d3.quantile(dataSort, 0.75);
      this.quantileData = [q1, q2, q3];
      let iqr = (q3 - q1 ) * 1.5;
      let i = -1, j = dataLength;
      while(dataSort[++i] < q1 - iqr);
      while(dataSort[--j] > q3 + iqr);
      let whiskerIndices = [i, j];
      this.whiskerData = [dataSort[whiskerIndices[0]], dataSort[whiskerIndices[1]]];
      let bandWidth = this.xscale.bandwidth();
      this.xOffset = this.type === "acc" ? bandWidth * 0.5 : 0;
      this.boxplotWidth = parseFloat(bandWidth) * 0.3;
      // outlier
      this.outlierIndices = d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, dataLength));
      this.dataSort = dataSort;
      this.dataSortObject = dataSortObject;
      // 更新outlier的client index
      this.outlierClientIndex = [];
      for (let i = 0; i < this.outlierIndices.length; i++) {
        this.outlierClientIndex.push(dataSortObject[i].clientIndex);
      }
      this.$store.dispatch('server/updateClientOutlier', [this.index, this.outlierClientIndex, this.type])        
    },
    getIterClientInfo (e) {
      // console.log(this.index);
      this.$store.dispatch('client/getClientInfoByIter', this.index);
    },
    // 判断是否高亮outlier
    isOutlierSelected (clientIndex) {
      if (this.choosediter === this.index) 
        return (this.choosedclient === parseInt(clientIndex)) ? {'stroke': 'red', 'stroke-width': '2px'} : {'stroke': '#000', 'stroke-width': '1px'};
      else
        return {'stroke': '#000', 'stroke-width': '1px'};
    }
  },
  watch: {
    index: function (newvalue, oldvalue) {
      this.updateBoxplotData();
    },
    xscale: function (newvalue, oldvalue) {
      this.updateBoxplotData();
    },
    choosedclient: function (newvalue, oldvalue) {
      this.choosedClient = newvalue;
    }
  },
  created () {
    this.updateBoxplotData();
  }
}
</script>
<style lang="scss">
.box-loss {
  fill: #8cb1cf;
  stroke: #000;
  stroke-width: 1px;
}
.box-acc {
  fill: #f3c0ba;
  stroke: #000;
  stroke-width: 1px;
}
.median, .whisker {
  stroke: #000;
  stroke-width: 1px;
}
.center {
  stroke-dasharray: 3,3;
  stroke: #000;
  stroke-width: 1px;
}
.outlier {
  fill: none;
  stroke: #000;
  stroke-width: 1px;
}
</style>

