require('dotenv').config({ path: `${__dirname}/.env` })
const { Telegraf } = require('telegraf')
const botToken = process.env['TELEGRAM_BOT_TOKEN']
const  Vehicle = require('./vehicle')

const bot = new Telegraf(botToken)

bot.start(({ replyWithHTML }) => replyWithHTML(
  'Hi, I am <b>Vehicle details finder</b> Bot. \n\rSend: <a href="/vehicle">/vehicle <b>RegistrationNumber</b></a> for vehicle details.'
))

bot.help(({ replyWithHTML }) => replyWithHTML(
  `To start searching type\n\r<a href="/vehicle">/vehicle <b>RegistrationNumber</b></a>\n\rE.g <a href="/vehicle">/vehicle <b>PB01R0000</b></a>`
))

bot.command('vehicle', async (ctx) => {
  let reg = ctx.update.message.text.replace('/vehicle', '').trim()
  if (!reg) {
    return ctx.reply('Registration number is missing.')
  }

  const vehicleObj = new Vehicle(reg)
  let vehicleData = await vehicleObj.getDetails()
  if (vehicleData.error) {
    return ctx.replyWithHTML(vehicleData.error)
  }

  let output = Object.entries(vehicleData).map(([key, value]) => `${key} <b>${value}</b>`)
  ctx.replyWithHTML(output.join('\n\r'))
})


bot.on('text', ctx => ctx.reply('Not Supported.'))
bot.launch()