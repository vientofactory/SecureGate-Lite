import { Router, Request, Response } from "express";
import { stream } from "../modules";
import { utils } from "../modules";
import { IRole } from "../types";
import { client } from "../../bot";
import consola from "consola";

class IRouter {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.router.get("/", this.getController);
    this.router.get("/roles", this.roleController);
  }
  private async getController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const guild = client.guilds.cache.get(id);
      if (guild) {
        return res.json({
          code: 200,
          data: {
            name: guild.name,
            id: guild.id,
            icon: guild.iconURL(),
            joinedTimestamp: guild.joinedTimestamp,
          },
        });
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__("GUILD_NOT_FOUND"),
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
  private async roleController(req: Request, res: Response) {
    try {
      const accessToken = req.cookies["auth._token.discord"];
      const id = req.query.id;
      if (!accessToken || typeof accessToken !== "string" || !id || typeof id !== "string") {
        return res.status(400).json({
          code: 400,
          message: res.__("INVALID_REQUEST"),
        });
      }

      const guild = await utils.getGuild(id);
      if (guild && guild.status === 200) {
        let filtered: any[] = [];
        guild.data.roles.forEach((e: IRole) => {
          if (!e.managed && e.name !== "@everyone") {
            filtered.push({
              id: e.id,
              name: e.name,
            });
          }
        });
        return res.json({
          code: 200,
          data: filtered,
        });
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__("GUILD_NOT_FOUND"),
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
