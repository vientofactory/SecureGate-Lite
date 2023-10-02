<template>
  <v-app>
    <v-main>
      <v-overlay v-model="$nuxt.isOffline">
        <div align="center">
          <v-progress-circular size="64" indeterminate></v-progress-circular>
          <p>인터넷 연결이 끊어졌습니다.</p>
        </div>
      </v-overlay>
      <Nuxt />
    </v-main>
    <v-footer>
      <v-row justify="center" no-gutters> &copy; {{ new Date().getFullYear() }} SecureGate </v-row>
      <v-row justify="center" no-gutters>
        <span class="grey--text"> v{{ ver }}/{{ branch }} ({{ current_commit }}) </span>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "DefaultLayout",
  data: () => ({
    ver: process.env.VER,
    branch: process.env.NUXT_ENV_CURRENT_GIT_BRANCH,
    current_commit: process.env.NUXT_ENV_CURRENT_GIT_SHA,
  }),
};
</script>
