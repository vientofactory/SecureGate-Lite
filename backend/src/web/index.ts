import { readdirSync } from "fs";
import { join } from "path";
import express, { json, urlencoded, Request, Response, Application } from "express";
import { stream, DBManager } from "./modules";
import { i18nMiddleware } from "./modules/middlewares";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import asyncify from "express-asyncify";
import consola from "consola";

export class Server {
  public readonly app: Application;
  public readonly port: number;
  public readonly isDev: boolean;
  constructor(port: number, isDev: boolean) {
    this.app = asyncify(express());
    this.port = port;
    this.isDev = isDev;
    this.initialize();
    this.setMiddlewares();
    this.setRouters();
  }
  private initialize() {
    new DBManager().connect(process.env.MONGODB_URI);
  }
  private setMiddlewares() {
    this.app.use(json());
    this.app.use(cookieParser());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(i18nMiddleware);
    if (!this.isDev) this.app.use(morgan("combined", { stream }));
    else this.app.use(morgan("dev"));
    this.app.disable("x-powered-by");
  }
  private setRouters() {
    this.app.use("/", require("./main"));
    readdirSync(join(__dirname, "routes")).forEach((file) => {
      if (this.isDev) {
        if (file.endsWith(".ts")) {
          try {
            const route = require(join(__dirname, "routes", file));
            this.app.use(`/${file.split(".")[0]}`, route);
            consola.info(`Loaded Backend Router: ${file}`);
          } catch (err) {
            consola.error(err);
          }
        }
      } else {
        if (file.endsWith(".js")) {
          try {
            const route = require(join(__dirname, "routes", file));
            this.app.use(`/${file.split(".")[0]}`, route);
            consola.info(`Loaded Backend Router: ${file}`);
          } catch (err) {
            consola.error(err);
          }
        }
      }
    });

    //Default 404 Route.
    this.app.all("*", (req: Request, res: Response) => {
      return res.status(404).json({
        code: 404,
        message: "Not found.",
      });
    });
  }
  public start() {
    this.app.listen(this.port, () => {
      consola.ready({
        message: `Server listening on port ${this.port}`,
        badge: true,
      });
    });
  }
}
