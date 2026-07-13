FROM node:22-alpine
RUN npm install -g mcp-remote
ENTRYPOINT ["mcp-remote", "https://predictionmarketspicks.com/api/mcp/mcp"]
