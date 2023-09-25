import { Router, Request, Response } from 'express';
import { captcha, mail, checkUser, utils } from '../modules';
import { guildSchema, userSchema, linkSchema } from '../../models';
import { stream } from '../modules';
import client from '../../bot';
import consola from 'consola';
import dayjs from 'dayjs';

let isDev: boolean;
if (process.env.NODE_ENV === 'production') isDev = false;
else if (process.env.NODE_ENV === 'development') isDev = true;
else isDev = false;

const resolved = ['authorize', 'dashboard']; //Resolved Names for Dashboard Routes.
const methods = ['1', '2']; //Captcha, Email
const expiresAt = ['30m', '1h', '12h', '1d', '7d', '30d', 'no_expires'];

const brand = process.env.BRAND;
const domain = process.env.FRONTEND_HOST;
const maxInvites = Number(process.env.MAX_ALLOWED_INVITES);
const expires = Number(process.env.EXPIRES);

class IRouter {
  /**
   * Routers
   */
  public readonly router: Router;
  constructor() {
    this.router = Router();
    /** Get from dashboard page */
    this.router.get('/get', this.getController);
    /** Check from invite page */
    this.router.get('/check', this.checkController);
    /** Create link */
    this.router.post('/create', checkUser, this.createController);
    this.router.post('/create/custom', checkUser, this.customCreateController);
    /** Form validition from server */
    this.router.get('/create/custom/validation', this.formValidationController);
    /** Delete link */
    this.router.delete('/delete', checkUser, this.deleteController);
    /** Auth & Participation */
    this.router.post('/authorization', checkUser, this.authorizationController);
    this.router.post('/email', checkUser, this.mailAuthController);
    /** Check link status */
    this.router.get('/email/check', checkUser, this.checkAuthController);
  }
  private async getController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const now = dayjs().valueOf();
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const links = await linkSchema.find({ gid: id });
      if (links.length) {
        let data: any[] = [];
        links.forEach((e) => {
          if (e.expiresAt > now || e.no_expires) data.push({
            auth_method: e.auth_method,
            createdAt: e.createdAt,
            expiresAt: e.expiresAt,
            gid: e.gid,
            identifier: e.identifier,
            no_expires: e.no_expires,
            number_of_uses: e.number_of_uses
          });
        });
        if (data.length) {
          return res.json({
            code: 200,
            create_limit: maxInvites,
            data: data
          });
        } else {
          return res.status(404).json({
            code: 404,
            create_limit: maxInvites,
            message: res.__('NO_REGISTERED_LINKS')
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          create_limit: maxInvites,
          message: res.__('NO_REGISTERED_LINKS')
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
  private async checkController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const now = dayjs().valueOf();
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const link = await linkSchema.find({ identifier: id });
      if (link.length) {
        let activeLink: any[] = [];
        link.forEach((e) => {
          if (e.expiresAt > now || e.no_expires) {
            activeLink.push({
              auth_method: e.auth_method,
              createdAt: e.createdAt,
              expiresAt: e.expiresAt,
              gid: e.gid,
              identifier: e.identifier,
              no_expires: e.no_expires,
              number_of_uses: e.number_of_uses
            });
          }
        });
        if (activeLink.length) {
          return res.json({
            code: 200,
            data: activeLink[activeLink.length - 1]
          });
        } else {
          return res.status(400).json({
            code: 400,
            message: res.__('LINK_EXPIRED')
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__('LINK_IDENTIFIER_NOT_FOUND')
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
  private async createController(req: Request, res: Response) {
    try {
      const { gid, role, method, expire } = req.body;
      const accessToken = req.cookies['auth._token.discord'];
      const now = dayjs().valueOf();
      if (!gid || typeof gid !== 'string' || !method || typeof method !== 'string' || !expire || typeof expire !== 'string' || !accessToken || typeof accessToken !== 'string' || !methods.includes(method) || !expiresAt.includes(expire)) {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const guild = await utils.getGuild(gid);
      if (guild) {
        const guildDB = await guildSchema.findOne({ id: guild.id });
        if (guildDB) {
          const token = accessToken.replace('Bearer ', '');
          const permissions = await utils.getGuildUserPermissions(token, gid);
          if (permissions) {
            if (utils.isAdmin(permissions)) {
              let links = [];
              const checkLinks = await linkSchema.find({ gid: guildDB.gid });
              checkLinks.forEach((e) => {
                if (e.expiresAt > now || e.no_expires) links.push(e);
              });
              if (links.length >= maxInvites) {
                return res.status(400).json({
                  code: 400,
                  message: res.__('LINK_CREATE_LIMIT', { name: String(maxInvites) })
                });
              }
              const expireTime = utils.getExpires(expire);
              let identifier = utils.genRandomString(8);
              //Check availability
              while (!utils.checkLink(identifier)) {
                identifier = utils.genRandomString(8);
              }
              const discordUser = await utils.getUser(token);
              if (role) {
                let roles: any[] = [];
                guild.roles.forEach((e: any) => {
                  if (!e.managed && e.name !== '@everyone') roles.push(e.id);
                });
                const filter = roles.find(e => e === role);
                if (filter) { //Selected role
                  const newLink = new linkSchema({
                    identifier: identifier,
                    gid: guild.id,
                    role: filter,
                    createdAt: now,
                    expiresAt: expireTime ? expireTime : 0,
                    auth_method: Number(method),
                    issuer: discordUser.id,
                    no_expires: expireTime ? false : true
                  });
                  newLink.save().then(() => {
                    return res.json({
                      code: 200,
                      message: res.__('LINK_CREATED')
                    });
                  }).catch((e) => {
                    return res.status(500).json({
                      code: 500,
                      message: e
                    });
                  });
                } else {
                  return res.status(404).json({
                    code: 404,
                    message: res.__('ROLE_NOT_FOUND')
                  });
                }
              } else { //Without selected role
                const newLink = new linkSchema({
                  identifier: identifier,
                  gid: guild.id,
                  role: null,
                  createdAt: now,
                  expiresAt: expireTime ? expireTime : 0,
                  auth_method: Number(method),
                  issuer: discordUser.id,
                  no_expires: expireTime ? false : true
                });
                newLink.save().then(() => {
                  return res.json({
                    code: 200,
                    message: res.__('LINK_CREATED')
                  });
                }).catch((e) => {
                  return res.status(500).json({
                    code: 500,
                    message: e
                  });
                });
              }
            } else {
              return res.status(403).json({
                code: 403,
                message: res.__('INVALID_ENTRY')
              });
            }
          } else {
            return res.status(500).json({
              code: 500,
              message: res.__('PERMISSION_CHECK_FAILED')
            });
          }
        } else {
          return res.status(404).json({
            code: 404,
            message: res.__('GUILD_NOT_FOUND')
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
  private async customCreateController(req: Request, res: Response) {
    try {
      const { id, gid, role, method, expire } = req.body;
      const accessToken = req.cookies['auth._token.discord'];
      const now = dayjs().valueOf();
      if (!id || typeof id !== 'string' || !gid || typeof gid !== 'string' || !method || typeof method !== 'string' || !expire || typeof expire !== 'string' || !accessToken || typeof accessToken !== 'string' || !methods.includes(method) || !expiresAt.includes(expire)) {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      if (!utils.validateLink(id)) {
        return res.status(400).json({
          code: 400,
          message: res.__('IDENTIFIER_FORMAT_ERROR')
        });
      }

      if (resolved.includes(id)) {
        return res.status(400).json({
          code: 400,
          message: res.__('SYSTEM_RESOLVED')
        });
      }

      if (expire === 'no_expires') {
        return res.status(400).json({
          code: 400,
          message: res.__('NO_EXPIRES_NOT_ALLOWED')
        });
      }

      const check = await linkSchema.findOne({ identifier: id });
      if (check) {
        if (check.no_expires || check.expiresAt > now) {
          return res.status(400).json({
            code: 400,
            message: res.__('IDENTIFIER_ALREADY_EXISTS')
          });
        }
      }

      const guild = await utils.getGuild(gid);
      if (guild) {
        const guildDB = await guildSchema.findOne({ id: guild.id });
        if (guildDB) {
          const token = accessToken.replace('Bearer ', '');
          const permissions = await utils.getGuildUserPermissions(token, gid);
          if (permissions) {
            if (utils.isAdmin(permissions)) {
              let links = [];
              const checkLinks = await linkSchema.find({ gid: guildDB.gid });
              checkLinks.forEach((e) => {
                if (e.expiresAt > now || e.no_expires) links.push(e);
              });
              if (links.length >= maxInvites) {
                return res.status(400).json({
                  code: 400,
                  message: res.__('LINK_CREATE_LIMIT', { name: String(maxInvites) })
                });
              }
              const expireTime = utils.getExpires(expire);
              if (role) {
                let roles: any[] = [];
                guild.roles.forEach((e: any) => {
                  if (!e.managed && e.name !== '@everyone') roles.push(e.id);
                });
                const filter = roles.find(e => e === role);
                if (filter) {
                  const discordUser = await utils.getUser(token);
                  const newLink = new linkSchema({
                    identifier: id,
                    gid: guild.id,
                    role: filter,
                    createdAt: now,
                    expiresAt: expireTime,
                    auth_method: Number(method),
                    issuer: discordUser.id,
                    no_expires: false
                  });
                  newLink.save().then(() => {
                    return res.json({
                      code: 200,
                      message: res.__('LINK_CREATED')
                    })
                  }).catch((e) => {
                    return res.status(500).json({
                      code: 500,
                      message: e
                    });
                  });
                } else {
                  return res.status(404).json({
                    code: 404,
                    message: res.__('ROLE_NOT_FOUND')
                  });
                }
              }
            } else {
              return res.status(403).json({
                code: 403,
                message: res.__('INVALID_ENTRY')
              });
            }
          } else {
            return res.status(500).json({
              code: 500,
              message: res.__('PERMISSION_CHECK_FAILED')
            });
          }
        } else {
          return res.status(404).json({
            code: 404,
            message: res.__('GUILD_NOT_FOUND')
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
  private async deleteController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const accessToken = req.cookies['auth._token.discord'];
      if (!id || typeof id !== 'string' || !accessToken || typeof accessToken !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const check = await linkSchema.findOne({ identifier: id });
      if (check) {
        const guild = await utils.getGuild(check.gid);
        if (guild) {
          const token = accessToken.replace('Bearer ', '');
          const permissions = await utils.getGuildUserPermissions(token, guild.id);
          if (permissions) {
            if (utils.isAdmin(permissions)) {
              await linkSchema.deleteMany({ identifier: id });
              return res.json({
                code: 200,
                message: res.__('LINK_DELETED')
              });
            } else {
              return res.status(403).json({
                code: 403,
                message: res.__('INVALID_ENTRY')
              });
            }
          } else {
            return res.status(500).json({
              code: 500,
              message: res.__('PERMISSION_CHECK_FAILED')
            });
          }
        } else {
          return res.status(404).json({
            code: 404,
            message: res.__('GUILD_NOT_FOUND')
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__('LINK_IDENTIFIER_NOT_FOUND')
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
  private async authorizationController(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const accessToken = req.cookies['auth._token.discord'];
      const now = dayjs().valueOf();
      const ip = (req.header('x-forwarded-for') ?? req.socket.remoteAddress) as string;
      if (!id || typeof id !== 'string' || !accessToken || typeof accessToken !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const token = accessToken.replace('Bearer ', '');
      const discordUser = await utils.getUser(token);
      const localuser = await userSchema.findOne({ id: discordUser.id });
      if (localuser) {
        const link = await linkSchema.findOne({ identifier: id });
        if (link) {
          if (link.expiresAt > now || link.no_expires) {
            if (link.auth_method === 1) { //Captcha
              const { g_recaptcha } = req.body;
              if (!g_recaptcha || typeof g_recaptcha !== 'string') {
                return res.status(400).json({
                  code: 400,
                  message: res.__('INVALID_REQUEST')
                });
              }
              const verify = await captcha.verify(g_recaptcha, ip);
              if (!verify) {
                return res.status(403).json({
                  code: 403,
                  message: res.__('CAPTCHA_ERROR')
                });
              }
              const invite = await utils.joinGuild(token, link.gid, discordUser.id, link.role as string);
              switch (invite) {
                case 'SUCCESS':
                  link.updateOne({
                    $set: {
                      number_of_uses: link.number_of_uses + 1
                    }
                  });
                  stream.write(`User Invited. Identifier: ${link.identifier} | Auth Method: ${link.auth_method} | Guild ID: ${link.gid} | User ID: ${discordUser.id} | Number of Uses: ${link.number_of_uses}`);
                  return res.json({
                    code: 200,
                    message: res.__('JOIN_SUCCESS')
                  });
                case 'ALREADY_INVITED':
                  return res.status(400).json({
                    code: 400,
                    message: res.__('ALREADY_INVITED')
                  });
                case 'PERMISSION_DENIED':
                  return res.status(400).json({
                    code: 403,
                    message: res.__('PERMISSION_DENIED')
                  });
                default:
                  return res.status(500).json({
                    code: 500,
                    message: res.__('UNKNOWN_ERROR')
                  });
              }
            } else if (link.auth_method === 2) { //Email
              const { email } = req.body;
              if (!email || typeof email !== 'string') {
                return res.status(400).json({
                  code: 400,
                  message: res.__('INVALID_REQUEST')
                });
              }
              if (!utils.validateMail(email)) {
                return res.status(400).json({
                  code: 400,
                  message: res.__('EMAIL_FORMAT_ERROR')
                });
              }
              const identifier = Buffer.from(`${discordUser.id}+${link.identifier}+${utils.genRandomString(32)}`).toString('base64');
              const guild = client.guilds.cache.get(link.gid);
              if (!guild) {
                return res.status(404).json({
                  code: 404,
                  message: res.__('GUILD_NOT_FOUND')
                });
              }
              const expiresIn = dayjs().add(expires, 'millisecond').valueOf();
              localuser.updateOne({
                $set: {
                  verify_key: identifier,
                  verify_expiresAt: expiresIn
                }
              }).exec();
              //TODO: Rate Limit
              if (!localuser.email_send_date) {
                localuser.updateOne({
                  $set: {
                    email_send_date: now
                  }
                }).exec();
                if (!isDev) {
                  new mail(email).sendVerifyMail({ //INFO
                    subject: res.__('EMAIL_TITLE', { guild: guild.name }),
                    verify: `${domain}/invite/authorize?identifier=${identifier}`,
                    expire: res.__('EMAIL_EXPIRES', { time: `KST ${dayjs(expiresIn).format('YYYY-MM-DD hh:mm:ss')}` }),
                    brand: brand,
                  }, { //LOCALES
                    header: res.__('EMAIL_HEAD'),
                    user: res.__('EMAIL_USER', { user: `${discordUser.global_name} (@${discordUser.username})` }),
                    desc: res.__('EMAIL_DESC'),
                    btn: res.__('EMAIL_BTN'),
                    ignore: res.__('EMAIL_IGNORE'),
                    footer: res.__('EMAIL_FOOT')
                  });
                }
              } else if ((localuser.email_send_date + 300000) < now) {
                localuser.updateOne({
                  $set: {
                    email_send_date: now
                  }
                }).exec();
                if (!isDev) {
                  new mail(email).sendVerifyMail({ //INFO
                    subject: res.__('EMAIL_TITLE', { guild: guild.name }),
                    verify: `${domain}/invite/authorize?identifier=${identifier}`,
                    expire: res.__('EMAIL_EXPIRES', { time: `KST ${dayjs(expiresIn).format('YYYY-MM-DD hh:mm:ss')}` }),
                    brand: brand,
                  }, { //LOCALES
                    header: res.__('EMAIL_HEAD'),
                    user: res.__('EMAIL_USER', { user: `${discordUser.global_name} (@${discordUser.username})` }),
                    desc: res.__('EMAIL_DESC'),
                    btn: res.__('EMAIL_BTN'),
                    ignore: res.__('EMAIL_IGNORE'),
                    footer: res.__('EMAIL_FOOT')
                  });
                }
              } else {
                const remain = dayjs((localuser.email_send_date as number + 300000) - now).minute();
                return res.status(400).json({
                  code: 400,
                  message: `이메일 인증은 약 ${remain}분 후에 다시 요청할 수 있습니다.`
                });
              }
              return res.json({
                code: 200,
                message: res.__('EMAIL_SENDED')
              });
            } else {
              return res.status(500).json({
                code: 500,
                message: res.__('UNKNOWN_AUTH_METHOD')
              });
            }
          } else {
            return res.status(400).json({
              code: 400,
              message: res.__('LINK_EXPIRED')
            });
          }
        } else {
          return res.status(404).json({
            code: 404,
            message: res.__('LINK_IDENTIFIER_NOT_FOUND')
          });
        }
      } else {
        return res.status(404).json({
          code: 404,
          message: res.__('LOCALUSER_NOT_FOUND')
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
  private async mailAuthController(req: Request, res: Response) {
    try {
      const { identifier } = req.body;
      const accessToken = req.cookies['auth._token.discord'];
      const now = dayjs().valueOf();
      if (!identifier || typeof identifier !== 'string' || !accessToken || typeof accessToken !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      /**
       * 0 - Discord User ID
       * 1 - Link Identifier
       * 2 - Random Generated
       */
      const data = Buffer.from(identifier, 'base64').toString('utf8').split('+');
      if (data && data.length === 3) {
        const localuser = await userSchema.findOne({ verify_key: identifier });
        if (localuser) {
          if (localuser.verify_expiresAt as number > now) {
            const link = await linkSchema.findOne({ identifier: data[1] });
            if (link) {
              if (link.expiresAt > now || link.no_expires) {
                const token = accessToken.replace('Bearer ', '');
                const discordUser = await utils.getUser(token);
                const invite = await utils.joinGuild(token, link.gid, discordUser.id, link.role as string);
                switch (invite) {
                  case 'SUCCESS':
                    link.updateOne({
                      $set: {
                        number_of_uses: link.number_of_uses + 1
                      }
                    });
                    localuser.updateOne({
                      $unset: {
                        verify_key: '',
                        verify_expiresAt: ''
                      }
                    }).exec();
                    stream.write(`User Invited. Identifier: ${link.identifier} | Auth Method: ${link.auth_method} | Guild ID: ${link.gid} | User ID: ${discordUser.id} | Number of Uses: ${link.number_of_uses}`);
                    return res.json({
                      code: 200,
                      message: res.__('JOIN_SUCCESS')
                    });
                  case 'ALREADY_INVITED':
                    return res.status(400).json({
                      code: 400,
                      message: res.__('ALREADY_INVITED')
                    });
                  case 'PERMISSION_DENIED':
                    return res.status(400).json({
                      code: 403,
                      message: res.__('PERMISSION_DENIED')
                    });
                  default:
                    return res.status(500).json({
                      code: 500,
                      message: res.__('UNKNOWN_ERROR')
                    });
                }
              } else {
                return res.status(400).json({
                  code: 400,
                  message: res.__('LINK_EXPIRED')
                });
              }
            } else {
              return res.status(404).json({
                code: 404,
                message: res.__('IDENTIFIER_NOT_FOUND')
              });
            }
          } else {
            return res.status(400).json({
              code: 400,
              message: res.__('LINK_EXPIRED')
            });
          }
        } else {
          return res.status(404).json({
            code: 404,
            message: res.__('LOCALUSER_NOT_FOUND')
          });
        }
      } else {
        return res.status(400).json({
          code: 400,
          message: '식별자 형식이 유효하지 않습니다.'
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
  private async checkAuthController(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const now = dayjs().valueOf();
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          code: 400,
          message: res.__('INVALID_REQUEST')
        });
      }

      const data = Buffer.from(id, 'base64').toString('utf8').split('+');
      if (data && data.length === 3) {
        const check = await userSchema.findOne({ verify_key: id });
        if (check) {
          if (check.verify_expiresAt as number > now) {
            const link = await linkSchema.findOne({ identifier: data[1] });
            if (link) {
              if (link.expiresAt > now || link.no_expires) {
                return res.json({
                  code: 200
                });
              } else {
                return res.status(400).json({
                  code: 400,
                  message: res.__('LINK_EXPIRED')
                });
              }
            } else {
              return res.status(400).json({
                code: 400,
                message: res.__('IDENTIFIER_NOT_FOUND')
              });
            }
          } else {
            return res.status(403).json({
              code: 403,
              message: res.__('LINK_EXPIRED')
            });
          }
        } else {
          return res.status(404).json({
            code: 404,
            message: res.__('IDENTIFIER_NOT_FOUND')
          });
        }
      } else {
        return res.status(400).json({
          code: 400,
          message: '식별자 형식이 유효하지 않습니다.'
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
  private async formValidationController(req: Request, res: Response) {
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

const router = new IRouter();
module.exports = router.router;