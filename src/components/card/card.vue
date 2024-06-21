<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="card d-flex flex-column">
    <div class="title d-flex">
      <h5>{{ title }}</h5>
      <v-spacer></v-spacer>
      <i :class="icon"></i>
    </div>

    <div class="detail" style="margin-top: auto;">
      <span>{{ value }}</span>
    </div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "card",
  props: {
    title: {
      type: String,
    },
    value: {
      type: String,
    },
    icon: {
      type: String,
    },
  },
};
</script>

<style scoped>
@import url("/src/dist/wu-icons-style.css");
.card {
  height: 130px;
  margin-block: 7px;
  margin-right: 14px;
  padding-block: 5px;
  padding-inline: 10px;
  border-radius: 8px;
  border: 3px solid rgb(226, 226, 226);
}
.card .title h5{
  font-size: 20px;
  font-weight: 500;
  margin-top: 20px;
  margin-left: 5px;
}
.card .detail {
  padding: 0px;
  font-size: 20px;
  font-weight: 500;
  margin-left: 5px;
  margin-bottom: 5px;
}
</style>
