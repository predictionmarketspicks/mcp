# PredictionMarketsPicks MCP

**Canonical home:** [predictionmarketspicks.com/mcp](https://predictionmarketspicks.com/mcp?utm_source=github&utm_medium=readme&utm_campaign=mcp-readme) — docs, setup, the live wall and the per-tool track record. This repo is the bridge and the offline calculators; the server lives on the site.

[![npm](https://img.shields.io/npm/v/@predictionmarketspicks/mcp)](https://www.npmjs.com/package/@predictionmarketspicks/mcp)
[![mcp MCP server](https://glama.ai/mcp/servers/predictionmarketspicks/mcp/badges/card.svg)](https://glama.ai/mcp/servers/predictionmarketspicks/mcp)

A hosted **Model Context Protocol** server that gives AI agents quant tools for **Kalshi** and **Polymarket** prediction markets — expected value, Kelly sizing, Bayesian updating, probability conversion, cross-platform price gaps, Fed rate odds, Kalshi's 15-minute markets and perps (with liquidation estimates), live edge signals, and the in-season NFL model: power ratings, win probability, The Ladder, the weekly prop board and game/prop edges.

**Every signal our engines publish is graded against the market that priced it — per tool, wins and losses both, including the engines that lose money.** The live record: [predictionmarketspicks.com/track-record](https://predictionmarketspicks.com/track-record?utm_source=github&utm_medium=readme&utm_campaign=mcp-server)

- **Endpoint (Streamable HTTP):** `https://predictionmarketspicks.com/api/mcp/mcp?via=npm`
- **Registry name:** `com.predictionmarketspicks/quant` ([MCP registry](https://registry.modelcontextprotocol.io))
- **34 tools** — 27 free, 5 Pro, 2 free-with-depth-caps. No key needed for the free set. Four of the free tools are fantasy-draft-only and parked until the 2027 offseason (see below), so 23 free tools answer in-season (the 2026 Senate map and per-race odds joined 2026-09-17; the Kalshi 15-minute board and the two perps tools joined 2026-09-26; the NHL board joined 2026-09-28).
- **Fantasy draft landing page:** [predictionmarketspicks.com/draft](https://predictionmarketspicks.com/draft?utm_source=github&utm_medium=readme&utm_campaign=mcp-server) — the eight draft tools, connect instructions, and the model behind the board. During the season four of them answer week-by-week NFL prop questions (player_outlook, explain_player, compare_players, sleepers_and_busts); the other four reopen for the 2027 offseason.

## See it work

[![Kalshi vs Polymarket price gaps in one question](https://img.youtube.com/vi/gye5D6neAg0/maxresdefault.jpg)](https://www.youtube.com/watch?v=gye5D6neAg0)

- **Gemini CLI:** install in one command, ask which Kalshi 15-minute markets are open. ([47s demo](https://www.youtube.com/watch?v=VCmYQQXq2bo) · [setup](https://predictionmarketspicks.com/mcp/gemini?utm_source=github&utm_medium=readme&utm_campaign=mcp-readme))
- **Kalshi vs Polymarket, in one question:** ask where the two venues disagree, then whether they agree on the next Fed meeting. ([50s demo](https://www.youtube.com/watch?v=gye5D6neAg0) · [setup guide](https://predictionmarketspicks.com/mcp/polymarket?utm_source=github&utm_medium=readme&utm_campaign=mcp-readme))
- **Kalshi 15-minute gold & Bitcoin + the BTC perp:** live boards and perp funding in one chat. ([48s demo](https://www.youtube.com/watch?v=VquOZ9jcHa8) · [commodity markets](https://predictionmarketspicks.com/commodity-markets?utm_source=github&utm_medium=readme&utm_campaign=mcp-readme))
- **Claude, ChatGPT & Cursor:** paste one URL and ask. ([40s demo](https://www.youtube.com/watch?v=ulgw1yUeP-Q) · [Cursor setup](https://predictionmarketspicks.com/mcp/cursor?utm_source=github&utm_medium=readme&utm_campaign=mcp-readme))
- **Kalshi weather edges + Kelly sizing:** forecast vs market, then the position size, in one chat. ([46s demo](https://www.youtube.com/watch?v=uafQ9UtOgwM) · [weather](https://predictionmarketspicks.com/weather?utm_source=github&utm_medium=readme&utm_campaign=mcp-readme))

## Connect

**One click:** [Add to Cursor](https://cursor.com/install-mcp?name=predictionmarketspicks&config=eyJ1cmwiOiJodHRwczovL3ByZWRpY3Rpb25tYXJrZXRzcGlja3MuY29tL2FwaS9tY3AvbWNwIn0%3D) · [Add to VS Code](https://vscode.dev/redirect/mcp/install?name=predictionmarketspicks&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fpredictionmarketspicks.com%2Fapi%2Fmcp%2Fmcp%22%7D) · Gemini CLI: `gemini extensions install https://github.com/predictionmarketspicks/mcp`

**Any host that speaks Streamable HTTP** (Claude Code, Claude.ai, ChatGPT, Cursor) — point it at the URL. Nothing to install:

```
claude mcp add --transport http predictionmarketspicks https://predictionmarketspicks.com/api/mcp/mcp?via=npm
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

That relays the hosted server verbatim — all 34 tools, live data, tool schemas and result payloads untouched. Set `PMP_API_KEY` in the server's `env` to unlock the Pro tools; without one you get the free tools at free depth.

```
npx @predictionmarketspicks/mcp            # bridge to the hosted quant server (default)
npx @predictionmarketspicks/mcp --draft    # bridge to the fantasy-draft server (half parked until 2027)
npx @predictionmarketspicks/mcp --local    # 6 calculators, offline, no network at all
```

`--local` is a self-contained build of the six stateless calculators. It makes no network calls, so it runs in an air-gapped sandbox — but it cannot serve the live engines, the NFL model, or anything that reads a market.

**Other hosted surfaces** (same registry, same tool objects, different selection — no separate install):

| Server | Endpoint | Exposes |
|---|---|---|
| `com.predictionmarketspicks/quant` | `https://predictionmarketspicks.com/api/mcp/mcp?via=npm` | All 34 tools |
| `com.predictionmarketspicks/fantasy-draft` | `https://predictionmarketspicks.com/api/mcp-draft/mcp` | The 8 draft tools — four answer in season, four parked until the 2027 offseason |
| `com.predictionmarketspicks/weather` | `https://predictionmarketspicks.com/api/mcp-weather/mcp` | The 7-tool weather loop: `weather_board` (every open Kalshi daily-high strike) + `edge_alerts` (weather feed) + the five calculators |
| `com.predictionmarketspicks/commodities` | `https://predictionmarketspicks.com/api/mcp-commodities/mcp` | The 10-tool macro & commodities desk: `fifteen_min_board`, `perps_board`, `perp_liquidation`, `commodity_edge` (gold / silver / oil / bitcoin), `fed_rate_odds`, `market_pulse`, `base_rate_gap` + three calculators |
| `com.predictionmarketspicks/elections` | `https://predictionmarketspicks.com/api/mcp-elections/mcp` | The election odds desk: `senate_map`, `race_odds` (every 2026 Senate, governor and House race on Kalshi), `fed_rate_odds`, `market_pulse` |
| `com.predictionmarketspicks/crypto` | `https://predictionmarketspicks.com/api/mcp-crypto/mcp` | The crypto desk: `fifteen_min_board`, `perps_board`, `perp_liquidation`, `commodity_edge` (bitcoin) + three calculators |

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
| `fifteen_min_board` | Every Kalshi 15-minute series live — crypto, gold, silver, oil, natural gas, copper, currencies — with the open window's YES price, close time, settlement source, and how the last 96 windows settled. |
| `perps_board` | Every Kalshi perp — price, volume, open interest, max leverage, and what funding has cost a long since launch. |
| `perp_liquidation` | Where a leveraged Kalshi perp position liquidates (an estimate from Kalshi's published risk parameters), with fees and funding over the hold. |
| `weather_board` | Every open Kalshi daily-high temperature strike in 13 cities — YES price, settlement station, close time, and the NWS forecast high beside it. |

### Politics — free

| Tool | What it does |
|---|---|
| `senate_map` | Every 2026 Senate seat — holder, structure rating, forecaster ratings and the live Kalshi price, closest race first. Unpriced seats return null, never an estimate. |
| `race_odds` | Live Kalshi odds for one 2026 Senate, governor or competitive House race (by state or district, e.g. "TX-34") — every leg's price, volume and link, plus the forecaster ratings. |

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
| `ladder_arb` | Ladder Arb Scanner — Kalshi college football + NFL spread/total ladders priced out of order on the same side of the same game: locked arbitrage (buy the low strike, sell the high one) and crossed-mid inversions with the resting orders that capture them. |

### NHL — free

| Tool | What it does |
|---|---|
| `nhl_edge` | Goal Light — every NHL game and player contract priced against Kalshi, with the book consensus beside it and a 10,000-season simulation for the futures board. |

### Fantasy draft desk — half in season, half parked until 2027

**Answering in season (free):** `player_outlook` · `explain_player` · `compare_players` · `sleepers_and_busts` — the same names, now about this week: one player's Kalshi prop strikes, why the model prices them there, two to four players side by side, and the players the market over- and underprices.

**Parked until the 2027 offseason:** `draft_board` · `best_available` · `who_do_i_draft` · `adp_market_gaps` — still registered (and free), but they answer with a redirect to the in-season NFL tools above rather than a draft answer. They reopen with the 2027 board.

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
