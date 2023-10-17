import { Router, Request, Response } from "express";
import { utils } from "../modules";
import consola from "consola";

class IRouter {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.router.get("/", this.mainController);
  }
  private async mainController(req: Request, res: Response) {
    try {
      const accessToken = req.cookies["auth._token.discord"];
      if (!accessToken || typeof accessToken !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const token = accessToken.replace("Bearer ", "");
      const user = await utils.getUser(token);
      if (user) {
        return res.json({
          code: 200,
          data: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            global_name: user.global_name,
            email: user.email,
          },
        });
      } else {
        return res.status(401).json({
          code: 401,
          message: res.__("user_VALIDATION_FAILED"),
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

const router = new IRouter();
module.exports = router.router;
