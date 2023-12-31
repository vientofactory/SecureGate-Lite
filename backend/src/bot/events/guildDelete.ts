import { Guild } from "discord.js";
import { Webhook, MessageBuilder } from "discord-webhook-node";
import { guildSchema, linkSchema } from "../../models";
import { BotEvent } from "../types";

const webhookURL = process.env.LOG_WEBHOOK;

const event: BotEvent = {
  name: "guildDelete",
  async execute(guild: Guild) {
    const checkGuild = await guildSchema.findOne({ gid: guild.id });
    const checkLinks = await linkSchema.find({ gid: guild.id });
    if (checkGuild) {
      guildSchema.deleteOne({ gid: guild.id }).exec();
      if (checkLinks.length) {
        linkSchema.deleteMany({ gid: guild.id }).exec();
      }
    }
    try {
      if (webhookURL) {
        const hook = new Webhook(webhookURL);
        const embed = new MessageBuilder()
          .setTitle("[ + ] Kicked from server")
          .addField("Server Name", guild.name, true)
          .addField("Server ID", guild.id, true)
          .addField("Owner ID", guild.ownerId, true)
          .addField("Member", `${guild.memberCount}`, true)
          .setTimestamp();
        hook.send(embed);
      }
    } catch (_err) {}
  },
};

export default event;
