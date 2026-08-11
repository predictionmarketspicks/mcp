# PredictionMarketsPicks MCP

[![mcp MCP server](https://glama.ai/mcp/servers/predictionmarketspicks/mcp/badges/card.svg)](https://glama.ai/mcp/servers/predictionmarketspicks/mcp)

A hosted **Model Context Protocol** server that gives AI agents institutional-grade quant tools for **Kalshi** and **Polymarket** prediction markets — expected value, Kelly sizing, Bayesian updating, probability conversion, cross-platform arbitrage, live edge signals, NFL model-vs-market edges, and a full **2026 fantasy football draft assistant**. **23 tools — 16 free, 2 free-with-caps, 5 Pro.**

- **Endpoint (Streamable HTTP):** `https://predictionmarketspicks.com/api/mcp/mcp`
- **Registry name:** `com.predictionmarketspicks/quant` ([Model Context Protocol registry](https://registry.modelcontextprotocol.io))
- **Docs / landing page:** https://predictionmarketspicks.com/mcp
- **Manifest:** [`server.json`](./server.json) · also served at `https://predictionmarketspicks.com/.well-known/mcp/server.json`
- **Type:** Cloud service ☁️ · TypeScript 📇

## Demo

[**Watch the 40-second walkthrough**](https://youtu.be/ulgw1yUeP-Q) — connect the server with one command, then ask in plain English and get quarter-Kelly position sizing from `kelly_size` and a model-vs-Kalshi edge read from `nfl_edge`, returned inside the chat.

[![Watch the demo](https://svxqipncfupabpvxtlro.supabase.co/storage/v1/object/public/media/mcp/mcp-demo-poster.jpg)](https://youtu.be/ulgw1yUeP-Q)

This repo is the public home and documentation for the hosted server. The server is live — no install, no build. Point any MCP client at the endpoint above.

It also ships a **local, self-contained build of the six free calculators** (`src/`) — a stdio MCP server with no network access that runs in any sandbox. See [Run the free tier locally](#run-the-free-tier-locally). The Pro tools read live PMP edge engines and are only available on the hosted endpoint.

## Tools

The free tier is a set of stateless quant calculators plus the whole 2026 fantasy draft assistant. Pro tools read PredictionMarketsPicks' live edge engines and require an API key. Two tools sit in between (**Capped**): they answer without a key at a limited depth and return more with a free key (just an email, no card) at [/mcp/key](https://predictionmarketspicks.com/mcp/key).

| Tool | Tier | What it does |
|---|---|---|
| `calculate_ev` | Free | Expected-value edge on a contract from market price + your probability; returns edge % and a BUY / SELL / SKIP read. |
| `kelly_size` | Free | Optimal Kelly position size (full / half / quarter / eighth) from win probability, price, and bankroll, with a risk rating. |
| `bayes_update` | Free | Update a prior with one or more pieces of evidence via Bayes' theorem; returns the posterior and the per-step chain. |
| `convert_probability` | Free | Convert between implied probability, American odds, and decimal odds (American odds carry no commas). |
| `base_rate_gap` | Free | Compare a market price to the historical base rate for a class of events; returns the gap in points + sample-size quality. |
| `combo_edge` | Free | Grade a same-game multi-leg combo: EV %, fair vs offered odds, and a negative-correlation-trap flag. Renders as an interactive card in supported hosts. |
| `nfl_power_ratings` | Free | Gridiron Edge Rating (GER) for all 32 NFL teams — a defense-adjusted power rating with offense/defense/special-teams splits. |
| `nfl_win_probability` | Free | Turn an NFL spread and total into win probability, projected score, cover probability, and over/under probability. |
| `draft_board` | Free | The 2026 half-PPR fantasy draft board — every player ranked, blending the projection model with consensus ADP. |
| `best_available` | Free | Best players still on the board given the current pick and who's already gone. |
| `player_outlook` | Free | One player's 2026 outlook: projected points, floor/ceiling, boom/bust odds, and a SLEEPER / BUST read. |
| `explain_player` | Free | Why the board ranks a player where it does — our model rank vs consensus ADP vs the published blend, the edge between them, and what the projection does and does not model. |
| `compare_players` | Free | Compare 2–4 players side by side — projection, floor/ceiling, ADP, and draft round. |
| `sleepers_and_busts` | Free | The biggest gaps between the model and consensus ADP for 2026. |
| `who_do_i_draft` | Free | The single best pick right now given your roster and pick number. |
| `adp_market_gaps` | Free | Players whose Average Draft Position swings most between platforms — consensus vs ESPN, Sleeper, Yahoo. |
| `find_arbitrage` | Capped | Cross-platform price gaps between Kalshi and Polymarket on the same sports contract (NBA, NHL, MLB, World Cup). No key returns the single largest gap in full detail; a free key returns the top 3; Pro returns the whole board. |
| `market_pulse` | Capped | US macro-health composite (0–100) and regime — free without a key, always — plus the six category scores: 2 without a key, 4 with a free key, all six on Pro. |
| `commodity_edge` | Pro | Largest model edge on a Kalshi weekly-silver or twice-daily bitcoin strike, as a trade ticket (side, price, criterion, edge, tier, ¼-Kelly). |
| `scan_mispricings` | Pro | Polymarket contracts trading away from the PMP model, with direction, edge in points, and quarter-Kelly sizing. |
| `nfl_edge` | Pro | Where the PMP NFL model disagrees with live Kalshi prices — game lines, win-total futures, MVP, championship. |
| `nfl_prop_edge` | Pro | NFL player-prop edges — model projection vs the Kalshi prop line (passing, rushing, receiving yards). |
| `edge_alerts` | Pro | The edge alerts our models generate on Kalshi — weather, bitcoin/silver/gold/oil, and mispricings — as a live feed. |

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

The 16 free tools work with no key. Pro tools require a PredictionMarketsPicks API key — see https://predictionmarketspicks.com/mcp.

## Run the free tier locally

The six core free calculators run entirely offline as a stdio MCP server — no key, no network. Useful for air-gapped agents, testing, or sandboxed hosts.

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

Point a stdio MCP client at `node src/index.js` (or the container). The local build ships the six core calculators only; the other 17 tools (draft assistant, NFL models, and the Pro edge engines) read live PMP data and are hosted-only — use the endpoint above.

## About

Built by [PredictionMarketsPicks](https://predictionmarketspicks.com) — independent quant tools and edge analysis for Kalshi and Polymarket, published by The 7 Oracles.

## License

MIT — see [`LICENSE`](./LICENSE). The hosted service and its live data are operated by PredictionMarketsPicks; this repository covers the server's public interface and documentation.
