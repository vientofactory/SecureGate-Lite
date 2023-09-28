import { Request, Response } from 'express';
import { utils, stream } from '../../../modules';
import { linkSchema } from '../../../../models';
import dayjs from 'dayjs';
import consola from 'consola';

const resolved = ['authorize', 'dashboard']; //Resolved Names for Dashboard Routes.

class IRouter {
  public async mainController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const now = dayjs().valueOf();
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      if (utils.validateLink(id)) {
        if (!resolved.includes(id)) {
          const check = await linkSchema.findOne({ identifier: id });
          if (!check || !check.no_expires && check.expiresAt < now) {
            return res.json({
              code: 200,
              message: res.__('AVALIABLE_IDENTIFIER')
            });
          } else {
            return res.status(400).json({
              code: 400,
              message: res.__('IDENTIFIER_ALREADY_EXISTS')
            });
          }
        } else {
          return res.status(400).json({
            code: 400,
            message: res.__('SYSTEM_RESOLVED')
          });
        }
      } else {
        return res.status(400).json({
          code: 400,
          message: res.__('IDENTIFIER_FORMAT_ERROR')
        });
      }
    } catch (err) {
      consola.error(err);
      stream.write(err as string);
      return res.status(500).json({
        code: 500,
        message: 'An error occurred while processing your request.'
      });
    }
  }
}

export const formValidation = new IRouter().mainController;