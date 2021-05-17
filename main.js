const discord = require('discord.js');
const client = new discord.Client();
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
	console.log('nexus assistant is ready!');
});

client.on('message', async message =>
{
    if(message.author == client.user) return;
    if(!message.content.startsWith("..")) return;
    var args = message.content.split(" ");
	if (args[0] === '..help') {
		message.inlineReply("..giverole:ネタロールを付与します。既に存在しているロールは付与できません。");
	}
        if (args[0] === '..giverole') {
	    if(args[1] === undefined || args[1] === null || args[1] === ""){
		message.inlineReply("..giverole 作りたいロールの名前");
	        return;
	    }
            let roleName = args[1];
            let role = message.guild.roles.cache.find(x => x.name === roleName);
            if (typeof role !== undefined) {
                message.inlineReply("その名前のロールは既に存在するため作成・付与できません。");
		return;
            } 
	    message.guild.roles.create({
            data: {
                name: args[1],
                color: 'BLUE',
            },
            reason: message.author.username+'からのリクエストで作成しました。',
            })
            .then(role => {
	    message.member.roles.add(role);
            message.inlineReply("追加しました！確認してください。");
	    })
            .catch(console.error);
    }
});
