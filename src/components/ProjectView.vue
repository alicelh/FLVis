<template>
  <div id="projectView-container">
    <div class="moduleTitle">Project View</div>
    <svg width="100%" height="100%" ref="svg" />
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
      projectDots: state => state.client.pos,
      choosedIterForProjection: state => state.client.choosedIterForProjection
    })
  },
  watch: {
    choosedIterForProjection: function(newValue, oldValue) {
      this.$store.dispatch("client/getClientProject", newValue);
    },

    projectDots: function(newValue, oldValue) {
      this.plot();
    }
  },
  methods: {
    plot() {
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
        .data(this.projectDots)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", function(d) {
          return xScale(d[0]);
        })
        .attr("cy", function(d) {
          return yScale(d[1]);
        })
        .attr("r", 2);
    }
  },
  mounted() {
    this.plot();
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
</style>
