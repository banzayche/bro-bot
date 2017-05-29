'use strict';

const TelegramBot = require('node-telegram-bot-api');
const MessageColector = require('./controllers/MessageColector');
let _ = require('lodash');

// replace the value below with the Telegram token you receive from @BotFather
const token = '387116379:AAGHOhcMN4DH0RzEagC3hMmLj7msVfGGlHk';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.on('callback_query', function(msg) {
    var match = /\/get_excuse (.+)/.exec(msg.data) || /\/get_joke (.+)/.exec(msg.data);

    // To define chat.id
    // _.set(msg, 'chat.id', match[1])

    if (match) new MessageColector(msg, [msg.data.split(' ')[0]], bot)
});
// IF MESSAGE MATCHES "[whatever]"
bot.onText(/(.+)/, (msg, match) => new MessageColector(msg, match, bot));