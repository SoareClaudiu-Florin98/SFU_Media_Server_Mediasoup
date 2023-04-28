FROM ubuntu

# Install DEB dependencies and others.
RUN \
	set -x \
	&& apt-get update \
	&& apt-get install -y net-tools build-essential python3 python3-pip valgrind

WORKDIR /usr/src
COPY package.json .
COPY src .
COPY tsconfig.json .

RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm install
RUN npm install watchify

EXPOSE 3000
EXPOSE 2000-2020
EXPOSE 10000-10100