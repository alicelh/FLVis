<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  created() {
    this.$store.dispatch("server/getServerInfo");
    this.$store.dispatch("server/getClientStasticsRange", [5, 15]);
    // this.$store.dispatch("client/getClientPara", [2, 0]);
    this.$store.dispatch("client/getClientParaList", {
      iter: 80,
      indexarr: [...Array(1700).keys()].slice(1500, 1700)
    });
    this.$store.dispatch("server/getServerPara", 80);
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
