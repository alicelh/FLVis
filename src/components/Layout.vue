<template>
  <div id="main">
    <div id="leftPanel">
      <div id="mainView">
        <MainView />
      </div>
      <div id="clientView">
        <ClientView />
      </div>
    </div>
    <div id="rightPanel">
      <div id="projectView">
        <ProjectView />
      </div>
      
      <div id="modelView">
        <ModelView />
      </div>
    </div>
  </div>
</template>

<script>
import MainView from './mainview/MainView';
import ModelView from './modelview/ModelView';
import ProjectView from './ProjectView';
import ClientView from './clientview/ClientView';

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
  width: 1904px;
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  grid-gap: 10px;
  #leftPanel {
    display: grid;
    grid-gap: 10px;
    #mainView {
      height: 700px;
    }
    #clientView {
      height: 300px;
    }
  }
  #rightPanel {
    display: grid;
    grid-gap: 10px;
    #projectView {
      height: 400px;
    }
    #modelView {
      height: 600px;
    }
  }
}
</style>
