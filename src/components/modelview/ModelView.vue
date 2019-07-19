<template>
  <div id="modelView-container">
    <div class="moduleTitle">Model View</div>
    <div class="modelContent" ref="weightView">
      <div class="varifyView"></div>
      <WeightView :width="weightWidth" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import WeightView from "./WeightView";

export default {
  name: "ModelView",
  data: function() {
    return {
      weightWidth: 600
    };
  },
  components: {
    WeightView
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
    grid-template-columns: 1fr 600px;
    width: 100%;
    height: 322px;
  }
}
</style>
