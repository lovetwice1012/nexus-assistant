const discord = require('discord.js');
const client = new discord.Client();

client.on('ready', message =>
{
	console.log('gamble bot is ready!');
});

client.on('message', message =>
{
	if (message.content === '!g 1' && message.author != client.user) {
        message.reply('所持金を入力してください。');
    }
});

client.login("");
