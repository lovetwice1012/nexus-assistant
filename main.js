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
    	send("check",message.author.id.toString()).then(function(result) {
            message.reply(result); 
        });
    }
});
     
async function send(type,id,bet = 0){
    var promise = new Promise(function(resolve, reject) {
    var flag = false;
    var res = "";
    var options = {
      uri: url[type],
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      form: {
       	id : id
      }
    };
    options.form[type] = type;
    request.post(options, function(error, response, body){
        flag = true;
	resolve(body);
    });
  });
   return promise;
}

client.login(process.env.token);
