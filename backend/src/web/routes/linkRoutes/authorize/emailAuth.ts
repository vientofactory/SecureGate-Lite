import { Request, Response } from "express";
import { utils, stream } from "../../../modules";
import { userSchema, linkSchema } from "../../../../models";
import dayjs from "dayjs";
import consola from "consola";

class IRouter {
  public async mainController(req: Request, res: Response) {
    try {
      const { identifier } = req.body;
      const accessToken = req.cookies["auth._token.discord"];
      const now = dayjs().valueOf();
      if (!identifier || typeof identifier !== "string" || !accessToken || typeof accessToken !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      /**
       * 0 - Discord User ID
       * 1 - Link Identifier
       * 2 - Random Generated
       */
      const data = Buffer.from(identifier, "base64").toString("utf8").split("+");
      if (data && data.length === 3) {
        const localuser = await userSchema.findOne({ verify_key: identifier });
        if (localuser) {
          if ((localuser.verify_expiresAt as number) > now) {
            const link = await linkSchema.findOne({ identifier: data[1] });
            if (link) {
              if (link.expiresAt > now || link.no_expires) {
                const token = accessToken.replace("Bearer ", "");
                const discordUser = await utils.getUser(token);
                const invite = await utils.addGuildMember({
                  token,
                  guild_id: link.gid,
                  user_id: discordUser?.data.id,
                  role: link.role,
                });
                switch (invite) {
                  case "SUCCESS":
                    link.updateOne({
                      $set: {
                        number_of_uses: link.number_of_uses + 1,
                      },
                    });
                    localuser
                      .updateOne({
                        $unset: {
                          verify_key: "",
                          verify_expiresAt: "",
                        },
                      })
                      .exec();
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
              } else {
                return res.status(400).json({
                  code: 400,
                  message: res.__("LINK_EXPIRED"),
                });
              }
            } else {
              return res.status(404).json({
                code: 404,
                message: res.__("IDENTIFIER_NOT_FOUND"),
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
            message: res.__("LOCALUSER_NOT_FOUND"),
          });
        }
      } else {
        return res.status(400).json({
          code: 400,
          message: "식별자 형식이 유효하지 않습니다.",
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

export const emailAuth = new IRouter().mainController;
