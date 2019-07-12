<template>
  <div id="main">
    <div id="leftPanel">
      <div id="mainView">
        <MainView />
      </div>
      <div id="modelView">
        <ModelView />
      </div>
    </div>
    <div id="rightPanel">
      <div id="projectView">
        <ProjectView />
      </div>
      <div id="clientView">
        <ClientView />
      </div>
    </div>
  </div>
</template>

<script>
import MainView from './mainview/MainView';
import ModelView from './modelview/ModelView';
import ProjectView from './ProjectView';
import ClientView from './ClientView';

export default {
  name: 'layout',
  data: function () {
    return {};
  },
  components: {
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
      height: 580px;
    }
    #modelView {
      height: 350px;
    }
  }
  #rightPanel {
    display: grid;
    grid-gap: 10px;
    #projectView {
      height: 520px;
    }
    #clientView {
      height: 410px;
    }
  }
}
</style>
