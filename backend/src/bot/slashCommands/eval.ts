import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

const command = {
  command: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Evaluate script from bot.")
    .addStringOption((option) => option.setName("script").setDescription("Script to be executed.")),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.user.id === process.env.SUPERUSER && interaction.guild) {
      const script = interaction.options.getString("script");
      if (script) {
        try {
          const toEval = script.replace("client", "interaction.client");
          const evaled = eval(toEval);
          return interaction.reply(`**[ Eval Result ]**\n${evaled}`);
        } catch (err) {
          return interaction.reply(`[ ❌ ] ${err}`);
        }
      } else {
        return interaction.reply({
          content: "[ ❌ ] 실행할 스크립트를 입력하세요.",
          ephemeral: true,
        });
      }
    } else {
      return interaction.reply({
        content: "[ ❌ ] 관리 권한이 없거나, DM에서 실행하신 것 같습니다.",
        ephemeral: true,
      });
    }
  },
};

export default command;
