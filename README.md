# POC: Nest.js (Back-end)

Esse projeto tem como propósito realizar uma POC (prova de conceito) da ferramenta **Nest.js** como alternativa para desenvolvimento dos projetos **back-end** na Rocketseat.

O projeto aqui detalhado tem como propósito testar única e exclusivamente a ferramenta e **não a performance individual** ou do grupo que o realizar, ou seja, nossa análise não será feita com a entrega do código e sim com **os feedbacks das pessoas envolvidas** em sua criação, ou seja, é super importante que ao longo do processo você vá criando uma **opinião própria** e anote suas dificuldades e pontos onde achou que a ferramenta lhe atendeu bem.

- [Projeto](#projeto)
- [Ferramentas e conceitos](#ferramentas-e-conceitos)
  - [GraphQL](#graphql)
  - [Kafka](#kafka)
  - [API Versioning](#api-versioning)
  - [PostgreSQL](#postgresql)
  - [Autenticação](#autenticação)
- [Setup do projeto](#setup-do-projeto)
- [Integração com Kafka](#integração-com-kafka)
  - [Configurando producer](#configurando-producer)
  - [Produzindo mensagens](#produzindo-mensagens)
  - [Formato das mensagens](#formato-das-mensagens)
  - [Exemplos de eventos](#exemplos-de-eventos)
- [Boa sorte](#boa-sorte)

## Projeto

O projeto receberá informações sobre vendas e reembolsos através de um sistema de mensageria assíncrona que detalharemos mais a frente, essas mensagens conterão dados da venda, produtos e cliente que deverão ser armazenados em um banco de dados.

Além de se comunicar com serviços externos para obter informações das vendas, o serviço também fornecerá uma forma de consulta dos dados cadastrados através de requisições HTTP.

O serviço deve permitir, através de HTTP, que o usuário autenticado cancele uma venda alterando seu status para cancelado e criando um novo reembolso para aquela venda.

Além de receber mensagens de serviços externos, o app deverá também se comunicar com outras aplicações externas (Ignite e Experts) quando novas compras ou reembolsos relacionados a esses produtos forem cadastrados para, então, liberar ou remover o acesso da pessoa nos produtos.

Ah, o nome desse projeto vai ser `Hidra` :)

## Ferramentas e conceitos

O objetivo dessa POC é testar principalmente o Nest.js, mas com ele vamos aproveitar para testar algumas ferramentas e conceitos que temos interesse de adotar dentro das aplicações internas, que são:

### GraphQL

Como percebemos, cada vez mais temos vários clientes consumindo as mesmas APIs e logo teremos aplicativos mobile também e, com isso, uma API RESTful acaba se tornando mais limitada para conseguir servir os dados para múltiplos clientes de uma forma escalável.

O GraphQL visa resolver esse e outros problemas permitindo que o front-end determine quais dados quer que sejam retornados do back-end evitando problemas over fetching (trazer dados que não são usados na interface) e under fetching (trazer dados de menos tendo que fazer mais requisições para o back-end).

O Nest.js possui uma [integração direta com o GraphQL](https://docs.nestjs.com/graphql/quick-start).

### Kafka

Outra ideia interna é começar a separar mais as aplicações em estruturas de serviços que serão responsáveis por uma parte menor de responsabilidades e, para isso, precisamos ter uma forma dos serviços se comunicarem entre si.

O Kafka é um sistema de mensageria assíncrona que nos permite comunicar duas aplicações diferentes de forma escalável.

Imagine o Kafka como um sistema de pub/sub ou de filas, mas mais focado em comunicação entre serviços back-end.

O Nest.js possui uma [integração direta com o Kafka](https://docs.nestjs.com/microservices/kafka).

### API Versioning

É muito comum, quando temos vários clientes para o mesmo back-end, que as informações retornadas do servidor acabem impactando a experiência da aplicação front-end.

Imagine que seu front-end precise da listagem dos usuários com o endereço, mas em algum momento o campo de endereço vira um vetor já que agora o usuário pode possuir mais de um endereço. Quanto temos mais de um front-end consumindo essa informação, é difícil manter todos projetos sincronizados para consumirem a informação com o novo formato e por isso é importante mantermos versões da nossa API a fim de não quebrar os clientes que ainda estiverem consumindo o formato anterior.

Nessa POC não faremos o API versioning ainda, mas é importante entender sua motivação, pois nos projetos reais provavelmente iremos utilizar esse conceito.

O Nest.js está [próximo de liberar](https://github.com/nestjs/nest/pull/6349) uma forma de definirmos prefixos nas rotas dentro dos controllers facilitando o API versioning.

### PostgreSQL

Além disso, é importante que o projeto desenvolvido tenha **testes de integração** (assim como acontece hoje no Skylab) e utilize banco de dados **PostgreSQL**.

### Autenticação

Para autenticação **não é necessário configurar uma tabela de usuários e todo processo de autenticação**, apenas crie uma verificação se existe um cabeçalho chamado "Authorization" e que dentro tenha algum token mesmo que aleatório.

## Setup do projeto

O primeiro passo é criar o projeto Nest dentro da pasta `packages` utilizando a CLI do Nest.js (é preciso instala-la de forma global). 

Você pode acessar a pasta `packages` e executar:

```sh
nest new hidra
```

Agora, para executar o sistema de mensageria (Kafka) e o banco de dados PostgreSQL que serão usados pela aplicação utilize o Docker Compose (é necessário instalar o Docker e o Docker Compose em sua máquina):

Na pasta raiz do projeto, execute:

```sh
docker compose up -d
```

Você pode conferir que todos containers foram criados utilizando `docker ps` e acessar os logs de um container com `docker logs {container_id}`.

O Kafka está acessível na porta `9092` e o PostgreSQL na porta `5432`.

Credenciais do PostgreSQL:
```
- USERNAME=docker
- PASSWORD=docker
- DATABASE=hidra
```

Agora com o projeto criado é mão na massa e daqui pra frente é com vocês! :)

Lembre-se, o intuito é você ter a **experiência completa** de entender a documentação do Nest.js e demais ferramentas e como configurar tudo do zero, o seu feedback do quanto isso foi fácil ou difícil é super importante pra gente.

## Integração com Kafka

Para conseguir testar que sua aplicação está ouvindo as mensagens do Kafka é importante que exista uma outra aplicação produzindo as mensagens.

Dentro do Kafka temos 3 principais conceitos:

- Topic: um canal por onde as mensagens são enviadas ou consumidas;
- Producer: aplicação que produz as mensagens para o tópico;
- Consumer: aplicação que consome as mensagens do tópico;

A sua aplicação com Nest.js fará o papel de consumer e irá consumir mensagens do tópico `hidra` que será configurado de forma automática logo.

Para produzir as mensagens criamos um projeto em Node.js extremamente simples que funciona como uma CLI e está dentro da pasta `packages/producer`.

### Configurando producer

Dentro da pasta do projeto `producer` vamos começar instalando as dependências do projeto com `yarn` e, logo após, você pode executar o comando `yarn link producer`. 

Com isso você já deve conseguir executar o projeto de forma global no seu terminal:

```sh
producer --version
```

Esse comando deve retornar a versão atual do producer.

Agora vamos executar o comando `producer setup` que vai criar os tópicos `hidra`, `ignite` e `experts` dentro do Kafka (esse comando pode ser executado mais de uma vez pois não cria o mesmo tópico duas vezes).

### Produzindo mensagens

Ainda no producer você pode produzir mensagens para o tópico do Kafka utilizando o comando `producer send` seguido do evento que quer disparar, por exemplo, `producer send purchase`.

⚠ É importante salientar que as mensagens enviadas pro Kafka que não forem consumidas por nenhuma aplicação são armazenadas em um banco de dados e enviadas novamente no futuro, então é legal testar esses comandos somente quanto sua aplicação consumidora já estiver executando. ⚠

| Event         | Action                             |
| ------------- |-----------------------------------:|
| purchase      | Send a kafka message of a purchase |
| refund        | Send a kafka message of a refund   |

#### Exemplos de eventos

```sh
producer send purchase --product ignite
producer send purchase --product experts
producer send purchase --product ignite --purchase-id p-1 --customer-id c-1

producer send refund --purchase-id p-1
```

#### Formato das mensagens

Toda `purchase` contém dados como os seguintes:

```json
{
  "id": "14245d40-8e83-4786-9e73-b52dba1f60e0",
  "customer": {
    "id": "4f1ba105-8455-4fe2-9ace-28aac3733797",
    "name": "Mattie Kohler",
    "email": "Donato.Stehr@yahoo.com",
    "address": { 
      "street": "Jonathan Plain", 
      "city": "Cartwrightburgh", 
      "state": "KS"
    }
  },
  "product": { 
    "id": "ignite", 
    "amount": 1980, 
    "type": "onetime"
  },
  "createdAt": "2021-03-22T17:21:06.246Z"
}
```

Todo `refund` contém dados como os seguintes:

```json
{
  "id": "19c6b0f7-4bb2-49ec-85bf-00ff185d7ed8",
  "purchaseId": "14245d40-8e83-4786-9e73-b52dba1f60e0",
  "createdAt": "2021-03-22T17:22:32.471Z"
}
```



## Boa sorte

Como explicado no documento, a ideia desse projeto é testar AS FERRAMENTAS abordadas aqui e não sua capacidade em desenvolver utilizando-as.

Por isso, sempre que tiver alguma dúvida sobre a ideia da POC e todo texto aqui colocado, chame a gente (Diego ou João)!

É super importante que você desenvolva a aplicação sempre em conjunto para que todas pessoas tenham a experiência completa de trabalhar com as ferramentas propostas.