<template>
  <div id="matrixPanel">
    <div id="legendPanel">
      <div id="labelPanel">
        <table
          width="97%"
          style="margin-top:10px; margin-left:5px; margin-right:15px"
          align="center"
        >
          <tr>
            <td></td>
            <td colspan="3">
              <strong>Node encodings</strong>
            </td>
            <td></td>
          </tr>
          <tr>
            <td align="center">1</td>
            <td colspan="3">
              <div id="nodeLabel"></div>
            </td>
            <td id="nodeMaxText" align="center"></td>
          </tr>
          <tr>
            <td align="center">-100%</td>
            <td colspan="3">
              <div id="nodeColorLabel"></div>
            </td>
            <td align="center">100%</td>
          </tr>
          <tr>
            <td></td>
            <td colspan="3">
              <strong>Link encodings</strong>
            </td>
            <td></td>
          </tr>
          <tr>
            <td align="center">-100%</td>
            <td colspan="3">
              <div id="linkColorLabel"></div>
            </td>
            <td align="center">100%</td>
          </tr>
          <tr>
            <td align="center">1</td>
            <td colspan="3">
              <div id="linkLabel"></div>
            </td>
            <td id="linkMaxText" align="center"></td>
          </tr>
        </table>
      </div>
    </div>
    <div id="matrixWave"></div>
  </div>
</template>

<script>
import Matrix from '@/utils/matrix';
import { mapState } from 'vuex';

export default {
  name: 'matrixwave',
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
  computed: mapState({
    loss: state => state.server.loss
  }),
  created () {
    this.$store.dispatch('server/getServerInfo');
  },
  mounted () {
    var matrixWave = new Matrix('matrixWave', this.matrixData);
  }
};
</script>

<style scoped lang="scss">
#matrixPanel {
  display: grid;
  grid-template-columns: 200px 1fr;
  #legendPanel {
  }
  #matrixWave {
    height: 250px;
  }
}
</style>
