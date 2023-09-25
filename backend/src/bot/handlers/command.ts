import 'dotenv/config'
import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest"
import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "../types";
import consola from "consola";

let isDev: boolean;
if (process.env.NODE_ENV === 'production') isDev = false;
else if (process.env.NODE_ENV === 'development') isDev = true;
else isDev = false;

module.exports = (client: Client) => {
  const slashCommands: SlashCommandBuilder[] = [];

  let slashCommandsDir = join(__dirname, "../slashCommands");

  readdirSync(slashCommandsDir).forEach(file => {
    if (isDev) {
      if (file.endsWith('.ts')) {
        let command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
        slashCommands.push(command.command);
        client.slashCommands.set(command.command.name, command);
      }
    } else {
      if (file.endsWith('.js')) {
        let command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
        slashCommands.push(command.command);
        client.slashCommands.set(command.command.name, command);
      }
    }
  });

  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: slashCommands.map(command => command.toJSON())
  }).then((data: any) => {
    consola.success(`Successfully loaded ${data.length} slash command(s)`);
  }).catch(e => {
    consola.error(e);
  });
}