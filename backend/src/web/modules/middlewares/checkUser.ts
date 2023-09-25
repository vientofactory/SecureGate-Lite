import { Request, Response, NextFunction } from 'express';
import { userSchema } from '../../../models';
import { utils } from '../utils';
import consola from 'consola';

class middleware {
  public async mainController(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies['auth._token.discord'];
      const refreshToken = req.cookies['auth._refresh_token.discord'];
      if (!accessToken || typeof accessToken !== 'string' || !refreshToken || typeof refreshToken !== 'string') {
        return res.status(400).json({
          code: 400,
          message: 'Parameter is not valid.'
        });
      }

      const discordUser = await utils.getUser(accessToken.replace('Bearer ', ''));
      if (discordUser) {
        const localUser = await userSchema.findOne({ id: discordUser.id });
        if (localUser) {
          if (localUser.refresh_token !== refreshToken) {
            await localUser.updateOne({
              $set: {
                refresh_token: refreshToken
              }
            });
          }
        } else {
          const data = new userSchema({
            id: discordUser.id,
            email: discordUser.email,
            createdAt: new Date().getTime(),
            refresh_token: refreshToken
          });
          data.save();
        }
        return next();
      } else {
        return res.status(401).json({
          code: 401,
          message: 'Discord user verification failed.'
        });
      }
    } catch (err) {
      consola.error(err);
      return res.status(500).json({
        code: 500,
        message: 'An error occurred while processing your request.'
      });
    }
  }
}

export const checkUser = new middleware().mainController;