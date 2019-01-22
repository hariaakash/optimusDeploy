# Optimus Deploy
[![Optimus Deploy Logo](https://optimuscp.io/img/logo.png)](https://optimuscp.io)

A cloud based easy infrastructure management solution.


### Requirements

  - docker > 17
  - docker-compose > 1.18

### Basics

#### Project Structure

```
.
+-- config          #Static files go here
+-- data            #Dynamically generated data from micros go here
|   +-- rabbitmq
|   +-- traefik
|   +-- mongodb
+-- services        #All micros go here
|   +-- starter
|   +-- ...         #More services
+-- readme.md
```

1. All static configuration files should go inside config directory.
2. Micro-services should be created inside services dir and on the micros network.
3. Applications deployed should be on apps network, if public then it should be shared with proxy network.
4. For preparing development or production environment follow their respective document block.

#### Development

1. Add necessary .local domains required to /etc/hosts.
2. Execute the below command to get the development environment setup.
```sh
docker-compose -f docker-compose.dev.yml up --build -d
```

#### Production

Execute the below command to get the production environment setup.
```sh
docker-compose -f docker-compose.pro.yml up --build -d
```

#### To create a micro-service

1. Create a clone of starter dir which is inside services dir.
2. Change the cloned service name and it's properties to whatever required.
3. Add that micro to both dev and pro by using the below yml block respectively.

#### Example yml for micros
```yml
    # Dev
starter:
    build:
        context: ./services/starter
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

#### Status Codes
- **200**: Success
- **400**: Client Error
- **500**: Server Error

#### RabbitMQ queue naming convention
Syntax: `origin_listenerFolder:listenerFile_destination`

Example Scenario: If communication originates from `orchestrator` microservice to `user` microservice, 
for the purpose of creation of user the `create` file lies inside the `profile` folder which goes inside `listeners` folder.

Queue Name: `orchestrator_profile:create_user`

Label:
- origin : orchestrator
- destination : user
- listenerFolder : profile
- listenerFile : create
