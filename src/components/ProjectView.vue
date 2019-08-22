<template>
  <div id="projectView-container">
    <div class="moduleTitle">Project View</div>
    <svg width="100%" height="100%" ref="svg">
      <g class="legends">
        <circle r="6" fill="rgb(70, 107, 183)" cx="10" cy="15"></circle>
        <text x="20" y="20">Server</text>
        <circle r="3" fill="#90c297" cx="10" cy="35"></circle>
        <text x="20" y="40">Normal client</text>
        <circle r="3" fill="red" cx="10" cy="55"></circle>
        <text x="20" y="60">Abnomal client</text>
      </g>
      <g id="corner"><text x="595" y="15">Iter: {{this.choosedIterForProjection === 0 ? 'not chosen' : this.choosedIterForProjection}}</text></g>
    </svg>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";

export default {
  name: "ProjectView",
  data() {
    return {
      clickedClient: -1
    };
  },
  computed: {
    svg() {
      return this.$refs.svg;
    },
    width() {
      return parseInt(d3.select("#projectView-container").style("width"));
    },
    height() {
      return parseInt(d3.select("#projectView-container").style("height")) - parseInt(d3.select(".moduleTitle").style("height"));
    },
    ...mapState({
      projectData: state => state.client.projectdata,
      choosedIterForProjection: state => state.client.choosedIterForProjection,
      clientHoveredInMain: state => state.client.clientHoveredInMain
    })
  },
  watch: {
    choosedIterForProjection: function(newValue, oldValue) {
      this.$store.dispatch("client/getClientProject", newValue);
    },
    projectData: function(newValue, oldValue) {
      this.plot(newValue);
    },
    clientHoveredInMain: function(newv, oldv) {
      this.highlightClient(newv);
    }
  },
  methods: {
    highlightClient(newV) {
      d3.select('.g-points')
        .selectAll('.point-not-chosen')
        .attr('stroke', 'none');
      d3.select('.g-points')
        .select('#point-' + newV)
        .attr('stroke', '#353535')
        .attr('stroke-width', "2px")
    },
    plot(projectData) {
      let me = this;
      let pos = projectData["pos"]
      let idList = projectData["idList"]
      let isNormal = projectData["isNormal"]
      let ofs = 0.99 * 0.5 * Math.min(this.width, this.height)
      //为了让server节点最后画，保证不被遮挡，所以需要逆序
      pos.reverse()
      idList.reverse()
      const serverIndex = pos.length-1
      let xScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.width * 0.5 - ofs, this.width * 0.5 + ofs]);

      let yScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.height * 0.5 + ofs, this.height * 0.5 - ofs]);
      d3.select(this.svg)
        .select(".g-points")
        .remove();
      d3.select(this.svg)
        .append("g")
        .attr("class", "g-points")
        .selectAll(".point")
        .data(pos)
        .enter()
        .append("circle")
        .classed('point-not-chosen', true)
        .classed('point', true)
        .classed('point-client', function(d,i){
          return i!==serverIndex
        })
        .attr('id', function(d, i) {
          return 'point-' + idList[i];
        })
        .attr("cx", function(d) {
          return xScale(d[0]);
        })
        .attr("cy", function(d) {
          return yScale(d[1]);
        })
        .attr("r", function(d,i){
          return i===serverIndex?6:3;
        })
        .attr("fill", function(d,i){
          return i===serverIndex?"rgb(70, 107, 183)":(isNormal[i]===1?"#90c297":"red");
        })
        .attr("opacity", 0.77)
        .on("click", (d,i)=> {
          if (i!==serverIndex) {
            me.clickedClient = idList[i];
            d3.select('.g-points')
              .selectAll('.point-client')
              .attr('stroke', 'none')
              .attr('r', 3)
              .classed('point-not-chosen', true);
            d3.select('.g-points')
              .select('#point-' + idList[i])
              .classed('point-not-chosen', false)
              .attr('stroke', '#353535')
              .attr('r', 4)
              .attr('stroke-width', "2px")
            let clickedClientIndex = idList[i];
            let clickedIter = me.choosedIterForProjection;
            // 高亮盒须图里的异常值
            me.$store.dispatch('client/updataClientChoosed', [parseInt(clickedClientIndex), parseInt(clickedIter)]);
            // 更新client view
            me.$store.dispatch('client/getClientInfoByIndex', clickedClientIndex);
            // 更新混淆矩阵
            me.$store.dispatch('client/getConfusionMatrix', clickedClientIndex);
            // 更新条带图
            me.$store.dispatch("client/getClientPara", [clickedIter, clickedClientIndex]);
          }
        })
        .on('mouseover', function(d, i){
          if (idList[i] !== me.clickedClient) {
            d3.select('.g-points')
              .select('#point-' + idList[i])
              .attr('stroke', '#353535')
              .attr('stroke-width', "2px");
          }
        })
        .on('mouseout', function(d, i){
          if (idList[i] !== me.clickedClient) {
            d3.select('.g-points')
              .select('#point-' + idList[i])
              .attr('stroke', '#none');
          }
        })
        .append("title")
        .text((d,i) => {
          return idList[i];
        });
    }
  },
  mounted() {
    // this.plot(this.projectData);
  },
};
</script>

<style lang="scss">
#projectView-container {
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
}
#corner {
  text-anchor: end;
  font-size: 15px;
  font-weight: bold;
}
</style>
