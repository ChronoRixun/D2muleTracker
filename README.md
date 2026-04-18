# Hoard

An offline-first **Diablo 2 Resurrected mule inventory tracker** built with
Expo + React Native. Catalog items across every mule and shared stash, then
find anything with instant autocomplete. Supports all D2R eras: Classic, Lord
of Destruction, and Reign of the Warlock (RoTW).

## Stack

- Expo (managed workflow) + Expo Router + React Native
- TypeScript
- `expo-sqlite` for persistent on-device data
- Bundled item index generated from
  [`blizzhackers/d2data`](https://github.com/blizzhackers/d2data) — no network
  dependency at runtime

## Getting Started

```sh
npm install
npm run build:item-index   # generate assets/data/item-index.json (once per d2data update)
npm start                  # open in Expo Go
```

Android / iOS:

```sh
npm run android
npm run ios
```

## Regenerating the item index

The item database is committed to `assets/data/item-index.json`. To refresh
from the latest d2data snapshot:

```sh
rm -rf scripts/.cache
npm run build:item-index
```

## Project Layout

```
app/                  Expo Router screens (tabs, modals, dynamic routes)
assets/data/          Bundled item-index.json asset
components/           Reusable UI (ItemRow, ContainerCard, ...)
db/                   SQLite schema, migrations, queries
hooks/                React hooks (useDatabase, useItemSearch, useContainers)
lib/                  Shared types, theme, item-index loader/search
scripts/              Build tooling (item-index generator)
```

## Features

- **Mules tab** — grouped by realm, with item counts, add/archive mules
- **Find Item tab** — instant autocomplete + cross-container search, filters
  by realm, also searches free-text notes ("40FCR", "um'd", etc.)
- **Container detail** — per-mule item list, edit notes, move between mules
  within a realm, delete
- **Settings** — manage realms, export/import JSON backups
- **Dark gothic theme** with D2-matching category colors (unique gold, set
  green, runeword grey, …)

## Item database

`scripts/build-item-index.ts` fetches raw JSON from the
[`blizzhackers/d2data`](https://github.com/blizzhackers/d2data) master branch,
resolves display names via `allstrings-eng.json`, and flattens everything to
a single sorted `ItemEntry[]` at `assets/data/item-index.json`. Nicknames
(shako → Harlequin Crest, hoto → Heart of the Oak, cta → Call to Arms, …)
are seeded in the build script.
