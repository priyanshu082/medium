# Use the Node.js Alpine base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for the 'workerd' binary
RUN apk add --no-cache libc6-compat

# Copy project files into the working directory
COPY . .

# Install Wrangler globally
RUN npm install -g wrangler

# Install project dependencies
RUN npm install

# Expose the port Wrangler will use (default: 8787)
EXPOSE 8787

# Run Wrangler using npx to ensure it uses the correct version
CMD ["npm", "run", "dev"]


#for passing env variables we can pass it during execution in terminal