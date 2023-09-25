import { Client } from "discord.js";
import { Webhook, MessageBuilder } from 'discord-webhook-node';
import { BotEvent } from "../types";
import consola from "consola";

let isDev: boolean;
if (process.env.NODE_ENV === 'production') isDev = false;
else if (process.env.NODE_ENV === 'development') isDev = true;
else isDev = false;

const webhookURL = process.env.LOG_WEBHOOK;

const event: BotEvent = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    const guilds = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    consola.ready({
      message: `Logged in as ${client.user?.tag}`,
      badge: true
    });
    consola.info(`In ${client.guilds.cache.size} guilds, ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users.`);
    if (!isDev) {
      try {
        if (webhookURL) {
          const hook = new Webhook(webhookURL);
          const embed = new MessageBuilder()
            .setTitle('[ ✔ ] Bot Ready!')
            .addField('Servers', `${guilds}`, true)
            .addField('Users', `${users}`, true)
            .addField('PID', `${process.pid}`, true)
            .addField('Logged in as', `${client.user?.tag}`, true)
            .setTimestamp();
          hook.send(embed);
        }
      } catch (_err) { }
    }
  }
}

export default event;