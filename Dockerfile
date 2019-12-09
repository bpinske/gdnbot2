FROM node:10.17.0

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Start the app
CMD ["npm", "start"]
