import express from 'express'

import Bot from '../models/Bot'
import Service from '../models/Service'

const createApp = handle => {
  const app = express()

  // create database tables if not exists
  app.put('/setup-database', async (req, res) => {
    await Bot.sync()
    await Service.sync()
    res.send('')
  })

  // "reboot": remove dead bots from database, ensure live bots have WebHooks
  app.put('/reboot', async (req, res) => {
    const bots = await Bot.findAll()
    for (const bot of bots) {
      if (await bot.check()) {
        await bot.ensureWebHook()
      }
    }
    res.send('')
  })

  app.get('/diagnostic', async (req, res) => {
    const bots = await Bot.findAll()
    let result = ''
    for (const bot of bots) {
      result += `<pre>${JSON.stringify(bot, null, 2)}</pre>`
      const subscriptions = await bot.getSubscriptions()
      result += `<pre>${JSON.stringify(subscriptions, null, 2)}</pre>`
    }
    res.send(result)
  })

  return app
}

export default createApp
