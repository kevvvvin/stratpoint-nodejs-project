# Use Node.js 20 as the base image
FROM node:20

# Set the working directory inside the Docker image
WORKDIR /usr/src/app

# Copy the root-level package.json and package-lock.json for workspace linking
# Copy the service-specific package.json only
# Install all dependencies from root and services through workspaces
COPY package.json package-lock.json ./
COPY services/notification-service/package.json ./services/notification-service/
RUN npm install --legacy-peer-deps

# Copy the service source code only
COPY services/notification-service ./services/notification-service

# Copy the shared packages explicitly
COPY shared/shared-common ./shared/shared-common
COPY shared/shared-notification ./shared/shared-notification

# Build the TypeScript code (ensure build is inside service directory)
RUN npm run build --prefix ./services/notification-service

# Expose the application port
EXPOSE 3006

# Command to run the application
CMD ["npm", "run", "start", "--prefix", "./services/notification-service"]