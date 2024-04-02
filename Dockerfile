# Use an official Node runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy your application files to the container.
COPY . .

# Install application dependencies.
RUN npm install

# Expose the port that your Express server will listen on.
EXPOSE 3001

# Define environment variables, if needed.

# Command to start your Node.js application.
CMD ["node", "api-getaway.js"]
