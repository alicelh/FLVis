<template>
  <div id="modelView-container">
    <div class="moduleTitle">Model View</div>
    <div class="modelContent">
      <div id="legendPanel">
        <MatrixLegend />
      </div>
      <div id="matrixPanel">
        <MatrixWave />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MatrixLegend from './MatrixLegend';
import MatrixWave from './MatrixWave';
export default {
  name: 'ModelView',
  data: function () {
    return {};
  },
  components: {
    MatrixLegend,
    MatrixWave
  },
  computed: {
    ...mapState({
      w1: state => state.client.w1,
      b1: state => state.client.b1
    })
  },
  methods: {
    getDragBoxSize: function () {
      let self = this;
      let len;
      self.dragBoxWidth = 0;
      self.dragBoxHeight = 0;
      if (dataInStep.length === 0) {
        self.dragBoxWidth = self.width;
        self.dragBoxHeight = self.height;
      } else {
        for (let i = 0; i < dataInStep.length; i++) {
          len = dataInStep[i]['nodes'].length;
          if (i % 2 === 1) {
            self.dragBoxWidth += len * self.rect;
            self.dragBoxWidth += self.textRectWidth;
          }
          if (i % 2 === 0) {
            self.dragBoxHeight += len * self.rect;
            self.dragBoxHeight += self.textRectWidth;
          }
        }
        self.dragBoxWidth =
          self.dragBoxWidth + self.margin.left + self.margin.right;
        self.dragBoxHeight =
          self.dragBoxHeight + self.margin.top + self.margin.bottom;
      }
    }
  }
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
    grid-template-columns: 200px 1fr;
    width: 100%;
    height: 322px;
    #legendPanel {
    }
    #matrixPanel {
    }
  }
}
</style>
