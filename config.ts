export default {
    bot_status: {
        type: "WATCHING", // WATCHING, PLAYING, LISTENING, STREAMING
        message: "lacabra.app" // Mensaje del estado del bot
    },
    img: {
        main_icon: "https://cdn.discordapp.com/attachments/810800509719019532/889905025290240080/avatar.png", // Icono principal del sistema
        banner: "https://cdn.discordapp.com/attachments/839400943517827092/948168647032053770/8372ead641f6bb38c98fa31b146e70b6.jpg", // Banner del la pagina principal
    },
    links: {
        website: "https://lacabra.app", // Link del sitio web (el que sea)
    },
    emojis: {
        ban: "771838918084657164", //Emoji del botón de banear (Solo la ID)
        unban: "771838935730094090", //Emoji del botón de desbanear (Solo la ID)

        //Emojis de las votaciones
        grey_left: "<:GRIS1:889925177754918972>", //Emoji gris de la izquierda
        grey_right: "<:GRIS3:889925177733943346>", //Emoji gris de la derecha
        grey_center: "<:GRIS2:889925177788485702>", //Emoji gris del centro

        green_left: "<:GREEN1:876413128223621180>", //Emoji verde de la izquierda
        green_right: "<:GREEN3:876413128164933672>", //Emoji verde de la derecha
        green_center: "<:GREEN2:876413127724523532>", //Emoji verde del centro

        red_left: "<:RED1:876414122714091532>", //Emoji rojo de la izquierda
        red_right: "<:RED3:876414122860904518>", //Emoji rojo de la derecha
        red_center: "<:RED2:876414122907025448>", //Emoji rojo del centro
    },
    wait_days: 30, // Días que el usuario debe de esperar para poder apelar
    server_name: "LA CABRA", // Nombre del servidor
    argument_vote: true, // Pedir al usuario que ha votado la razón de su voto
}