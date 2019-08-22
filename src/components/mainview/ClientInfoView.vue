<template>
  <div>
    <div id="clientInfoView" :style="{'grid-template-columns':gridColumns}">
      <div v-for="(item, i) in choosedIters" :key="'panel-'+i" class="singleIterPanel">
        <ClientIterPanel
          :iterId="item"
          :data="clientInfoData[item]"
          :panelId="i"
          :colorLinear="colorLinear"
          :hasLinkedClient="linkedClientArr[i]"
          :linkedClient="parseInt(choosedclient)"/>
      </div>
      <div v-for="(item, i) in genePanelArray" :key="'void-'+i" class="singleIterPanel">
      </div>
    </div>
    <svg id="client-rect-legend">
       <defs>
        <linearGradient id="rectgreen_linear" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#90c297"/>
          <stop offset="100%" stop-color="#F0F9E8"/>
        </linearGradient>
      </defs>
      <g transform="translate(0,18)">
        <text transform="translate(15,40) rotate(-90)">Data Size</text>
        <rect transform="translate(25,0)" width="14px" height="80px" fill="url(#rectgreen_linear)"></rect>
        <text class="label" transform="translate(30,-5)">{{clientDataNumMinMax[1]}}</text>
        <text class="label" transform="translate(30,95)">{{clientDataNumMinMax[0]}}</text>
      </g>
    </svg>
  </div>
</template>
<script>
import ClientIterPanel from "./ClientIterPanel";
import { mapState } from 'vuex';
import * as d3 from 'd3';

export default {
  name: "ClientInfoView",
  props: {

  },
  data () {
    return {
      panelNum: 10,
      gridColumns: '',
      choosedIters: [],
      clientDataNumMinMax: [],
      colorLinear: '',
      linkedClientArr: []
    };
  },
  components: {
    ClientIterPanel
  },
  computed: {
    genePanelArray () {
      let panelArray = [];
      this.gridColumns = ''
      for (let i = 0; i < this.panelNum; i++) {
        this.gridColumns += '1fr '
      }
      for (let i = 0; i < this.panelNum - this.choosedIters.length; i++) {
        panelArray.push(i);
      }
      return panelArray;
    },
    ...mapState({
      currentChoosedIter: state => state.client.choosediter,
      clientInfoData: state => state.client.clientInfo,
      deleteIter: state => state.client.deleteiter,
      choosedclient: state => state.client.choosedclient
    })
  },
  watch: {
    currentChoosedIter: function (newvalue, oldvalue) {
      let v = parseInt(newvalue);
      if(v !== -1 && this.choosedIters.indexOf(v) === -1 && this.choosedIters.length < this.panelNum) {
        this.choosedIters.push(v);
        this.choosedIters.sort(d3.ascending);
        this.clientDataNumMinMax = [9999999, -1];
        for(var i in this.clientInfoData) {
          let tmp = d3.extent(this.clientInfoData[i].map(d=>d.num));
          if(tmp[0] < this.clientDataNumMinMax[0]) this.clientDataNumMinMax[0] = tmp[0];
          if(tmp[1] > this.clientDataNumMinMax[1]) this.clientDataNumMinMax[1] = tmp[1];
        }
        this.colorLinear = d3.scaleLinear()
          .domain(this.clientDataNumMinMax)
          .range([0,1]);
        this.updateLinking();
      }
    },
    deleteIter: function (newvalue, oldvalue) {
      // 从choosedIters删除
      let deleteId = this.choosedIters.indexOf(newvalue);
      if(deleteId > -1) {
        this.choosedIters.splice(deleteId, 1);
        let clientDataNumMinMax = [9999999, -1];
        for(var i in this.clientInfoData) {
          let tmp = d3.extent(this.clientInfoData[i].map(d=>d.num));
          if(tmp[0] < clientDataNumMinMax[0]) clientDataNumMinMax[0] = tmp[0];
          if(tmp[1] > clientDataNumMinMax[1]) clientDataNumMinMax[1] = tmp[1];
        }
        this.colorLinear = d3.scaleLinear()
          .domain(clientDataNumMinMax)
          .range([0,1]);
        this.updateLinking();
      }
    },
    choosedclient: function (newv, oldv) {
      this.updateLinking();
    }
  },
  methods: {
    updateLinking() {
      if (this.choosedclient !== -1) {
        this.linkedClientArr = [];
        for (let key in this.clientInfoData) {
          let clientIndexArr = this.clientInfoData[key].map(d=>d.index);
          this.linkedClientArr.push(clientIndexArr.indexOf(parseInt(this.choosedclient)) > -1 ? true : false);
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#clientInfoView{
  display: grid;
  grid-gap: 10px;
  padding: 15px 50px 0px 50px;
  .singleIterPanel {
    border-radius: 5px;
    height: 330px;
    background: #D8D8D8;
    border: 1px solid #979797;
  }
}
#client-rect-legend {
  position: absolute;
  height: 150px;
  width: 50px;
  left: 10px;
  top: 55px;
  text {
    font-size: 14px;
    text-anchor: middle;
  }
  .label {
    font-size: 12px;
  }
}
</style>
