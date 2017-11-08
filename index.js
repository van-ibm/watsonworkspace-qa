'use strict'

const logger = require('winston')

const UI = require('watsonworkspace-sdk').UI

const action = 'find-answers'  // the actionId used to create the initial UI of buttons

module.exports.bind = (bot) => {
  /**
   * Listens for questions asked in conversation.
   */
  bot.on('message-focus:Question', (message, annotation) => {
    logger.info(`Received message-focus:Question`)
    logger.debug(message)
    logger.debug(annotation)

    // fetch the original user's message and get the content to add the UI decoration
    bot.getMessage(message.messageId, ['id', 'content'])
    .then(message => bot.addMessageFocus(message, annotation.phrase, 'Question', '', action))
    .catch(error => logger.error(error))
  })

  /**
   * An 'actionSelected' event signals the user has initiated actionFulfillment from Workspace.
   * Set up the resulting UI to be sent back to the user.
   */
  bot.on(`actionSelected`, (message, annotation) => {
    // get the original message that created this actionSelected annotation
    const referralMessageId = annotation.referralMessageId
    const userId = message.userId
    const actionId = annotation.actionId

    logger.info(`${actionId} selected from message ${referralMessageId} by user ${userId}`)
    logger.debug(message)
    logger.debug(annotation)

    bot.getMessage(referralMessageId, ['id', 'created', 'annotations'])
    .then(message => {
      logger.verbose(`Successfully retrieved message ${message.id} created on ${message.created}`)

      // useful data from wws information extration
      const searchableData = bot.extractInformation(message)

      // show the user available answers
      return answer(userId, annotation, searchableData)
    })
    .then(message => logger.info('Successfully sent answers'))
    .catch(error => logger.error(error))
  })

  function answer (userId, annotation, searchableData) {
    let cards = []

    logger.info(`Answering question using data ${JSON.stringify(searchableData, null, 1)}`)

    // for example, let's pull concepts from dbpedia
    const text = 'Sed aliquet orci non ullamcorper condimentum. Quisque id mauris commodo, aliquam urna quis, suscipit nisi. Quisque faucibus erat id accumsan.'

    searchableData.concepts.forEach(concept => {
      const subtitleRand = Math.random() * (25 - 10) + 10
      const textRand = Math.random() * (140 - 50) + 50

      cards.push(UI.card(concept.text, text.substring(0, subtitleRand), text.substring(0, textRand), [
        UI.cardButton('More')
      ]))
    })

    if (cards.length > 0) {
      return bot.sendTargetedMessage(userId, annotation, cards)
    } else {
      logger.warn(`No suitable answers found`)
    }
  }
}
