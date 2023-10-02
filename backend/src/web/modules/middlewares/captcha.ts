import axios from "axios";
import consola from "consola";

let isDev: boolean;
if (process.env.NODE_ENV === "production") isDev = false;
if (process.env.NODE_ENV === "development") isDev = true;

const secretKey = process.env.RECAPTCHA_SECRET;

class recaptcha {
  public async verify(token: string, ip: string): Promise<boolean> {
    return axios
      .get(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}&remoteip=${ip}`)
      .then((response) => {
        if (!response.data.success) {
          return false;
        }
        return true;
      })
      .catch((err) => {
        consola.error(err);
        return false;
      });
  }
}

export const captcha = new recaptcha();
