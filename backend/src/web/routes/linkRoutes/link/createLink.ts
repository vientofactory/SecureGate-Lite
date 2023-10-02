import { Request, Response } from "express";
import { utils, stream } from "../../../modules";
import { guildSchema, linkSchema } from "../../../../models";
import { role } from "../../../types";
import dayjs from "dayjs";
import consola from "consola";

const resolved = ["authorize", "dashboard"]; //Resolved Names for Dashboard Routes.
const methods = ["1", "2"]; //Captcha, Email
const expiresAt = ["30m", "1h", "12h", "1d", "7d", "30d", "no_expires"];
const maxInvites = Number(process.env.MAX_ALLOWED_INVITES);

class IRouter {
  public async mainController(req: Request, res: Response) {
    try {
      const { id, gid, role, method, expire } = req.body;
      const accessToken = req.cookies["auth._token.discord"];
      const now = dayjs().valueOf();
      if (
        !gid ||
        typeof gid !== "string" ||
        !method ||
        typeof method !== "string" ||
        !expire ||
        typeof expire !== "string" ||
        !accessToken ||
        typeof accessToken !== "string" ||
        !methods.includes(method) ||
        !expiresAt.includes(expire)
      ) {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const guild = await utils.getGuild(gid);
      if (guild && guild.status === 200) {
        const guildDB = await guildSchema.findOne({ gid: guild.data.id });
        if (guildDB) {
          const token = accessToken.replace("Bearer ", "");
          const permissions = await utils.getGuildUserPermissions(token, gid);
          if (permissions) {
            if (utils.isAdmin(permissions)) {
              let links = [];
              const checkLinks = await linkSchema.find({ gid: guildDB.gid });
              checkLinks.forEach((e) => {
                if (e.expiresAt > now || e.no_expires) links.push(e);
              });
              if (links.length >= maxInvites) {
                return res.status(400).json({
                  code: 400,
                  message: res.__("LINK_CREATE_LIMIT", { name: String(maxInvites) }),
                });
              }
              const expireTime = utils.getExpires(expire);
              if (id && typeof id === "string") {
                if (!utils.validateLink(id)) {
                  return res.status(400).json({
                    code: 400,
                    message: res.__("IDENTIFIER_FORMAT_ERROR"),
                  });
                }
                if (resolved.includes(id)) {
                  return res.status(400).json({
                    code: 400,
                    message: res.__("SYSTEM_RESOLVED"),
                  });
                }
                if (expire === "no_expires") {
                  return res.status(400).json({
                    code: 400,
                    message: res.__("NO_EXPIRES_NOT_ALLOWED"),
                  });
                }

                const check = await linkSchema.findOne({ identifier: id });
                if (check) {
                  return res.status(400).json({
                    code: 400,
                    message: res.__("IDENTIFIER_ALREADY_EXISTS"),
                  });
                }

                const discordUser = await utils.getUser(token);
                if (role) {
                  let roles: any[] = [];
                  guild.data.roles.forEach((e: role) => {
                    if (!e.managed && e.name !== "@everyone") roles.push(e.id);
                  });
                  const filter = roles.find((e) => e === role);
                  if (filter) {
                    const newLink = new linkSchema({
                      identifier: id,
                      gid: guild.data.id,
                      role: filter,
                      createdAt: now,
                      expiresAt: expireTime,
                      auth_method: Number(method),
                      issuer: discordUser?.data.id,
                      no_expires: false,
                    });
                    newLink
                      .save()
                      .then(() => {
                        return res.json({
                          code: 200,
                          message: res.__("LINK_CREATED"),
                        });
                      })
                      .catch((e) => {
                        return res.status(500).json({
                          code: 500,
                          message: e,
                        });
                      });
                  } else {
                    return res.status(404).json({
                      code: 404,
                      message: res.__("ROLE_NOT_FOUND"),
                    });
                  }
                } else {
                  const newLink = new linkSchema({
                    identifier: id,
                    gid: guild.data.id,
                    role: null,
                    createdAt: now,
                    expiresAt: expireTime,
                    auth_method: Number(method),
                    issuer: discordUser?.data.id,
                    no_expires: false,
                  });
                  newLink
                    .save()
                    .then(() => {
                      return res.json({
                        code: 200,
                        message: res.__("LINK_CREATED"),
                      });
                    })
                    .catch((e) => {
                      return res.status(500).json({
                        code: 500,
                        message: e,
                      });
                    });
                }
              } else {
                let identifier = utils.genRandomString(8);
                //Check availability
                while (!utils.checkLink(identifier)) {
                  identifier = utils.genRandomString(8);
                }
                const discordUser = await utils.getUser(token);
                if (role) {
                  let roles: any[] = [];
                  guild.data.roles.forEach((e: role) => {
                    if (!e.managed && e.name !== "@everyone") roles.push(e.id);
                  });
                  const filter = roles.find((e) => e === role);
                  if (filter) {
                    //Selected role
                    const newLink = new linkSchema({
                      identifier: identifier,
                      gid: guild.data.id,
                      role: filter,
                      createdAt: now,
                      expiresAt: expireTime ? expireTime : 0,
                      auth_method: Number(method),
                      issuer: discordUser?.data.id,
                      no_expires: expireTime ? false : true,
                    });
                    newLink
                      .save()
                      .then(() => {
                        return res.json({
                          code: 200,
                          message: res.__("LINK_CREATED"),
                        });
                      })
                      .catch((e) => {
                        return res.status(500).json({
                          code: 500,
                          message: e,
                        });
                      });
                  } else {
                    return res.status(404).json({
                      code: 404,
                      message: res.__("ROLE_NOT_FOUND"),
                    });
                  }
                } else {
                  //Without selected role
                  const newLink = new linkSchema({
                    identifier: identifier,
                    gid: guild.data.id,
                    role: null,
                    createdAt: now,
                    expiresAt: expireTime ? expireTime : 0,
                    auth_method: Number(method),
                    issuer: discordUser?.data.id,
                    no_expires: expireTime ? false : true,
                  });
                  newLink
                    .save()
                    .then(() => {
                      return res.json({
                        code: 200,
                        message: res.__("LINK_CREATED"),
                      });
                    })
                    .catch((e) => {
                      return res.status(500).json({
                        code: 500,
                        message: e,
                      });
                    });
                }
              }
            } else {
              return res.status(403).json({
                code: 403,
                message: res.__("INVALID_ENTRY"),
              });
            }
          } else {
            return res.status(500).json({
              code: 500,
              message: res.__("PERMISSION_CHECK_FAILED"),
            });
          }
        } else {
          return res.status(404).json({
            code: 404,
            message: res.__("GUILD_NOT_FOUND"),
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__("GUILD_NOT_FOUND"),
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

export const createLink = new IRouter().mainController;
