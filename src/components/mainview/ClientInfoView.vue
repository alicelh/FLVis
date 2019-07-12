<template>
  <div id="clientInfoView" :style="{'grid-template-columns':gridColumns}">
    <div v-for="(item, i) in genePanelArray" :key="i" class="singleIterPanel"></div>
  </div>
</template>
<script>
export default {
  name: "ClientInfoView",
  data () {
    return {
      panelNum: 10,
      gridColumns: ''
      // panelArray: []

    };
  },
  computed: {
    genePanelArray () {
      let panelArray = []
      for (let i = 0; i < this.panelNum; i++) {
        panelArray.push(i);
        this.gridColumns += '1fr '
      }
      return panelArray;
    }
  }
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
</style>
