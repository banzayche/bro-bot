'use strict';

const unirest = require('unirest');
let htmlparser = require("htmlparser2");
let select = require('soupselect').select;
const random = require('node-random-number');

class MessageColector {
  constructor(msg, match, bot) {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    this.chatId = msg.chat.id;
    this.bot = bot;
    this.match = match;

    // this.sendMessage();
    this.makeRequest();
  }

  sendMessage() {
    let resp = this.match[1]; // the captured "whatever"
    // send back the matched "whatever" to the chat
    this.bot.sendMessage(this.chatId, resp);
  }

  makeRequest() {
    let number = random({start: 1, end: 50})[0];
    let that = this;

    var Request = unirest.get(`http://copout.me/get-excuse/${number}`);
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
            that.bot.sendMessage(that.chatId, titles);
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