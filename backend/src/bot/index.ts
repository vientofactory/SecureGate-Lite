import { readdirSync } from "fs";
import { join } from "path";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import { SlashCommand } from "./types";
import consola from "consola";
const { Guilds, GuildMembers, GuildPresences } = GatewayIntentBits;

let isDev: boolean;
if (process.env.NODE_ENV === "production") isDev = false;
else if (process.env.NODE_ENV === "development") isDev = true;
else isDev = false;

const client = new Client({
  intents: [Guilds, GuildMembers, GuildPresences],
});

client.slashCommands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, "./handlers");
readdirSync(handlersDir).forEach((handler) => {
  if (isDev) {
    if (handler.endsWith(".ts")) {
      try {
        require(`${handlersDir}/${handler}`)(client);
      } catch (e) {
        consola.error(e);
      }
    }
  } else {
    if (handler.endsWith(".js")) {
      try {
        require(`${handlersDir}/${handler}`)(client);
      } catch (e) {
        consola.error(e);
      }
    }
  }
});

client.login(process.env.BOT_TOKEN).catch((e) => {
  consola.error(e);
});

export default client;
