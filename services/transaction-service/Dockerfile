# Use Node.js 20 as the base image
FROM node:20

# Set the working directory inside the Docker image
WORKDIR /usr/src/app

# Copy the root-level package.json and package-lock.json for workspace linking
# Copy the service-specific package.json only
# Install all dependencies from root and services through workspaces
COPY package.json package-lock.json ./
COPY services/transaction-service/package.json ./services/transaction-service/
RUN npm install --legacy-peer-deps

# Copy the service source code only
COPY services/transaction-service ./services/transaction-service

# Copy the shared packages explicitly
COPY shared/shared-common ./shared/shared-common
COPY shared/shared-notification ./shared/shared-notification
COPY shared/shared-account-transaction ./shared/shared-account-transaction

# Build the TypeScript code (ensure build is inside service directory)
RUN npm run build --prefix ./services/transaction-service

# Expose the application port
EXPOSE 3003

# Command to run the application
CMD ["npm", "run", "start", "--prefix", "./services/transaction-service"]