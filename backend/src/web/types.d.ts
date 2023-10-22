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

export interface IEmailLocale {
  header: string;
  footer: string;
  user: string;
  desc?: string;
  content?: string;
  btn?: string;
  from?: string;
  ignore?: string;
}

export interface IDiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  accent_color: number;
  global_name: string;
  banner_color: string | null;
  mfa_enabled: boolean;
  locale: string;
  premium_type: number;
  email: string;
  verified: boolean;
}

export interface ILink {
  auth_method: number;
  createdAt: number;
  expiresAt: number;
  gid: string;
  identifier: string;
  no_expires: boolean;
  number_of_uses: number;
}

export interface ICaptchaResponse {
  data: {
    success: boolean;
    challenge_ts: string;
  };
}
