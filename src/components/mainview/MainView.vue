<template>
  <div id="mainView-container">
    <div class="moduleTitle">Main View</div>
    <div id="clientInfoView-container">
      <ClientInfoView />
    </div>
    <div id="clientBrushView-container">
      <ClientBrushView 
        :mainViewWidth = "mainViewWidth"
      />
    </div>
    <div id="serverOverallView-container" ref="serverOverallView">
      <ServerOverallView
        :mainViewWidth = "mainViewWidth"
      />
    </div>
  </div>
</template>

<script>
import ServerOverallView from "./ServerOverallView";
import ClientBrushView from "./ClientBrushView";
import ClientInfoView from "./ClientInfoView";

export default {
  name: "MainView",
  data() {
    return {
      mainViewWidth: 0
    };
  },
  components: {
    ServerOverallView,
    ClientBrushView,
    ClientInfoView
  },
  mounted () {
    this.mainViewWidth = this.$refs.serverOverallView.clientWidth;
  }
}
</script>

<style lang="scss">
  #mainView-container {
    border: 1px solid #4A4A4A;
    border-radius: 5px;
    height: 100%;
    .moduleTitle {
      text-align: left;
      line-height: 30px;
      background: #414447;
      font-size: 24px;
      color: #FFFFFF;
      padding-left: 10px;
    }
    #clientInfoView-container {
      height: 360px;
      // padding: 10px 20px 20px 20px;
      width: 100%;
      // border: 1px solid #979797;
      // background: #D8D8D8
    }
    #clientBrushView-container {
      height: 210px;
      width: 100%;
    }
    #serverOverallView-container {
      height: 100px;
      width: 100%;
    }
  }
</style>
