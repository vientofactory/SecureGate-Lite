<template>
  <v-app>
    <v-parallax src="/images/Empty.png" height="700">
      <!-- particles -->
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <v-avatar size="120" class="logo-animate">
          <v-img src="/images/SecureGate_Logo.svg" />
        </v-avatar>
        <!-- error message -->
        <v-alert type="warning" v-if="error_param" dismissible>
          {{ error_param }}
        </v-alert>
        <h1 class="brand-title">
          {{ brand }}
        </h1>
        <h1 class="font-weight-bold mb-4 brand-subtitle">
          {{ $t('subtitle') }}
        </h1>
        <div v-if="loading">
          <h4 class="grey--text subheading">
            {{ $t('checking') }}
          </h4>
        </div>
        <div v-else-if="loggedin">
          <h4 class="subheading">
            <v-avatar size="30">
              <v-img class="align-end" :src="getAvatar(user.id, user.avatar)" />
            </v-avatar>
            {{ $t('welcome', { user: user.global_name }) }}
          </h4>
        </div>
        <div v-else>
          <h4 class="subheading">
            {{ $t('status', { guilds: guilds, users: users }) }}
          </h4>
        </div>
        <div class="mt-4 justify-center align-center">
          <div v-if="loggedin">
            <v-btn to="/oauth2/logout">
              <v-icon right>mdi-logout-variant</v-icon>
              {{ $t('logout') }}
            </v-btn>
            <v-btn color="primary" to="/dashboard">
              <v-icon right>mdi-view-dashboard</v-icon>
              {{ $t('dashboard') }}
            </v-btn>
          </div>
          <div v-else-if="!loading">
            <v-btn color="primary" large to="/oauth2/login">
              <v-icon right>mdi-login-variant</v-icon>
              {{ $t('login') }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-parallax>
    <div class="shadow-divider"></div>
    <v-parallax src="/images/Empty.png" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h4 font-weight-bold mb-4">
          <v-icon>mdi-earth</v-icon>
          안녕하세요! Hello! こんにちは！
        </h1>
        <h4 class="subheading">
          Select your language first.
          <selectLang />
        </h4>
      </div>
    </v-parallax>
    <v-parallax src="/images/Empty.png" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h4 font-weight-bold mb-4">
          <v-icon>mdi-check</v-icon>
          {{ $t('hero-1-title') }}
        </h1>
        <h4 class="subheading">
          {{ $t('hero-1-desc') }}
        </h4>
      </div>
    </v-parallax>
    <v-parallax src="/images/Empty.png" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h4 font-weight-bold mb-4">
          <v-icon>mdi-security</v-icon>
          {{ $t('hero-2-title') }}
        </h1>
        <h4 class="subheading">
          {{ $t('hero-2-desc') }}
        </h4>
      </div>
    </v-parallax>
    <v-parallax src="/images/Empty.png" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h4 font-weight-bold mb-4">
          <v-icon>mdi-door-open</v-icon>
          {{ $t('hero-3-title') }}
        </h1>
        <h4 class="subheading">
          {{ $t('hero-3-desc') }}
        </h4>
        <div class="mt-4 justify-center align-center">
          <v-btn color="primary" large to="/official">
            {{ $t('join-btn') }}
          </v-btn>
        </div>
      </div>
    </v-parallax>
    <v-parallax src="/images/Empty.png" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center grey--text">
        <!-- 삭제, 수정 금지 -->
        <span>
          <a href="https://github.com/vientorepublic/SecureGate-Lite">이 프로젝트는 오픈소스 입니다!❤️</a>
        </span>
        <!------------------>
        <span>
          <nuxt-link to="/License">{{ $t('license') }}</nuxt-link>
        </span>
        <span>
          {{ $t('not-affiliated') }}
        </span>
        <span>This site is protected by reCAPTCHA and the Google
          <a href="https://policies.google.com/privacy">Privacy Policy</a> and
          <a href="https://policies.google.com/terms">Terms of Service</a> apply.
        </span>
      </div>
    </v-parallax>

  </v-app>
</template>

<i18n lang="yaml">
  ko:
    subtitle: "디스코드 서버를 더욱 안전하게."
    checking: "유저 확인중..."
    welcome: "환영합니다, {user}님!"
    status: "현재 {guilds}개의 길드와 {users}명의 유저가 보호 받고 있어요."
    logout: "로그아웃"
    dashboard: "대시보드"
    login: "디스코드 계정으로 로그인"
    hero-1-title: "사용자 친화적인🌳"
    hero-1-desc: "디스코드 서버를 소유하거나 관리하고 계신가요? 모든 유저 인증 문제는 저희가 해결할게요."
    hero-2-title: "여러 인증 방식🔒"
    hero-2-desc: "reCAPTCHA, 이메일 인증, 질의응답, 관리자 승인 중 자유롭게 선택해서 초대 링크를 만들 수 있습니다. 인증이 완료되면 유저가 자동으로 서버에 참여합니다."
    hero-3-title: "열린 커뮤니티📢"
    hero-3-desc: "도움이 필요하신가요? 중요 소식을 빠르게 전달받고 싶으신가요? 여기로 오세요!"
    join-btn: "공식 디스코드 참여"
    not-affiliated: "Discord는 Discord Inc.의 브랜드이며, 본 서비스는 Discord와 관련이 없습니다."
    license: "오픈소스 라이선스"
  en:
    subtitle: "Make your Discord server more secure."
    checking: "Checking user..."
    welcome: "Welcome, {user}!"
    status: "Currently, {guilds} guilds and {users} users are protected."
    logout: "Logout"
    dashboard: "Dashboard"
    login: "Login with Discord account"
    hero-1-title: "User friendly🌳"
    hero-1-desc: "Do you own or manage a Discord server? We will solve all user authentication issues."
    hero-2-title: "Multiple authentication methods🔒"
    hero-2-desc: "You can create an invitation link by freely choosing among reCAPTCHA, email authentication, Q&A, and administrator approval. Once authentication is complete, the user automatically joins the server."
    hero-3-title: "Open community📢"
    hero-3-desc: "Need help? Want to receive important news quickly? come here!"
    join-btn: "Join the official Discord"
    not-affiliated: "Discord is a brand of Discord Inc. and this service is not affiliated with Discord."
    license: "Opensource License"
</i18n>

<script>
import selectLang from '../components/selectLang.vue';
export default {
  name: 'IndexPage',
  head: {
    title: 'Main'
  },
  components: {
    selectLang
  },
  data() {
    return {
      error_param: this.$route.query.error,
      brand: process.env.BRAND,
      loading: true,
      loggedin: false,
      user: [],
      guilds: 0,
      users: 0
    }
  },
  mounted() {
    this.getUser();
  },
  methods: {
    getStats: function () {
      this.$axios.get('/api/globalData').then((res) => {
        this.guilds = res.data.guilds;
        this.users = res.data.users;
      }).catch((_err) => { });
    },
    getUser: function () {
      this.$axios.get('/api/user').then((res) => {
        this.loading = false;
        this.loggedin = true;
        this.user = res.data.data;
      }).catch((_err) => {
        this.loading = false;
        this.getStats();
      });
    },
    getAvatar: function (id, name) {
      if (!name) {
        return '/images/default.png';
      } else {
        return `https://cdn.discordapp.com/avatars/${id}/${name}.png`;
      }
    }
  }
}
</script>

<style scoped>
@import '~/static/css/particles.css';

.brand-title {
  opacity: 0;
  font-size: 5rem;
  background: linear-gradient(135deg, #388B87, #6133D4);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: title_animate 0.5s ease-out 0.5s forwards;
}

.brand-subtitle {
  opacity: 0;
  font-size: 1.5rem;
  animation: subtitle_animate 0.5s ease-out 1s forwards;
}

.logo-animate {
  opacity: 0;
  animation: logo_animate 0.5s ease-in 1.5s forwards;
}

.shadow-divider {
  height: 30px;
  box-shadow: 0px -20px 20px 0px #242424;
}

@keyframes title_animate {
  0% {
    transform: translate(0px, -25px);
    opacity: 0.1;
  }

  100% {
    transform: translate(0px, 0px);
    opacity: 1;
  }
}

@keyframes subtitle_animate {
  0% {
    transform: translate(0px, 25px);
    opacity: 0.1;
  }

  100% {
    transform: translate(0px, 0px);
    opacity: 1;
  }
}

@keyframes logo_animate {
  0% {
    opacity: 0.1;
  }

  100% {
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .brand-title {
    font-size: 50px;
  }

  .brand-subtitle {
    font-size: 1.2rem;
  }
}
</style>