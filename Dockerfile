# # Use the official Node.js image as the base image
# FROM node:18-alpine

# # Set the working directory inside the container
# WORKDIR /app

# # Install dependencies needed for Prisma
# RUN apk add --no-cache openssl

# # Copy package.json and pnpm-lock.yaml to the working directory
# COPY package.json  ./

# # Install dependencies
# # RUN npm ci --only=production=false



# # Copy the rest of the application code to the working directory
# COPY . .

# # Generate the Prisma client
# RUN npx prisma generate

# # Expose the port your app runs on
# EXPOSE 3000

# # Start the application
# CMD ["npm", "run", "dev"]



# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# # Install dependencies needed for Prisma
# RUN apk add --no-cache openssl

COPY package.json pnpm-lock.yaml ./


RUN npm install

COPY prisma ./prisma/

COPY . .

# Copy package.json and pnpm-lock.yaml to the working directory
# COPY package.json  ./

# Install dependencies
# RUN npm ci --only=production=false





# Generate the Prisma client
RUN npx prisma generate


# Start the application
CMD ["npm", "run", "dev"]