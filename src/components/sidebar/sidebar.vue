<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-navigation-drawer app :width="80">
    <v-list flat>
      <v-list-item-group active-class="border" color="red">
        <v-list-item v-for="(item, index) in items" :key="index">
          <v-list-item-content @click="navigateTo(item.to)">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "sidebar",
  data() {
    return {
      items: [
        {icon: "mdi-view-dashboard-outline", to: "/dashboard"},
        {icon: "mdi-google-analytics", to: "/analytics"},
      ],
    };
  },
  methods: {
    navigateTo(to) {
      if (this.$route.path !== to) {
        this.$router.push(to);
      }
    },
  },
};
</script>

<style>
.border {
  border-left: 3px solid #f00;
}
.color {
    color: #f00;
}
</style>
