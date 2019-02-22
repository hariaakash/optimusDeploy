## Optimus Deploy
[![Optimus Deploy Logo](https://optimuscp.io/img/logo.png)](https://optimuscp.io)

A cloud based easy infrastructure management solution.

## Table of Contents
- [Optimus Deploy](#optimus-deploy)
- [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Project Structure](#project-structure)
    - [Micros](#micros)
    - [Micros Structure](#micros-structure)
    - [Dedicated Ports](#dedicated-ports)
  - [Environment Setup](#environment-setup)
  - [Create Micros](#create-micros)
  - [Standards](#standards)
    - [Status Codes](#status-codes)
    - [RabbitMQ Queue Naming Convention](#rabbitmq-queue-naming-convention)
    - [Communication Request & Response](#communication-request--response)
  - [References](#references)

### Requirements

  - docker > 17
  - docker-compose > 1.18

### Project Structure

```
.
+-- config          #Static files go here
+-- data            #Dynamically generated data from micros go here
|   +-- rabbitmq
|   +-- traefik
|   +-- mongodb
+-- services        #All micros go here
|   +-- starter     #Reference
|   +-- service1
|   +-- ...         #More services
+-- vagrant         #For swarm dev setup
+-- readme.md
+-- docker-compose.*.yml
+-- package*.json   #Global packages required for development.
```

1. All static configuration files should go inside config directory.
2. Micro-services should be created inside services dir and on the micros network.
3. Applications deployed should be on apps network, if public then it should be shared with proxy network.
4. For preparing development or production environment follow their respective document block.

#### Micros
1. **api**<br>
   Express
2. **orchestrator**<br>
   Invoked by API and pipeline for the requests.
3. **user**<br>
4. **starter**<br>
   For reference

#### Micros Structure
```
.
+-- src
|   +-- helpers
|   +-- listeners/controllers
|   +-- schemas     #Optional
+-- index.js
+-- Dockerfile
+-- package*.json
```

#### Dedicated Ports
```
- 80, 443, 8080 : Traefik
- 5000          : Docker Registry
```

### Environment Setup
For Development:
1. Add necessary .local domains required to /etc/hosts.
2. Execute the below command to get the development environment setup.
```sh
docker-compose -f docker-compose.dev.yml up --build -d
```

For Production, execute the below command to get the production environment setup.
```sh
docker-compose -f docker-compose.pro.yml up --build -d
```

### Create Micros
1. Create a clone of starter dir which is inside services dir.
2. Change the cloned service name and it's properties to whatever required.
3. Add that micro to both dev and pro by using the below yml block respectively.

Example yml for micros
```yml
# Dev
starter:
    build:
        context: ./services/starter
        image: opdp-starter:dev
        args:
            NODE_ENV: development
    command: npm run dev
    environment:
        NODE_ENV: development
        AMQP_URI: amqp://rabbitmq
    volumes:
        - ./services/starter/src:/app/src
    restart: always
    depends_on:
        - rabbitmq
    networks:
        - micros
# Production
starter:
    build: ./services/starter
    image: opdp-starter:pro
    command: npm run start
    environment:
        NODE_ENV: production
        AMQP_URI: amqp://rabbitmq
    volumes:
        - ./services/starter/src:/app/src
    restart: always
    depends_on:
        - rabbitmq
    networks:
        - micros
```

### Standards

#### Status Codes
- **200**: Success
- **400**: Client Error
- **500**: Server Error

#### RabbitMQ Queue Naming Convention
Syntax: `origin_listenerFolder:listenerFile_destination`

Example Scenario: If communication originates from `orchestrator` microservice to `user` microservice, 
for the purpose of creation of user the `create` file lies inside the `profile` folder which goes inside `listeners` folder.<br>
Example Queue: `orchestrator_profile:create_user`

Labels:
- origin : orchestrator
- destination : user
- listenerFolder : profile
- listenerFile : create

#### Communication Request & Response
- Request Data: To API, API to Orchestrator & Orchestrator to Micros, Micros to Micros:
    ```js
    // /user/create
    { email: 'em@i.l', pass: 'haha1234' }
    ```
- Response Data: Micros to Orchestrator or Orchestrator to API or Micros to Micros
    ```js
    { status: 200, data: { msg: 'Data processed', data: [{}] } }
    { status: 200, data: { msg: 'Registered', authKey: 'ffff' } }
    { status: 400, data: { msg: 'Client Error' } }
    { status: 400, data: { msg: 'User not found' } }
    { status: 500, data: { msg: 'Server Error' } }
    ```

### References
- [Consul Traefik Setup](https://blog.ruanbekker.com/blog/2017/10/24/managing-traefik-configuration-with-consul-on-docker-swarm/)
- [Consul Traefik Setup 2](https://jmaitrehenry.ca/2017/12/15/using-traefik-with-docker-swarm-and-consul-as-your-load-balancer/)
- 