require('dotenv').config()

// creates a bot server with a single bot
const botFramework = require('watsonworkspace-bot')
botFramework.level('info')
botFramework.startServer()

const bot = botFramework.create(
  process.env.QA_APP_ID,
  process.env.QA_APP_SECRET,
  process.env.QA_WEBHOOK_SECRET
)

// bind the Q&A bot's behavior
const qa = require('./index.js')
qa.bind(bot)

bot.authenticate()
