import { Router, Request, Response } from "express";
import { stream } from "../modules";
import { client } from "../../bot";
import consola from "consola";

class IRouter {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.router.get("/", this.mainController);
  }
  private async mainController(req: Request, res: Response) {
    try {
      let guilds = client.guilds.cache.size;
      let users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      return res.json({
        code: 200,
        guilds,
        users,
      });
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
