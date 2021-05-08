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
	    if(result === "no user"){
		send("register",message.author.id.toString()).then(function(regresult) {
	            if(regresult !== "success") {
			    message.reply("API Error."); 
			    return;
		    }
		    message.reply("Your account has been created! credit:10000");
		});
		return;
	    }
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
       	id : id,
	point : bet
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

client.login(process.env.casinotoken);
