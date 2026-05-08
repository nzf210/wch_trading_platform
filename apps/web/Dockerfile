FROM node:20-alpine
WORKDIR /workspace

# Copy web app package and install
COPY apps/web/package*.json ./apps/web/
WORKDIR /workspace/apps/web
RUN npm install

# Copy all needed source files
WORKDIR /workspace
COPY packages ./packages
COPY apps/web ./apps/web

WORKDIR /workspace/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev"]
