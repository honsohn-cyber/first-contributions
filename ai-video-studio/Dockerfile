# Single-image build for AI Video Studio: builds the React frontend, then
# packages it together with the Node/Express backend plus the system tools
# the video pipeline needs (ffmpeg, espeak-ng, a font for captions) into one
# container that serves the whole app on a single port. This is what lets
# the app be deployed with one click on a host like Render, Railway, or
# Fly.io — no separate frontend/backend services needed.

# ---- 1. Build the frontend ----
FROM node:22-slim AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- 2. Runtime image ----
FROM node:22-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg espeak-ng fonts-dejavu-core && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./

# Built frontend lands at /app/client/dist, which server/src/index.js looks
# for relative to itself (../../client/dist) and serves automatically.
COPY --from=client-build /build/client/dist /app/client/dist

ENV PORT=8787
ENV STORAGE_DIR=/app/server/storage
EXPOSE 8787

CMD ["node", "src/index.js"]
