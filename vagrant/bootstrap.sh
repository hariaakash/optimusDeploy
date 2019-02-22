echo "Bootstrap Started."

export DEBIAN_FRONTEND=noninteractive

echo "Event: Update"
apt-get update

echo "Event: Installing dependencies."
apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common

echo "Event: Add Docker repo"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

echo "Event: Check repo updates"
apt-get update

echo "Event: Installing Docker"
apt-get install -y docker-ce

echo "Event: Installing Docker Compose"
curl -fsSL https://github.com/docker/compose/releases/download/1.23.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

apt-get autoclean && apt-get autoremove

echo "Bootstrap Finished."