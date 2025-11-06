# Use official Apify Node.js image with Chromium
FROM apify/actor-node-chromium:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . ./

# Run the actor
CMD npm start
