<template>
  <div id="matrixWave" ref="matrixwave"></div>
</template>

<script>
import * as d3 from "d3";
import Matrix from "util/matrix";

export default {
  name: "MatrixWave",
  props: {
    paradata: Array
  },
  cpmputed: {},
  methods: {},
  watch: {
    // let node = this.$refs.matrixwave;
    // let height = node.clientHeight;
    // let svg = d3
    //   .select(node)
    //   .append('svg')
    //   .attr('id', 'matrixwaveSvg')
    //   .attr('width', self.dragBoxWidth)
    //   .attr('height', height);
    paradata: function() {
      let matrixData = this.paradata;
      let length = matrixData.length;
      for (let i = 0; i < length; i++) {
        if (i === 0) {
          matrixData[i]["nodes"] = matrixData[i]["nodes"].slice(280, 300);
        } else {
          matrixData[i]["nodes"] = matrixData[i]["nodes"].slice(0, 10);
        }
        let len = matrixData[i]["nodes"].length;
        matrixData[i]["stepIndex"] = i + 1;
        for (let j = 0; j < len; j++) {
          matrixData[i]["nodes"][j]["orderIndex"] = j;
        }
      }
      console.log(matrixData);
      let matrix = new Matrix(matrixData);
    }
  }
};
</script>

<style scoped lang="scss">
#matrixWave {
  height: 100%;
}
</style>
