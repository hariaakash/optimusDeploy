# Gluster

Storage Cluster

## Setup

1. Update System
```
apt update
apt upgrade
```
2. Setup friendly hostnames:
```
#/etc/hosts
XX.XX.XX.XX    node1
XX.XX.XX.XX    node2
XX.XX.XX.XX    node3
```
1. Install Glusterfs
```
apt install -y glusterfs-server
```
1. Start Glusterfs
```
sudo systemctl start glusterd
sudo systemctl enable glusterd
```

## Creating Cluster

Setup by probing servers from one main node.
```
# From node1
gluster peer probe node2
gluster peer probe node3
```

## Commands list
```
gluster peer status
gluster pool list
gluster volume info name
```

## References

- Docs: 
- Setup Ex 1: http://embaby.com/blog/using-glusterfs-docker-swarm-cluster/
- Setup Ex 2: https://www.howtoforge.com/tutorial/high-availability-storage-with-glusterfs-on-ubuntu-1804/
- Setup Ex 3: https://www.ionos.com/community/server-cloud-infrastructure/docker/using-gluster-for-a-distributed-docker-storage-volume/