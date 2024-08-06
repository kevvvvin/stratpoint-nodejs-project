# Use Node.js 20 as the base image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# Build the TypeScript code
RUN tsc

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/index.js"]