# MongoDB Slave
docker run -d -p 37017:27017 -v /root/mongo:/data/db --name mongo hariaakash/op-mongo

# MySQL Slave
docker run -d -p 3306:3306 -v /root/mysql:/app/mysql --name mysql hariaakash/op-mysql