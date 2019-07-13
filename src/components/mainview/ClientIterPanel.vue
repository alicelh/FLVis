<template>
  <div class="client-panel">
    <div class="title">
      <div>iter {{iterId}}</div>
      <div>{{data.length}}</div>
      <div>
        <img src="../../assets/delete.png" @click="deletePanel">
      </div>
    </div>
    <div class="client-content">
      <svg height="100%" width="100%">
        <rect
          class="client-rect"
          :x="i % 5 * rectSize + 5 * (i % 5)"
          :y="Math.floor(i / 5) * rectSize + 20 + 5 * Math.floor(i / 5)"
          :width="rectSize"
          :height="rectSize"
          v-for="(client, i) in data" :key="'rect-'+i">
        </rect>
      </svg>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3';

export default {
  name: "ClientIterPanel",
  props: {
    iterId: Number,
    data: Array
  },
  data () {
    return {
      // clientNum: 0
      rectSize: 20
    };
  },
  computed: {
    ...mapState({
      clientInfo: state => state.client.clientInfo[this.iterId]
    }),

  },
  methods: {
    deletePanel () {
      this.$store.dispatch('client/deleteClientInfoByIter', this.iterId);
    }
  }
}
</script>

<style lang="scss">
.client-panel {
  height: 100%;
  position: relative;
}
img {
  width: 20px;
  cursor: pointer;
}
.title {
  line-height: 20px;
  height: 20px;
  display: grid;
  grid-template-columns: 4fr 4fr 1fr;
  border-bottom: 1px solid #979797;
  font-size: 10px;
  color: #000;
  position: absolute;
  background: #D8D8D8;
}
.client-content {
  background: #fff;
  height: 100%;
  // border: 1px solid #979797;
  border-radius: 5px;
}
.client-rect {
  fill: #90c297;
}
</style>
