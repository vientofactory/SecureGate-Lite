import { Transporter, createTransport } from "nodemailer";
import { IEmail, IEmailLocale } from "../types";
import { utils } from "./utils";
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
  public async send(type: number, template: string, param: IEmail, locale: IEmailLocale) {
    let replacements = {};
    switch (type) {
      case 1: // Verify
        Object.assign(replacements, {
          verify: param.verify,
          brand: param.brand,
          expire: param.expire,
          title: locale.header,
          username: locale.user,
          link_desc: locale.desc,
          button: locale.btn,
          ignore_info: locale.ignore,
          sending_only: locale.footer,
        });
      case 2: // Notify
        Object.assign(replacements, {
          brand: param.brand,
          link: param.link,
          title: locale.header,
          username: locale.user,
          content: locale.content,
          from: locale.from,
          sending_only: locale.footer,
        });
    }
    utils.readHTML(path.join(__dirname, "templates", template), (err: any, html: string) => {
      if (err) {
        return false;
      }
      let template = handlebars.compile(html);
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
        console.info(res);
        return true;
      });
    });
  }
}
