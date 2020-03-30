FROM ubuntu:18.04

RUN apt-get update
# install nodeJS and npm.
RUN apt-get install -y \
        nodejs \
        curl \
        npm \
        gnupg2

# install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install -y yarn

RUN yarn global add typescript

# install ttyd.
RUN apt-get install -y \
        yarn \
        make \
        g++ \
        cmake \ 
        pkg-config \
        git \
        vim-common \
        libwebsockets-dev \
        libjson-c-dev \
        libssl-dev \
    && git clone https://github.com/tsl0922/ttyd.git \
    && cd ttyd \
    && mkdir build \
    && cd build \ 
    && cmake .. \
    && make \
    && make install


# copy Server Code.
RUN mkdir /server
ADD package.json /server
ADD ./src /server/src
ADD ./html /server/html
ADD ./@types /server/@types
ADD ./tsconfig.json /server/tsconfig.json
ADD ./jest.config.js /server/jest.config.js

WORKDIR /server
RUN yarn

CMD ["yarn", "start"]