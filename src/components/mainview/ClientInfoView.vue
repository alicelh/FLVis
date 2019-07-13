<template>
  <div id="clientInfoView" :style="{'grid-template-columns':gridColumns}">
    <!-- <ClientIterPanel
      :iterId="item"
      :data="clientInfoData[item]"
      v-for="(item, i) in choosedIters" :key="'panel'-i"/> -->
    <div v-for="(item, i) in choosedIters" :key="'panel-'+i" class="singleIterPanel">
      <ClientIterPanel
        :iterId="item"
        :data="clientInfoData[item]"/>
    </div>
    <div v-for="(item, i) in genePanelArray" :key="'void-'+i" class="singleIterPanel">
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
      panelNum: 10,
      gridColumns: '',
      choosedIters: []
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
      deleteIter: state => state.client.deleteiter
    })
  },
  watch: {
    currentChoosedIter: function (newvalue, oldvalue) {
      let v = parseInt(newvalue);
      if(v !== -1 && this.choosedIters.indexOf(v) === -1) {
        this.choosedIters.push(v);
        this.choosedIters.sort(d3.ascending);
      }
    },
    deleteIter: function (newvalue, oldvalue) {
      // 从choosedIters删除
      let deleteId = this.choosedIters.indexOf(newvalue);
      if(deleteId > -1) {
        this.choosedIters.splice(deleteId, 1);
      }
    }
  }
  // methods: {
  //   get
  // }
}
</script>
<style lang="scss" scoped>
#clientInfoView{
  display: grid;
  grid-gap: 10px;
  padding: 15px 50px 0px 50px;
}
.singleIterPanel {
  border-radius: 5px;
  height: 300px;
  background: #D8D8D8;
  border: 1px solid #979797;
}
button {
  margin: 0;
  padding: 0;
  background-image: url("/assets/delete(1).png");
  background-repeat: no-repeat;
  // background: url("./delete.png") no-repeat;
  width: 20px;
  height: 20px;
  border: none;
}
</style>
