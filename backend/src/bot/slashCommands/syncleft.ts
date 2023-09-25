import { SlashCommandBuilder } from 'discord.js';
import { guildSchema } from '../../models/guild';
import { SlashCommand } from '../types';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('syncleft')
    .setDescription('길드 데이터를 봇 데이터와 일치시켜 동기화 합니다. (관리자 전용)')
  ,
  async execute(interaction) {
    try {
      if (interaction.user.id === process.env.SUPERUSER && interaction.guild) {
        let botCachedGuilds: any[] = [];
        let deleted = [];
        let left = 0;
        interaction.client.guilds.cache.forEach((e) => {
          botCachedGuilds.push(e.id);
        });
        const local = await guildSchema.find();
        for (let i = 0; i < local.length; i++) {
          const localdata = await guildSchema.findOne({ id: local[i].gid });
          if (localdata && !botCachedGuilds.includes(localdata.gid)) {
            await guildSchema.deleteOne({ gid: localdata.gid });
            deleted.push(localdata.gid);
            left++;
          }
        }
        return interaction.reply(`[ ✅ ] 동기화 완료 (DB 길드 데이터 ${local.length}개 중 ${left}개 삭제)\n=> Synced Guilds:\n${deleted.join('\n')}`);
      } else {
        return interaction.reply({
          content: '[ ❌ ] 관리 권한이 없거나, DM에서 실행하신 것 같습니다.',
          ephemeral: true
        });
      }
    } catch (err) {
      return interaction.reply({
        content: `[ ❌ ] Error: ${err}`,
        ephemeral: true
      });
    }
  },
}

export default command;