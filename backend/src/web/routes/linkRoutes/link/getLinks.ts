import { Request, Response } from "express";
import { linkSchema } from "../../../../models";
import dayjs from "dayjs";
import consola from "consola";

const maxInvites = Number(process.env.MAX_ALLOWED_INVITES);

class controller {
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
        let data = [];
        for (let i = 0; i < links.length; i++) {
          if (links[i].expiresAt < now && !links[i].no_expires) {
            linkSchema.findByIdAndDelete(links[i]._id).exec(); //Delete expired links
          } else {
            let dataObj = {};
            Object.assign(dataObj, {
              auth_method: links[i].auth_method,
              createdAt: links[i].createdAt,
              expiresAt: links[i].expiresAt,
              gid: links[i].gid,
              identifier: links[i].identifier,
              no_expires: links[i].no_expires,
              number_of_uses: links[i].number_of_uses,
            });
            data.push(dataObj);
          }
        }
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
      return res.status(500).json({
        code: 500,
        message: "An error occurred while processing your request.",
      });
    }
  }
}

export const getLinks = new controller().mainController;
