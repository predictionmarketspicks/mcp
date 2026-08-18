# PredictionMarketsPicks MCP

[![npm](https://img.shields.io/npm/v/@predictionmarketspicks/mcp)](https://www.npmjs.com/package/@predictionmarketspicks/mcp)
[![mcp MCP server](https://glama.ai/mcp/servers/predictionmarketspicks/mcp/badges/card.svg)](https://glama.ai/mcp/servers/predictionmarketspicks/mcp)

A hosted **Model Context Protocol** server that gives AI agents quant tools for **Kalshi** and **Polymarket** prediction markets — expected value, Kelly sizing, Bayesian updating, probability conversion, cross-platform price gaps, live edge signals, and a 2026 NFL fantasy draft assistant.

**Every signal our engines publish is graded against the market that priced it: 1,612 decided signals, +$98.40 net on a flat one-contract stake, as of Aug 18, 2026 — published per tool, including the engines that lose money.** → [predictionmarketspicks.com/track-record](https://predictionmarketspicks.com/track-record)

- **Endpoint (Streamable HTTP):** `https://predictionmarketspicks.com/api/mcp/mcp`
- **Registry name:** `com.predictionmarketspicks/quant` ([MCP registry](https://registry.modelcontextprotocol.io))
- **Docs / landing page:** https://predictionmarketspicks.com/mcp
- **23 tools** — 16 free, 5 Pro, 2 free-with-depth-caps. No key needed for the free set.

## Connect

**Any host that speaks Streamable HTTP** (Claude Code, Claude.ai, ChatGPT, Cursor) — point it at the URL. Nothing to install:

```
claude mcp add --transport http predictionmarketspicks https://predictionmarketspicks.com/api/mcp/mcp
```

**Hosts that only speak stdio** — this package bridges one to the other:

```jsonc
{
  "mcpServers": {
    "predictionmarketspicks": {
      "command": "npx",
      "args": ["-y", "@predictionmarketspicks/mcp"]
    }
  }
}
```

That relays the hosted server verbatim — all 23 tools, live data, tool schemas and result payloads untouched. Set `PMP_API_KEY` in the server's `env` to unlock the Pro tools; without one you get the free tools at free depth.

```
npx @predictionmarketspicks/mcp            # bridge to the hosted quant server (default)
npx @predictionmarketspicks/mcp --draft    # bridge to the fantasy-draft server instead
npx @predictionmarketspicks/mcp --local    # 6 calculators, offline, no network at all
```

`--local` is a self-contained build of the six stateless calculators. It makes no network calls, so it runs in an air-gapped sandbox — but it cannot serve the live engines, the draft desk, or anything that reads a market.

## Tools

Free tools need no key. Pro tools read the live PMP edge engines and require a PredictionMarketsPicks API key ([$14.99/mo](https://predictionmarketspicks.com/pricing)). A [free key](https://predictionmarketspicks.com/mcp/key) raises the depth caps on the list-shaped tools.

### Calculators — free, stateless, also available offline via `--local`

| Tool | What it does |
|---|---|
| `calculate_ev` | Expected-value edge on a contract from market price + your probability; returns edge % and a BUY / SELL / SKIP read. |
| `kelly_size` | Kelly position size (full / half / quarter / eighth) from win probability, price, and bankroll, with a risk rating. |
| `bayes_update` | Update a prior with one or more pieces of evidence; returns the posterior and the per-step chain. |
| `convert_probability` | Convert between implied probability, American odds, and decimal odds. |
| `base_rate_gap` | Compare a market price to the historical base rate for a class of events; returns the gap in points + sample quality. |
| `combo_edge` | Grade a same-game multi-leg combo: EV %, fair vs offered odds, correlation-aware joint probability, negative-correlation trap flag. |

### Markets — free, depth-capped

| Tool | What it does |
|---|---|
| `find_arbitrage` | Cross-venue price gaps between Kalshi and Polymarket on the same contract. Largest gap free; whole board on Pro. |
| `market_pulse` | US macro-health composite (0–100) and regime, plus six category scores. Composite always free. |

### NFL + fantasy draft — free

`draft_board` · `best_available` · `who_do_i_draft` · `compare_players` · `player_outlook` · `explain_player` · `sleepers_and_busts` · `adp_market_gaps` · `nfl_power_ratings` · `nfl_win_probability`

The 2026 half-PPR board with model calls, tier breaks, ADP-vs-model gaps, per-player reasoning, and eight platform ADP presets. Single-player lookups are never capped.

### Pro — live edge engines

`commodity_edge` · `scan_mispricings` · `nfl_edge` · `nfl_prop_edge` · `edge_alerts`

Trade tickets from the silver, gold, oil and bitcoin engines; Polymarket contracts trading away from the PMP model; NFL game and prop edges; the alerts feed.

All tool descriptions and outputs use prediction-market terminology (trader / position / contract / market analysis).

## Source

This repo is the public home of the server: the manifest, the bridge, the offline calculator build, and the docs. The hosted service and its live data are operated by PredictionMarketsPicks — MIT license covers this repository, and **no install is required to use the server**.

```
npm install
npm run smoke          # offline calculator self-test, no network
npm run smoke:bridge   # bridge self-test against the hosted endpoint
npm start -- --local   # stdio server, 6 calculators
```

Or run the offline build with Docker:

```
docker build -t pmp-mcp-quant .
docker run --rm -i pmp-mcp-quant
```

## About

Built by [PredictionMarketsPicks](https://predictionmarketspicks.com) — independent quant tools and edge analysis for Kalshi and Polymarket, published by The 7 Oracles. Educational analysis, not financial advice.

## License

MIT — see [`LICENSE`](./LICENSE).
