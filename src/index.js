'use strict';

const fs      = require('fs');
const cfg     = require('../config.js');
const pkg     = require('../package.json');
const Discord = require('discord.js');
const Jeeves  = require('./bot.js');
const bot     = new Discord.Client();

let app = new Jeeves({
  name: cfg.name,
  desc: pkg.description,
  prefix: cfg.prefix,
  version: pkg.version,
  onReply: (msg, context) => {
    // Fired when input is needed to be shown to the user.
    context.reply('\n' + msg);

    // Delete own message stuff
    /*
     .then(bot_response => {
     if (cfg.deleteAfterReply.enabled) {
     context.msg.delete(cfg.deleteAfterReply.time)
     .then(msg => console.log(`Deleted message from ${msg.author}`))
     .catch(console.log);
     bot_response.delete(cfg.deleteAfterReply.time)
     .then(msg => console.log(`Deleted message from ${msg.author}`))
     .catch(console.log);
     }
     });
     */
  }
});

// Load every command in the commands folder
fs.readdirSync('./src/commands/').forEach(file => {
  app.addCommand(require("./commands/" + file));
});

bot.on('message', msg => {
  // Fired when someone sends a message
  if (app.hasPrefix(msg.content)) {
    if (app.validCommand(msg.content)) { // If message has correct prefix and valid command
      app.parseInput(msg);
    } else { // Command is not valid so print help
      app.help(msg);
    }
  }
});

bot.login(cfg.token).then(() => {
  console.log('Running!');
});
