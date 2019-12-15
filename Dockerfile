FROM node:12.13.1-alpine3.10

# Add some required packages
#   git: so we can `npm install` from Github
#   python3: for building sqlite3
#   build-base: for building bunyan and bunyan-syslogger (includes make and g++)
RUN apk add --update git openssh python3 build-base

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm install

# Copy source files
COPY src/ ./src/
RUN npm run build

# Start the app
CMD ["npm", "run", "host"]
