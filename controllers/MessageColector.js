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

    this.inlineKeyboard = (key, all) => {
      let keyboardArrayMap = {
        get_excuse: [{text: 'Получить отмазку', callback_data: `/get_excuse ${this.chatId}`}],
        get_joke: [{text: 'Получить шутку', callback_data: `/get_joke ${this.chatId}`}]
      };

      let markup = {
        'reply_markup': {
          'inline_keyboard': all ? [keyboardArrayMap[key[0]], keyboardArrayMap[key[1]]] : [keyboardArrayMap[key]]
        }
      };

      return markup;
    };
    
    if (this.match[0] === '/get_excuse') this.getExecuse()
    else if (this.match[0] === '/get_joke') this.getJoke()
    else {
      this.bot.sendSticker(this.chatId, 'CAADAgADEgUAAvoLtgjV7M7AFx5kYwI');
      this.bot.sendMessage(this.chatId, 'Что я могу вам предоставить:', this.inlineKeyboard(['get_excuse', 'get_joke'], true));
    }
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

            that.bot.sendMessage(that.chatId, titles, that.inlineKeyboard('get_excuse'));
          } catch (error) {
            that.bot.sendMessage(that.chatId, 'Херня дело, попробуй позже..');
          }         
        }                
      });
      new htmlparser.Parser(handler).parseComplete(response.body)
    });
  }

  getJoke() {
    let that = this;
    var Request = unirest.post(`https://online-generators.ru/ajax.php`);

    Request.send({
      processor: 'jokes'
    });
    Request.end(function (response) {
      try {
        that.bot.sendMessage(that.chatId, response.body.split('##')[0], that.inlineKeyboard('get_joke'));
      } catch (error) {
        that.bot.sendMessage(that.chatId, 'Херня дело, попробуй позже..');
      }     
    });
  }
}

module.exports = MessageColector;