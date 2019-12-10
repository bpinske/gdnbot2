FROM node:12.13.1

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .
RUN npm run build

# Start the app
CMD ["npm", "run", "host"]
