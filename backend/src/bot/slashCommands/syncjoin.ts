import { SlashCommandBuilder } from "discord.js";
import { guildSchema } from "../../models";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("syncjoin").setDescription("길드 데이터를 봇 데이터와 일치시켜 동기화 합니다. (관리자 전용)"),
  async execute(interaction) {
    try {
      if (interaction.user.id === process.env.SUPERUSER && interaction.guild) {
        let botCachedGuilds: any[] = [];
        let newGuilds = [];
        let join = 0;
        interaction.client.guilds.cache.forEach((e) => {
          botCachedGuilds.push(e.id);
        });
        for (let i = 0; i < botCachedGuilds.length; i++) {
          const localdata = await guildSchema.findOne({ gid: botCachedGuilds[i] });
          if (!localdata) {
            newGuilds.push(botCachedGuilds[i]);
            const data = new guildSchema({
              gid: botCachedGuilds[i],
              owner: interaction.client.guilds.cache.get(botCachedGuilds[i])?.ownerId,
              joinedAt: new Date().getTime(),
            });
            data.save();
            join++;
          }
        }
        return interaction.reply(
          `[ ✅ ] 동기화 완료 (전체 길드 ${botCachedGuilds.length}개 중 ${join}개 신규 등록)\n=> Synced Guilds:\n${newGuilds.join("\n")}`
        );
      } else {
        return interaction.reply({
          content: "[ ❌ ] 관리 권한이 없거나, DM에서 실행하신 것 같습니다.",
          ephemeral: true,
        });
      }
    } catch (err) {
      return interaction.reply({
        content: `[ ❌ ] Error: ${err}`,
        ephemeral: true,
      });
    }
  },
};

export default command;
