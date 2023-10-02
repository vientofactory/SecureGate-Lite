declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BRAND: string;
      FRONTEND_HOST: string;
      VERIFY_HTML_TEMPLATE: string;
      NOTIFY_HTML_TEMPLATE: string;
      MONGODB_URI: string;
      LOG_WEBHOOK: string;
    }
  }
}

export interface email_param {
  verify?: string;
  brand: string;
  subject: string;
  expire?: string;
  link?: string;
}

export interface verify_locale_param {
  header: string;
  footer: string;
  user: string;
  desc: string;
  btn: string;
  ignore: string;
}

export interface notify_locale_param {
  header: string;
  footer: string;
  user: string;
  content: string;
  btn?: string;
  from: string;
}

export interface role {
  managed: boolean;
  name: string;
  id: string;
}
