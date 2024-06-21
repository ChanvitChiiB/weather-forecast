<template>
  <v-app>
    <sidebar />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import sidebar from './components/sidebar/sidebar.vue'
export default {
  name: 'App',
  components: {
    sidebar,
  },
}
</script>

<style></style>