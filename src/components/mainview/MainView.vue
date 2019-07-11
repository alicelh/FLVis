<template>
  <div id="mainView-container">
    <div class="moduleTitle">Main View</div>
    <div id="clientInfoView-container"></div>
    <div id="serverBrushView-container"></div>
    <div id="serverOverallView-container" ref="serverOverallView">
      <ServerOverallView
        :mainViewWidth = "mainViewWidth"
      />
    </div>
  </div>
</template>

<script>
import ServerOverallView from "./ServerOverallView";

export default {
  name: "MainView",
  data() {
    return {
      mainViewWidth: 0
    };
  },
  components: {
    ServerOverallView
  },
  mounted () {
    this.mainViewWidth = this.$refs.serverOverallView.clientWidth;
    console.log(this.$refs.serverOverallView.clientWidth);
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
      height: 320px;
      width: 100%;
    }
    #serverBrushView-container {
      height: 120px;
      width: 100%;
    }
    #serverOverallView-container {
      height: 50px;
      width: 100%;
    }
  }
</style>
