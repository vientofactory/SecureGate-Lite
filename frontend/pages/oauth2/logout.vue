<template>
  <v-app>
    <v-parallax src="/images/Empty.png">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h4 font-weight-bold mb-4">
          {{ $t('title') }}
        </h1>
        <h4 class="subheading font-weight-thin">
          {{ $t('subtitle') }}
        </h4>
      </div>
    </v-parallax>
  </v-app>
</template>

<i18n lang="yaml">
  ko:
    title: "로그아웃 하는 중..."
    subtitle: "화면이 자동으로 넘어가지 않는다면 페이지를 새로고침 해주세요."
  en:
    title: "Logging out..."
    subtitle: "If the screen does not advance automatically, please refresh the page."
</i18n>

<script>
export default {
  name: 'OAuth2Logout',
  head: {
    title: 'Logout'
  },
  mounted() {
    if (this.$auth.loggedIn) {
      this.$auth.logout();
      this.$router.push({ path: '/' });
    } else {
      this.$router.push({ path: `/?error=${encodeURIComponent('로그인 하지 않았습니다.')}` });
    }
  }
}
</script>