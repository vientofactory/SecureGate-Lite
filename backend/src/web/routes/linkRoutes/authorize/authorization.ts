import { Request, Response } from "express";
import { captcha } from "../../../modules/middlewares";
import { utils, stream, mail } from "../../../modules";
import { userSchema, linkSchema } from "../../../../models";
import { client } from "../../../../bot";
import { IDiscordUser } from "../../../types";
import dayjs from "dayjs";
import consola from "consola";

let isDev: boolean;
if (process.env.NODE_ENV === "production") isDev = false;
else if (process.env.NODE_ENV === "development") isDev = true;
else isDev = false;

const brand = process.env.BRAND;
const domain = process.env.FRONTEND_HOST;
const expires = Number(process.env.EXPIRES);

class IRouter {
  public async mainController(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const accessToken = req.cookies["auth._token.discord"];
      const now = dayjs().valueOf();
      const ip = (req.header("x-forwarded-for") ?? req.socket.remoteAddress) as string;
      if (!id || typeof id !== "string" || !accessToken || typeof accessToken !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const token = accessToken.replace("Bearer ", "");
      const discordUser = res.locals.user as IDiscordUser;
      const localuser = await userSchema.findOne({ id: discordUser.id });
      if (localuser) {
        const link = await linkSchema.findOne({ identifier: id });
        if (link) {
          if (link.expiresAt > now || link.no_expires) {
            if (link.auth_method === 1) {
              //Captcha
              const { g_recaptcha } = req.body;
              if (!g_recaptcha || typeof g_recaptcha !== "string") {
                return res.status(400).json({
                  code: 400,
                  message: res.__("INVALID_REQUEST"),
                });
              }
              const verify = await captcha.verify(g_recaptcha, ip);
              if (!verify) {
                return res.status(403).json({
                  code: 403,
                  message: res.__("CAPTCHA_ERROR"),
                });
              }
              const invite = await utils.addGuildMember({
                token,
                guild_id: link.gid,
                user_id: discordUser.id,
                role: link.role,
              });
              switch (invite) {
                case "SUCCESS":
                  link.updateOne({
                    $set: {
                      number_of_uses: link.number_of_uses + 1,
                    },
                  });
                  return res.json({
                    code: 200,
                    message: res.__("JOIN_SUCCESS"),
                  });
                case "ALREADY_INVITED":
                  return res.status(400).json({
                    code: 400,
                    message: res.__("ALREADY_INVITED"),
                  });
                case "PERMISSION_DENIED":
                  return res.status(400).json({
                    code: 403,
                    message: res.__("PERMISSION_DENIED"),
                  });
                default:
                  return res.status(500).json({
                    code: 500,
                    message: res.__("UNKNOWN_ERROR"),
                  });
              }
            } else if (link.auth_method === 2) {
              //Email
              const { email } = req.body;
              if (!email || typeof email !== "string") {
                return res.status(400).json({
                  code: 400,
                  message: res.__("INVALID_REQUEST"),
                });
              }
              if (!utils.validateMail(email)) {
                return res.status(400).json({
                  code: 400,
                  message: res.__("EMAIL_FORMAT_ERROR"),
                });
              }
              const identifier = Buffer.from(`${discordUser.id}+${link.identifier}+${utils.genRandomString(32)}`).toString("base64");
              const guild = client.guilds.cache.get(link.gid);
              if (!guild) {
                return res.status(404).json({
                  code: 404,
                  message: res.__("GUILD_NOT_FOUND"),
                });
              }
              const expiresIn = dayjs().add(expires, "millisecond").valueOf();
              localuser
                .updateOne({
                  $set: {
                    verify_key: identifier,
                    verify_expiresAt: expiresIn,
                  },
                })
                .exec();
              //TODO: Rate Limit
              if (!localuser.email_send_date) {
                localuser
                  .updateOne({
                    $set: {
                      email_send_date: now,
                    },
                  })
                  .exec();
                if (!isDev) {
                  new mail(email).send(
                    1,
                    process.env.VERIFY_HTML_TEMPLATE,
                    {
                      //INFO
                      subject: res.__("EMAIL_TITLE", { guild: guild.name }),
                      verify: `${domain}/invite/authorize?identifier=${identifier}`,
                      expire: res.__("EMAIL_EXPIRES", { time: `KST ${dayjs(expiresIn).format("YYYY-MM-DD hh:mm:ss")}` }),
                      brand: brand,
                    },
                    {
                      //LOCALES
                      header: res.__("EMAIL_HEAD"),
                      user: res.__("EMAIL_USER", { user: `${discordUser.global_name} (@${discordUser.username})` }),
                      desc: res.__("EMAIL_DESC"),
                      btn: res.__("EMAIL_BTN"),
                      ignore: res.__("EMAIL_IGNORE"),
                      footer: res.__("EMAIL_FOOT"),
                    }
                  );
                }
              } else if (localuser.email_send_date + 300000 < now) {
                localuser
                  .updateOne({
                    $set: {
                      email_send_date: now,
                    },
                  })
                  .exec();
                if (!isDev) {
                  new mail(email).send(
                    1,
                    process.env.VERIFY_HTML_TEMPLATE,
                    {
                      //INFO
                      subject: res.__("EMAIL_TITLE", { guild: guild.name }),
                      verify: `${domain}/invite/authorize?identifier=${identifier}`,
                      expire: res.__("EMAIL_EXPIRES", { time: `KST ${dayjs(expiresIn).format("YYYY-MM-DD hh:mm:ss")}` }),
                      brand: brand,
                    },
                    {
                      //LOCALES
                      header: res.__("EMAIL_HEAD"),
                      user: res.__("EMAIL_USER", { user: `${discordUser.global_name} (@${discordUser.username})` }),
                      desc: res.__("EMAIL_DESC"),
                      btn: res.__("EMAIL_BTN"),
                      ignore: res.__("EMAIL_IGNORE"),
                      footer: res.__("EMAIL_FOOT"),
                    }
                  );
                }
              } else {
                const remain = dayjs((localuser.email_send_date as number) + 300000 - now).minute();
                return res.status(400).json({
                  code: 400,
                  message: `이메일 인증은 약 ${remain}분 후에 다시 요청할 수 있습니다.`,
                });
              }
              return res.json({
                code: 200,
                message: res.__("EMAIL_SENDED"),
              });
            } else {
              return res.status(500).json({
                code: 500,
                message: res.__("UNKNOWN_AUTH_METHOD"),
              });
            }
          } else {
            return res.status(400).json({
              code: 400,
              message: res.__("LINK_EXPIRED"),
            });
          }
        } else {
          return res.status(404).json({
            code: 404,
            message: res.__("LINK_IDENTIFIER_NOT_FOUND"),
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__("LOCALUSER_NOT_FOUND"),
        });
      }
    } catch (err) {
      consola.error(err);
      stream.write(err as string);
      return res.status(500).json({
        code: 500,
        message: "An error occurred while processing your request.",
      });
    }
  }
}

export const authorization = new IRouter().mainController;
