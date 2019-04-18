# Build docker image for services.
build_images() {
    docker-compose -f docker-compose.dev.yml build
}

# Make build images available on private registry.
tag_images() {
    services=("api" "orchestrator" "user" "mailer" "container")
    MANAGER_IP=$(docker node inspect self --format '{{ .Status.Addr  }}')
    for service in "${services[@]}"
    do
        service="optimusdeploy_$service:dev"
        docker tag $service registry.local/$service
        docker push registry.local/$service
    done
}

# Makesure directories exists for volumes.
make_dirs() {
    mkdir -p /srv/daemon-data
    mkdir -p /srv/utils
    mkdir -p /srv/utils/registry
    mkdir -p /srv/utils/consul-leader
    mkdir -p /srv/utils/traefik && touch /srv/utils/traefik/access.json
    mkdir -p /srv/elastic/es && chown 1000:1000 /srv/elastic/es
}

# Start stacks
start_stacks() {
    docker stack deploy -c stack.dev.utils.yml utils
    docker stack deploy -c stack.elastic.yml elastic
    docker stack deploy -c stack.elastic.beats.yml beats
    docker stack deploy -c stack.dev.services.yml services
}

main() {
    make_dirs
    build_images
    tag_images
    start_stacks
}

main