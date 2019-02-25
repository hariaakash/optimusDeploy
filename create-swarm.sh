#!/bin/bash

# COLORS
set_colors() {
    COLOR_GREEN="\e[32m"
    COLOR_RED="\e[31m"
    COLOR_BLUE="\e[34m"
    COLOR_DEFAULT="\e[0m"
    COLOR_SECONDARY="\e[37m"
}

# Check if the host is part of swarm manager, if not create it.
check_swarm() {
    if docker node ls > /dev/null 2>&1;
    then
        MANAGER_IP=$(docker node inspect self --format '{{ .Status.Addr  }}')
    else
        docker swarm init --advertise-addr ${MANAGER_IP} > /dev/null
    fi
}

# Change the IP to the docker manager ip for registry.local to be accessible
set_configs() {
    MANAGER_IP="192.168.43.66"
    file="./config/traefik/traefik.crt"
    SWARM_WORKERS=2
    SWARM_MEMORY=1024

    echo -e "\n${COLOR_SECONDARY}Following configuration will be used:-";
    echo -e "Workers: ${SWARM_WORKERS}"
    echo -e "Manager IP: ${MANAGER_IP}"
    echo -e "Cert file: ${file}${COLOR_DEFAULT}\n"
}

# Create workers
create_machines() {
    for (( server=1; server<=SWARM_WORKERS; server++ ));
    do
        echo -e "${COLOR_BLUE}worker${server}${COLOR_DEFAULT}: Machine being created."
        docker-machine create \
            --driver=virtualbox \
            --virtualbox-memory=${SWARM_MEMORY} \
            worker${server} > /dev/null
    done
}

# Configure machine
config_machines() {
    hostname="${MANAGER_IP} registry.local"
    cmd="echo '${hostname}' | sudo tee -a /etc/hosts"
    for (( server=1; server<=SWARM_WORKERS; server++ ));
    do
        echo -e "${COLOR_BLUE}worker${server}${COLOR_DEFAULT}: Setting certs and hostname"
        {
            echo -e "${COLOR_BLUE}worker${server}${COLOR_DEFAULT}: Copying files"
            docker-machine scp ${file} worker${server}:
            docker-machine ssh worker${server} sudo mv traefik.crt /var/lib/boot2docker/traefik.crt

            echo -e "${COLOR_BLUE}worker${server}${COLOR_DEFAULT}: Creating bootlocal.sh"
            docker-machine ssh worker${server} 'echo "#!/bin/sh" | sudo tee /var/lib/boot2docker/bootlocal.sh'
            docker-machine ssh worker${server} 'echo "cat /var/lib/boot2docker/traefik.crt >> /etc/ssl/certs/ca-certificates.crt" | sudo tee -a /var/lib/boot2docker/bootlocal.sh'
            docker-machine ssh worker${server} "echo '${cmd}' | sudo tee -a /var/lib/boot2docker/bootlocal.sh"
            docker-machine ssh worker${server} sudo chmod +x /var/lib/boot2docker/bootlocal.sh
        } > /dev/null

        echo -e "${COLOR_BLUE}worker${server}${COLOR_DEFAULT}: Restarting machine to apply changes."
        docker-machine restart worker${server} > /dev/null
    done
}

# List machine
list_machines() {
    docker-machine ls -f "Machine: {{.Name}} {{.State}} on {{.URL}}"
}

main() {
    set_colors
    # check_swarm
    set_configs
    create_machines
    config_machines
    list_machines
    echo -e "${COLOR_GREEN}DONE${COLOR_DEFAULT}"
}

main