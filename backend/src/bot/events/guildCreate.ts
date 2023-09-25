import { Guild } from 'discord.js';
import { Webhook, MessageBuilder } from 'discord-webhook-node';
import { guildSchema } from '../../models';
import { BotEvent } from '../types';
import dayjs from 'dayjs';

const webhookURL = process.env.LOG_WEBHOOK;

const event: BotEvent = {
  name: 'guildCreate',
  async execute(guild: Guild) {
    const now = dayjs().valueOf();
    const check = await guildSchema.findOne({ id: guild.id });
    if (!check) {
      const data = new guildSchema({
        id: guild.id,
        owner: guild.ownerId,
        joinedAt: now
      });
      data.save();
    }
    try {
      if (webhookURL) {
        const hook = new Webhook(webhookURL);
        const embed = new MessageBuilder()
          .setTitle('[ + ] Invited to a new server')
          .addField('Server Name', guild.name, true)
          .addField('Server ID', guild.id, true)
          .addField('Owner ID', guild.ownerId, true)
          .addField('Member', `${guild.memberCount}`, true)
          .setTimestamp();
        hook.send(embed);
      }
    } catch (_err) { }
  }
}

export default event;