import { Request, Response } from "express";
import { stream } from "../../../modules";
import { linkSchema } from "../../../../models";
import dayjs from "dayjs";
import consola from "consola";

const maxInvites = Number(process.env.MAX_ALLOWED_INVITES);

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

      const links = await linkSchema.find({ gid: id });
      if (links.length) {
        let data: any[] = [];
        links.forEach((e) => {
          if (e.expiresAt > now || e.no_expires)
            data.push({
              auth_method: e.auth_method,
              createdAt: e.createdAt,
              expiresAt: e.expiresAt,
              gid: e.gid,
              identifier: e.identifier,
              no_expires: e.no_expires,
              number_of_uses: e.number_of_uses,
            });
        });
        if (data.length) {
          return res.json({
            code: 200,
            create_limit: maxInvites,
            data: data,
          });
        } else {
          return res.status(404).json({
            code: 404,
            create_limit: maxInvites,
            message: res.__("NO_REGISTERED_LINKS"),
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          create_limit: maxInvites,
          message: res.__("NO_REGISTERED_LINKS"),
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

export const getLinks = new IRouter().mainController;
