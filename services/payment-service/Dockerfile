# Use Node.js 20 as the base image
FROM node:20

# Set the working directory inside the Docker image
WORKDIR /usr/src/app

# Copy the root-level package.json and package-lock.json for workspace linking
# Copy the service-specific package.json only
# Install all dependencies from root and services through workspaces
COPY package.json package-lock.json ./
COPY services/payment-service/package.json ./services/payment-service/
RUN npm install --legacy-peer-deps

# Copy the service source code only
COPY services/payment-service ./services/payment-service

# Copy the shared packages explicitly
COPY shared/shared-common ./shared/shared-common
COPY shared/shared-notification ./shared/shared-notification
COPY shared/shared-account-payment ./shared/shared-account-payment

# Build the TypeScript code (ensure build is inside service directory)
RUN npm run build --prefix ./services/payment-service

# Expose the application port
EXPOSE 3004

# Command to run the application
CMD ["npm", "run", "start", "--prefix", "./services/payment-service"]