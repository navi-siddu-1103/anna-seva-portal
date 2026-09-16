FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install deps (use --legacy-peer-deps for compatibility)
RUN npm install --legacy-peer-deps

COPY . .

# Set memory limit AND disable telemetry BEFORE build
ENV NODE_OPTIONS=--max-old-space-size=1800
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

EXPOSE 8080

ENV PORT=8080

CMD ["npm", "start"]
