import { Transporter, createTransport } from "nodemailer";
import { email_param, notify_locale_param, verify_locale_param } from "../types";
import { utils } from "./utils";
import { stream } from "./logger";
import transport from "nodemailer-smtp-transport";
import handlebars from "handlebars";
import path from "path";
import consola from "consola";

let isDev: boolean;
if (process.env.NODE_ENV === "production") isDev = false;
if (process.env.NODE_ENV === "development") isDev = true;

export class mail {
  public to: string;
  public smtpTransport: Transporter;
  constructor(to: string) {
    this.to = to;
    this.smtpTransport = createTransport(
      transport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })
    );
  }
  public async sendVerifyMail(param: email_param, locale: verify_locale_param) {
    const template = process.env.VERIFY_HTML_TEMPLATE;
    utils.readHTML(path.join(__dirname, "templates", template), (err: any, html: string) => {
      if (err) {
        return false;
      }
      let template = handlebars.compile(html);
      let replacements = {
        verify: param.verify,
        brand: param.brand,
        expire: param.expire,
        title: locale.header,
        username: locale.user,
        link_desc: locale.desc,
        button: locale.btn,
        ignore_info: locale.ignore,
        sending_only: locale.footer,
      };
      let options = {
        from: `${process.env.SMTP_SENDER_NAME} <${process.env.USER}>`,
        to: this.to,
        subject: param.subject,
        html: template(replacements),
      };
      this.smtpTransport.sendMail(options, (err, res) => {
        if (err) {
          if (isDev) consola.error(err);
          return false;
        }
        stream.write(`Email Sended. Accepted: ${res.accepted} | Response: ${res.response} | messageId: ${res.messageId}`);
        return true;
      });
    });
  }
  public async sendNotifyMail(param: email_param, locale: notify_locale_param) {
    const template = process.env.NOTIFY_HTML_TEMPLATE;
    utils.readHTML(path.join(__dirname, "templates", template), (err: any, html: string) => {
      if (err) {
        return false;
      }
      let template = handlebars.compile(html);
      let replacements = {
        brand: param.brand,
        link: param.link,
        title: locale.header,
        username: locale.user,
        content: locale.content,
        from: locale.from,
        sending_only: locale.footer,
      };
      let options = {
        from: `${process.env.SMTP_SENDER_NAME} <${process.env.USER}>`,
        to: this.to,
        subject: param.subject,
        html: template(replacements),
      };
      this.smtpTransport.sendMail(options, (err, res) => {
        if (err) {
          if (isDev) consola.error(err);
          return false;
        }
        stream.write(`Email Sended. Accepted: ${res.accepted} | Response: ${res.response} | messageId: ${res.messageId}`);
        return true;
      });
    });
  }
}
