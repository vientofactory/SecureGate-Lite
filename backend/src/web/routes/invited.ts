import { Router, Request, Response } from 'express';
import { stream } from '../modules';
import client from '../../bot';
import consola from 'consola';

class IRouter {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.router.get('/', this.mainController);
  }
  private async mainController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const invited = client.guilds.cache.map(e => e.id).includes(id);
      return res.json({
        code: 200,
        id: id,
        invited
      });
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

const router = new IRouter();
module.exports = router.router;