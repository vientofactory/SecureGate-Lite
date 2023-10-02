import { SlashCommandBuilder } from "discord.js";
import { guildSchema, linkSchema } from "../../models";
import { SlashCommand } from "../types";
import dayjs from "dayjs";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("stats").setDescription("봇의 통계를 봅니다."),
  async execute(interaction) {
    try {
      let now = dayjs().valueOf();
      let guildCount = interaction.client.guilds.cache.size;
      let users = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      let guildDBCount = (await guildSchema.find()).length;
      let links = await linkSchema.find();
      let activeLinks = 0;
      links.forEach((e) => {
        if (e.expiresAt > now || e.no_expires) activeLinks++;
      });
      let messages = [
        `> **[ 📈통계 ]**`,
        `> 전체 길드: ${guildCount}개`,
        `> 전체 유저: ${users}명`,
        `> DB에 등록된 길드: ${guildDBCount}개`,
        `> 전체 링크 데이터: ${links.length}개`,
        `> 활성 링크: ${activeLinks}개`,
      ];
      return interaction.reply(messages.join("\n"));
    } catch (err) {
      return interaction.reply({
        content: `[ ❌ ] Error: ${err}`,
        ephemeral: true,
      });
    }
  },
};

export default command;
