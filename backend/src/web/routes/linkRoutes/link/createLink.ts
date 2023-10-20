import { Request, Response } from "express";
import { utils } from "../../../modules";
import { guildSchema, linkSchema } from "../../../../models";
import { client } from "../../../../bot";
import { IDiscordUser } from "../../../types";
import dayjs from "dayjs";
import consola from "consola";

const resolved = ["authorize", "dashboard"]; //Resolved Names for Dashboard Routes.
const methods = ["1", "2"]; //reCAPTCHA, Email
const expiresAt = ["30m", "1h", "12h", "1d", "7d", "30d", "no_expires"];

const maxInvites = Number(process.env.MAX_ALLOWED_INVITES);

class controller {
  public async mainController(req: Request, res: Response) {
    try {
      const { id, gid, role, method, expire } = req.body;
      const now = dayjs().valueOf();
      if (
        !gid ||
        typeof gid !== "string" ||
        !method ||
        typeof method !== "string" ||
        !expire ||
        typeof expire !== "string" ||
        !methods.includes(method) ||
        !expiresAt.includes(expire)
      ) {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const userData = res.locals.user as IDiscordUser;
      const guild = client.guilds.cache.get(gid);
      if (guild) {
        const guildDB = await guildSchema.findOne({ gid: guild.id });
        if (guildDB) {
          const user = guild.members.cache.get(userData.id);
          if (user && utils.isAdmin(parseInt(user.permissions.toJSON()))) {
            let linkCount = 0;
            const checkLinks = await linkSchema.find({ gid: guildDB.gid });
            checkLinks.forEach((e) => {
              if (e.expiresAt > now || e.no_expires) linkCount++;
            });
            if (linkCount >= maxInvites) {
              return res.status(400).json({
                code: 400,
                message: res.__("LINK_CREATE_LIMIT", { max: String(maxInvites) }),
              });
            }
            const expireTime = utils.getExpires(expire);

            let dataObj = {};

            // Default data
            Object.assign(dataObj, {
              gid: guild.id,
              createdAt: now,
              expiresAt: expireTime,
              auth_method: Number(method),
              issuer: user.id,
              no_expires: expireTime ? false : true,
            });

            // Custom identifier
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

              Object.assign(dataObj, {
                identifier: id,
              });
            } else {
              // Random identifier
              let identifier = utils.genRandomString(8);
              //Check availability
              while (!utils.checkLink(identifier)) {
                identifier = utils.genRandomString(8);
              }
              Object.assign(dataObj, {
                identifier,
              });
            }

            // Add role_id if role selected
            if (role) {
              let roles: string[] = [];
              guild.roles.cache.forEach((e) => {
                if (e.guild.id === gid && !e.managed && e.name !== "@everyone") roles.push(e.id);
              });
              const filter = roles.find((e) => e === role);
              if (filter) {
                Object.assign(dataObj, {
                  role: filter,
                });
              } else {
                return res.status(404).json({
                  code: 404,
                  message: res.__("ROLE_NOT_FOUND"),
                });
              }
            }

            const newLink = new linkSchema(dataObj);
            newLink.save();

            return res.json({
              code: 200,
              message: res.__("LINK_CREATED"),
            });
          } else {
            return res.status(403).json({
              code: 403,
              message: res.__("INVALID_ENTRY"),
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
      return res.status(500).json({
        code: 500,
        message: "An error occurred while processing your request.",
      });
    }
  }
}

export const createLink = new controller().mainController;
