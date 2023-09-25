<template>
  <v-select label="Select Language" :items="lang" v-model="selectedLang" @change="changeLang(selectedLang)"></v-select>
</template>

<script>
export default {
  name: 'selectLang',
  data: () => ({
    lang: [
      {
        text: '한국어',
        value: 'ko'
      },
      {
        text: 'English',
        value: 'en'
      }
    ],
    selectedLang: ''
  }),
  mounted() {
    this.selectedLang = this.$root.$i18n.locale;
  },
  methods: {
    changeLang: function (lang) {
      this.$root.$i18n.setLocale(lang);
    }
  }
}
</script>