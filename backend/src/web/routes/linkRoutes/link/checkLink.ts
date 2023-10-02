import { Request, Response } from "express";
import { linkSchema } from "../../../../models";
import { stream } from "../../../modules";
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

      const link = await linkSchema.find({ identifier: id });
      if (link.length) {
        let activeLink: any[] = [];
        link.forEach((e) => {
          if (e.expiresAt > now || e.no_expires) {
            activeLink.push({
              auth_method: e.auth_method,
              createdAt: e.createdAt,
              expiresAt: e.expiresAt,
              gid: e.gid,
              identifier: e.identifier,
              no_expires: e.no_expires,
              number_of_uses: e.number_of_uses,
            });
          }
        });
        if (activeLink.length) {
          return res.json({
            code: 200,
            data: activeLink[activeLink.length - 1],
          });
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

export const checkLink = new IRouter().mainController;
