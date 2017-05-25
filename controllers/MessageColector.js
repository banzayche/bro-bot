'use strict';

const unirest = require('unirest');
let htmlparser = require("htmlparser2");
let select = require('soupselect').select;
const random = require('node-random-number');
let _ = require('lodash');

let excusePath = `/get-excuse/24`;

class MessageColector {
  constructor(msg, match, bot) {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    this.chatId = msg.chat.id;
    this.bot = bot;
    this.match = match;

    this.inlineKeyboard = {
      'reply_markup': {
        'inline_keyboard': [
          [{text: 'Получить отмазку', callback_data: `/дай отмазку ${this.chatId}`}]
        ]
      }
    };
    
    if (this.match[0] === '/дай отмазку') this.getExecuse()
    else this.bot.sendSticker(this.chatId, 'CAADAgADEgUAAvoLtgjV7M7AFx5kYwI', this.inlineKeyboard);
  }

  getExecuse() {
    let that = this;
    var Request = unirest.get(`http://copout.me${excusePath}`);
    
    Request.query({
      _pjax: '#section-excuse'
    });
    Request.end(function (response) {
      var handler = new htmlparser.DomHandler(function(err, dom) {
        if (err) {
          that.bot.sendMessage(that.chatId, 'Error occured');
        } 
        else {
          var titles;
          try {
            titles = select(dom, 'blockquote')[0].children[0].data;
            // set up path to nex valid excuse
            excusePath = select(dom, 'a.btn-generation.btn-open-excuse')[0].attribs['data-href'];

            that.bot.sendMessage(that.chatId, titles, that.inlineKeyboard);
          } catch (error) {
            that.bot.sendMessage(that.chatId, 'Херня дело, попробуй позже..');
          }         
        }                
      });
      new htmlparser.Parser(handler).parseComplete(response.body)
    });
  }
}

module.exports = MessageColector;