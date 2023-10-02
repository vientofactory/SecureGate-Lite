import { Request, Response } from "express";
import { stream } from "../../../modules";
import { userSchema, linkSchema } from "../../../../models";
import dayjs from "dayjs";
import consola from "consola";

class IRouter {
  public async mainController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const now = dayjs().valueOf();
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const data = Buffer.from(id, "base64").toString("utf8").split("+");
      if (data && data.length === 3) {
        const check = await userSchema.findOne({ verify_key: id });
        if (check) {
          if ((check.verify_expiresAt as number) > now) {
            const link = await linkSchema.findOne({ identifier: data[1] });
            if (link) {
              if (link.expiresAt > now || link.no_expires) {
                return res.json({
                  code: 200,
                });
              } else {
                return res.status(400).json({
                  code: 400,
                  message: res.__("LINK_EXPIRED"),
                });
              }
            } else {
              return res.status(400).json({
                code: 400,
                message: res.__("IDENTIFIER_NOT_FOUND"),
              });
            }
          } else {
            return res.status(403).json({
              code: 403,
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

export const checkEmailAuth = new IRouter().mainController;
