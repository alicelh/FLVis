<template>
  <div id="modelView-container">
    <div class="moduleTitle">Model View</div>
    <div class="modelContent" ref="weightView">
      <WeightView :width="weightWidth" />
      <VarifyView />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import WeightView from "./WeightView";
import VarifyView from "./VarifyView";

export default {
  name: "ModelView",
  data: function() {
    return {
      weightWidth: 600
    };
  },
  components: {
    WeightView,
    VarifyView
  },
  computed: {},
  methods: {},
  mounted() {}
};
</script>

<style lang="scss">
#modelView-container {
  border: 1px solid #4a4a4a;
  border-radius: 5px;
  height: 100%;
  .moduleTitle {
    text-align: left;
    line-height: 30px;
    background: #414447;
    font-size: 24px;
    color: #ffffff;
    padding-left: 10px;
  }
  .modelContent {
    display: grid;
    grid-template-rows: 1fr 2fr;
    width: 100%;
    height: 500px;
  }
}
</style>
