import i18n from 'i18n';
import { Request, Response, NextFunction } from 'express';

class middleware {
  constructor() {
    i18n.configure({
      locales: ['ko', 'en'],
      defaultLocale: 'ko',
      cookie: 'i18n_redirected',
      directory: `${__dirname}/../locales`
    });
  }
  public mainController(req: Request, res: Response, next: NextFunction) {
    i18n.init(req, res);
    return next();
  }
}

export const i18nMiddleware = new middleware().mainController;