import { Request, Response } from "express";
import { utils } from "../../../modules";
import { linkSchema } from "../../../../models";
import { client } from "../../../../bot";
import { IDiscordUser } from "../../../types";
import consola from "consola";

class IRouter {
  public async mainController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const accessToken = req.cookies["auth._token.discord"];
      if (!id || typeof id !== "string" || !accessToken || typeof accessToken !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const userData = res.locals.user as IDiscordUser;
      const check = await linkSchema.findOne({ identifier: id });
      if (check) {
        const guild = client.guilds.cache.get(check.gid);
        if (guild) {
          const user = guild.members.cache.get(userData.id);
          if (user && utils.isAdmin(parseInt(user.permissions.toJSON()))) {
            linkSchema.deleteOne({ identifier: id }).exec();
            return res.json({
              code: 200,
              message: res.__("LINK_DELETED"),
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
          message: res.__("LINK_IDENTIFIER_NOT_FOUND"),
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

export const deleteLink = new IRouter().mainController;
