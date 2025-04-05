# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the app
COPY . .

# Expose the port (same as in your Express app)
EXPOSE 3001

# Start the server
CMD ["yarn", "dev"]