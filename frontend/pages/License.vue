<template>
  <v-app>
    <v-parallax src="/images/Empty.png" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h4 class="subheading">
          <nuxt-link to="/">홈페이지로 돌아가기</nuxt-link>
        </h4>
        <h1 class="text-h4 font-weight-thin mb-4">
          오픈소스 라이선스
        </h1>
        <h4 class="subheading">
          {{ brand }}는 전세계 여러 개발자에 의해 만들어진 멋진 오픈소스 프로젝트들로 구성되어 있어요.
        </h4>
      </div>
    </v-parallax>
    <v-parallax src="/images/Empty.png" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <v-avatar size="120">
          <v-img src="/images/SecureGate_Logo.svg" />
        </v-avatar>
        <h1 class="brand-title">
          {{ brand }}
        </h1>
        <h4 class="subheading grey--text">
          v{{ ver }}/{{ branch }} ({{ current_commit }})
        </h4>
        <!-- 삭제, 수정 금지 -->
        <h4 class="subheading grey--text">
          <a href="https://github.com/vientorepublic/SecureGate-Lite">이 프로젝트는 오픈소스 입니다!❤️</a>
        </h4>
        <!------------------>
      </div>
    </v-parallax>
    <v-parallax src="/images/Empty.png" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h4 font-weight-thin mb-4">
          개발 & 기여자
        </h1>
        <!--삭제, 수정 금지 -->
        <span>Doyeon Kim - 원작자. 백엔드, 프론트엔드 개발</span>
        <span>Hanseung Kim, Jihun Aiden Lee - 로고 디자인, 다국어 지원 검수</span>
        <!----------------->
        <span class="grey--text">ヨルシカ / n-buna - 일상에 활력을 준 최고의 음악들!</span>
      </div>
    </v-parallax>
    <v-parallax src="/images/Empty.png">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <a href="https://github.com/nuxt/nuxt/blob/main/LICENSE">Nuxt.js</a>
        <a href="https://github.com/vuejs/core/blob/main/LICENSE">Vue.js</a>
        <a href="https://github.com/vuetifyjs/vuetify/blob/master/LICENSE.md">Vuetify</a>
        <a href="https://github.com/nuxt-community/auth-module/blob/dev/LICENSE">@nuxtjs/auth-next</a>
        <a href="https://github.com/nuxt-community/proxy-module/blob/master/LICENSE">@nuxtjs/proxy</a>
        <a href="https://github.com/nuxt-community/recaptcha-module/blob/main/LICENSE">@nuxtjs/recaptcha</a>
        <a href="https://github.com/zloirock/core-js/blob/master/LICENSE">core.js</a>
        <a href="https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt">Typescript</a>
        <a href="https://github.com/expressjs/express/blob/master/LICENSE">Express</a>
        <a href="https://github.com/pkolt/express-asyncify/blob/master/LICENSE.md">express-asyncify</a>
        <a href="https://github.com/expressjs/cookie-parser/blob/master/LICENSE">cookie-parser</a>
        <a href="https://github.com/discordjs/discord.js/blob/main/LICENSE">Discord.js</a>
        <a href="https://github.com/motdotla/dotenv/blob/master/LICENSE">Dotenv</a>
        <a href="https://github.com/Automattic/mongoose/blob/master/LICENSE.md">Mongoose</a>
        <a href="https://github.com/axios/axios/blob/v1.x/LICENSE">Axios</a>
        <a href="https://github.com/iamkun/dayjs/blob/dev/LICENSE">Day.js</a>
        <a href="https://github.com/handlebars-lang/handlebars.js/blob/master/LICENSE">handlebars</a>
        <a href="https://github.com/nodemailer/nodemailer/blob/master/LICENSE">nodemailer</a>
        <a href="https://github.com/expressjs/morgan/blob/master/LICENSE">morgan</a>
        <a href="https://github.com/winstonjs/winston/blob/master/LICENSE">winston</a>
      </div>
    </v-parallax>
  </v-app>
</template>

<script>
export default {
  name: 'licensePage',
  head: {
    title: 'Licenses'
  },
  data() {
    return {
      brand: process.env.BRAND,
      ver: process.env.VER,
      branch: process.env.NUXT_ENV_CURRENT_GIT_BRANCH,
      current_commit: process.env.NUXT_ENV_CURRENT_GIT_SHA
    }
  }
}
</script>

<style scoped>
.brand-title {
  font-size: 5rem;
  background: linear-gradient(135deg, #388B87, #6133D4);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (max-width: 767px) {
  .brand-title {
    font-size: 50px;
  }
}
</style>