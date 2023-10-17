import { Request, Response, NextFunction } from "express";
import { userSchema } from "../../../models";
import { utils } from "../utils";
import dayjs from "dayjs";
import consola from "consola";

class middleware {
  public async mainController(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies["auth._token.discord"];
      const now = dayjs().valueOf();
      if (!accessToken || typeof accessToken !== "string") {
        return res.status(400).json({
          code: 400,
          message: "OAuth2 cookies not found.",
        });
      }

      const user = await utils.getUser(accessToken.replace("Bearer ", ""));
      if (user) {
        const localUser = await userSchema.findOne({ id: user.id });
        if (localUser) {
          if (localUser.email !== user.email) {
            localUser
              .updateOne({
                $set: {
                  email: user.email,
                },
              })
              .exec();
          }
        } else {
          const data = new userSchema({
            id: user.id,
            email: user.email,
            createdAt: now,
          });
          data.save();
        }
        // Pass user data to next router.
        res.locals.user = user;
        return next();
      } else {
        return res.status(401).json({
          code: 401,
          message: "Discord user verification failed.",
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

export const checkUser = new middleware().mainController;
