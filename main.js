const discord = require('discord.js');
const client = new discord.Client();

client.on('ready', message =>
{
	console.log('gamble bot is ready!');
});

client.on('message', message =>
{
	if(message.author == client.user) return;
	if(!message.content.startsWith(".")) return;
	var args = message.content.split(" ");
	if (args[0] === '.g') {
        message.reply('所持金を入力してください。');
    }
});

client.login(process.env.token);
