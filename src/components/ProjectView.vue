<template>
  <div id="projectView-container">
    <div class="moduleTitle">Projection View</div>
    <img id="server-img" src="../assets/server2.svg" />
    <img id="legend-img" src="../assets/server2.svg" />
    <svg width="100%" height="100%" ref="svg">
      <g class="legends">
        <!-- <circle r="8" fill="rgb(70, 107, 183)" cx="10" cy="15"></circle> -->
        <text x="20" y="20">Server</text>
        <circle r="4" fill="#90c297" cx="10" cy="35" />
        <text x="20" y="40">Normal client</text>
        <circle r="4" fill="#ff7f00" cx="10" cy="55" />
        <text x="20" y="60">Abnormal client</text>
        <circle r="3.5" fill="none" stroke="rgb(57, 131, 192)" stroke-width="2px" cx="10" cy="75" />
        <text x="20" y="80">Abnormal loss</text>
        <circle r="3.5" fill="none" stroke="rgb(221, 80, 65)" stroke-width="2px" cx="10" cy="95" />
        <text x="20" y="100">Abnormal acc</text>
        <path transform="translate(10,115)" :d="arcData('left')" fill="rgb(57, 131, 192)" />
        <path transform="translate(10,115)" :d="arcData('right')" fill="rgb(221, 80, 65)" />
        <text x="20" y="120">Abnormal acc &amp; loss</text>
      </g>
      <!-- <g id="corner"><text x="595" y="15">Iter: {{this.choosedIterForProjection === 0 ? 'not chosen' : this.choosedIterForProjection}}</text></g> -->
      <g class="g-points">
        <g
          v-for="(value, i) in pos.slice(0, pos.length-1)"
          :key="'circle' + i"
          :transform="'translate(' + xScale((value[0]-pos[pos.length-1][0]) * 1.2 + pos[pos.length-1][0])+',' +yScale((value[1]-pos[pos.length-1][1]) * 1.2 + pos[pos.length-1][1])+ ')'"
        >
          <circle
            class="point point-not-chosen"
            :class="i===pos.length-1?'':'point-client'"
            :fill="i===pos.length-1?'rgb(70, 107, 183)':(isNormal[i]===1?'#90c297':'#ff7f00')"
            :r="i===pos.length-1?8:4"
            opacity="0.77"
            :id="'point-' + idList[i]"
            @click="handlePointClick"
            @mouseover="handleMouseOver"
            @mouseout="handleMouseOut"
          >
            <title>{{idList[i]}}</title>
          </circle>
          <circle
            v-if="outlierClientLoss.indexOf(idList[i]) > -1 && doubleOutlierArr.indexOf(idList[i]) === -1"
            class="outlier-stroke"
            fill="none"
            r="3.5"
            stroke="rgb(57, 131, 192)"
            stroke-width="2px"
          />
          <circle
            v-if="outlierClientAcc.indexOf(idList[i]) > -1 && doubleOutlierArr.indexOf(idList[i]) === -1"
            class="outlier-stroke"
            fill="none"
            r="3.5"
            stroke="rgb(221, 80, 65)"
            stroke-width="2px"
          />
          <!-- <circle
            v-if="doubleOutlierArr.indexOf(idList[i]) > -1"
            class="outlier-stroke"
            fill="none"
            :cx="xScale(value[0])"
            :cy="yScale(value[1])"
            r="4"
            stroke="rgb(221, 80, 65)"
            stroke-width="2px"
          ></circle>-->
          <path
            v-if="doubleOutlierArr.indexOf(idList[i]) > -1"
            :d="arcData('left')"
            fill="rgb(57, 131, 192)"
          />
          <path
            v-if="doubleOutlierArr.indexOf(idList[i]) > -1"
            :d="arcData('right')"
            fill="rgb(221, 80, 65)"
          />
        </g>
      </g>
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
      clickedClient: -1,
      doubleOutlierArr: [],
      outlierClientLoss: [],
      outlierClientAcc: [],
      pos: [],
      idList: [],
      isNormal: []
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
      return (
        parseInt(d3.select("#projectView-container").style("height")) -
        parseInt(d3.select(".moduleTitle").style("height"))
      );
    },
    xScale() {
      let ofs = 0.99 * 0.5 * Math.min(this.width, this.height);
      return d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.width * 0.5 - ofs, this.width * 0.5 + ofs]);
    },
    yScale() {
      let ofs = 0.99 * 0.5 * Math.min(this.width, this.height);
      return d3
        .scaleLinear()
        .domain([0, 1])
        .range([this.height * 0.5 + ofs, this.height * 0.5 - ofs]);
    },
    ...mapState({
      projectData: state => state.client.projectdata,
      choosedIterForProjection: state => state.client.choosedIterForProjection,
      clientHoveredInMain: state => state.client.clientHoveredInMain,
      outlierClientAccAll: state => state.server.outlierClientAcc,
      outlierClientLossAll: state => state.server.outlierClientLoss
    })
  },
  watch: {
    choosedIterForProjection: function(newValue, oldValue) {
      this.$store.dispatch("client/getClientProject", newValue);
      this.getOutliers();
    },
    projectData: function(newValue, oldValue) {
      this.pos = newValue["pos"].reverse(); // server最后画
      this.idList = newValue["idList"].reverse();
      this.isNormal = newValue["isNormal"].reverse();
      // this.plot(newValue);
    },
    clientHoveredInMain: function(newv, oldv) {
      this.highlightClient(newv);
    }
  },
  methods: {
    arcData(direction) {
      let start = 0,
        end = 0;
      if (direction === "left") {
        start = Math.PI;
        end = 2 * Math.PI;
      } else if (direction === "right") {
        start = 0;
        end = Math.PI;
      }
      let arc = d3.arc();
      return arc({
        innerRadius: 2,
        outerRadius: 4,
        startAngle: start,
        endAngle: end
      });
    },
    // isOutlier (clientId) {
    //   // outlierClientLoss.indexOf(parseInt(idList[i])) > -1? 'rgb(140, 177, 207)':'none'
    //   // console.log(this.outlierClientLoss, clientId);
    //   if (this.outlierClientLoss.indexOf(parseInt(clientId)) > -1) {
    //     console.log("123")
    //     return '#8cb1cf';
    //   } else if (this.outlierClientLoss.indexOf(parseInt(clientId)) > -1){
    //     return '#f3c0ba';
    //   }
    // },
    handlePointClick(e) {
      let clickedId = e.target.getAttribute("id");
      let clickedClientIndex = clickedId.split("-")[1];
      if (clickedClientIndex !== this.idList[this.pos.length - 1]) {
        d3.select(".g-points")
          .selectAll(".point-client")
          .attr("stroke", "none")
          .attr("r", 4);
        d3.select("#" + clickedId)
          .attr("stroke", "#353535")
          .attr("r", 6)
          .attr("stroke-width", "2px")
          .classed("point-not-chosen", false);
        this.clickedClient = clickedClientIndex;
        let clickedIter = this.choosedIterForProjection;
        // 高亮盒须图里的异常值
        this.$store.dispatch("client/updataClientChoosed", [
          parseInt(clickedClientIndex),
          parseInt(clickedIter)
        ]);
        // 更新client view
        this.$store.dispatch("client/getClientInfoByIndex", clickedClientIndex);
        // 更新混淆矩阵
        // this.$store.dispatch('client/getConfusionMatrix', clickedClientIndex);
        // 更新条带图
        this.$store.dispatch("client/getClientPara", [
          clickedIter,
          clickedClientIndex
        ]);
      }
    },
    handleMouseOver(e) {
      let hoverId = e.target.getAttribute("id");
      let hoverClientIndex = hoverId.split("-")[1];
      if (
        hoverClientIndex !== this.clickedClient &&
        hoverClientIndex !== this.idList[this.pos.length - 1]
      ) {
        d3.select(".g-points")
          .select("#" + hoverId)
          .attr("stroke", "#353535")
          .attr("stroke-width", "2px");
      }
    },
    handleMouseOut(e) {
      let hoverId = e.target.getAttribute("id");
      let hoverClientIndex = hoverId.split("-")[1];
      if (
        hoverClientIndex !== this.clickedClient &&
        hoverClientIndex !== this.idList[this.pos.length - 1]
      ) {
        d3.select(".g-points")
          .select("#" + hoverId)
          .attr("stroke", "#none");
      }
    },
    getOutliers() {
      this.doubleOutlierArr = [];
      this.outlierClientLoss = this.outlierClientLossAll[
        this.choosedIterForProjection
      ];
      this.outlierClientAcc = this.outlierClientAccAll[
        this.choosedIterForProjection
      ];
      for (let i = 0; i < this.outlierClientLoss.length; i++) {
        if (this.outlierClientAcc.indexOf(this.outlierClientLoss[i]) > -1)
          this.doubleOutlierArr.push(this.outlierClientLoss[i]);
      }
    },
    highlightClient(newV) {
      d3.select(".g-points")
        .selectAll(".point-not-chosen")
        .attr("stroke", "none");
      d3.select(".g-points")
        .select("#point-" + newV)
        .attr("stroke", "#353535")
        .attr("stroke-width", "2px");
    }
  }
};
</script>

<style lang="scss">
#projectView-container {
  border: 1px solid #4a4a4a;
  border-radius: 5px;
  height: 100%;
  position: relative;
  #server-img {
    position: absolute;
    top: 207px;
    left: 290px;
    width: 20px;
    z-index: -1;
  }
  .moduleTitle {
    text-align: left;
    line-height: 30px;
    background: #414447;
    font-size: 24px;
    color: #ffffff;
    padding-left: 10px;
  }
  #legend-img {
    position: absolute;
    left: 1px;
    width: 20px;
    top: 38px;
  }
}
#corner {
  text-anchor: end;
  font-size: 15px;
  font-weight: bold;
  text {
    fill: #333;
  }
}
.legends {
  font-size: 14px;
}
</style>
