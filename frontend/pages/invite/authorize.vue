<template>
  <v-app>
    <div v-if="!$route.query.identifier">
      <section id="invitese">
        <div class="container">필수 인자가 누락되었습니다.</div>
      </section>
    </div>
    <div v-else-if="loading">
      <section id="invitese">
        <div class="container">
          <v-progress-circular indeterminate :size="60"></v-progress-circular>
        </div>
      </section>
    </div>
    <div v-else-if="check_res">
      <section id="invitese">
        <div class="container">
          {{ check_res }}
        </div>
      </section>
    </div>
    <div v-else-if="verify_res">
      <section id="invitese">
        <div class="container">
          <v-alert type="success">
            {{ verify_res }}
          </v-alert>
        </div>
      </section>
    </div>
    <div v-else>
      <section id="invitese">
        <div class="container">
          {{ $t("title") }}
          <v-btn size="x-large" class="joinBtn mt-5" @click="verify($route.query.identifier)" block :loading="verifying" :disabled="verifying">
            {{ $t("btn") }}
            <v-dialog v-model="dialog_verify_error" width="auto" class="text-center">
              <v-card>
                <v-card-text class="white--text">
                  {{ verify_err }}
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" outlined block @click="dialog_verify_error = false">확인</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-btn>
        </div>
      </section>
    </div>
  </v-app>
</template>

<i18n lang="yaml">
ko:
  title: "아래 버튼을 눌러서 인증을 완료하세요."
  btn: "인증 & 서버 참여"
en:
  title: "Click the button below to complete verification."
  btn: "Confirm"
</i18n>

<script>
export default {
  name: "emailAuthPage",
  layout: "invite",
  head: {
    title: "Authentication",
  },
  data() {
    return {
      loggedin: this.$auth.loggedIn,
      identifier: this.$route.query.identifier,
      loading: true,
      verifying: false,
      dialog_verify_error: false,
      check_res: "",
      verify_res: "",
      verify_err: "",
    };
  },
  mounted() {
    if (!this.loggedin && this.identifier) {
      this.$auth.$storage.setLocalStorage("redirect", `/invite/authorize?identifier=${this.identifier}`);
      this.$auth.loginWith("discord");
    } else if (this.identifier) {
      this.check(this.identifier);
    }
  },
  methods: {
    check: function (id) {
      this.$axios
        .get(`/api/link/authorization/email?id=${id}`)
        .then(() => {
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.check_res = err.response.data.message;
        });
    },
    verify: function (id) {
      this.verifying = true;
      this.$axios
        .post("/api/link/authorization/email/verify", {
          identifier: id,
        })
        .then((res) => {
          this.verifying = false;
          this.verify_res = res.data.message;
        })
        .catch((err) => {
          this.verifying = false;
          this.dialog_verify_error = true;
          this.verify_err = err.response.data.message;
        });
    },
  },
};
</script>

<style scoped>
@import "~/static/css/invite.css";
</style>
