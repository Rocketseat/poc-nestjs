# POC: Nest.js (Back-end)

Esse projeto tem como propósito realizar uma POC (prova de conceito) da ferramenta **Nest.js** como alternativa para desenvolvimento dos projetos **back-end** na Rocketseat.

O projeto aqui detalhado tem como propósito testar única e exclusivamente a ferramenta e **não a performance individual** ou do grupo que o realizar, ou seja, nossa análise não será feita com a entrega do código e sim com **os feedbacks das pessoas envolvidas** em sua criação, ou seja, é super importante que ao longo do processo você vá criando uma **opinião própria** e anote suas dificuldades e pontos onde achou que a ferramenta lhe atendeu bem.

## Projeto

O projeto a ser desenvolvido será um serviço responsável por armazenar dados de vendas, seus produtos e informações de possíveis reembolsos.

Além de se comunicar com serviços externos para obter informações das vendas, o serviço também fornecerá uma forma de consulta dos dados cadastrados através de requisições HTTP.

O serviço deve permitir, através de HTTP, que o usuário autenticado cancele uma venda reembolsando o valor integral ao comprador.

Por último, a cada venda aprovada, o serviço deverá se comunicar com um terceiro serviço responsável pela emissão de notas fiscais dos pedidos enviando alguns dados da venda.

Ah, o nome desse projeto vai ser `Hidra` :)

## Ferramentas & conceitos

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

O Nest.js está [próximo de liberar](https://github.com/nestjs/nest/pull/6349) uma integração completa com API versioning.

### PostgreSQL

Além disso, é importante que o projeto desenvolvido tenha **testes de integração** (assim como acontece hoje no Skylab) e utilize banco de dados **PostgreSQL**.

### Autenticação

Para autenticação **não é necessário configurar uma tabela de usuários e todo processo de autenticação**, apenas crie uma verificação se existe um cabeçalho chamado "Authorization" e que dentro tenha algum token mesmo que aleatório.

