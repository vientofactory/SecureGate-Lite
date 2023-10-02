import { Router, Request, Response } from "express";
import client from "../../bot";
import consola from "consola";

class IRouter {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.router.get("/", this.mainController);
  }
  private async mainController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }
      let online = 0;
      const guild = client.guilds.cache.get(id);
      if (guild) {
        const members = await guild.members.fetch();
        members.forEach((e) => {
          if (e.presence) {
            if (e.presence.status === "online" || e.presence.status === "idle" || e.presence.status === "dnd") {
              online++;
            }
          }
        });
        return res.json({
          code: 200,
          online: online,
          members: guild.memberCount,
        });
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__("GUILD_NOT_FOUND"),
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
