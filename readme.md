# Optimus Deploy
[![Optimus Deploy Logo](https://optimuscp.io/img/logo.png)](https://optimuscp.io)

A cloud based easy infrastructure management solution.


### Requirements

  - docker > 17
  - docker-compose > 1.18


### Development
```sh
docker-compose -f docker-compose.dev.yml up --build -d
```

### Production
```sh
docker-compose -f docker-compose.yml up --build -d
```

## Traefik Alpha
```sh
docker-compose -f docker-compose-traefik.yml up -d
```