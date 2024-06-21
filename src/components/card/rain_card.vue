<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="card d-flex">
    <div class="deco"></div>
    <div class="content d-flex align-center">
        <h3>{{ time }}</h3>
        <v-spacer></v-spacer>
        <h4>{{ value }}</h4>
    </div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "rain_card",
  props: {
    time: {
      type: String,
    },
    value: {
      type: String,
    },
  },
};
</script>

<style scoped>
.card {
    width: 100%;
    height: 60px;
    overflow: hidden;
    border-radius: 4px ;
}
.card .content {
    width: 100%;
    padding-inline: 20px;
    background-color: #ecf2ff;
}
.card .deco {
    width: 6px;
    min-width: 6px;
    background-color: #5383E8;
}
</style>
