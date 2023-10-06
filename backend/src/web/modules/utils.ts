import { linkSchema } from "../../models";
import axios, { isAxiosError, ResponseType } from "axios";
import { IAddGuildMember } from "../types";
import dayjs from "dayjs";
import fs from "fs";

const botToken = process.env.BOT_TOKEN;
const emailPattern = new RegExp(/^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/);
const customLinkPattern = new RegExp(/^[a-z]+[A-z0-9]{2,41}$/);
const urlPattern = new RegExp(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

class utility {
  public async addGuildMember(param: IAddGuildMember) {
    try {
      const res = await axios.put(
        `https://discordapp.com/api/guilds/${param.guild_id}/members/${param.user_id}`,
        {
          access_token: param.token,
          roles: param.role ? [param.role] : null,
        },
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      switch (res.status) {
        case 201:
          return "SUCCESS";
        case 204:
          return "ALREADY_INVITED";
        default:
          return "UNKNOWN";
      }
    } catch (err) {
      if (isAxiosError<ResponseType, any>(err)) {
        if (err.response) {
          switch (err.response.status) {
            case 403:
              return "PERMISSION_DENIED";
            default:
              return "UNKNOWN";
          }
        }
      }
    }
  }
  public async getUser(token: string) {
    try {
      const res = await axios.get("https://discordapp.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        data: res.data,
        status: res.status,
      };
    } catch (err) {
      if (isAxiosError<ResponseType, any>(err)) {
        if (err.response) {
          return {
            data: err.response.data,
            status: err.status,
          };
        } else {
          return null;
        }
      }
    }
  }
  public async getGuild(id: string) {
    try {
      const res = await axios.get(`https://discordapp.com/api/guilds/${id}`, {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      });
      return {
        data: res.data,
        status: res.status,
      };
    } catch (err) {
      if (isAxiosError<ResponseType, any>(err)) {
        if (err.response) {
          return {
            data: err.response.data,
            status: err.status,
          };
        } else {
          return null;
        }
      }
    }
  }
  /**
   * @deprecated Server => Client
   */
  public async getGuildsByUser(token: string) {
    try {
      const res = await axios.get(`https://discord.com/api/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      return null;
    }
  }
  public async getGuildUserPermissions(token: string, id: string) {
    try {
      const res = await axios.get(`https://discord.com/api/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const filter = res.data.find((e: any) => e.id === id);
      return filter.permissions;
    } catch (err) {
      return false;
    }
  }
  public isAdmin(permission: number) {
    return (permission % 16) - 8 >= 0;
  }
  public validateMail(address: string): boolean {
    return "string" === typeof address && emailPattern.test(address);
  }
  public validateLink(link: string): boolean {
    return "string" === typeof link && customLinkPattern.test(link);
  }
  public genRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  public validateURL(url: string) {
    return "string" === typeof url && urlPattern.test(url);
  }
  public genRandomString(len: number): string {
    let result = "";
    for (let i = 0; i < len; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  public getExpires(expires: string) {
    let now = dayjs().valueOf();
    switch (expires) {
      case "30m":
        return now + 1800000;
      case "1h":
        return now + 3600000;
      case "12h":
        return now + 43200000;
      case "1d":
        return now + 86400000;
      case "7d":
        return now + 604800000;
      case "30d":
        return now + 2592000000;
      default:
        return null;
    }
  }
  public async checkLink(id: string) {
    try {
      const check = await linkSchema.find({ identifier: id });
      if (check.length) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return null;
    }
  }
  public readHTML(path: string, callback: any): any {
    fs.readFile(path, "utf-8", function (err, html) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, html);
      }
    });
  }
}

export const utils = new utility();
