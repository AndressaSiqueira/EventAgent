FROM crcommunitydashansi.azurecr.io/base/node:20-bookworm AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM crcommunitydashansi.azurecr.io/base/node:20-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./package.json
EXPOSE 8080
CMD ["npm", "start"]
