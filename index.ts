import {
  Client,
  ActivityType,
  Interaction,
  REST,
  Routes,
  User,
  GuildMember
} from "discord.js";
import { readdirSync } from "fs";
import Command from "./Command";
import Config from "./config.json";
import { processListen } from "./process";

let commands = new Array<Command>();
export let client = new Client({
    intents: ["Guilds"]
});

for (const cmd of readdirSync("./commands")) {
    if (cmd.endsWith(".ts")) {
        let data: Command = require("./commands/" + cmd).default;
        commands.push(data);
    }
}

function updateStatusCount() {
    let guilds = client.guilds.cache
    client.user.setActivity({
        type: ActivityType.Watching,
        name: `${guilds.size} servers across Equestria!`
    })
}

client.on("ready", async () => {
    console.log("EquestrianBot is now online.");
    updateStatusCount();

    const rest = new REST({version: "10"}).setToken(Config.token);
    console.log("Refreshing slash commands.");
    await rest.put(
        Routes.applicationCommands(Config.clientId),
        { body: commands.map((c: Command) => {
            return c.data;
        }) }
    );
    console.log("Successfully loaded commands.");
})

client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isRepliable()) return;
    if (interaction.isButton()) {
        interaction.deferUpdate();
        return;
    };

    let command: Command;
    if (interaction.isChatInputCommand()) {
        command = commands.find((c: Command) => {
            return c.data.name == interaction.commandName;
        })

        await command.execute(interaction);
    }


    let cmd = (command as Command);
    if (interaction.isAutocomplete()) {
        await cmd.autocomplete(interaction);
    }

    if (interaction.isModalSubmit()) {
        await cmd.modalsubmit(interaction);
    }
})

client.on("guildCreate", () => updateStatusCount());
client.on("guildDelete", () => updateStatusCount());

client.login(Config.token);
(async () => {
    processListen();
})