const discord = require('discord.js');
const client = new discord.Client();
const url = require('./url.json');
const request = require('request');

client.on('ready', message =>
{
	console.log('gamble bot is ready!');
});

client.on('message', async message =>
{
    if(message.author == client.user) return;
    if(!message.content.startsWith(".")) return;
    var args = message.content.split(" ");
    if (args[0] === '.g') {
    	message.reply(await send("check",message.author.id));
    }
});

async function send(type,id,bet = 0){
    var flag = false;
    var res = "";
    var options = {
      uri: url[type],
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      form: {
        type: type,
	id: id
      }
    };
    request.post(options, function(error, response, body){
        flag = true;
	res = response;
    });
     function check(callback){
	if(flag){
	    clearInterval(timer);
	    callback();
        }
     };
     var timer = setInterval(check(function ({return res})), 100);
}
client.login(process.env.token);
