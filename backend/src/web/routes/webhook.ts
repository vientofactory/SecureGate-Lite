import { Router, Request, Response } from 'express';
import { guildSchema } from '../../models';
import { stream, utils, checkUser, webhookManager } from '../modules';
import consola from 'consola';

class IRouter {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.router.get('/', checkUser, this.getWebhook);
    this.router.post('/register', checkUser, this.registerWebhook);
    this.router.delete('/delete', checkUser, this.deleteWebhook);
  }
  private async getWebhook(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const accessToken = req.cookies['auth._token.discord'];
      if (!id || typeof id !== 'string' || !accessToken || typeof accessToken !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const guild = await guildSchema.findOne({ gid: id });
      if (guild) {
        const token = accessToken.replace('Bearer ', '');
        const permissions = await utils.getGuildUserPermissions(token, guild.gid);
        if (utils.isAdmin(permissions)) {
          if (guild.webhook) {
            return res.json({
              code: 200,
              url: guild.webhook
            });
          } else {
            return res.status(404).json({
              code: 404,
              message: res.__('NO_REGISTERED_WEBHOOK')
            });
          }
        } else {
          return res.status(403).json({
            code: 403,
            message: res.__('INVALID_ENTRY')
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__('GUILD_NOT_FOUND')
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
  private async registerWebhook(req: Request, res: Response) {
    try {
      const { id, url } = req.body;
      const accessToken = req.cookies['auth._token.discord'];
      if (!id || typeof id !== 'string' || !url || typeof url !== 'string' || !accessToken || typeof accessToken !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const guild = await guildSchema.findOne({ gid: id });
      if (guild) {
        const token = accessToken.replace('Bearer ', '');
        const permissions = await utils.getGuildUserPermissions(token, guild.gid);
        if (utils.isAdmin(permissions)) {
          if (!guild.webhook) {
            if (utils.validateURL(url)) {
              await guild.updateOne({
                $set: {
                  webhook: url
                }
              });
              new webhookManager(url).test();
              return res.json({
                code: 200,
                message: res.__('WEBHOOK_REGISTERED')
              });
            } else {
              return res.status(400).json({
                code: 400,
                message: res.__('URL_FORMAT_ERROR')
              });
            }
          } else {
            return res.status(400).json({
              code: 400,
              message: res.__('WEBHOOK_ALREADY_REGISTERED')
            });
          }
        } else {
          return res.status(403).json({
            code: 403,
            message: res.__('INVALID_ENTRY')
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__('GUILD_NOT_FOUND')
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
  private async deleteWebhook(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const accessToken = req.cookies['auth._token.discord'];
      if (!id || typeof id !== 'string' || !accessToken || typeof accessToken !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const guild = await guildSchema.findOne({ gid: id });
      if (guild) {
        const token = accessToken.replace('Bearer ', '');
        const permissions = await utils.getGuildUserPermissions(token, guild.gid);
        if (utils.isAdmin(permissions)) {
          if (guild.webhook) {
            await guild.updateOne({
              $unset: {
                webhook: ''
              }
            });
            return res.json({
              code: 200,
              message: res.__('WEBHOOK_DELETED')
            });
          } else {
            return res.status(404).json({
              code: 404,
              message: res.__('NO_REGISTERED_WEBHOOK')
            });
          }
        } else {
          return res.status(403).json({
            code: 403,
            message: res.__('INVALID_ENTRY')
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__('GUILD_NOT_FOUND')
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

const router = new IRouter();
module.exports = router.router;