#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const { Kafka } = require('kafkajs');
const Table = require('cli-table')
const package = require('./package.json');

program.version(package.version);

const availableEvents = new Set([
  'purchase',
])

const kafka = new Kafka({
  clientId: 'sample-producer',
  brokers: ['localhost:9092'],
})

program
  .command('setup')
  .description('Setup Kafka topics')
  .action(async () => {
    const admin = kafka.admin()

    await admin.connect();

    await admin.createTopics({
      topics: [
        { topic: 'hidra' }
      ] 
    })

    await admin.disconnect();
  })

program
  .command('send [event]')
  .description('Envia um evento ao Kafka')
  .action(async (event) => {
    if (!availableEvents.has(event)) {
      console.log(chalk.redBright(`Evento "${event}" não suportado.`))
      return;
    }

    const producer = kafka.producer()

    await producer.connect()

    const response = await producer.send({
      topic: 'hidra',
      messages: [
        { value: 'Hello KafkaJS user!' },
      ],
    })

    console.log(chalk.cyanBright(`Evento "${event}" disparado com sucesso.`))

    const eventLog = new Table()

    eventLog.push(...response)

    console.log(eventLog.toString())

    await producer.disconnect()
  });

program.parse(process.argv);