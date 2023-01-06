import { Interaction, MessageCreateOptions } from "discord.js";
export async function sendDm(interaction: Interaction, msg: MessageCreateOptions) {
    if (!interaction.isRepliable()) return;
    let dmChannel = await interaction.user.createDM(true);

    function cannotDmResponse() {
        return {
            content: "Sorry, but I cannot DM you as your DMs seem to be private",
            files: [
                {
                    attachment: "./assets/enabling_dms_1.png",
                    name: "1"
                },
                {
                    attachment: "./assets/enabling_dms_2.png",
                    name: "2"
                }
            ],
            ephemeral: true
        }
    }

    dmChannel.send(msg).catch(() => {
        let response = cannotDmResponse();
        if (interaction.replied) {
            interaction.followUp(response);
            return
        }
        interaction.reply(response);
        return;
    });
}