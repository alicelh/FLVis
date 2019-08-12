<template>
  <div id="projectView-container">
    <div class="moduleTitle">Project View</div>
    <svg width="100%" height="100%" ref="svg" />
    <div id="corner">{{this.choosedIterForProjection}}</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";
export default {
  name: "ProjectView",
  computed: {
    svg() {
      return this.$refs.svg;
    },
    width() {
      return parseInt(d3.select("#projectView-container").style("width"));
    },
    height() {
      return parseInt(d3.select("#projectView-container").style("height"));
    },
    ...mapState({
      projectData: state => state.client.projectdata,
      choosedIterForProjection: state => state.client.choosedIterForProjection
    })
  },
  watch: {
    choosedIterForProjection: function(newValue, oldValue) {
      this.$store.dispatch("client/getClientProject", newValue);
    },

    projectData: function(newValue, oldValue) {
      this.plot(newValue);
    }
  },
  methods: {
    plot(projectData) {
      let me = this;
      let pos = projectData["pos"]
      let idList = projectData["idList"]
      //为了让server节点最后画，保证不被遮挡，所以需要逆序
      pos.reverse()
      idList.reverse()
      const serverIndex = pos.length-1
      let xScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.width * 0.1, this.width * 0.9]);

      let yScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.height * 0.9, this.height * 0.1]);
      d3.select(this.svg)
        .selectAll("g")
        .remove();
      d3.select(this.svg)
        .append("g")
        .selectAll(".point")
        .data(pos)
        .enter()
        .append("circle")
        .attr("class", "point")
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
          return i===serverIndex?'red':'blue';
        })
        .attr("stroke", 'red')
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0)
        // 点击事件
        d3.select(this.svg).selectAll('circle')
        .on('click', function (d, i) {
          me.$store.dispatch("client/getConfusionMatrix", idList[i]);
        })
        .append("title")
        .text((d,i) => {
          return idList[i];
        });
    }
  },
  mounted() {
    // this.plot();
  }
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
  position: absolute;
  top: 40px;
  right: 20px;
}
</style>
