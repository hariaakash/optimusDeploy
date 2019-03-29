# Build docker image for services.
docker-compose -f docker-compose.dev.yml build


# Make build images available on private registry.
services=("api" "orchestrator" "user" "mailer" "container")
MANAGER_IP=$(docker node inspect self --format '{{ .Status.Addr  }}')
for service in "${services[@]}"
do
    service="optimusdeploy_$service:dev"
    docker tag $service registry.local/$service
    docker push registry.local/$service
done

# Start Services Stack
docker stack deploy -c stack.dev.services.yml services