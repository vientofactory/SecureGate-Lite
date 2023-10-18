<template>
  <v-app>
    <v-container pa-5 mt-5>
      <div class="text-h3">{{ $t("title") }}</div>
      <div v-if="!loggedin">
        <v-alert type="warning" class="mt-5">
          {{ $t("login-required") }}
        </v-alert>
      </div>
      <div class="text-subtitle-1 mb-5" v-else>
        {{ $t("logged-in-as", { user: $auth.user.global_name }) }},
        <nuxt-link to="/dashboard">{{ $t("goto-select") }}</nuxt-link>
        <v-divider vertical></v-divider>
        <nuxt-link to="/oauth2/logout">{{ $t("logout") }}</nuxt-link>
      </div>
      <div v-if="!$route.params.gid">
        <v-alert type="warning" class="mt-8">
          {{ $t("param-missed") }}
        </v-alert>
      </div>
      <div v-else-if="loading">
        <v-progress-circular indeterminate :size="60"></v-progress-circular>
      </div>
      <div v-else-if="error">
        <v-alert type="warning" class="mt-8">
          {{ error }}
        </v-alert>
      </div>
      <div v-else>
        <v-row>
          <v-col>
            <v-card class="mb-5 mx-auto">
              <v-card-title>
                <v-avatar size="45">
                  <v-img class="align-end text-white" :src="iconFilter(guild.icon)" />
                </v-avatar>
                {{ guild.name }}
              </v-card-title>
              <v-card-text class="pt-4"> {{ $t("server-id") }}: {{ guild.id ? guild.id : "N/A" }} </v-card-text>
              <v-card-text class="pt-4"> {{ $t("bot-add-date") }}: {{ $dayjs(guild.joinedTimestamp).format("YYYY-MM-DD hh:mm:ss") }} </v-card-text>
            </v-card>
            <v-card class="pa-md-2 mb-5 mx-auto">
              <v-card-title>
                <v-icon>mdi-plus</v-icon>
                {{ $t("create-link") }}
              </v-card-title>
              <v-card-text v-if="create_result">
                <v-alert type="success" dismissible>
                  {{ create_result }}
                </v-alert>
              </v-card-text>
              <form
                @submit.prevent="
                  createLink({
                    id: link_input,
                    gid: guild.id,
                    role: selected_role,
                    method: selected_method,
                    expire: selected_expires,
                    question: question_input,
                    answer: answer_input,
                  })
                "
              >
                <v-card-text>
                  {{ $t("auth-method") }}
                  <v-select v-model="selected_method" :items="methods" :label="$t('auth-method-placeholder')" :disabled="creating"></v-select>
                </v-card-text>
                <v-card-text>
                  {{ $t("validity-period") }}
                  <v-select v-model="selected_expires" :items="expires" :label="$t('validity-period-placeholder')" :disabled="creating"></v-select>
                </v-card-text>
                <v-card-text>
                  {{ $t("role-to-add") }}
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-select
                        v-bind="attrs"
                        v-on="on"
                        v-model="selected_role"
                        :items="roles"
                        chips
                        :label="$t('roles')"
                        :disabled="creating"
                      ></v-select>
                    </template>
                    <span>{{ $t("role-tooltip") }}</span>
                  </v-tooltip>
                </v-card-text>
                <v-card-text>
                  <v-checkbox :label="$t('custom-link')" v-model="custom_link"></v-checkbox>
                </v-card-text>
                <!-- Custom Link -->
                <v-card-text v-if="custom_link">
                  <b> {{ $t("custom-link-desc") }} </b><br />
                  <b>
                    {{ $t("link-format") }}
                  </b>
                  <v-text-field type="text" :label="$t('invite-id')" v-model="link_input" :disabled="creating" required></v-text-field>
                  <span v-if="validateMessage" :class="{ 'orange--text': warnMessage, 'green--text': !warnMessage }">{{ validateMessage }}</span>
                </v-card-text>
                <v-card-text>
                  <v-btn type="submit" color="primary" :loading="creating" :disabled="creating">
                    {{ $t("generate-btn") }}
                    <v-dialog v-model="dialog_create_error" width="auto" class="text-center">
                      <v-card>
                        <v-card-text class="white--text">
                          {{ create_error }}
                        </v-card-text>
                        <v-card-actions>
                          <v-btn color="primary" outlined block @click="dialog_create_error = false">{{ $t("confirm") }}</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-btn>
                </v-card-text>
              </form>
            </v-card>
            <v-card class="pa-md-2 mb-5 mx-auto">
              <v-card-title>
                <v-icon>mdi-link</v-icon>
                {{ $t("link-list") }}
              </v-card-title>
              <v-card-text v-if="delete_result">
                <v-alert type="success" dismissible>
                  {{ delete_result }}
                </v-alert>
              </v-card-text>
              <v-card-text>
                {{ $t("link-list-desc", { max: create_limit, current: links.length }) }}
              </v-card-text>
              <v-divider></v-divider>
              <div v-if="link_get_error">
                <v-card-text>
                  <v-alert type="info" class="mt-8">
                    {{ link_get_error }}
                  </v-alert>
                </v-card-text>
              </div>
              <div v-else v-for="(data, i) in links" :key="i">
                <v-card-text>
                  <v-chip dark text-color="white" class="font-weight-bold">
                    <span class="inv-text">{{ domain }}/invite/{{ data.identifier }}</span>
                    <v-divider class="mx-4" vertical light></v-divider>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <span @click="copyCode(data.identifier)" @mouseout="reset" style="cursor: pointer" v-bind="attrs" v-on="on"
                          ><v-icon>mdi-content-copy</v-icon></span
                        >
                      </template>
                      <span>{{ copyText }}</span>
                    </v-tooltip>
                  </v-chip>
                </v-card-text>
                <v-card-text> {{ $t("method") }}: {{ humanizeMethod(data.auth_method) }} </v-card-text>
                <v-card-text v-if="!data.no_expires"> {{ $t("expires") }}: {{ $dayjs(data.expiresAt).format("YYYY-MM-DD hh:mm:ss") }} </v-card-text>
                <v-card-text v-else> {{ $t("expires") }}: {{ $t("no-expires") }} </v-card-text>
                <v-card-text> {{ $t("n-n-u") }}: {{ data.number_of_uses }} </v-card-text>
                <v-card-text>
                  <v-btn
                    color="red"
                    @click="
                      delete_target = data.identifier;
                      dialog_delete_confirm = true;
                    "
                    :disabled="deleting"
                  >
                    {{ $t("delete") }}
                  </v-btn>
                </v-card-text>
                <v-divider></v-divider>
              </div>
              <v-dialog v-model="dialog_delete_confirm" width="auto">
                <Dialog
                  @hide="dialog_delete_confirm = false"
                  @submit="deleteLink(delete_target)"
                  footer-submit
                  cancelable
                  red
                  footer-submit-title="삭제"
                >
                  <template v-slot:body>
                    <span class="white--text">
                      {{ $t("delete-confirm") }}
                    </span>
                  </template>
                </Dialog>
              </v-dialog>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-app>
</template>

<i18n lang="yaml">
ko:
  title: "링크 관리"
  login-required: "해당 작업을 수행하려면 디스코드 계정으로 로그인이 필요합니다."
  logged-in-as: "{user}(으)로 로그인됨"
  goto-select: "서버 목록으로"
  logout: "로그아웃"
  param-missed: "필수 인자가 누락되었습니다."
  server-id: "서버 식별자"
  active-link: "활성 링크"
  bot-add-date: "봇 추가 일자"
  create-link: "링크 생성"
  auth-method: "인증 방식을 선택하세요."
  validity-period: "링크 유효 기간을 선택하세요."
  role-to-add: "인증 완료 시 부여할 역할을 선택하세요. (선택사항)"
  role-tooltip: "선택하신 역할이 봇의 역할보다 낮은 순위에 있어야 정상적으로 부여됩니다."
  custom-link: "사용자 지정 초대 링크"
  custom-link-desc: "사용자 지정 초대 링크는 가용성 확보를 위해 최대 30일까지 사용할 수 있어요. 계속 사용하기를 원하신다면 만료 후 다시 생성 해주세요."
  link-format: "식별자는 최소 3글자, 최대 40글자 제한, 영문 대소문자와 숫자를 사용할 수 있습니다."
  invite-id: "초대 링크 식별자"
  generate-btn: "생성"
  confirm: "확인"
  cancel: "취소"
  30m: "30분"
  1h: "1시간"
  12h: "12시간"
  1d: "1일"
  7d: "7일"
  30d: "30일"
  no-expires: "만료 기간 없음"
  captcha: "캡차"
  email: "이메일"
  qna: "질의응답"
  roles: "역할"
  auth-method-placeholder: "인증 방식"
  validity-period-placeholder: "유효 기간"
  no-expires-not-allowed: "만료 기간 없음 (사용자 지정 링크에는 사용할 수 없습니다.)"
  select-required: "필요한 정보를 모두 선택해주세요."
  checking: "사용 가능 여부 확인 중..."
  copied: "복사되었습니다"
  click-to-copy: "복사하려면 클릭하세요"
  link-list: "링크 목록"
  link-list-desc: "초대 링크는 최대 {max}개 까지 만들 수 있습니다. 현재 {current}개의 활성 링크가 있습니다."
  method: "인증 방식"
  expires: "만료일"
  n-n-u: "사용 횟수"
  delete-confirm: "초대 링크를 삭제하시겠습니까? 해당 링크는 더 이상 작동하지 않을 것입니다."
  delete: "삭제"
  created-at: "생성일"
en:
  title: "Link Management"
  login-required: "You will need to login with your Discord account to do this."
  logged-in-as: "Logged in as {user}"
  goto-select: "Go to guild list"
  logout: "Logout"
  param-missed: "A required argument is missing."
  server-id: "Server ID"
  active-link: "Active links"
  bot-add-date: "Bot addition date"
  create-link: "Create Link"
  auth-method: "Authentication method"
  validity-period: "Link validity period"
  role-to-add: "Role to be granted upon completion of authentication (optional)"
  role-tooltip: "The role you choose must be lower in priority than the bot's role to be properly granted."
  custom-link: "Custom invitation link"
  custom-link-desc: "Custom invitation links can last up to 30 days to ensure availability. If you wish to continue using it, please regenerate it after it expires."
  link-format: "Identifiers can be a minimum of 3 characters, a maximum of 40 characters, and can contain upper and lower case letters and numbers."
  invite-id: "Invitation link identifier"
  generate-btn: "Generate"
  confirm: "Confirm"
  cancel: "Cancel"
  30m: "30 minute"
  1h: "1 hour"
  12h: "12 hours"
  1d: "1 day"
  7d: "7 days"
  30d: "30 days"
  no-expires: "Never"
  captcha: "Captcha"
  email: "Email"
  qna: "Q&A"
  roles: "Roles"
  auth-method-placeholder: "Authentication method"
  validity-period-placeholder: "Link validity period"
  no-expires-not-allowed: "Never (Not available for custom links.)"
  select-required: "Please select all required information."
  checking: "Checking availability..."
  copied: "Copied"
  click-to-copy: "Click to copy"
  link-list: "List of Links"
  link-list-desc: "You can create up to {max} invitation links. There are currently {current} active links."
  method: "Authentication method"
  expires: "Expiration date"
  n-n-u: "Number of uses"
  delete-confirm: "Are you sure you want to delete the invitation link? That link will no longer work."
  delete: "Delete"
  created-at: "Creation date"
</i18n>

<script>
import Dialog from "../../../components/dialog.vue";
export default {
  name: "DashboardHome",
  head: {
    title: "Management",
  },
  components: {
    Dialog,
  },
  data() {
    return {
      loggedin: this.$auth.loggedIn,
      gid: this.$route.params.gid,
      domain: process.env.FRONTEND_HOST,
      loading: false,
      creating: false,
      deleting: false,
      dialog_create_error: false,
      dialog_delete_error: false,
      dialog_delete_confirm: false,
      custom_link: false,
      guild: [],
      roles: [],
      links: [],
      text: this.$t("click-to-copy"),
      copyText: "",
      invitationCode: "",
      validateMessage: "",
      delete_target: "",
      warnMessage: false,
      methods: [
        {
          text: this.$t("captcha"),
          value: "1",
        },
        {
          text: this.$t("email"),
          value: "2",
        },
      ],
      expires: [
        {
          text: this.$t("30m"),
          value: "30m",
        },
        {
          text: this.$t("1h"),
          value: "1h",
        },
        {
          text: this.$t("12h"),
          value: "12h",
        },
        {
          text: this.$t("1d"),
          value: "1d",
        },
        {
          text: this.$t("7d"),
          value: "7d",
        },
        {
          text: this.$t("30d"),
          value: "30d",
        },
        {
          text: this.$t("no-expires"),
          value: "no_expires",
          disabled: false,
        },
      ],
      link_input: "",
      create_result: "",
      create_error: "",
      delete_result: "",
      delete_error: "",
      selected_role: "",
      selected_expires: "",
      selected_method: "",
      link_get_error: "",
      error: "",
      create_limit: 0,
      debounceTimeout: null,
    };
  },
  created() {
    this.copyText = this.text;
  },
  mounted() {
    if (!this.loggedin && this.gid) {
      this.$auth.$storage.setLocalStorage("redirect", `/dashboard/home/${this.gid}`);
      this.$auth.loginWith("discord");
    } else if (this.gid) {
      this.getGuild(this.gid);
      this.getLinks(this.gid);
      this.getRoles(this.gid);
    }
  },
  watch: {
    custom_link: function () {
      if (this.custom_link) {
        this.expires[6].text = this.$t("no-expires-not-allowed");
        this.expires[6].disabled = true;
      } else {
        this.expires[6].text = this.$t("no-expires");
        this.expires[6].disabled = false;
      }
    },
    link_input: function () {
      if (this.link_input) {
        this.validateMessage = this.$t("checking");
        this.debounceValidation(this.link_input);
      } else {
        this.warnMessage = false;
        this.validateMessage = "";
      }
    },
  },
  methods: {
    debounceValidation: function (id) {
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.formValidation(id);
      }, 500);
    },
    createLink: function (param) {
      if (!param.method || !param.expire) {
        this.dialog_create_error = true;
        this.create_error = this.$t("select-required");
      } else {
        this.creating = true;
        this.$axios
          .post("/api/link/create", {
            id: param.id,
            gid: param.gid,
            role: param.role,
            method: param.method,
            expire: param.expire,
            question: param.question,
            answer: param.answer,
          })
          .then((res) => {
            this.creating = false;
            this.link_get_error = "";
            this.alert = true;
            this.create_result = res.data.message;
            this.getLinks(param.gid);
          })
          .catch((err) => {
            this.creating = false;
            this.dialog_create_error = true;
            this.create_error = err.response.data.message;
          });
      }
    },
    createCustomLink: function (gid, role, method, expire, custom_id, question, answer) {
      if (!this.selected_method || !this.selected_expires) {
        this.dialog_create_error = true;
        this.create_error = this.$t("select-required");
      } else {
        this.creating = true;
        this.$axios
          .post("/api/link/create/custom", {
            id: custom_id,
            gid,
            role,
            method,
            expire,
            question,
            answer,
          })
          .then((res) => {
            this.creating = false;
            this.link_get_error = "";
            this.create_result = res.data.message;
            this.getLinks(gid);
          })
          .catch((err) => {
            this.creating = false;
            this.dialog_create_error = true;
            this.create_error = err.response.data.message;
          });
      }
    },
    formValidation: function (id) {
      this.$axios
        .get("/api/link/create/custom/validation", {
          params: {
            id,
          },
          progress: false,
        })
        .then((res) => {
          this.validateMessage = res.data.message;
        })
        .catch((err) => {
          this.warnMessage = true;
          this.validateMessage = err.response.data.message;
        });
    },
    deleteLink: function (id) {
      this.deleting = true;
      this.dialog_delete_confirm = false;
      this.$axios
        .delete(`/api/link/delete?id=${id}`)
        .then((res) => {
          this.deleting = false;
          this.delete_result = res.data.message;
          this.getLinks(this.guild.id);
        })
        .catch((err) => {
          this.deleting = false;
          this.dialog_delete_error = true;
          this.delete_error = err.response.data.message;
        });
    },
    getGuild: function (id) {
      this.loading = true;
      this.$axios
        .get(`/api/guild?id=${id}`)
        .then((res) => {
          this.loading = false;
          this.guild = res.data.data;
        })
        .catch((err) => {
          this.loading = false;
          this.error = err.response.data.message;
        });
    },
    getLinks: function (id) {
      this.$axios
        .get(`/api/link?id=${id}`, { progress: false })
        .then((res) => {
          this.create_limit = res.data.create_limit;
          this.links = res.data.data;
        })
        .catch((err) => {
          this.create_limit = err.response.data.create_limit;
          this.link_get_error = err.response.data.message;
        });
    },
    getRoles: function (id) {
      this.$axios
        .get(`/api/guild/roles?id=${id}`)
        .then((res) => {
          let roles = [];
          res.data.data.forEach((e) => {
            roles.push({
              text: e.name,
              value: e.id,
            });
          });
          this.roles = roles;
        })
        .catch((_err) => {});
    },
    copyCode: async function (code) {
      await navigator.clipboard.writeText(`${this.domain}/invite/${code}`);
      this.copyText = this.$t("copied");
    },
    reset() {
      this.copyText = this.text;
    },
    iconFilter(name) {
      if (name == null) {
        return "/images/default.png";
      }
      return name;
    },
    getApprovalLink(id) {
      return `/dashboard/approval/${id}`;
    },
    humanizeMethod: function (method) {
      switch (method) {
        case 1:
          return this.$t("captcha");
        case 2:
          return this.$t("email");
        default:
          return "Unknown";
      }
    },
  },
};
</script>

<style scoped>
.inv-text {
  min-width: 150px;
  font-size: 15px;
  overflow: hidden;
}

.custom-ad-area {
  margin-top: 20px;
}
</style>
