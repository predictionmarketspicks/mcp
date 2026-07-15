# PredictionMarketsPicks MCP

[![mcp MCP server](https://glama.ai/mcp/servers/predictionmarketspicks/mcp/badges/card.svg)](https://glama.ai/mcp/servers/predictionmarketspicks/mcp)

A hosted **Model Context Protocol** server that gives AI agents institutional-grade quant tools for **Kalshi** and **Polymarket** prediction markets — expected value, Kelly sizing, Bayesian updating, probability conversion, cross-platform arbitrage, and live edge signals.

- **Endpoint (Streamable HTTP):** `https://predictionmarketspicks.com/api/mcp/mcp`
- **Registry name:** `com.predictionmarketspicks/quant` ([Model Context Protocol registry](https://registry.modelcontextprotocol.io))
- **Docs / landing page:** https://predictionmarketspicks.com/mcp
- **Manifest:** [`server.json`](./server.json) · also served at `https://predictionmarketspicks.com/.well-known/mcp/server.json`
- **Type:** Cloud service ☁️ · TypeScript 📇

This repo is the public home and documentation for the hosted server. The server is live — no install, no build. Point any MCP client at the endpoint above.

It also ships a **local, self-contained build of the six free calculators** (`src/`) — a stdio MCP server with no network access that runs in any sandbox. See [Run the free tier locally](#run-the-free-tier-locally). The four Pro tools read live PMP edge engines and are only available on the hosted endpoint.

## Tools

The free tier is a set of stateless quant calculators. Pro tools read PredictionMarketsPicks' live edge engines and require an API key.

| Tool | Tier | What it does |
|---|---|---|
| `calculate_ev` | Free | Expected-value edge on a contract from market price + your probability; returns edge % and a BUY / SELL / SKIP read. |
| `kelly_size` | Free | Optimal Kelly position size (full / half / quarter / eighth) from win probability, price, and bankroll, with a risk rating. |
| `bayes_update` | Free | Update a prior with one or more pieces of evidence via Bayes' theorem; returns the posterior and the per-step chain. |
| `convert_probability` | Free | Convert between implied probability, American odds, and decimal odds (American odds carry no commas). |
| `base_rate_gap` | Free | Compare a market price to the historical base rate for a class of events; returns the gap in points + sample-size quality. |
| `combo_edge` | Free | Grade a same-game multi-leg combo: EV %, fair vs offered odds, and a negative-correlation-trap flag. |
| `find_arbitrage` | Pro | Cross-platform price gaps between Kalshi and Polymarket on the same sports contract (NBA, NHL, MLB, World Cup). |
| `market_pulse` | Pro | US macro-health composite (0–100) and regime, plus six category scores. |
| `commodity_edge` | Pro | Largest model edge on a Kalshi weekly-silver or twice-daily bitcoin strike, as a trade ticket (side, price, criterion, edge, tier, ¼-Kelly). |
| `scan_mispricings` | Pro | Polymarket contracts trading away from the PMP model, with direction, edge in points, and quarter-Kelly sizing. |

All tool descriptions and outputs use prediction-market terminology (trader / position / contract / market analysis).

## Connect

**Claude Code**

```
claude mcp add --transport http predictionmarketspicks https://predictionmarketspicks.com/api/mcp/mcp
```

**Claude.ai, ChatGPT, or Cursor** — add a custom connector / MCP server with the URL:

```
https://predictionmarketspicks.com/api/mcp/mcp
```

The free calculators work with no key. Pro tools require a PredictionMarketsPicks API key — see https://predictionmarketspicks.com/mcp.

## Run the free tier locally

The six free calculators run entirely offline as a stdio MCP server — no key, no network. Useful for air-gapped agents, testing, or sandboxed hosts.

```
npm install
npm start          # stdio MCP server: 6 free tools
npm run smoke      # end-to-end self-test
```

Or with Docker:

```
docker build -t pmp-mcp-quant .
docker run --rm -i pmp-mcp-quant
```

Point a stdio MCP client at `node src/index.js` (or the container). For the full ten-tool experience including the live Pro edge engines, use the hosted endpoint above.

## About

Built by [PredictionMarketsPicks](https://predictionmarketspicks.com) — independent quant tools and edge analysis for Kalshi and Polymarket, published by The 7 Oracles.

## License

MIT — see [`LICENSE`](./LICENSE). The hosted service and its live data are operated by PredictionMarketsPicks; this repository covers the server's public interface and documentation.
