#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const { Kafka } = require('kafkajs');
const Table = require('cli-table')
const package = require('./package.json');

program.version(package.version);

const kafkaTopics = ['ignite', 'experts'];

const kafka = new Kafka({
  clientId: 'sample-consumer',
  brokers: ['localhost:9092'],
})

program
  .command('setup')
  .description('Setup Kafka topics')
  .action(async () => {
    const admin = kafka.admin()

    await admin.connect();

    const topics = await admin.listTopics()
    const topicsToCreate = kafkaTopics.filter(topic => !topics.includes(topic))

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate.map(topic => {
          return { topic };
        }) 
      })

      console.log(chalk.cyan(`Topics ${topicsToCreate.join(', ')} created successfully.`));
    } else {
      console.log(chalk.yellowBright('No topics to be created.'))
    }


    await admin.disconnect();
  })

program
  .command('listen [topic]')
  .description('Ouve eventos do Kafka')
  .action(async (topic) => {
    const consumer = kafka.consumer({
      groupId: 'custom-consumer'
    })

    try {
      console.log(chalk.yellowBright(`Initializing consumer, please wait...`))

      await consumer.connect()

      await consumer.subscribe({ topic, fromBeginning: true })

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log(chalk.blueBright(`New message on topic ${topic}`));
          console.log(JSON.stringify(JSON.parse(message.value.toString()), null, 2))
        },
      })
      
      console.log(chalk.cyan(`Listening to topic ${topic}.`))
    } catch (err) {
      console.log(chalk.redBright('Error'));
      console.log(err);
    } finally {
      // await consumer.disconnect()
    }
  });

program.parse(process.argv);