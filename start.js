'use strict';
const BOT_CONFIGS = require('./configBOT');
const TelegramBot = require('node-telegram-bot-api');
const MessageColector = require('./controllers/MessageColector');
let _ = require('lodash');

// replace the value below with the Telegram token you receive from @BotFather
const token = BOT_CONFIGS.telegrammBotToken;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.on('callback_query', function(msg) {
    var match = /\/get_excuse (.+)/.exec(msg.data) || /\/get_joke (.+)/.exec(msg.data) || /\/m (.+)/.exec(msg.data) || /\/ms (.+)/.exec(msg.data);

    // To define chat.id
    _.set(msg, 'chat.id', match[1]);

    if (match) new MessageColector(msg, [msg.data.split(' ')[0]], bot)
});
// IF MESSAGE MATCHES "[whatever]"
bot.onText(/(.+)/, (msg, match) => new MessageColector(msg, match, bot));



setInterval(function() {
  new MessageColector({chat:{id: BOT_CONFIGS.myChatId}}, ['/autoGPUAlert'], bot);
}, 5000);
//}, 1800000);