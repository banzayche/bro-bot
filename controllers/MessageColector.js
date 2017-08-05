'use strict';

const unirest = require('unirest');
let htmlparser = require("htmlparser2");
let select = require('soupselect').select;
const random = require('node-random-number');
let _ = require('lodash');
let moment = require('moment');
const BOT_CONFIGS = require('../configBOT');

let excusePath = `/get-excuse/367`;

class MessageColector {
  constructor(msg, match, bot) {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    this.chatId = _.has(msg, 'chat.id') ? msg.chat.id : msg.from.id;
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
    else if (this.match[0] === '/m') this.getMiningEthermineStats('serg')
    else if (this.match[0] === '/ms') this.getMiningEthermineStats('sem')
    else if (this.match[0] === '/autoGPUAlert') this.lowHighTemperatureAlert();
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

  getMiningEthermineStats(option) {
    let that = this;
    var Request = unirest.get(`https://ethermine.org/api/miner_new/${BOT_CONFIGS.ethermineIDS[option]}`);

    Request.end(function (response) {
      let nextPayoutHours = (((+response.body.settings.minPayout - +response.body.unpaid)/ 1000000000000000000)/(+response.body.ethPerMin * 60)).toFixed(1);
      nextPayoutHours = Math.round(nextPayoutHours);
      let payoutDay = moment().add(nextPayoutHours, 'h');

      var  msg = `
      <code>Address: </code><b>${response.body.address}</b>\n
      <code>Unpaid ethereum: </code><b>${ (+response.body.unpaid / 1000000000000000000).toFixed(5)}</b>\n
      <b>===HASHRATE===</b>\n
      <code>Current hashrate: </code><b>${response.body.hashRate}</b>\n
      <code>Average hashrate: </code><b>${(+response.body.avgHashrate / 1000000).toFixed(5)} MH/s</b>\n
      <code>Reported hashrate: </code><b>${response.body.reportedHashRate}</b>\n
      <b>===ETHER PER===</b>\n
      <code>Ether per minute: </code><b>${+response.body.ethPerMin.toFixed(6)}</b>\n
      <code>Ether per day: </code><b>${(+response.body.ethPerMin * 1440).toFixed(5)}</b>\n
      <code>Ether per week: </code><b>${(+response.body.ethPerMin * 7 * 1440).toFixed(5)}</b>\n
      <b>===USD PER===</b>\n
      <code>USD per minute: </code><b>${+response.body.usdPerMin.toFixed(5)} USD</b> \n
      <code>USD per day: </code><b>${(+response.body.usdPerMin * 1440).toFixed(5)} USD</b> \n
      <code>USD per week: </code><b>${(+response.body.usdPerMin * 7 * 1440).toFixed(5)} USD</b> \n
      <b>===NEAREST PAYOUT===</b>\n
      ${payoutDay.format("dddd, MMMM Do YYYY, h:mm:ss a")}

      <b>===ETHERMINE WEB SITE===</b>\n
      <a href="https://ethermine.org/miners/${BOT_CONFIGS.ethermineIDS[option]}">STATS ON WEB-site</a>

      <b>===DONATE HERE===</b>\n
      ETH: 0x7fd34080918b7a48f797364c1016ef0d4136262a \n
      `;

      that.bot.sendMessage(that.chatId, msg, {parse_mode:'html', disable_web_page_preview:true});
      
      if (option === 'serg') {
        that.getGPUTemperature();
      }
    });
  }

  getGPUTemperature() {
    let that = this;
    var Request = unirest.get(BOT_CONFIGS.rigAdress);
    Request.end(function (response) {
      var handler = new htmlparser.DomHandler(function(err, dom) {
        let temperature = select(dom, 'body')[0].children[0].data;
        temperature = JSON.parse(temperature).result[6];
        temperature = temperature.split(';')

        let temperatureString = '';
        
        _.forEach(temperature, (v,i) => {
          if (i%2 === 0) {
            temperatureString = temperatureString + `<code>GPU-${i === 0 ? 0 : i/2}</code> \n <strong>t - ${v}C  `;
          }
          else if (i%2 === 1) {
            temperatureString = temperatureString + `fan - ${v}%</strong> \n`;
          }
        });

        that.bot.sendMessage(that.chatId, temperatureString, {parse_mode:'html', disable_web_page_preview:true});             
      });
      
      new htmlparser.Parser(handler).parseComplete(response.body)
    });
  }

  lowHighTemperatureAlert() {
    let that = this;
    var Request = unirest.get(BOT_CONFIGS.rigAdress);
    Request.end(function (response) {
      var handler = new htmlparser.DomHandler(function(err, dom) {
        if (err) {
          that.bot.sendMessage(that.chatId, 'Have no access to the local statistic server.');
        }
        else {
          let temperature = select(dom, 'body')[0].children[0].data;
          temperature = JSON.parse(temperature).result[6];
          temperature = temperature.split(';')

          let isThereAnAlertMessage = '';
          let isThereAnAlert = false;
          
          _.forEach(temperature, (v,i) => {
            // If high temperature
            if (i%2 === 0) {
              let isToLowTemperature = !v || +v < BOT_CONFIGS.GPULowTemperature;
              let isToHighTemperature = +v > BOT_CONFIGS.GPUTLimit;
              if (isToLowTemperature || isToHighTemperature) {
                isThereAnAlertMessage = isThereAnAlertMessage + `<strong>Danger temperature.</strong> <i>Limit ${BOT_CONFIGS.GPUTLimit}C</i>\n<code>GPU-${i === 0 ? 0 : i/2}</code> \n <strong>t - ${v}C</strong> \n`;
              }

              isThereAnAlert = isToLowTemperature || isToHighTemperature || temperature.length < BOT_CONFIGS.GPUCount*2;
            }
          });

          // if one of GPU went down
          if (temperature.length < BOT_CONFIGS.GPUCount*2) {
            isThereAnAlertMessage = isThereAnAlertMessage + `<code>Some of your GPU went down!</code>`;
          }

          //Send alert if it's reasons
          if (isThereAnAlert) {
            that.bot.sendMessage(that.chatId, isThereAnAlertMessage, {parse_mode:'html', disable_web_page_preview:true});
          }             
        }
        
      });
      
      new htmlparser.Parser(handler).parseComplete(response.body)
    });
  }
}

module.exports = MessageColector;