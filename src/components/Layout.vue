<template>
  <div id="main">
    <div id="leftPanel">
      <div id="serverView">
        <ServerView />
      </div>
      <div id="mainView"></div>
      <div id="structureView">
        <MatrixView />
      </div>
    </div>
    <div id="rightPanel">
      <div id="projectView"></div>
      <div id="clientView"></div>
    </div>
  </div>
</template>

<script>
import ServerView from './ServerView';
import MatrixView from './MatrixWave';

export default {
  name: 'layout',
  data: function () {
    return {};
  },
  components: {
    ServerView,
    MatrixView
  }
};
</script>

<style scoped lang="scss">
#main {
  display: grid;
  grid-template-columns: 900px 1fr;
  #leftPanel {
    width: 100%;
    #serverView {
      height: 200px;
    }
    #mainView {
      height: 400px;
    }
    #structureView {
      height: 250px;
    }
  }
}
</style>
