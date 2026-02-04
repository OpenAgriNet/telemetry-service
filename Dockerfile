FROM node:8.11-alpine as builder

# create app directory in container
RUN mkdir -p /app

# set /app directory as default working directory
WORKDIR /app

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD ./src/ /app/

RUN npm install

# --pure-lockfile: Don’t generate a yarn.lock lockfile
#RUN yarn --pure-lockfile

# copy all file from current dir to /app in container
COPY . /app/

FROM node:8.11-alpine

WORKDIR /app

COPY --from=builder /app/ .
COPY --from=builder /app/node_modules/ ./node_modules/

# expose port 4000
EXPOSE 8181

# cmd to start service
CMD [ "node", "app.js"]
