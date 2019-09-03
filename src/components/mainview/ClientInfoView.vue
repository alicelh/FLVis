<template>
  <div id="main-top">
    <div id="client-left">
      <svg id="info-container">
        <g transform="translate(45, 15)">
          <rect :width="rectInfoWidth" :height="rectInfoHeight" stroke-dasharray="10 10" stroke="#333" fill="#eee"></rect>
          <g transform="translate(20, 30)">
            <text class="title">Selected iter: {{choosedIterForProjection === 0?'none':choosedIterForProjection}}</text>
            <g transform="translate(0, 25)" class="details">
              <text>
                <tspan>loss: {{iterDetails.loss===-1?'':iterDetails.loss.toFixed(2)}}</tspan>
                <tspan x="0" dy="25">accuracy: {{iterDetails.acc===-1?'':iterDetails.acc.toFixed(2)}}</tspan>
                <tspan x="0" dy="25">data amount: {{iterDetails.dataNum===-1?'':iterDetails.dataNum}}</tspan>
                <tspan x="0" dy="25">client amount: {{iterDetails.clientNum===-1?'':iterDetails.clientNum}}</tspan>
              </text>
            </g>
          </g>
          <line x1="0" :x2="rectInfoWidth" :y1="rectInfoHeight/2" :y2="rectInfoHeight/2" stroke-dasharray="10 10" stroke="#fff"></line>
          <g :transform="'translate(20,' +(rectInfoHeight/2+30) +')'">
            <text class="title">Selected client: {{parseInt(choosedclient) === -1?'none':choosedclient}}</text>
            <g transform="translate(0, 25)" class="details">
              <text>
                <tspan>iter: {{clientDetails.iter===-1?'':clientDetails.iter}}</tspan>
                <tspan x="0" dy="25">loss: {{clientDetails.loss===-1?'':clientDetails.loss.toFixed(2)}}</tspan>
                <tspan x="0" dy="25">accuracy: {{clientDetails.acc===-1?'':clientDetails.acc.toFixed(2)}}</tspan>
                <tspan x="0" dy="25">data amount: {{clientDetails.num===-1?'':clientDetails.num}}</tspan>
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
    <div id="client-right">
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
        <g transform="translate(-15,18)">
          <text transform="translate(45,40) rotate(90)" fill="#333">Data Size</text>
          <rect transform="translate(25,0)" width="14px" height="80px" fill="url(#rectgreen_linear)"></rect>
          <text class="label" transform="translate(30,-5)" fill="#333">{{clientDataNumMinMax[1]}}</text>
          <text class="label" transform="translate(30,95)" fill="#333">{{clientDataNumMinMax[0]}}</text>
        </g>
      </svg>
    </div>
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
      panelNum: 8,
      gridColumns: '',
      choosedIters: [],
      clientDataNumMinMax: [],
      colorLinear: '',
      linkedClientArr: [],
      rectInfoWidth: 200,
      rectInfoHeight: 330,
      clientDetails: {
        iter: -1,
        num: -1,
        loss: -1,
        acc: -1
      },
      iterDetails: {
        acc: -1,
        loss: -1,
        dataNum: -1,
        clientNum: -1
      }
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
      choosedclient: state => state.client.choosedclient,
      choosedIterForProjection: state => state.client.choosedIterForProjection,// 选择的某次迭代
      selectedClientInfo: state=>state.client.selectedClientInfo,
      choosedclientiter: state=>state.client.choosedclientiter,
      acc: state=>state.server.acc,
      loss: state=>state.server.loss,
      num: state=>state.server.num,
    })
  },
  watch: {
    choosedIterForProjection: function(newv, oldv) {
      this.iterDetails.acc = this.acc[newv-1];
      this.iterDetails.loss = this.loss[newv-1];
      this.iterDetails.dataNum = this.num[newv-1];
      this.iterDetails.clientNum = this.clientInfoData[newv].length;
    },
    selectedClientInfo: function(newv, oldv) {
      for(let i = 0; i < newv.length; i++) {
        if((newv[i].iter) === parseInt(this.choosedclientiter))
          this.clientDetails = newv[i];
      }
    },
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
#main-top {
  display: grid;
  grid-template-columns: 1fr 4fr;
  #client-left {
    #info-container {
      // margin-left: 45px;
      // margin-top: 15px;
      height: 347px;
      width: 250px;
      // border: 1.5px dashed #333;
      // background: #eee;
      // border-radius: 5px;
      .title {
        fill: #333;
        font-size: 16px;
        font-weight: bold;
      }
      .details {
        fill: #333;
        font-size: 14px;
      }
    }
  }
  #client-right {
    position: relative;
    #clientInfoView{
      display: grid;
      grid-gap: 10px;
      padding: 15px 50px 0px 20px;
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
      top: 10px;
      right: 0px;
      text {
        font-size: 14px;
        text-anchor: middle;
      }
      .label {
        font-size: 12px;
      }
    }
  }
}

</style>
