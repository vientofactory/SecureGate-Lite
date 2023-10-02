<template>
  <v-app>
    <v-container pa-5 mt-5>
      <div class="text-h3">{{ $t("title") }}</div>
      <div v-if="!loggedin">
        <v-alert type="warning" class="mt-5">
          {{ $t("login-required") }}
        </v-alert>
      </div>
      <div class="text-subtitle-1 mb-9" v-else>
        {{ $t("logged-in-as", { user: $auth.user.global_name }) }},
        <nuxt-link to="/">{{ $t("goto-home") }}</nuxt-link>
        <v-divider vertical></v-divider>
        <nuxt-link to="/oauth2/logout">{{ $t("logout") }}</nuxt-link>
      </div>
      <div v-if="loading">
        <v-progress-circular indeterminate :size="60"></v-progress-circular>
      </div>
      <div v-else-if="error">
        <v-alert type="warning" class="mt-8">
          {{ error.message }}
        </v-alert>
      </div>
      <div v-else-if="guilds.length === 0">
        <v-alert type="info" class="mt-8">
          {{ $t("no-servers") }}
        </v-alert>
      </div>
      <div v-else>
        <v-row>
          <v-col v-for="(data, i) in guilds" :key="i">
            <v-card width="300px">
              <v-img
                :src="getGuildIcon(data.id, data.icon)"
                class="white--text align-end"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                height="100px"
              ></v-img>
              <v-card-title>{{ data.name }}</v-card-title>
              <v-card-actions>
                <v-btn color="primary" :to="getHome(data.id)" v-if="invited[data.id]">
                  <v-icon right>mdi-cog</v-icon>
                  {{ $t("manage") }}
                </v-btn>
                <v-btn :href="getLink(data.id)" v-else>
                  <v-icon right>mdi-account-plus</v-icon>
                  {{ $t("invite") }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-app>
</template>

<i18n lang="yaml">
ko:
  title: "서버 선택"
  login-required: "해당 작업을 수행하려면 디스코드 계정으로 로그인이 필요합니다."
  logged-in-as: "{user}(으)로 로그인됨"
  goto-home: "홈으로"
  logout: "로그아웃"
  no-servers: "참여 중인 서버가 없거나, 관리 권한이 있는 서버가 없어요."
  manage: "관리하기"
  invite: "봇 초대하기"
en:
  title: "Select Server"
  login-required: "You will need to login with your Discord account to do this."
  logged-in-as: "Logged in as {user}"
  goto-home: "Go to homepage"
  logout: "Logout"
  no-servers: "There are no participating guilds, or there are no guilds with management authority."
  manage: "Manage"
  invite: "Invite a bot"
</i18n>

<script>
export default {
  name: "DashboardIndex",
  head: {
    title: "Server Selector",
  },
  data() {
    return {
      loggedin: this.$auth.loggedIn,
      loading: false,
      guilds: [],
      invited: {},
      error: "",
      redirect_uri: encodeURIComponent(`${process.env.FRONTEND_HOST}/dashboard`),
      client_id: process.env.CLIENT_ID,
      permissions: process.env.PERMISSIONS,
    };
  },
  mounted() {
    if (!this.$auth.loggedIn) {
      this.$auth.$storage.setLocalStorage("redirect", `/dashboard`);
      this.$auth.loginWith("discord");
    } else {
      this.getGuilds();
    }
  },
  methods: {
    getGuilds: function () {
      this.loading = true;
      this.$axios
        .get("https://discord.com/api/users/@me/guilds", {
          headers: {
            Authorization: this.$auth.$storage.getCookie("_token.discord"),
          },
        })
        .then((res) => {
          let data = [];
          res.data.map((e) => {
            if (this.isAdmin(e.permissions)) {
              this.isInvited(e.id);
              data.push(e);
            }
          });
          this.loading = false;
          this.guilds = data;
        })
        .catch((err) => {
          this.loading = false;
          this.error = err.response.data;
        });
    },
    isInvited: function (id) {
      this.$axios
        .get(`/api/invited?id=${id}`, { progress: false })
        .then((res) => {
          this.invited = Object.assign({}, this.invited, { [id]: res.data.invited });
        })
        .catch((_err) => {});
    },
    getLink: function (id) {
      return `https://discord.com/api/oauth2/authorize?client_id=${this.client_id}&guild_id=${id}&permissions=${this.permissions}&scope=bot applications.commands&response_type=code&redirect_uri=${this.redirect_uri}`;
    },
    getHome: function (id) {
      return `/dashboard/home/${id}`;
    },
    getGuildIcon(id, name) {
      if (name == null) {
        return "/images/default.png";
      }
      return `https://cdn.discordapp.com/icons/${id}/${name}`;
    },
    isAdmin: function (permission) {
      return (parseInt(permission) % 16) - 8 >= 0;
    },
  },
};
</script>
