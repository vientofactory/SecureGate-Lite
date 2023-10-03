import { Router, Request, Response } from "express";
import { stream } from "../modules";
import client from "../../bot";
import consola from "consola";

class IRouter {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.router.post("/", this.mainController);
  }
  private async mainController(req: Request, res: Response) {
    try {
      const { ids } = req.body;
      if (!ids || typeof ids !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const data = ids.split("+");
      if (data.length) {
        let invited: any[] = [];
        let notInvited: any[] = [];
        data.forEach((id) => {
          let check = client.guilds.cache.map((e) => e.id).includes(id);
          if (check) invited.push(id);
          else notInvited.push(id);
        });
        return res.json({
          code: 200,
          data: {
            invited,
            notInvited,
          },
        });
      } else {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
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

const router = new IRouter();
module.exports = router.router;
