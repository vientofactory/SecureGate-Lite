import { Router } from "express";
import { checkUser } from "../modules/middlewares";

import { getLinks, checkLink, createLink, deleteLink, formValidation } from "./linkRoutes/link";

import { authorization, checkEmailAuth, emailAuth } from "./linkRoutes/authorize";

class IRouter {
  /**
   * Routers
   */
  public readonly router: Router;
  constructor() {
    this.router = Router();
    /** Get from dashboard page */
    this.router.get("/", getLinks);
    /** Check from invite page */
    this.router.get("/check", checkLink);
    /** Create link */
    this.router.post("/create", checkUser, createLink);
    /** Form validition from server */
    this.router.get("/create/custom/validation", formValidation);
    /** Delete link */
    this.router.delete("/delete", checkUser, deleteLink);
    /** Check link status */
    this.router.get("/authorization/email", checkUser, checkEmailAuth);
    /** Auth & Participation */
    this.router.post("/authorization", checkUser, authorization);
    this.router.post("/authorization/email/verify", checkUser, emailAuth);
  }
}

const router = new IRouter();
module.exports = router.router;
