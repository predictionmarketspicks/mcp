# Local free-calculator build of the PredictionMarketsPicks Quant MCP server.
# A stdio MCP server with no network access — runs in any sandbox (this is what
# Glama's build test executes). The hosted server at
# https://predictionmarketspicks.com/api/mcp/mcp is canonical (adds 4 Pro tools).
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY . .
# MCP clients (and Glama's mcp-proxy wrapper) drive this over stdio.
CMD ["node", "src/index.js"]
