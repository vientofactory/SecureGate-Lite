import { Request, Response } from "express";
import { utils, stream } from "../../../modules";
import { linkSchema } from "../../../../models";
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

      const check = await linkSchema.findOne({ identifier: id });
      if (check) {
        const guild = await utils.getGuild(check.gid);
        if (guild && guild.status === 200) {
          const token = accessToken.replace("Bearer ", "");
          const permissions = await utils.getGuildUserPermissions(token, guild.data.id);
          if (permissions) {
            if (utils.isAdmin(permissions)) {
              await linkSchema.deleteMany({ identifier: id });
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
          message: res.__("LINK_IDENTIFIER_NOT_FOUND"),
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

export const deleteLink = new IRouter().mainController;
