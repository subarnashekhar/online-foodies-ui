FROM node:24.11.1-alpine as builder

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH


COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.19.4-alpine

RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

#docker run -p 5173:80 online-foodies-admin-ui-docker:latest


CMD ["nginx", "-g", "daemon off;"]