import { Interaction } from "discord.js";
import { BotEvent } from "../types";
import consola from "consola";

const event: BotEvent = {
  name: "interactionCreate",
  execute: (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      let command = interaction.client.slashCommands.get(interaction.commandName);
      let cooldown = interaction.client.cooldowns.get(`${interaction.commandName}-${interaction.user.username}`);
      if (!command) return;
      if (command.cooldown && cooldown) {
        if (Date.now() < cooldown) {
          return interaction.reply({
            content: `${Math.floor(Math.abs(Date.now() - cooldown) / 1000)}초 후에 다시 시도해 주세요.`,
            ephemeral: true,
          });
        }
        interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000);
        setTimeout(() => {
          interaction.client.cooldowns.delete(`${interaction.commandName}-${interaction.user.username}`);
        }, command.cooldown * 1000);
      } else if (command.cooldown && !cooldown) {
        interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000);
      }
      command.execute(interaction);
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.slashCommands.get(interaction.commandName);
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }
      try {
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      } catch (e) {
        consola.error(e);
      }
    }
  },
};

export default event;
