# PredictionMarketsPicks MCP

[![npm](https://img.shields.io/npm/v/@predictionmarketspicks/mcp)](https://www.npmjs.com/package/@predictionmarketspicks/mcp)
[![mcp MCP server](https://glama.ai/mcp/servers/predictionmarketspicks/mcp/badges/card.svg)](https://glama.ai/mcp/servers/predictionmarketspicks/mcp)

A hosted **Model Context Protocol** server that gives AI agents quant tools for **Kalshi** and **Polymarket** prediction markets — expected value, Kelly sizing, Bayesian updating, probability conversion, cross-platform price gaps, Fed rate odds, live edge signals, and the in-season NFL model: power ratings, win probability, The Ladder, the weekly prop board and game/prop edges.

**Docs, setup and the live wall:** [predictionmarketspicks.com/mcp](https://predictionmarketspicks.com/mcp?utm_source=github&utm_medium=readme&utm_campaign=mcp-readme)

**Every signal our engines publish is graded against the market that priced it: 1,612 decided signals, +$98.40 net on a flat one-contract stake, as of Aug 18, 2026 — published per tool, including the engines that lose money.** → [predictionmarketspicks.com/track-record](https://predictionmarketspicks.com/track-record?utm_source=github&utm_medium=readme&utm_campaign=mcp-server)

- **Endpoint (Streamable HTTP):** `https://predictionmarketspicks.com/api/mcp/mcp`
- **Registry name:** `com.predictionmarketspicks/quant` ([MCP registry](https://registry.modelcontextprotocol.io))
- **26 tools** — 19 free, 5 Pro, 2 free-with-depth-caps. No key needed for the free set. Eight of the free tools are the fantasy draft desk, parked until the 2027 offseason (see below), so 11 free tools answer in-season.
- **Fantasy draft landing page:** [predictionmarketspicks.com/draft](https://predictionmarketspicks.com/draft?utm_source=github&utm_medium=readme&utm_campaign=mcp-server) — the eight draft tools, connect instructions, and the model behind the board. The desk is parked for the 2026 season and reopens for the 2027 offseason.

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

That relays the hosted server verbatim — all 26 tools, live data, tool schemas and result payloads untouched. Set `PMP_API_KEY` in the server's `env` to unlock the Pro tools; without one you get the free tools at free depth.

```
npx @predictionmarketspicks/mcp            # bridge to the hosted quant server (default)
npx @predictionmarketspicks/mcp --draft    # bridge to the fantasy-draft server (parked until the 2027 offseason)
npx @predictionmarketspicks/mcp --local    # 6 calculators, offline, no network at all
```

`--local` is a self-contained build of the six stateless calculators. It makes no network calls, so it runs in an air-gapped sandbox — but it cannot serve the live engines, the NFL model, or anything that reads a market.

**Other hosted surfaces** (same registry, same tool objects, different selection — no separate install):

| Server | Endpoint | Exposes |
|---|---|---|
| `com.predictionmarketspicks/quant` | `https://predictionmarketspicks.com/api/mcp/mcp` | All 26 tools |
| `com.predictionmarketspicks/fantasy-draft` | `https://predictionmarketspicks.com/api/mcp-draft/mcp` | The 8 draft tools — parked until the 2027 offseason |
| `com.predictionmarketspicks/weather` | `https://predictionmarketspicks.com/api/mcp-weather/mcp` | The 6-tool weather loop: `edge_alerts` (weather feed) + the five calculators |

## Tools

Free tools need no key. Pro tools read the live PMP edge engines and require a PredictionMarketsPicks API key ([$14.99/mo](https://predictionmarketspicks.com/pricing?utm_source=github&utm_medium=readme&utm_campaign=mcp-server)). Deeper results on the list-shaped tools unlock instantly and free — no key to copy, nothing to install: [unlock here](https://predictionmarketspicks.com/mcp/unlock?utm_source=github&utm_medium=readme&utm_campaign=mcp-server).

### Calculators — free, stateless, also available offline via `--local`

| Tool | What it does |
|---|---|
| `calculate_ev` | Expected-value edge on a contract from market price + your probability; returns edge % and a BUY / SELL / SKIP read. |
| `kelly_size` | Kelly position size (full / half / quarter / eighth) from win probability, price, and bankroll, with a risk rating. |
| `bayes_update` | Update a prior with one or more pieces of evidence; returns the posterior and the per-step chain. |
| `convert_probability` | Convert between implied probability, American odds, and decimal odds. |
| `base_rate_gap` | Compare a market price to the historical base rate for a class of events; returns the gap in points + sample quality. |
| `combo_edge` | Grade a same-game multi-leg combo: EV %, fair vs offered odds, correlation-aware joint probability, negative-correlation trap flag. |

### Markets — free

| Tool | What it does |
|---|---|
| `fed_rate_odds` | Live Kalshi-implied odds of a Fed rate cut, hold or hike at each remaining 2026 FOMC meeting, plus the next meeting and the current fed funds rate. |

### Markets — free, depth-capped

| Tool | What it does |
|---|---|
| `find_arbitrage` | Cross-venue price gaps between Kalshi and Polymarket on the same contract. Largest gap free; whole board on Pro. |
| `market_pulse` | US macro-health composite (0–100) and regime, plus six category scores. Composite always free. |

### NFL in-season — free

| Tool | What it does |
|---|---|
| `nfl_power_ratings` | PWR for all 32 NFL teams — points per game above an average team on a neutral field, with rank and tier. |
| `nfl_win_probability` | Turn an NFL spread + total into win probability, projected score, and over/cover probability — or pass two teams to derive the spread. |
| `nfl_ladder` | The Ladder — every Kalshi strike vs our whole distribution (spreads, season wins, props) with the derived verdict: SHAPE, LOCATION or PRICED. |
| `nfl_prop_board` | This week's NFL prop prices venue by venue — every Kalshi strike vs the book consensus, DraftKings/FanDuel lines, Novig/ProphetX, and where the best price for each side actually is. |

### Fantasy draft desk — parked until the 2027 offseason

`draft_board` · `best_available` · `who_do_i_draft` · `compare_players` · `player_outlook` · `explain_player` · `sleepers_and_busts` · `adp_market_gaps`

The 2026 draft season closed on Sept 10, 2026. These eight tools stay registered (and free) but currently answer with a redirect to the in-season NFL tools above — `nfl_prop_board`, `nfl_ladder`, `nfl_edge` — rather than a draft answer. The desk reopens, with the 2027 board, for the 2027 offseason.

### Pro — live edge engines

`commodity_edge` · `scan_mispricings` · `nfl_edge` · `nfl_prop_edge` · `edge_alerts`

Trade tickets from the silver, gold, oil and bitcoin engines; Polymarket contracts trading away from the PMP model; NFL game and prop edges; the alerts feed. `edge_alerts` is the one hybrid: Pro keys get the feed in real time, and without a key the same feed arrives delayed 24h.

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

Built by [PredictionMarketsPicks](https://predictionmarketspicks.com/?utm_source=github&utm_medium=readme&utm_campaign=mcp-server) — independent quant tools and edge analysis for Kalshi and Polymarket, published by The 7 Oracles. Educational analysis, not financial advice.

## License

MIT — see [`LICENSE`](./LICENSE).
