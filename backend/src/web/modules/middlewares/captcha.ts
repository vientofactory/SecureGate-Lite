import axios from "axios";
import consola from "consola";
import { ICaptchaResponse } from "../../types";

const secretKey = process.env.RECAPTCHA_SECRET;

class recaptcha {
  public async verify(token: string, ip: string) {
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);
    params.append("remoteip", ip);
    return axios
      .get("https://www.google.com/recaptcha/api/siteverify", { params })
      .then((res: ICaptchaResponse) => {
        return {
          success: res.data.success,
          challenge_ts: res.data.challenge_ts,
        };
      })
      .catch((err) => {
        consola.error(err);
        return null;
      });
  }
}

export const captcha = new recaptcha();
