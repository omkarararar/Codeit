# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.17.1

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Run the application as a non-root user.
USER node

# Copy server source files
COPY --chown=node:node server/ ./

# Expose the port that the application listens on.
EXPOSE 5000

# Run the application.
CMD npm start
