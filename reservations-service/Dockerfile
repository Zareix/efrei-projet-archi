FROM node:19-alpine as builder

RUN npm -g install pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm run prisma generate
RUN pnpm run prebuild
RUN pnpm run build


FROM node:19-alpine as runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY ./public ./public
COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 8001

ENTRYPOINT ["/app/entrypoint.sh"]