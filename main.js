const discord = require('discord.js');
const client = new discord.Client();
const url = require('./url.json');
const request = require('request');
const { APIMessage, Structures } = require("discord.js");

class ExtAPIMessage extends APIMessage {
    resolveData() {
        if (this.data) return this;
        super.resolveData();
        if ((this.options.allowedMentions || {}).repliedUser !== undefined) {
            if (this.data.allowed_mentions === undefined) this.data.allowed_mentions = {};
            Object.assign(this.data.allowed_mentions, { replied_user: this.options.allowedMentions.repliedUser });
            delete this.options.allowedMentions.repliedUser;
        }
        if (this.options.replyTo !== undefined) {
            Object.assign(this.data, { message_reference: { message_id: this.options.replyTo.id } });
        }
        return this;
    }
}

class Message extends Structures.get("Message") {
    inlineReply(content, options) {
        return this.channel.send(ExtAPIMessage.create(this, content, options, { replyTo: this }).resolveData());
    }

    edit(content, options) {
        return super.edit(ExtAPIMessage.create(this, content, options).resolveData());
    }
}

Structures.extend("Message", () => Message);

client.on('ready', message =>
{
	console.log('gamble bot is ready!');
});

client.on('message', async message =>
{
    if(message.author == client.user) return;
    if(!message.content.startsWith(".")) return;
    var args = message.content.split(" ");
	if (args[0] === '.help') {
		message.inlineReply(".bet: A bet whose multiplier changes according to the winning probability. (Usage: .bet amount percentage) \n.flip: You can predict the front (F) and back (B) of the coin when you toss the coin, and if the prediction is successful, you can get double the stake. If you fail, your stake will be lost. (Usage: .flip amount F / B)");
	}
    if (args[0] === '.g') {
    	send("check",message.author.id.toString()).then(function(result) {
	    if(result === "no user"){
		send("register",message.author.id.toString()).then(function(regresult) {
	            if(regresult !== "success") {
			    message.inlineReply("API Error."); 
			    return;
		    }
		    message.inlineReply("Your account has been created! credit:10000");
		});
		return;
	    }
            message.inlineReply(result); 
        });
    }
    if (args[0] === '.bet') {
	    if(args[1] === undefined || args[1] === null || args[1] === "" || args[2] === undefined || args[2] === null || args[2] === ""){
		message.inlineReply(".bet amount percentage");
	        return;
	    }
            if(parseInt(args[1]) < 1 || parseInt(args[2]) < 1 || parseInt(args[2]) > 100){
		message.inlineReply(".bet amount(1~∞) percentage(1~100)");
	        return;
	    }
    	send("check",message.author.id.toString()).then(function(result) {
	    if(result === "no user"){
		message.inlineReply("please send '.g' first.");
		return;
	    }
	    if(parseInt(args[1]) > parseInt(result)){
		message.inlineReply("Your balance is too low to make this bet.");
		return;
	    }
	    send("changepoint",message.author.id.toString(),(-1 * args[1])).then(function(result) {
                        if(result === "faild") {
	                    message.inlineReply("API Error.");
		            return;
                        }
		    var odd = 100 / parseInt(args[2]);
	            if(isHit(args[2])){
		    
		    var get = Math.floor(parseInt(args[1]) * odd);
		    send("changepoint",message.author.id.toString(),get).then(function(result) {
                        if(result === "faild") {
	                    message.inlineReply("API Error.");
		            return;
                        }
                        message.inlineReply("Hit! You won "+(get - parseInt(args[1]))+" credits! (odds:"+odd+")"); 
                    });
		    return;
	            }else{
		    message.inlineReply("You lose! You lost "+args[1]+" credits! (odds:"+odd+")");
		    return;
	            }
                });
            });
	    
    }
	if (args[0] === '.flip') {
	    if(args[1] === undefined || args[1] === null || args[1] === "" || args[2] === undefined || args[2] === null || args[2] === ""){
		message.inlineReply(".flip amount < F / B > ");
	        return;
	    }
            if(parseInt(args[1]) < 1 || (args[2] !== "F" || "f"&& args[2] !== "B" || "b")){
		message.inlineReply(".flip amount(1~∞) < F / B > ");
	        return;
	    }
    	send("check",message.author.id.toString()).then(function(result) {
	    if(result === "no user"){
		message.inlineReply("please send '.g' first.");
		return;
	    }
	    if(parseInt(args[1]) > parseInt(result)){
		message.inlineReply("Your balance is too low to make this bet.");
		return;
	    }
	    send("changepoint",message.author.id.toString(),(-1 * args[1])).then(function(result) {
                        if(result === "faild") {
	                    message.inlineReply("API Error.");
		            return;
                        }
		    var odd = 2;
	            if(isHit(50)){	    
		    var get = Math.floor(parseInt(args[1]) * odd);
		    send("changepoint",message.author.id.toString(),get).then(function(result) {
                        if(result === "faild") {
	                    message.inlineReply("API Error.");
		            return;
                        }
			if(args[2] === "F"){
                                message.inlineReply("Front! You won "+(get - parseInt(args[1]))+" credits!"); 
			}else{
				message.inlineReply("Back! You won "+(get - parseInt(args[1]))+" credits!"); 
			}
                    });
		    return;
	            }else{
		        if(args[2] === "F"){
                                message.inlineReply("Back! You lost "+parseInt(args[1])+" credits!"); 
			}else{
				message.inlineReply("Front! You lost "+parseInt(args[1])+" credits!"); 
			}
		    return;
	            }
                });
            });
	    
    }
    if (args[0] === '.ban' && (message.author.id == 769340481100185631 || message.author.id == 665129572857020416 || message.author.id == 572915483209105408)) {
	if(args[1] === undefined || args[1] === null || args[1] === ""){
		message.inlineReply(".ban <user id here>");
	        return;
	}
    	send("ban",args[1]).then(function(result) {
            if(result === "faild") {
	        message.inlineReply("API Error.");
		return;
            }
            message.inlineReply(result); 
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
