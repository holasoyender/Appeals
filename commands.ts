import { SlashCommandBuilder } from "@discordjs/builders"

export default  [

		new SlashCommandBuilder()
			.setName('appeal')
			.setDescription('Comando para votar en una petición de apelación')
			.addStringOption(option =>
				option.setName('voto')
					.setDescription('Votar desbanear/banear')
					.setRequired(true)
					.addChoice('Desbanear', 'unban')
					.addChoice('Banear', 'ban'))
			.addStringOption(option =>
				option.setName("id")
					.setDescription("ID de la apelación")
					.setRequired(true)),

		new SlashCommandBuilder()
			.setName('block')
			.setDescription('Comando para bloquear a un usuario del sistema de apelación')
			.addUserOption(opt =>
			opt.setName("usuario")
				.setDescription("Usuario a bloquear")
				.setRequired(true)),

		new SlashCommandBuilder()
			.setName('unblock')
			.setDescription('Comando para desbloquear a un usuario del sistema de apelación')
			.addUserOption(opt =>
			opt.setName("usuario")
				.setDescription("Usuario a desbloquear")
				.setRequired(true))

]