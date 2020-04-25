FROM oraclelinux:7-slim

ARG release=19
ARG update=5

RUN yum -y install curl \
&& mkdir -p /app \
&& curl --silent --location https://rpm.nodesource.com/setup_10.x | bash - \
&& yum -y install nodejs \
&&  yum -y install oracle-release-el7 && yum-config-manager --enable ol7_oracle_instantclient && \
yum -y install oracle-instantclient${release}.${update}-basic oracle-instantclient${release}.${update}-devel oracle-instantclient${release}.${update}-sqlplus && \
     rm -rf /var/cache/yum


COPY . /app
WORKDIR /app

RUN npm install


EXPOSE 6001
CMD ["node", "server.js"]

# docker build -t 52.117.54.217/oracledbnode:1.0.0 -f dockerFile-oracleClient . 
# docker run -it -d --name oraclenode -p 6001:6001 migutak/oracledbnode:1.0.0