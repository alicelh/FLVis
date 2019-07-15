<template>
  <div id="matrixWave" ref="matrixwave"></div>
</template>

<script>
import * as d3 from 'd3';
import { mapState } from 'vuex';

export default {
  name: 'MatrixWave',
  data: function () {
    let matrix = this.$store.state.matrix.matrixData;
    let length = matrix.length;
    for (let i = 0; i < length; i++) {
      let len = matrix[i]['nodes'].length;
      matrix[i]['stepIndex'] = i + 1;
      for (let j = 0; j < len; j++) {
        matrix[i]['nodes'][j]['orderIndex'] = j;
      }
    }
    return {
      matrixData: matrix
    };
  },
  computed: {},
  methods: {},
  mounted () {
    let node = this.$refs.matrixwave;
    let height = node.clientHeight;
    let svg = d3
      .select(node)
      .append('svg')
      .attr('id', 'matrixwaveSvg')
      .attr('width', self.dragBoxWidth)
      .attr('height', height);
  }
};
</script>

<style scoped lang="scss">
#matrixWave {
  height: 250px;
}
</style>
