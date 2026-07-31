# Graph Report - server  (2026-07-31)

## Corpus Check
- 72 files · ~71,567 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 430 nodes · 1022 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5550f3c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin.ts
- seedFixtures.ts
- manager.ts
- index.ts
- scripts
- dependencies
- substitution.ts
- notification.ts
- transfers.ts
- compilerOptions
- fetchSofascoreData.js
- subUpdate.ts
- MatchDetails.ts
- sofascore.ts

## God Nodes (most connected - your core abstractions)
1. `error` - 56 edges
2. `FantasyTeam` - 34 edges
3. `Gameweek` - 29 edges
4. `Team` - 26 edges
5. `details()` - 19 edges
6. `User` - 18 edges
7. `Fixture` - 17 edges
8. `connectDB()` - 16 edges
9. `createTransfer()` - 14 edges
10. `resolvePosition()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `login()` --indirect_call--> `error`  [INFERRED]
  src/controllers/auth.ts → src/types/error.ts
- `details()` --indirect_call--> `error`  [INFERRED]
  src/controllers/manager.ts → src/types/error.ts
- `substitution()` --indirect_call--> `error`  [INFERRED]
  src/controllers/manager.ts → src/types/error.ts
- `myFixtures()` --indirect_call--> `error`  [INFERRED]
  src/controllers/manager.ts → src/types/error.ts
- `dashboard()` --indirect_call--> `error`  [INFERRED]
  src/controllers/manager.ts → src/types/error.ts

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "admin.ts"
Cohesion: 0.11
Nodes (48): completeGameweek(), createFantasyTeam(), createGameweek(), createH2HFixture(), deleteH2HFixture(), deleteH2HLeague(), fetchLeagueRounds(), getAdminPlayers() (+40 more)

### Community 1 - "seedFixtures.ts"
Cohesion: 0.06
Nodes (52): connectDB(), ILeague, League, LeagueSchema, ISeason, Season, SeasonSchema, buildStandingsUrl() (+44 more)

### Community 2 - "manager.ts"
Cohesion: 0.11
Nodes (40): dashboard(), details(), getLatestAvailableGw(), myFixtures(), substitution(), aggregateMatchStats(), getFilters(), getFullPlayerStats() (+32 more)

### Community 3 - "index.ts"
Cohesion: 0.06
Nodes (28): getFixtures(), SheetController, SyncController, app, auth, cors, credentials, fs (+20 more)

### Community 4 - "scripts"
Cohesion: 0.06
Nodes (34): nodemon, author, description, devDependencies, nodemon, ts-node, ts-node-dev, @types/express (+26 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (33): axios, bcryptjs, body-parser, cors, dayjs, dotenv, express, google-auth-library (+25 more)

### Community 6 - "substitution.ts"
Cohesion: 0.13
Nodes (21): Formation, FormationResult, Player, RoleKey, setCaptain(), setCaptaincyRole(), setViceCaptain(), canSwap() (+13 more)

### Community 8 - "notification.ts"
Cohesion: 0.12
Nodes (19): client, login(), privateKey, Cell, notifications(), Row, send(), subscribe() (+11 more)

### Community 9 - "transfers.ts"
Cohesion: 0.22
Nodes (17): clonePicks(), createTransfer(), getPositionCounts(), getTakenPlayerIds(), getTransfers(), healLineup(), normalizeCaptaincy(), normalizePosition() (+9 more)

### Community 10 - "compilerOptions"
Cohesion: 0.13
Nodes (14): node_modules, src/**/*, compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, module, outDir (+6 more)

### Community 11 - "fetchSofascoreData.js"
Cohesion: 0.21
Nodes (12): fs, DATA_DIR, delay(), main(), saveJSON(), TOURNAMENT_SEASONS, {
    launchWarmSession,
    fetchSofascoreJSON
}, path (+4 more)

### Community 12 - "subUpdate.ts"
Cohesion: 0.22
Nodes (9): buildSquadRows(), InputData, OutputRow, Player, Position, PosLetter, posToLetter, roleOf() (+1 more)

### Community 13 - "MatchDetails.ts"
Cohesion: 0.13
Nodes (19): countCards(), countGoalsConceded(), mapSofascoreToPlayerMatchStat(), ILineupEntry, IMatchDetails, LineupEntrySchema, MatchDetailsSchema, Player (+11 more)

## Knowledge Gaps
- **149 isolated node(s):** `name`, `version`, `description`, `main`, `prebuild` (+144 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `error` connect `admin.ts` to `seedFixtures.ts`, `manager.ts`, `index.ts`, `notification.ts`, `transfers.ts`, `fetchSofascoreData.js`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `main()` connect `fetchSofascoreData.js` to `admin.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `FantasyTeam` connect `manager.ts` to `admin.ts`, `notification.ts`, `index.ts`, `transfers.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 55 inferred relationships involving `error` (e.g. with `completeGameweek()` and `createFantasyTeam()`) actually correct?**
  _`error` has 55 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _149 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10844155844155844 - nodes in this community are weakly interconnected._
- **Should `seedFixtures.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06201923076923077 - nodes in this community are weakly interconnected._