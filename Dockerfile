FROM node:22-alpine

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Let Next generate build-specific type references instead of carrying dev-server-only imports.
COPY next.config.ts tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/
RUN pnpm build

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

EXPOSE 3000
CMD ["pnpm", "start"]
