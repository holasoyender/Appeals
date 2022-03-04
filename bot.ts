import {
    ButtonInteraction,
    Client, Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed
} from "discord.js"
import Appeal from "./database/Appeal";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import commands from "./commands";
import Blocked from "./database/Blocked";
import mongoose from "mongoose";
import config from "./config";

const client = new Client({
    intents: ["GUILDS", "GUILD_BANS", "DIRECT_MESSAGES"]
})

const _commands = [];

for (const command of commands) {
    _commands.push(command.toJSON());
}

// @ts-ignore
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Cargando todos los comandos... (/)');

        // @ts-ignore
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Todos los comandos han sido recargados! (/)');
    } catch (error) {
        console.error(error);
    }
})();

client.on("ready", () => {
    // @ts-ignore
    client.user?.setPresence({ status: 'invisible', activities: [{ name: config.bot_status.message, type: config.bot_status.type }] });
    console.log(`Bot iniciado como ${client.user?.username}!`)
});

client.on("interactionCreate", async (interaction) => {

    //@ts-ignore
    if (!interaction.member.roles.cache.find(r => r.id === process.env.ROL_MODERADOR)) return interaction.reply({
        content: ":no_entry_sign:  No tienes permisos para realizar esta acción!",
        ephemeral: true
    })

    if (interaction.isButton()) {

        let args = interaction.customId.split("-")

        if (args[0] !== "btn") return
        if (args[1] === "yes") return await voteYes(args[2], interaction)
        if (args[1] === "no") return await voteNo(args[2], interaction)

        if (args[1] === "end") {

            if (!process.env.ADMINISTRADORES?.split(",").includes(interaction.user.id)) return interaction.reply({
                content: `:no_entry_sign:  No puedes terminar esta votación.`,
                ephemeral: true
            });

            let AppealID = args[2]

            let _Appeal: any = await Appeal.findOne({ AppealID })
            if (!_Appeal) return interaction.reply({
                content: ":no_entry_sign:  Esta petición de apelación no existe!",
                ephemeral: true
            })

            if (_Appeal.ClickersYes.length > _Appeal.ClickersNo.length) return unbanUser(interaction)
            if (_Appeal.ClickersNo.length > _Appeal.ClickersYes.length) return banUser(interaction)
            if (_Appeal.ClickersYes.length == _Appeal.ClickersNo.length) return unbanUser(interaction)

        }
    }

    if (interaction.isCommand()) {

        switch (interaction.commandName) {

            case "appeal":

                let voto = interaction.options.data.find(cmd => cmd.name == "voto");
                let id = interaction.options.data.find(cmd => cmd.name == "id")

                if (voto?.value == "ban") {

                    let _Appeal: any = await Appeal.findOne({ AppealID: id?.value, Unbanned: false })
                    if (!_Appeal) return interaction.reply({
                        content: ":no_entry_sign:  Esta petición de apelación no existe!",
                        ephemeral: true
                    })

                    if (_Appeal.ClickersNo.includes(interaction.user.id)) return interaction.reply({
                        content: `:no_entry_sign:  Ya has votado **banear** al usuario <@!${_Appeal.UserID}>.`,
                        ephemeral: true
                    });

                    if (_Appeal.ClickersYes.includes(interaction.user.id)) {
                        _Appeal.ClickersYes = _Appeal.ClickersYes.filter((item: any) => item !== interaction.user.id)
                    }
                    await interaction.reply({
                        content: `✅  Has votado **banear** al usuario <@!${_Appeal.UserID}>.`,
                        ephemeral: true
                    });
                    _Appeal.ClickersNo.push(interaction.user.id)
                    _Appeal.save();

                    let all = _Appeal.ClickersYes.length + _Appeal.ClickersNo.length
                    let yesVotes = Math.round(_Appeal.ClickersYes.length / all * 10)
                    let noVotes = Math.round(_Appeal.ClickersNo.length / all * 10)

                    let string;
                    if (yesVotes === 10) string = config.emojis.green_left + config.emojis.green_center.repeat(yesVotes) + config.emojis.green_right
                    if (noVotes === 10) string = config.emojis.red_left + config.emojis.red_center.repeat(noVotes) + config.emojis.red_right

                    if (!string)
                        string = config.emojis.green_left + config.emojis.green_center.repeat(yesVotes) + config.emojis.red_center.repeat(noVotes) + config.emojis.red_right

                    // @ts-ignore
                    let channel = interaction.guild?.channels.cache.get(process.env.CHANNEL_ID)
                    if (!channel) return interaction.reply({
                        content: ":no_entry_sign:  Esta petición de apelación no existe!",
                        ephemeral: true
                    })

                    let msg: any = undefined;
                    try {
                        // @ts-ignore
                        msg = await channel.messages.fetch(_Appeal.MessageID);
                    } catch (e) {
                        return interaction.reply({
                            content: ":no_entry_sign:  Esta petición de apelación no existe!",
                            ephemeral: true
                        });
                    }
                    if (!msg) return interaction.reply({
                        content: ":no_entry_sign:  Esta petición de apelación no existe!",
                        ephemeral: true
                    });

                    let embed = msg.embeds[0]
                    embed.setDescription(`Progreso de la votación:\n\n \`[${_Appeal.ClickersYes.length}/${all}]\` ${string} \`[${_Appeal.ClickersNo.length}/${all}]\`\n`)
                    msg.edit({ embeds: [embed] })

                }
                if (voto?.value == "unban") {

                    let _Appeal: any = await Appeal.findOne({ AppealID: id?.value, Unbanned: false })
                    if (!_Appeal) return interaction.reply({
                        content: ":no_entry_sign:  Esta petición de apelación no existe!",
                        ephemeral: true
                    })

                    if (_Appeal.ClickersYes.includes(interaction.user.id)) return interaction.reply({
                        content: `:no_entry_sign:  Ya has votado **desbanear** al usuario <@!${_Appeal.UserID}>.`,
                        ephemeral: true
                    });

                    if (_Appeal.ClickersNo.includes(interaction.user.id)) {
                        _Appeal.ClickersNo = _Appeal.ClickersNo.filter((item: any) => item !== interaction.user.id)
                    }

                    await interaction.reply({
                        content: `✅  Has votado **desbanear** al usuario <@!${_Appeal.UserID}>.`,
                        ephemeral: true
                    });
                    _Appeal.ClickersYes.push(interaction.user.id)
                    _Appeal.save();

                    let all = _Appeal.ClickersYes.length + _Appeal.ClickersNo.length
                    let yesVotes = Math.round(_Appeal.ClickersYes.length / all * 10)
                    let noVotes = Math.round(_Appeal.ClickersNo.length / all * 10)

                    let string;
                    if (yesVotes === 10) string = config.emojis.green_left + config.emojis.green_center.repeat(yesVotes) + config.emojis.green_right
                    if (noVotes === 10) string = config.emojis.red_left + config.emojis.red_center.repeat(noVotes) + config.emojis.red_right

                    if (!string)
                        string = config.emojis.green_left + config.emojis.green_center.repeat(yesVotes) + config.emojis.red_center.repeat(noVotes) + config.emojis.red_right

                    // @ts-ignore
                    let channel = interaction.guild?.channels.cache.get(process.env.CHANNEL_ID)
                    if (!channel) return interaction.reply({
                        content: ":no_entry_sign:  Esta petición de apelación no existe!",
                        ephemeral: true
                    })

                    let msg: any = undefined;
                    try {
                        // @ts-ignore
                        msg = await channel.messages.fetch(_Appeal.MessageID);
                    } catch (e) {
                        return interaction.reply({
                            content: ":no_entry_sign:  Esta petición de apelación no existe!",
                            ephemeral: true
                        });
                    }
                    if (!msg) return interaction.reply({
                        content: ":no_entry_sign:  Esta petición de apelación no existe!",
                        ephemeral: true
                    });

                    let embed = msg.embeds[0]
                    embed.setDescription(`Progreso de la votación:\n\n \`[${_Appeal.ClickersYes.length}/${all}]\` ${string} \`[${_Appeal.ClickersNo.length}/${all}]\`\n`)
                    msg.edit({ embeds: [embed] })

                }
                break;

            case "block":

                if (!interaction.options.data[0]) return interaction.reply({
                    content: ":no_entry_sign:  Ese usuario no existe",
                    ephemeral: true
                });

                Blocked.findOne({
                    ID: interaction.options.data[0].user?.id
                }, (err: any, res: any) => {
                    if (err || res) return interaction.reply({
                        content: ":no_entry_sign:  Ese usuario ya está bloqueado",
                        ephemeral: true
                    });

                    new Blocked({
                        _id: new mongoose.Types.ObjectId(),
                        ID: interaction.options.data[0].user?.id
                    }).save().then(() => {
                        return interaction.reply({
                            content: `✅  El usuario **${interaction.options.data[0].user?.tag}** ha sido bloqueado.`,
                        }).catch(e => {
                            console.log(e)
                            return interaction.reply({
                                content: ":no_entry_sign:  Ha ocurrido un error!",
                                ephemeral: true
                            });
                        });
                    })
                })
                break;

            case "unblock":

                if (!interaction.options.data[0]) return interaction.reply({
                    content: ":no_entry_sign:  Ese usuario no existe",
                    ephemeral: true
                });

                Blocked.findOne({
                    ID: interaction.options.data[0].user?.id
                }, (err: any, res: any) => {
                    if (err || !res) return interaction.reply({
                        content: ":no_entry_sign:  Ese usuario no está bloqueado",
                        ephemeral: true
                    });

                    res.delete();
                    return interaction.reply({
                        content: `✅  El usuario **${interaction.options.data[0].user?.tag}** ha sido desbloqueado.`,
                    })
                })
                break;
        }
    }

})

export async function checkBans(userId: any) {
    // @ts-ignore
    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return false
    try {
        let ban = await guild.bans.fetch({ user: userId })
        return !!ban;
    } catch (e) {
        //console.log("No tengo permisos para ver los bans del servidor!")
        //console.log(e)
        return false
    }
}

export async function getBanByUserID(userId: any) {
    // @ts-ignore
    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return false
    try {
        let ban = await guild.bans.fetch({ user: userId })
        return ban || false
    } catch (e) {
        //console.log("No tengo permisos para ver los bans del servidor!")
        return false
    }
}

export async function sendAppealEmbed(user: any, _appeal: any) {

    // @ts-ignore
    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return false
    // @ts-ignore
    let channel = guild.channels.cache.get(process.env.CHANNEL_ID)
    if (!channel || channel.type !== "GUILD_TEXT") return false;

    let ban = guild.bans.cache.get(user.ID)
    if (!ban) return false;

    let reason = ban.reason || "Sin razón"
    if (!reason) return false;

    let appeal = await _appeal
    if (!appeal) return false;

    let mod = reason.split(" Baneado por: ")[1]
    if (!mod) {
        mod = "Sin moderador"
    } else {
        reason = reason.split(" Baneado por: ")[0] || "Sin razón"
    }
    let progress = config.emojis.grey_center.repeat(10)

    let avatar;
    if (user.Avatar !== "https://cdn.discordapp.com/embed/avatars/0.png")
        avatar = `https://cdn.discordapp.com/avatars/${user.ID}/${user.Avatar}.webp`
    else
        avatar = "https://cdn.discordapp.com/embed/avatars/0.png"

    let embed = new MessageEmbed()
        .setColor("#2cfff7")
        .setAuthor({ name: "¡ Nueva apelación recibida !", iconURL: config.img.main_icon, url: config.links.website})
        .setThumbnail(avatar)
        .addField("Información del usuario:", `- Usuario: <@!${user.ID}>\n- Nombre: \`${user.Tag}\`\n- ID: \`${user.ID}\`\n\n- ID del caso: \`${appeal.AppealID}\`\n- Razón del baneo: \`${reason}\`\n- Moderador: \`${mod}\``, false)
        .addField("¿Por qué has sido baneado?", appeal.banReason, false)
        .addField("¿Por qué crees que deberíamos levantarte el ban?", appeal.appealText, false)
        .addField("¿Qué harás para evitar ser baneado en el futuro?", appeal.futureActions, false)

        .setDescription(`Progreso de la votación:\n\n \`[0/0]\`${config.emojis.grey_left}${progress}${config.emojis.grey_right} \`[0/0]\`\n`)

    let voteYesButton = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Desbanear")
        .setEmoji(config.emojis.unban)
        .setCustomId(`btn-yes-${appeal.AppealID}`)

    let voteNoButton = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Banear")
        .setEmoji(config.emojis.ban)
        .setCustomId(`btn-no-${appeal.AppealID}`)

    let endButton = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Terminar votación")
        .setCustomId(`btn-end-${appeal.AppealID}`)
    try {
        //@ts-ignore
        let msg = await channel.send({
            embeds: [embed],
            components: [new MessageActionRow().addComponents(voteYesButton, voteNoButton, endButton)]
        })

        let user: any = await Appeal.findOne(
            {
                AppealID: appeal.AppealID
            });

        if (!user) return false;
        user.MessageID = msg.id;
        user.save();
        return true;
    } catch (e) {
        console.log("No se ha podido mandar el mensaje: " + e)
        return false
    }
}
export function start() {
    client.login(process.env.BOT_TOKEN).catch()
}
async function voteYes(AppealID: any, interaction: ButtonInteraction) {

    let _Appeal: any = await Appeal.findOne({ AppealID })
    if (!_Appeal) return interaction.reply({
        content: ":no_entry_sign:  Esta petición de apelación no existe!",
        ephemeral: true
    })

    if (_Appeal.ClickersYes.includes(interaction.user.id)) return interaction.reply({
        content: `:no_entry_sign:  Ya has votado **desbanear** al usuario <@!${_Appeal.UserID}>.`,
        ephemeral: true
    });

    if (_Appeal.ClickersNo.includes(interaction.user.id)) {
        _Appeal.ClickersNo = _Appeal.ClickersNo.filter((item: any) => item !== interaction.user.id)
    }

    await interaction.reply({
        content: `✅  Has votado **desbanear** al usuario <@!${_Appeal.UserID}>.`,
        ephemeral: true
    });
    _Appeal.ClickersYes.push(interaction.user.id)
    _Appeal.save();

    let all = _Appeal.ClickersYes.length + _Appeal.ClickersNo.length
    let yesVotes = Math.round(_Appeal.ClickersYes.length / all * 10)
    let noVotes = Math.round(_Appeal.ClickersNo.length / all * 10)

    let string;
    if (yesVotes === 10) string = config.emojis.green_left + config.emojis.green_center.repeat(yesVotes) + config.emojis.green_right
    if (noVotes === 10) string = config.emojis.red_left + config.emojis.red_center.repeat(noVotes) + config.emojis.red_right

    if (!string)
        string = config.emojis.green_left + config.emojis.green_center.repeat(yesVotes) + config.emojis.red_center.repeat(noVotes) + config.emojis.red_right

    let embed = interaction.message.embeds[0]
    //@ts-ignore
    embed.setDescription(`Progreso de la votación:\n\n \`[${_Appeal.ClickersYes.length}/${all}]\` ${string} \`[${_Appeal.ClickersNo.length}/${all}]\`\n`)
    //@ts-ignore
    interaction.message.edit({ embeds: [embed] })

    if(config.argument_vote) {
        try {
            await interaction.user.send({content: `Hola :wave: <@!${interaction.user.id}>\nHas votado **desbaneaar** en la apelación de <@!${_Appeal.UserID}>. ¿Puedes argumentar tu voto?\n\`Puedes esperar 5 minutos o decir no para no argumentar\``})
        } catch (e) {
            let Embed = new MessageEmbed()
                .setColor("#57F287")
                .setAuthor({ name: `Voto a favor de ${interaction.user.tag}`, iconURL: `${interaction.user.avatarURL()}`})
                .setDescription(`Apelación de: <@!${_Appeal.UserID}> (${_Appeal.UserID}) con id: [${_Appeal.AppealID}](https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}/${_Appeal.MessageID})`)
            //@ts-ignore
            return interaction.guild?.channels.cache.get(process.env.ARGUMENT_CHANNEL_ID).send({embeds: [Embed]}).catch(() => {
            })

        }
        const filter = (m: any) => m.content !== "";
        const collector = interaction.user.dmChannel?.createMessageCollector({filter: filter, max: 1, time: 300000})

        collector?.on("collect", (msg: Message) => {
            if(msg.author.bot) return;
            msg.react("✅")
            if (msg.content.toLowerCase() == "no") return collector?.stop("no")
            return collector?.stop(msg.content)
        })
        collector?.on("end", (collected: any, reason: any) => {
            let Embed = new MessageEmbed()
                .setColor("#57F287")
                .setAuthor({ name: `Voto a favor de ${interaction.user.tag}`, iconURL: `${interaction.user.avatarURL()}`})
                .setDescription(`Apelación de: <@!${_Appeal.UserID}> (${_Appeal.UserID}) con id: [${_Appeal.AppealID}](https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}/${_Appeal.MessageID})`)

            if (reason == "no" || reason == "time") //@ts-ignore
                return interaction.guild?.channels.cache.get(process.env.ARGUMENT_CHANNEL_ID).send({embeds: [Embed]})

            Embed.addField("Argumentación: ", reason)
            //@ts-ignore
            interaction.guild?.channels.cache.get(process.env.ARGUMENT_CHANNEL_ID).send({embeds: [Embed]})
        })
    }
}
async function voteNo(AppealID: any, interaction: ButtonInteraction) {

    let _Appeal: any = await Appeal.findOne({ AppealID })
    if (!_Appeal) return interaction.reply({
        content: ":no_entry_sign:  Esta petición de apelación no existe!",
        ephemeral: true
    })

    if (_Appeal.ClickersNo.includes(interaction.user.id)) return interaction.reply({
        content: `:no_entry_sign:  Ya has votado **banear** al usuario <@!${_Appeal.UserID}>.`,
        ephemeral: true
    });

    if (_Appeal.ClickersYes.includes(interaction.user.id)) {
        _Appeal.ClickersYes = _Appeal.ClickersYes.filter((item: any) => item !== interaction.user.id)
    }
    await interaction.reply({
        content: `✅  Has votado **banear** al usuario <@!${_Appeal.UserID}>.`,
        ephemeral: true
    });
    _Appeal.ClickersNo.push(interaction.user.id)
    _Appeal.save();

    let all = _Appeal.ClickersYes.length + _Appeal.ClickersNo.length
    let yesVotes = Math.round(_Appeal.ClickersYes.length / all * 10)
    let noVotes = Math.round(_Appeal.ClickersNo.length / all * 10)

    let string;
    if (yesVotes === 10) string = config.emojis.green_left + config.emojis.green_center.repeat(yesVotes) + config.emojis.green_right
    if (noVotes === 10) string = config.emojis.red_left + config.emojis.red_center.repeat(noVotes) + config.emojis.red_right

    if (!string)
        string = config.emojis.green_left + config.emojis.green_center.repeat(yesVotes) + config.emojis.red_center.repeat(noVotes) + config.emojis.red_right

    let embed = interaction.message.embeds[0]
    //@ts-ignore
    embed.setDescription(`Progreso de la votación:\n\n \`[${_Appeal.ClickersYes.length}/${all}]\` ${string} \`[${_Appeal.ClickersNo.length}/${all}]\`\n`)
    //@ts-ignore
    interaction.message.edit({ embeds: [embed] })

    if(config.argument_vote) {
        try {
            await interaction.user.send({content: `Hola :wave: <@!${interaction.user.id}>\nHas votado **banear** en la apelación de <@!${_Appeal.UserID}>. ¿Puedes argumentar tu voto?\n\`Puedes esperar 5 minutos o decir no para no argumentar\``})
        } catch (e) {
            let Embed = new MessageEmbed()
                .setColor("#ED4245")
                .setAuthor({ name: `Voto en contra de ${interaction.user.tag}`, iconURL: `${interaction.user.avatarURL()}`})
                .setDescription(`Apelación de: <@!${_Appeal.UserID}> (${_Appeal.UserID}) con id: [${_Appeal.AppealID}](https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}/${_Appeal.MessageID})`)
            //@ts-ignore
            return interaction.guild?.channels.cache.get(process.env.ARGUMENT_CHANNEL_ID).send({embeds: [Embed]}).catch(() => {
            })
        }
        const filter = (m: any) => m.content !== "";
        const collector = interaction.user.dmChannel?.createMessageCollector({filter: filter, max: 1, time: 300000})

        collector?.on("collect", (msg: Message) => {
            if(msg.author.bot) return;
            msg.react("✅")
            if (msg.content.toLowerCase() == "no") return collector?.stop("no")
            return collector?.stop(msg.content)
        })
        collector?.on("end", (collected: any, reason: any) => {
            let Embed = new MessageEmbed()
                .setColor("#ED4245")
                .setAuthor({ name: `Voto en contra de ${interaction.user.tag}`, iconURL:  `${interaction.user.avatarURL()}` })
                .setDescription(`Apelación de: <@!${_Appeal.UserID}> (${_Appeal.UserID}) con id: [${_Appeal.AppealID}](https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}/${_Appeal.MessageID})`)

            if (reason == "no" || reason == "time") //@ts-ignore
                return interaction.guild?.channels.cache.get(process.env.ARGUMENT_CHANNEL_ID).send({embeds: [Embed]})

            Embed.addField("Argumentación: ", reason)
            //@ts-ignore
            interaction.guild?.channels.cache.get(process.env.ARGUMENT_CHANNEL_ID).send({embeds: [Embed]})
        })
    }
}
function unbanUser(interaction: ButtonInteraction) {

    let args = interaction.customId.split("-")
    // @ts-ignore
    let channel = interaction.guild?.channels.cache.get(process.env.CHANNEL_ID)
    if (!channel || channel.type !== "GUILD_TEXT") return;

    Appeal.findOne({ AppealID: args[2], Unbanned: false }, (err: any, res: any) => {
        if (!res) return interaction.reply({
            content: ":no_entry_sign:  Esta votación ya ha acabado!",
            ephemeral: true
        })

        res.Unbanned = true;
        res.save();

        let _voteYesButton = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel("Desbanear")
            .setEmoji(config.emojis.unban)
            .setDisabled(true)
            .setCustomId(`btn-yes-${res.AppealID}`)

        let _voteNoButton = new MessageButton()
            .setStyle("DANGER")
            .setLabel("Banear")
            .setEmoji(config.emojis.ban)
            .setDisabled(true)
            .setCustomId(`btn-no-${res.AppealID}`)

        let _endButton = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel("Votación finalizada")
            .setDisabled(true)
            .setCustomId(`btn-end-${res.AppealID}`)

        let embed = interaction.message.embeds[0]
        //@ts-ignore
        embed.setColor("#57F287").setAuthor({ name: "Usuario desbaneado", iconURL: config.img.main_icon, url: config.links.website})

        //@ts-ignore
        interaction.message.edit({
            components: [new MessageActionRow().addComponents(_voteYesButton, _voteNoButton, _endButton)],
            embeds: [embed]
        }).catch(() => {
        })

        try {
            interaction.guild?.bans.remove(res.UserID, "Apelación aprobada").catch(() => { })
            return interaction.reply({
                content: "✅  El usuario ha sido **desbaneado**",
                ephemeral: true
            })
        } catch (e) {
            interaction.reply({
                content: ":no_entry_sign:  Ha ocurrido un error, por favor, comprueba la consola",
                ephemeral: true
            });
            return console.log(e)
        }
    })

}
function banUser(interaction: ButtonInteraction) {

    let args = interaction.customId.split("-")
    // @ts-ignore
    let channel = interaction.guild?.channels.cache.get(process.env.CHANNEL_ID)
    if (!channel || channel.type !== "GUILD_TEXT") return;

    Appeal.findOne({ AppealID: args[2], Unbanned: false }, (err: any, res: any) => {
        if (!res) return interaction.reply({
            content: ":no_entry_sign:  Esta votación ya ha acabado!",
            ephemeral: true
        })

        res.Unbanned = true;
        res.save();

        let _voteYesButton = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel("Desbanear")
            .setEmoji(config.emojis.unban)
            .setDisabled(true)
            .setCustomId(`btn-yes-${res.AppealID}`)

        let _voteNoButton = new MessageButton()
            .setStyle("DANGER")
            .setLabel("Banear")
            .setEmoji(config.emojis.ban)
            .setDisabled(true)
            .setCustomId(`btn-no-${res.AppealID}`)

        let _endButton = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel("Votación finalizada")
            .setDisabled(true)
            .setCustomId(`btn-end-${res.AppealID}`)

        let embed = interaction.message.embeds[0]
        //@ts-ignore
        embed.setColor("#ED4245").setAuthor({ name: "Usuario no desbaneado", iconURL: config.img.main_icon, url: config.links.website})

        //@ts-ignore
        interaction.message.edit({ components: [new MessageActionRow().addComponents(_voteYesButton, _voteNoButton, _endButton)], embeds: [embed] }).catch(() => { })

        return interaction.reply({
            content: "✅  El usuario **no** ha sido desbaneado",
            ephemeral: true
        })
    })
}
