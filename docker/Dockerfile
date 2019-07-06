FROM node
ADD app/ /data/app
WORKDIR /data/app
RUN yarn install --registry=https://registry.npm.taobao.org
EXPOSE 8080
CMD [ "npm", "run", "start"]