<template>
  <div id="labelPanel">
    <table>
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
</template>

<script>
export default {
  name: 'MatrixLegend'
};
</script>
