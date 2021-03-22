#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const faker = require('faker');
const { Kafka } = require('kafkajs');
const Table = require('cli-table')
const { v4: uuid } = require('uuid')
const package = require('./package.json');

program.version(package.version);

const kafkaTopics = ['ignite', 'experts', 'hidra.purchase', 'hidra.refund'];

const availableEvents = new Set([
  'purchase',
  'refund',
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
  .command('send [event]')
  .description('Envia um evento ao Kafka')
  .option('-p --product <productId>', 'Set product ID', 'ignite')
  .option('-pid --purchase-id <purchaseId>', 'Set purchase ID')
  .option('-cid --customer-id <customerId>', 'Set customer ID')
  .action(async (event, options) => {
    if (!availableEvents.has(event)) {
      console.log(chalk.redBright(`Evento "${event}" não suportado.`))
      return;
    }

    const producer = kafka.producer()

    try {
      let response = [];

      switch (event) {
        case 'purchase':
          const purchaseId = options.purchaseId ?? uuid();
          const customerId = options.customerId ?? uuid();

          const products = {
            ignite: { id: 'ignite', amount: 1980, type: 'onetime' },
            experts: { id: 'experts', amount: 37, type: 'recurring' }
          }

          const purchase = {
            id: purchaseId,
            customer: {
              id: customerId,
              name: faker.name.findName(),
              email: faker.internet.email(),
              address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
              }
            },
            product: products[options.product],
            createdAt: new Date().toISOString()
          }

          console.log(purchase)
          
          await producer.connect()

          response = await producer.send({
            topic: 'hidra.purchase',
            messages: [
              { value: JSON.stringify(purchase) },
            ],
          })

          break;
        case 'refund':
          if (!options.purchaseId) {
            console.log(chalk.redBright('Purchase ID is required, set it with --purchase-id 123'))
            return;
          }

          const refund = {
            id: uuid(),
            purchaseId: options.purchaseId,
            createdAt: new Date().toISOString()
          }

          console.log(refund)

          await producer.connect()

          response = await producer.send({
            topic: 'hidra.refund',
            messages: [
              { value: JSON.stringify(refund) },
            ],
          })

          break;
        default:
          break;
      }

      console.log(chalk.cyanBright(`Evento "${event}" disparado com sucesso.`))

      const eventLog = new Table()

      eventLog.push(...response)

      console.log(eventLog.toString())
    } catch (err) {
      console.log(chalk.redBright('Error'));
      console.log(err);
    } finally {
      await producer.disconnect()
    }
  });

program.parse(process.argv);