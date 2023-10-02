<template>
  <v-app>
    <div v-if="!invite">
      <section id="invitese">
        <div class="container">
          <p>{{ $t("param-missed") }}</p>
        </div>
      </section>
    </div>
    <div v-else-if="error">
      <section id="invitese">
        <div class="container">
          {{ error }}
        </div>
      </section>
    </div>
    <div v-else-if="auth_result">
      <section id="invitese">
        <div class="container">
          <v-alert type="success" v-if="auth_result">
            {{ auth_result }}
          </v-alert>
        </div>
      </section>
    </div>
    <!-- Loading -->
    <div v-else-if="loading || details.length === 0">
      <section id="invitese">
        <div class="container">
          <v-progress-circular indeterminate :size="60"></v-progress-circular>
        </div>
      </section>
    </div>
    <!-- Guild Details -->
    <section id="invitese" v-else>
      <div class="container">
        <selectLang />
        <div class="serverIcon">
          <v-avatar size="150">
            <v-img :src="iconFilter(details.icon)" />
          </v-avatar>
        </div>
        <span class="message">{{ $t("title") }}</span>
        <div class="serverName">{{ details.name }}</div>
        <!-- Presence -->
        <div class="userCount">
          <div id="online">
            <div class="dot" id="online"></div>
            <span>{{ $t("online", { online: online }) }}</span>
          </div>
          <div id="member">
            <div class="dot" id="member"></div>
            <span>{{ $t("member", { member: members }) }}</span>
          </div>
        </div>
        <!-- User Info -->
        <div class="userInfo">
          <div class="userIcon">
            <v-avatar size="30">
              <v-img class="align-end" :src="getAvatar($auth.user.id, $auth.user.avatar)" />
            </v-avatar>
          </div>
          <div class="userName">{{ $t("loggedin-as", { user: $auth.user.global_name }) }},&nbsp;</div>
          <nuxt-link to="/oauth2/logout">{{ $t("logout") }}</nuxt-link>
        </div>
        <!-- reCAPTCHA -->
        <div v-if="auth_type === 1">
          <recaptcha />
          <v-btn size="x-large" class="joinBtn mt-5" @click="captcha(result.identifier)" block :loading="auth_loading" :disabled="auth_loading">
            {{ $t("accept") }}
            <v-dialog v-model="dialog_captcha_error" width="auto" class="text-center">
              <v-card>
                <v-card-text class="white--text">
                  {{ $t("click-captcha") }}
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" outlined block @click="dialog_captcha_error = false">확인</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialog_auth_error" width="auto" class="text-center">
              <v-card>
                <v-card-text class="white--text">
                  {{ auth_error }}
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" outlined block @click="dialog_auth_error = false">확인</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-btn>
        </div>
        <!-- Email -->
        <div v-else-if="auth_type === 2">
          <b>{{ $t("account-email") }}: {{ $auth.user.email }}</b>
          <v-btn
            type="submit"
            size="x-large"
            class="joinBtn mt-5"
            @click="email(result.identifier, $auth.user.email)"
            block
            :loading="auth_loading"
            :disabled="auth_loading"
          >
            {{ $t("accept") }}
            <v-dialog v-model="dialog_email_error" width="auto" class="text-center">
              <v-card>
                <v-card-text class="white--text">
                  {{ auth_error }}
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" outlined block @click="dialog_email_error = false">확인</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-btn>
        </div>
        <!-- Unknown -->
        <div v-else>
          <p class="orange--text">{{ $t("unknown") }}</p>
        </div>
      </div>
    </section>
  </v-app>
</template>

<i18n lang="yaml">
ko:
  param-missed: "필수 인자가 누락되었습니다."
  title: "서버에 초대되었습니다"
  online: "온라인 {online}명"
  member: "멤버 {member}명"
  loggedin-as: "{user}(으)로 로그인됨"
  logout: "로그아웃"
  accept: "초대 수락하기"
  click-captcha: "reCAPTCHA 체크박스를 클릭해주세요."
  account-email: "디스코드 계정 이메일"
  unknown: "알 수 없는 인증 타입이 감지되었습니다. 개발자에게 문의 해주세요."
  question: "질문"
  question-placeholder: "답변을 입력하세요."
  confirm: "확인"
en:
  param-missed: "A required argument is missing."
  title: "You have been invited to the server"
  online: "{online} Online"
  member: "{member} Member"
  loggedin-as: "Logged in as {user}"
  logout: "Logout"
  accept: "Accept Invitation"
  click-captcha: "Please click the reCAPTCHA checkbox."
  account-email: "Discord account email"
  unknown: "An unknown authentication type was detected. Please contact the developer."
  question: "Question"
  question-placeholder: "Please enter your answer."
  confirm: "Confirm"
</i18n>

<script>
export default {
  name: "InvitePage",
  layout: "invite",
  head: {
    title: "Invite",
  },
  data() {
    return {
      invite: this.$route.params.invite,
      loggedin: this.$auth.loggedIn,
      loading: true,
      auth_loading: false,
      dialog_captcha_error: false,
      dialog_auth_error: false,
      dialog_email_error: false,
      result: [],
      details: [],
      auth_type: 0,
      online: 0,
      members: 0,
      error: "",
      auth_result: "",
      auth_error: "",
    };
  },
  mounted() {
    if (!this.loggedin && this.invite) {
      this.$auth.$storage.setLocalStorage("redirect", `/invite/${this.invite}`);
      this.$auth.loginWith("discord");
    } else {
      if (this.invite) this.checkLink(this.invite);
    }
  },
  methods: {
    checkLink: function (id) {
      this.$axios
        .get(`/api/link/check?id=${id}`, { progress: false })
        .then((res) => {
          this.loading = false;
          this.getPresence(res.data.data.gid);
          this.getDetails(res.data.data.gid);
          this.auth_type = res.data.data.auth_method;
          this.result = res.data.data;
        })
        .catch((err) => {
          this.loading = false;
          this.error = err.response.data.message;
        });
    },
    captcha: async function (id) {
      try {
        let token = await this.$recaptcha.getResponse();
        this.auth_loading = true;
        this.$axios
          .post("/api/link/authorization", {
            id,
            g_recaptcha: token,
          })
          .then((res) => {
            this.auth_loading = false;
            this.auth_result = res.data.message;
          })
          .catch((err) => {
            this.auth_loading = false;
            this.$recaptcha.reset();
            this.dialog_auth_error = true;
            this.auth_error = err.response.data.message;
          });
      } catch (e) {
        this.dialog_captcha_error = true;
      }
    },
    email: function (id, email) {
      this.auth_loading = true;
      this.$axios
        .post("/api/link/authorization", {
          id,
          email,
        })
        .then((res) => {
          this.auth_loading = false;
          this.auth_result = res.data.message;
        })
        .catch((err) => {
          this.auth_loading = false;
          this.dialog_email_error = true;
          this.auth_error = err.response.data.message;
        });
    },
    getDetails: function (id) {
      this.$axios
        .get(`/api/guild?id=${id}`)
        .then((res) => {
          this.details = res.data.data;
        })
        .catch((_err) => {});
    },
    getPresence: function (id) {
      this.$axios
        .get(`/api/presence?id=${id}`)
        .then((res) => {
          this.online = res.data.online;
          this.members = res.data.members;
        })
        .catch((_err) => {});
    },
    iconFilter(name) {
      if (name == null) {
        return "/images/default.png";
      }
      return name;
    },
    getAvatar: function (id, name) {
      if (!name) {
        return "/images/default.png";
      } else {
        return `https://cdn.discordapp.com/avatars/${id}/${name}.png`;
      }
    },
  },
};
</script>

<style scoped>
@import "~/static/css/invite.css";
</style>
