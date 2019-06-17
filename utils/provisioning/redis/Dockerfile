FROM redis:5.0.4

MAINTAINER powerumc

COPY conf/redis.conf /etc/redis/conf/

EXPOSE 6379

CMD ["redis-server", "/etc/redis/conf/redis.conf", "--appendfsync", "no", "--save", "", "--appendonly", "no"]
