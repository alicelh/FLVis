<template>
  <div id="main">
    <div id="leftPanel">
      <div id="mainView">
        <MainView/>
      </div>
      <div id="modelView">
        <ModelView/>
      </div>
      <!-- <div id="serverView">
        <ServerView />
      </div>
      <div id="mainView"></div>
      <div id="structureView">
        <MatrixView />
      </div> -->
      
    </div>
    <div id="rightPanel">
      <div id="projectView">
        <ProjectView/>
      </div>
      <div id="clientView">
        <ClientView/>
      </div>
    </div>
  </div>
</template>

<script>
import ServerView from './ServerView';
import MatrixView from './MatrixWave';
import MainView from './MainView';
import ModelView from './ModelView';
import ProjectView from './ProjectView';
import ClientView from './ClientView';

export default {
  name: 'layout',
  data: function () {
    return {};
  },
  components: {
    ServerView,
    MatrixView,
    MainView,
    ModelView,
    ProjectView,
    ClientView
  }
};
</script>

<style scoped lang="scss">
#main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 10px;
  #leftPanel {
    display: grid;
    grid-gap: 10px;
    #serverView {
      height: 200px;
    }
    #mainView {
      height: 550px;
    }
    #modelView {
      height: 350px;
    }
  }
  #rightPanel {
    display: grid;
    grid-gap: 10px;
    #projectView {
      height: 500px;
    }
    #clientView {
      height: 400px;
    }
  }
}
</style>
