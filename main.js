const discord = require('discord.js');
const client = new discord.Client();
const request = require('request');
const { APIMessage, Structures } = require("discord.js");
const Keyv = require('keyv');
const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
var invites = [];

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
	var g = client.guilds.cache.get("817762054114902046")
	g.fetchInvites().then(guildInvites => {
		invites[g.id] = guildInvites;
	});
});

client.on('message', async message =>
{
    if(message.author == client.user) return;
    if(!message.content.startsWith("..")) return;
    var args = message.content.split(" ");
	if (args[0] === '..help') {
		message.inlineReply("..giverole:ネタロールを付与します。既に存在しているロールは付与できません。\n..level:色々な景品と交換できるポイントの残高を確認できます。");
	}
        if (args[0] === '..giverole') {
	    if(args[1] === undefined || args[1] === null || args[1] === ""){
		message.inlineReply("..giverole 作りたいロールの名前");
	        return;
	    }
            let roleName = args[1];
            let role = await message.guild.roles.cache.find(x => x.name === roleName);
            if (role !== undefined) {
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
	if(args[0] === "..buy") {
		return;
	        if(args[1] === undefined || args[1] === null || args[1] === "") {
	            message.inlineReply("使い方: ..buy reward-name");
	            return;
	        }
		switch(args[1]){
			case "nexus-BE-money-x25000":
				
				break;
			case "nexus-BE-tp-bow":
				
				break;
			case "nexus-BE-night-vision":
				
				break;
			default:
				message.inlineReply("..rewardコマンドで交換対象のリストを確認してください。");
				return;
				break;
		}
	}
	
	   if (message.content === '..level') {
		   const level = (await levels.get(message.author.id)) || { count: 0, level: 0, point: 0 };
                   message.channel.send(
                       `現在のレベルは ${level.level} です。\n次のレベルまであと ${
                       (level.level * 25) - level.count
                       } ポイントです。\nあなたは ${level.point} ポイント所持しています。`
                   );
            }
});

//level system
client.on('message', async (message) => {
   if (message.author.bot) return;
   if (message.content.startsWith("..")) return;

   const level = (await levels.get(message.author.id)) || { count: 0, level: 0, point: 0 };

   level.count += 1;
   level.point += 1;
	
   if (level.count >= level.level * 25) {
     level.count = 0;
     level.level += 1;
     level.point += 100;
     message.inlineReply("**☆Level UP☆**\nあなたのレベルが" + level.level + "になりました！\n100ボーナスポイントを受け取りました！\n現在の所持ポイント:" + level.point);
   }
 
   levels.set(message.author.id, level);
 });
client.on('guildMemberAdd', async member => {
  if (member.guild.id == "817762054114902046") {
    member.guild.fetchInvites().then(async guildInvites => {
      const ei = invites[member.guild.id];
      invites[member.guild.id] = guildInvites;
      const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
      const inviter = client.users.cache.get(invite.inviter.id);
      const logChannel = member.guild.channels.cache.find(channel => channel.name === "招待ログ");
      logChannel.send(`${inviter.tag}が${member.user.tag}をNexusに招待しました！\n使用された招待URL: https://discord.gg/${invite.code}\n(この招待リンクは${invite.uses}回使用されました。)`);
      var id = invite.inviter.id;
      var user = await client.users.fetch(id);
      var admin = await client.users.fetch("769340481100185631");
      if (user === undefined || user === null) {
        return;
      }
      const level = (await levels.get(user.id)) || { count: 0, level: 0, point: 0 };
      level.point += 100;
      levels.set(user.id, level);
      const mlevel = (await levels.get(member.user.id)) || { count: 0, level: 0, point: 0 };
      mlevel.point += 100;
      levels.set(member.user.id, mlevel);
      try {
        await user.send("🌟招待ありがとうございます！🌟\nあなたが" + member.user.tag + "さんをNexusに招待したことを確認しました。\nお礼に100ポイントをプレゼントしました！\n(このリワードは招待のたびにもらえます。)\nあなたの今のクレジット残高:" + level.point);
        await admin.send("🌟Nexusに招待された人がいます！🌟\n" + user.tag + "が" + member.user.tag + "さんをNexusに招待したことを確認しました。\n" + user.tag + "にお礼として100ポイントをプレゼントしました！\n" + user.tag + "の今のクレジット残高:" + level.point);
	await member.user.send("🌟ようこそ！🌟\nあなたが" + user.tag + "さんの紹介でNexus-総合コミュニティに参加したことを確認しました。\nお祝いに100ポイントをプレゼントしました！\nあなたの今のポイント残高:" + mlevel.point);
      } catch (e) {
        console.log(e)
      }
    });
  }
});
client.on("message", async message => {	
  if (
    message.channel.id == 821150641102651442 &&
    message.author.id == 302050872383242240
  ) {
    if (message.embeds[0].description.match(/表示順をアップしたよ/)) {
      var id = message.embeds[0].description.split(",");
      id = id[0].replace("<@", "");
      id = id.replace(">", "");
      const level = (await levels.get(id)) || { count: 0, level: 0, point: 0 };
      level.point += 75;
      levels.set(id, level);
      var guild = client.guilds.cache.get("817762054114902046");
      if (guild !== undefined && guild !== null) {
        var member = guild.members.cache.get(id);
        if (member !== undefined && member !== null) {
          message.inlineReply(
            "<@"+id+"> BUMPありがとうございます！\n75ボーナスポイントを付与しました！\nあなたの所持ポイント数:"+level.point
          );
          var admin = message.guild.members.cache.get("769340481100185631");
          if (admin !== undefined && admin !== null) {
            admin.send(
              member.user.tag +
                "さんがBUMPしてくれました。\nお礼に75ボーナスポイントを付与しました。\n"+member.user.tag +"さんの所持ポイント数:"+level.point
            );
          }
        }
      }
    }
  }
  if(message.channel.id==820292879565848616&&message.author.id==159985870458322944){
    var id = message.content.split(":") 
    var guild = clientassi.guilds.cache.get("817762054114902046"); 
    if(guild!==undefined&&guild!==null){
     var member = guild.members.cache.get(id[1])
     if(member!==undefined&&member!==null){
       const level = (await levels.get(member.id)) || { count: 0, level: 0, point: 0 };
       level.point += 777;
       levels.set(member.id, level);
       member.send("誕生日おめでとうございます！\nお祝いに777ボーナスポイントをプレゼントします！\nあなたの所持ポイント:"+level.point) 
       var admin = message.guild.members.cache.get("769340481100185631")
       if(admin!==undefined&&admin!==null){
         admin.send("今日は"+member.user.tag+"さんの誕生日です！\nお祝いに777ボーナスポイントをプレゼントしました。\n"+member.user.tag+"さんの所持ポイント数:"+level.point)
       }
     }
    }
  }
});
client.login(process.env.nexustoken);
