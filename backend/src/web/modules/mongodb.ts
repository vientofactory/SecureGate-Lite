import { connect, connection } from "mongoose";
import consola from "consola";

export class DBManager {
  private readonly DB;
  public constructor() {
    this.DB = connection;
  }
  public connect(address: string) {
    connect(address);

    this.DB.on("error", (e) => {
      consola.error(e);
    });

    this.DB.once("open", () => {
      consola.success("MongoDB Connected!");
    });
  }
}
