FROM zenika/alpine-chrome:13

USER root
RUN apk add --no-cache make gcc g++ python git nodejs nodejs-npm yarn \
	&& rm -rf /var/lib/apt/lists/* \
    /var/cache/apk/* \
    /usr/share/man \
    /tmp/*
USER chrome
