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
    if (args[0] === '.bet') {
	    if(args[1] === undefined || args[1] === null || args[1] === "" || args[2] === undefined || args[2] === null || args[2] === ""){
		message.reply(".bet amount percentage");
	        return;
	    }
            if(parseInt(args[1]) < 1 || parseInt(args[2]) < 1 || parseInt(args[2]) > 100){
		message.reply(".bet amount(1~∞) percentage(1~100)");
	        return;
	    }
    	send("check",message.author.id.toString()).then(function(result) {
	    if(result === "no user"){
		message.reply("please send '.g' first.");
		return;
	    }
	    if(parseInt(args[1]) > result){
		message.reply("Your balance is too low to make this bet.");
		return;
	    }
	    send("changepoint",message.author.id.toString(),(-1 * args[1])).then(function(result) {
                        if(result === "faild") {
	                    message.reply("API Error.");
		            return;
                        }
            });
	    var odd = 100 / parseInt(args[2]);
	    if(isHit(args[2])){
		    
		    var get = Math.floor(parseInt(args[1]) * odd) + parseInt(args[1]);
		    send("changepoint",message.author.id.toString(),get).then(function(result) {
                        if(result === "faild") {
	                    message.reply("API Error.");
		            return;
                        }
                        message.reply("Hit! You won "+(get - parseInt(args[1]))+" credits! (odds:"+odd+")"); 
                    });
		    return;
	    }else{
		    message.reply("You lose! You lost "+args[1]+" credits! (odds:"+odd+")");
		    return;
	    }
        });
    }
    if (args[0] === '.ban' && (message.author.id == 769340481100185631 || message.author.id == 665129572857020416 || message.author.id == 572915483209105408)) {
	if(args[1] === undefined || args[1] === null || args[1] === ""){
		message.reply(".ban <user id here>");
	        return;
	}
    	send("ban",args[1]).then(function(result) {
            if(result === "faild") {
	        message.reply("API Error.");
		return;
            }
            message.reply(result); 
        });
    }
});
function isHit(percentage){
	var random = Math.ceil( Math.random()*100 );
	if(random <= percentage) return true;
	return false;
}
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
