import {ButtonInteraction, Client, MessageActionRow, MessageButton, MessageEmbed} from "discord.js"
import Appeal from "./database/Appeal";

const client = new Client({
    intents: [ "GUILDS", "GUILD_BANS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]
})
/* TODO:
 - Comandos de slashes para acabar/votar por ID
 - Comprobar y pulir todo
*/

client.on("ready", () => {
    client.user?.setPresence({status: 'online', activities: [{name: "lacabra.app", type: "WATCHING"}]});
    console.log(`Bot iniciado como ${client.user.username}!`)
});

client.on("interactionCreate", async (interaction) => {

    if (interaction.isButton()) {

        let args = interaction.customId.split("-")

        if (args[0] !== "btn") return

        if (args[1] === "yes") {

            let AppealID = args[2]

            let _Appeal: any = await Appeal.findOne({AppealID})
            if (!_Appeal) return interaction.reply({
                content: ":no_entry_sign:  Esta petición de apelación no existe!",
                ephemeral: true
            })

            if (_Appeal.ClickersYes.includes(interaction.user.id)) return interaction.reply({
                content: `<:new_aviso:761805859100688394>  Ya has votado **desbanear** al usuario <@!${_Appeal.UserID}>.`,
                ephemeral: true
            });

            if (_Appeal.ClickersNo.includes(interaction.user.id)) {
                _Appeal.ClickersNo = _Appeal.ClickersNo.filter((item: any) => item !== interaction.user.id)
            }

            await interaction.reply({
                content: `<:success:830860492112265217>  Has votado **desbanear** al usuario <@!${_Appeal.UserID}>.`,
                ephemeral: true
            });
            _Appeal.ClickersYes.push(interaction.user.id)
            _Appeal.save();

            let all = _Appeal.ClickersYes.length + _Appeal.ClickersNo.length
            let yesVotes = Math.round(_Appeal.ClickersYes.length / all * 10)
            let noVotes = Math.round(_Appeal.ClickersNo.length / all * 10)

            let string;
            if (yesVotes === 10) string = "<:GREEN1:876413128223621180>" + "<:GREEN2:876413127724523532>".repeat(yesVotes) + "<:GREEN3:876413128164933672>"
            if (noVotes === 10) string = "<:RED1:876414122714091532>" + "<:RED2:876414122907025448>".repeat(noVotes) + "<:RED3:876414122860904518>"

            if (!string)
                string = "<:GREEN1:876413128223621180>" + "<:GREEN2:876413127724523532>".repeat(yesVotes) + "<:RED2:876414122907025448>".repeat(noVotes) + "<:RED3:876414122860904518>"

            let embed = interaction.message.embeds[0]
            //@ts-ignore
            embed.setDescription(`Progreso de la votación:\n\n \`[${_Appeal.ClickersYes.length}/${all}]\` ${string} \`[${_Appeal.ClickersNo.length}/${all}]\`\n`)
            //@ts-ignore
            interaction.message.edit({embeds: [ embed]})        }
        if (args[1] === "no") {

            let AppealID = args[2]

            let _Appeal: any = await Appeal.findOne({AppealID})
            if (!_Appeal) return interaction.reply({
                content: ":no_entry_sign:  Esta petición de apelación no existe!",
                ephemeral: true
            })

            if (_Appeal.ClickersNo.includes(interaction.user.id)) return interaction.reply({
                content: `<:new_aviso:761805859100688394>  Ya has votado **banear** al usuario <@!${_Appeal.UserID}>.`,
                ephemeral: true
            });

            if (_Appeal.ClickersYes.includes(interaction.user.id)) {
                _Appeal.ClickersYes = _Appeal.ClickersYes.filter((item: any) => item !== interaction.user.id)
            }
            await interaction.reply({
                content: `<:success:830860492112265217>  Has votado **banear** al usuario <@!${_Appeal.UserID}>.`,
                ephemeral: true
            });
            _Appeal.ClickersNo.push(interaction.user.id)
            _Appeal.save();

            let all = _Appeal.ClickersYes.length + _Appeal.ClickersNo.length
            let yesVotes = Math.round(_Appeal.ClickersYes.length / all * 10)
            let noVotes = Math.round(_Appeal.ClickersNo.length / all * 10)

            let string;
            if (yesVotes === 10) string = "<:GREEN1:876413128223621180>" + "<:GREEN2:876413127724523532>".repeat(yesVotes) + "<:GREEN3:876413128164933672>"
            if (noVotes === 10) string = "<:RED1:876414122714091532>" + "<:RED2:876414122907025448>".repeat(noVotes) + "<:RED3:876414122860904518>"

            if (!string)
                string = "<:GREEN1:876413128223621180>" + "<:GREEN2:876413127724523532>".repeat(yesVotes) + "<:RED2:876414122907025448>".repeat(noVotes) + "<:RED3:876414122860904518>"

            let embed = interaction.message.embeds[0]
            //@ts-ignore
            embed.setDescription(`Progreso de la votación:\n\n \`[${_Appeal.ClickersYes.length}/${all}]\` ${string} \`[${_Appeal.ClickersNo.length}/${all}]\`\n`)
            //@ts-ignore
            interaction.message.edit({embeds: [ embed]})

        }
        if (args[1] === "end") {

            if (!process.env.ADMINISTRADORES.split(",").includes(interaction.user.id)) return interaction.reply({
                content: `<:new_aviso:761805859100688394>  No puedes terminar esta votación.`,
                ephemeral: true
            });

            let AppealID = args[2]

            let _Appeal: any = await Appeal.findOne({AppealID})
            if (!_Appeal) return interaction.reply({
                content: ":no_entry_sign:  Esta petición de apelación no existe!",
                ephemeral: true
            })

            if (_Appeal.ClickersYes.length > _Appeal.ClickersNo.length) return unbanUser(interaction)
            if (_Appeal.ClickersNo.length > _Appeal.ClickersYes.length) return banUser(interaction)
            if (_Appeal.ClickersYes.length == _Appeal.ClickersNo.length) return unbanUser(interaction)

        }
    }

    function unbanUser(interaction: ButtonInteraction) {

        let args = interaction.customId.split("-")
        let channel = interaction.guild.channels.cache.get(process.env.CHANNEL_ID)
        if (!channel || channel.type !== "GUILD_TEXT") return;

        Appeal.findOne({AppealID: args[2], Unbanned: false}, (err, res) => {
            if (!res) return interaction.reply({
                content: ":no_entry_sign:  Esta votación ya ha acabado!",
                ephemeral: true
            })

            res.Unbanned = true;
            res.save();

            let _voteYesButton = new MessageButton()
                .setStyle("SUCCESS")
                .setLabel("Desbanear")
                .setEmoji("771838935730094090")
                .setDisabled(true)
                .setCustomId(`btn-yes-${res.AppealID}`)

            let _voteNoButton = new MessageButton()
                .setStyle("DANGER")
                .setLabel("Banear")
                .setEmoji("771838918084657164")
                .setDisabled(true)
                .setCustomId(`btn-no-${res.AppealID}`)

            let _endButton = new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Terminar votación")
                .setEmoji("876195233271005184")
                .setDisabled(true)
                .setCustomId(`btn-end-${res.AppealID}`)

            let embed = interaction.message.embeds[0]
            //@ts-ignore
            embed.setColor("#57F287").setAuthor("Usuario desbaneado", "https://cdn.discordapp.com/attachments/810800509719019532/889905025290240080/avatar.png", "https://www.lacabra.app/")

            //@ts-ignore
            interaction.message.edit({
                components: [new MessageActionRow().addComponents(_voteYesButton, _voteNoButton, _endButton)],
                embeds: [embed]
            }).catch(e => {
            })

            try {
                interaction.guild.bans.remove(res.UserID, "Apelación aprobada").catch(e => {})
                return interaction.reply({
                    content: "<:tick2:778321510637109289>  El usuario ha sido **desbaneado**",
                    ephemeral: true
                })
            }catch (e) {
                interaction.reply({
                    content: ":no_entry_sign:  Ha ocurrido un error, por favor, comprueba la consola",
                    ephemeral: true
                })
                return console.log(e)
            }
        })

    }

    function banUser(interaction: ButtonInteraction) {

        let args = interaction.customId.split("-")
        let channel = interaction.guild.channels.cache.get(process.env.CHANNEL_ID)
        if(!channel || channel.type !== "GUILD_TEXT") return;

        Appeal.findOne({AppealID: args[2], Unbanned: false}, (err, res) => {
            if (!res) return interaction.reply({
                content: ":no_entry_sign:  Esta votación ya ha acabado!",
                ephemeral: true
            })

            res.Unbanned = true;
            res.save();

            let _voteYesButton = new MessageButton()
                .setStyle("SUCCESS")
                .setLabel("Desbanear")
                .setEmoji("771838935730094090")
                .setDisabled(true)
                .setCustomId(`btn-yes-${res.AppealID}`)

            let _voteNoButton = new MessageButton()
                .setStyle("DANGER")
                .setLabel("Banear")
                .setEmoji("771838918084657164")
                .setDisabled(true)
                .setCustomId(`btn-no-${res.AppealID}`)

            let _endButton = new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Terminar votación")
                .setEmoji("876195233271005184")
                .setDisabled(true)
                .setCustomId(`btn-end-${res.AppealID}`)

            let embed = interaction.message.embeds[0]
            //@ts-ignore
            embed.setColor("#ED4245").setAuthor("Usuario no desbaneado", "https://cdn.discordapp.com/attachments/810800509719019532/889905025290240080/avatar.png", "https://www.lacabra.app/")

            //@ts-ignore
            interaction.message.edit({ components: [new MessageActionRow().addComponents(_voteYesButton, _voteNoButton, _endButton)], embeds: [ embed ] }).catch(e => {})

            return interaction.reply({
                content: "<:tick2:778321510637109289>  El usuario **no** ha sido desbaneado",
                ephemeral: true
            })
        })
    }
})

export async function checkBans(userId) {
    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if(!guild) return false
    try {
        let bans = await guild.bans.fetch();
        return bans.has(userId)
    }catch (e) {
        console.log("No tengo permisos para ver los bans del servidor!")
        return false
    }
}

export async function sendAppealEmbed(user: any, _appeal:any) {

    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if(!guild) return false
    let channel = guild.channels.cache.get(process.env.CHANNEL_ID)
    if(!channel || channel.type !== "GUILD_TEXT") return false;

    let ban = guild.bans.cache.get(user.ID)
    if(!ban) return false;

    let reason = ban.reason || "Sin razón"
    if(!reason) return false;

    let appeal = await _appeal
    if(!appeal) return false;

    let mod = reason.split("Baneado por: ")[1]
    if(!mod){
        mod = "Sin moderador"
    }else {
        reason = reason.split("Baneado por: ")[0]
    }
    let progress = "<:GRIS2:889925177788485702>".repeat(10)

    let embed = new MessageEmbed()
        .setColor("#2cfff7")
        .setAuthor("¡ Nueva apelación recibida !", "https://cdn.discordapp.com/attachments/810800509719019532/889905025290240080/avatar.png", "https://www.lacabra.app/")
        .setThumbnail(`https://cdn.discordapp.com/avatars/${user.ID}/${user.Avatar}.webp`)
        .addField("Información del usuario:", `- Usuario: <@!${user.ID}>\n- Nombre: \`${user.Tag}\`\n- ID: \`${user.ID}\`\n\n- ID del caso: \`${appeal.AppealID}\`\n- Razón del baneo: \`${reason}\`\n- Moderador: \`${mod}\``,false)
        .addField("¿Por qué has sido baneado?", appeal.banReason, false)
        .addField("¿Por qué crees que deberíamos levantarte el ban?", appeal.appealText, false)
        .addField("¿Qué harás para evitar ser baneado en el futuro?", appeal.futureActions, false)

        .setDescription(`Progreso de la votación:\n\n \`[0/0]\`<:GRIS1:889925177754918972>${progress}<:GRIS3:889925177733943346> \`[0/0]\`\n`)

    let voteYesButton = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Desbanear")
        .setEmoji("771838935730094090")
        .setCustomId(`btn-yes-${appeal.AppealID}`)

    let voteNoButton = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Banear")
        .setEmoji("771838918084657164")
        .setCustomId(`btn-no-${appeal.AppealID}`)

    let endButton = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Terminar votación")
        .setEmoji("876195233271005184")
        .setCustomId(`btn-end-${appeal.AppealID}`)
    try {
        //@ts-ignore
        let msg = await channel.send({
            embeds: [embed],
            components: [new MessageActionRow().addComponents(voteYesButton, voteNoButton, endButton)]
        })

        let user:any = await Appeal.findOne(
            {
                AppealID: appeal.AppealID
            });

        if (!user) return false;
        user.MessageID = msg.id;
        user.save();
        return true;
    }catch (e) {
        console.log("No se ha podido mandar el mensaje: "+e)
        return false
    }
}

export function start() {
    client.login(process.env.BOT_TOKEN).catch()
}
