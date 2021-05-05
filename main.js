const discord = require('discord.js');
const client = new discord.Client();
const url = require('./url.json');
const request = require('request');

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

async function send(type,message){
    var flag = false;
    var res = "";
    var options = {
      uri: url[type],
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      form: {
        type: type
      }
    };
    request.post(options, function(error, response, body){
        flag = true;
	res = response;
    });
     var check = function(callback){
	if(flag){
	    clearInterval(timer);
	    callback();
        }
     };
     var timer = setInterval(check(function ({return res})), 100);
}
client.login(process.env.token);
