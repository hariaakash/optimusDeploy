# Build docker image for services.
docker-compose -f docker-compose.dev.yml build

# Start Utils Stack
docker stack deploy -c stack.dev.utils.yml utils

# Make build images available on private registry.
services=("api" "orchestrator" "user" "mailer" "container")
MANAGER_IP=$(docker node inspect self --format '{{ .Status.Addr  }}')
for service in "${services[@]}"
do
    service="optimusdeploy_$service:dev"
    docker tag $service registry.local:5000/$service
    docker push registry.local:5000/$service
done

# Start Services Stack
docker stack deploy -c stack.dev.services.yml services