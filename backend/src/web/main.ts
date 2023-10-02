import { Router, Request, Response } from "express";
import consola from "consola";

class IRouter {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.router.get("/", this.mainController);
  }
  private async mainController(req: Request, res: Response) {
    try {
      return res.json({
        code: 200,
        pid: process.pid,
        env: process.env.NODE_ENV,
      });
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
