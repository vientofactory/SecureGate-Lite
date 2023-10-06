declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BRAND: string;
      FRONTEND_HOST: string;
      RECAPTCHA_SECRET: string;
      VERIFY_HTML_TEMPLATE: string;
      NOTIFY_HTML_TEMPLATE: string;
      MONGODB_URI: string;
      LOG_WEBHOOK: string;
    }
  }
}

export interface IAddGuildMember {
  token: string;
  guild_id: string;
  user_id: string;
  role?: string;
}

export interface IEmail {
  verify?: string;
  brand: string;
  subject: string;
  expire?: string;
  link?: string;
}

export interface IVerifyLocale {
  header: string;
  footer: string;
  user: string;
  desc: string;
  btn: string;
  ignore: string;
}

export interface INotifyLocale {
  header: string;
  footer: string;
  user: string;
  content: string;
  btn?: string;
  from: string;
}

export interface IRole {
  managed: boolean;
  name: string;
  id: string;
}

export interface ICaptchaResponse {
  data: {
    success: boolean;
    challenge_ts: string;
  };
}
