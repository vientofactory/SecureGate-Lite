<template>
  <v-app>
    <v-container>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card height="400" color="transparent" flat>
            <div class="display-3 mt-9">{{ error.statusCode }}</div>
            <div class="grey--text lighten-5">
              {{ error.message }}
            </div>
            <div class="paragraph-text mt-2">
              <nuxt-link to="/" class="link">back to home page</nuxt-link>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'ErrorLayout',
  head: {
    title: 'Error'
  },
  props: ['error']
}
</script>

<style>
.paragraph-text {
  font-size: 18px;
}
</style>