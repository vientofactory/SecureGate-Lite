import 'dotenv/config';

export default {
  head: {
    titleTemplate: '%s - SecureGate Lite',
    htmlAttrs: {
      lang: 'ko'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'google-adsense-account', content: 'ca-pub-6469556883738104' },
      { hid: 'description', name: 'description', content: '디스코드 링크 보호 솔루션' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/images/favicon/favicon.ico' }
    ]
  },

  proxy: {
    '/api': {
      target: process.env.BACKEND_HOST,
      pathRewrite: { '^/api': '' }
    }
  },

  axios: {
    proxy: true,
    baseURL: process.env.FRONTEND_HOST,
    proxyHeaders: false,
    credentials: false
  },

  router: {
    fallback: true
  },

  loading: {
    color: '#29d',
    failedColor: '#29d'
  },

  auth: {
    strategies: {
      discord: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        codeChallengeMethod: 'S256',
        grantType: 'authorization_code',
        scope: ['email', 'identify', 'guilds', 'guilds.join']
      },
    },
    redirect: {
      login: '/oauth2/login',
      logout: '/oauth2/logout',
      callback: '/oauth2/callback',
      home: '/'
    }
  },

  recaptcha: {
    hideBadge: false,
    siteKey: process.env.RECAPTCHA_SITE,
    version: 2,
    size: 'normal'
  },

  dayjs: {
    defaultTimeZone: 'Asia/Seoul',
    plugins: [
      'utc',
      'timezone'
    ]
  },

  css: [
    '~/static/css/main.css',
    '~/static/css/vuetify.css'
  ],

  plugins: [
  ],

  components: true,

  buildModules: [
    '@nuxtjs/vuetify',
    [
      '@nuxtjs/dotenv',
      {
        //CLIENT SECRET등이 노출되지 않도록 스코프 지정.
        only: ['VER', 'FRONTEND_HOST', 'CLIENT_ID', 'PERMISSIONS', 'BRAND']
      }
    ]
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/proxy',
    'cookie-universal-nuxt',
    '@nuxtjs/recaptcha',
    '@nuxtjs/i18n',
    '@nuxtjs/dayjs'
  ],

  i18n: {
    strategy: 'no_prefix',
    locales: ['en', 'ko'],
    defaultLocale: 'ko',
    vueI18n: {
      fallbackLocale: 'ko'
    },
    vueI18nLoader: true
  },

  vuetify: {
    theme: {
      disable: true,
      dark: true
    }
  },

  build: {
    publicPath: '/static/',
    extractCSS: true,
    minimize: true,
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '.',
      name: undefined,
      cacheGroups: {}
    },
    html: {
      minify: {
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        processConditionalComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        trimCustomFragments: true,
        useShortDoctype: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyElements: true,
        preserveLineBreaks: false,
        collapseWhitespace: true
      }
    },
    transpile: [
      'defu'
    ]
  }
}
