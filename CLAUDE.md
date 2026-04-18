# CLAUDE.md — Hoard

## Project Overview

Hoard is an offline-first Diablo 2 Resurrected mule inventory tracker. Lets players catalog which items are on which mule characters, then instantly search across all mules to find any item. Supports Classic, Lord of Destruction, and Reign of the Warlock (RoTW) eras.

**Key principle: this app is fully offline.** No internet required for any core functionality. The item database is bundled at build time. All user data lives in on-device SQLite. The export/import backup uses the native share sheet (which can save to iCloud Drive via iOS). Do not add features that require network connectivity.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Expo (managed workflow) | SDK 54 |
| Language | TypeScript | ~5.9 |
| Navigation | Expo Router | ~6.0 |
| UI | React Native | 0.81.5 |
| React | React | 19.1 |
| Database | expo-sqlite | ~16.0 |
| Animations | react-native-reanimated | v4.1 |
| Gestures | react-native-gesture-handler | ~2.28 |
| SVG Icons | react-native-svg | installed |
| Item Data | Bundled JSON from blizzhackers/d2data | D2R 3.0 (RoTW) |

**Architecture:**
- New Architecture is enabled by default (SDK 54+)
- Reanimated v4 — use `ReanimatedSwipeable` from `react-native-gesture-handler/ReanimatedSwipeable`, NOT the deprecated `Swipeable`
- React 19.1 — `useContext` still works but `use()` is available; `Context.Provider` can be simplified to `Context`
- Web: expo-sqlite is stubbed out via Metro resolver (`metro.config.js`). Web shows a "use Expo Go" fallback. Don't break web even though it's not the target platform.
- Database schema is at **version 3** (v1: initial tables, v2: added `sockets` column to items, v3: added `item_tags` table)

---

## Project Structure

```
app/                    Expo Router screens
  (tabs)/               Tab navigator (Mules, Find Item, Collections, Settings)
    index.tsx           Mules tab (realms & containers)
    search.tsx          Find Item tab (cross-container search)
    collections.tsx     Collections tab (sets & runewords progress)
    settings.tsx        Settings tab
  container/[id].tsx    Container detail (items list, sort, filter, bulk select)
  modal/add-item.tsx    Add item modal with autocomplete + variable stats
assets/data/            Bundled item-index.json
assets/icons/           SVG item type icons (23 icons from game-icons.net)
components/             Reusable UI
  ItemRow.tsx           Item list row with icon, category badge, notes
  ItemTypeIcon.tsx      SVG icon component for item types
  itemTypeIconSvgs.ts   SVG markup strings for all item type icons
  ContainerCard.tsx     Mule/stash card with swipe-to-archive
  SetProgressCard.tsx   Set completion card with progress bar & dots
  SetDetailModal.tsx    Modal showing set pieces + set bonuses (2pc, 3pc, full)
  RunewordDetailModal.tsx Modal showing runeword details (runes, base types, stats, level req)
  CategoryBadge.tsx     Unique/Set/Runeword/etc. badge
  ItemAutocomplete.tsx  Search + autocomplete with recent items
  RealmTag.tsx          Realm indicator chip
db/                     SQLite schema, migrations, all query functions
hooks/                  useDatabase, useItemSearch, useContainers
lib/                    Types, theme, item-index loader/search
scripts/                build-item-index.ts (generates item-index.json from d2data)
```

---

## Key Conventions

- **Dark theme always.** Colors are in `lib/theme.ts`. D2 rarity colors: gold (#c9a84c) unique, green (#00b300) set, grey (#b0a080) runeword, orange (#ff8040) rune, white (#e0e0e0) base.
- **No `flex: 1` on standalone buttons.** Buttons in modal footer rows use `flex: 1` to share space. Standalone buttons (like "Create a Realm") must use `standaloneBtn` or explicit sizing — `flex: 1` causes them to stretch to fill the entire screen.
- **Filter chip ScrollViews need `flexGrow: 0`** and should be wrapped in a `View` with `flexShrink: 0` to prevent compression by adjacent FlatLists.
- **Container detail header: name gets full width.** The container name, subtitle, and category stats occupy full width on their own lines. Action buttons (Select, Share, Edit) go in a row BELOW the name/stats, never beside them. Long container names must not be truncated by competing buttons.
- **Expo Router navigation: use explicit group paths.** When navigating to tab screens from modals or other contexts, use the full path including the group: `router.push({ pathname: '/(tabs)/search', params: { ... } })` instead of just `/search`. This ensures the router correctly resolves nested routes and tab navigation.
- **Haptics are light only.** Use `Haptics.impactAsync(ImpactFeedbackStyle.Light)` wrapped in `.catch(() => undefined)`. Never Medium or Heavy for routine interactions.
- **Interactive Codex modals are tappable.** Both set items and runewords in the Collections tab should be tappable to show detailed modals. Use `Pressable` with haptic feedback and state management for the selected item.
- **Set bonus active states must be calculated.** SetDetailModal compares `ownedPieces` to `bonus.pieceCount` to determine if a bonus is active. Full set bonuses (`pieceCount: -1`) are active when `ownedPieces === totalPieces`.
- **Runeword modals show ownership context.** RunewordDetailModal displays which runes the user owns (checkmarks) vs. missing (empty diamonds) based on the `missingRunes` array from the craftability query.
- **Item index is read-only at runtime.** The bundled `item-index.json` is loaded once into memory on app start via `lib/itemIndex.ts`. It's never modified at runtime. To update items, modify `scripts/build-item-index.ts` and run `npm run build:item-index`.
- **UUIDs via expo-crypto.** All database IDs use `Crypto.randomUUID()`.
- **Timestamps are ISO strings.** All `created_at` / `updated_at` fields store `new Date().toISOString()`.

---

## Item Index Build

The item database lives in `assets/data/item-index.json`. It's generated by `scripts/build-item-index.ts` which:

1. Fetches raw JSON from `blizzhackers/d2data` (cached in `scripts/.cache/`)
2. Resolves display names via `allstrings-eng.json`
3. Maps property codes to readable stat names via `properties.json`
4. Extracts variable stats (min ≠ max) for unique/set items AND runewords
5. Extracts `maxSockets` for base items from `gemsockets` field
6. Applies era detection (Classic/LoD/RoTW) via keyword matching with word boundaries
7. Deduplicates misc items against uniques/sets
8. Seeds nickname search terms (shako, hoto, botd, cta, etc.)

**Note:** Runewords use different field names than uniques/sets:
- Uniques/Sets: `prop{N}`, `min{N}`, `max{N}`, `par{N}`
- Runewords: `T1Code{N}`, `T1Min{N}`, `T1Max{N}`, `T1Param{N}`

To regenerate:
```bash
rm -rf scripts/.cache    # force re-download
npm run build:item-index
```

Current stats: ~1,353 items, 52 RoTW, 99 active runewords, 437 bases with socket data. ~280 KB bundled.

---

## Set Bonus Data Structure

**Added in interactive Codex enhancement.** Set items now include `setBonuses` arrays that describe partial and full set bonuses.

### Structure
```typescript
interface SetBonus {
  pieceCount: number;  // 2, 3, 4, etc., or -1 for full set
  bonuses: VariableStat[];
}

interface ItemEntry {
  // ... existing fields ...
  setBonuses?: SetBonus[];  // Only present on set category items
}
```

### Data Source
Set bonuses are parsed from `sets.json` during the item index build:
- **Partial bonuses:** `PCode2a/PMin2a/PMax2a` = 2-piece, `PCode3a/PMin3a/PMax3a` = 3-piece, etc.
- **Full set bonuses:** `FCode1/FMin1/FMax1`, `FCode2/FMin2/FMax2`, etc.
- Property codes (`dmg%`, `res-all`, etc.) are mapped to readable names using the same `propNames` map as item stats

### Special Values
- `pieceCount: -1` is a sentinel value indicating "full set bonus" (applies when all pieces are owned)
- Stat values are stored as absolute numbers (e.g., `+50` not `-50`)
- Each set item in the index contains the FULL bonus structure for its set (not split across items)

### Display Rules
- Active bonuses (user owns enough pieces) are highlighted with ember color
- Inactive bonuses are dimmed (opacity 0.5)
- Full set bonuses get ember glow effect when complete
- Bonuses are displayed grouped by piece count: 2-piece, 3-piece, ..., Full Set

---

## Credits & Licenses

**IMPORTANT: These attributions MUST be maintained in the app's About/Settings screen and in any App Store listing.**

| Resource | License | Attribution Required | Used For |
|----------|---------|---------------------|----------|
| [blizzhackers/d2data](https://github.com/blizzhackers/d2data) | MIT | Yes — mention in About screen | Item database (all uniques, sets, runewords, bases, runes, gems). Raw JSON extracted from D2R 3.0 game data. |
| [game-icons.net](https://game-icons.net) | CC BY 3.0 | **Yes — must credit authors by name.** Format: "Icons by [author names] from game-icons.net" per CC BY 3.0. Check each icon's specific author on game-icons.net. | Item type icons (helm, armor, sword, ring, etc.) — 23 SVGs bundled in `assets/icons/` |
| Expo / React Native | MIT | No (but good practice) | App framework |
| expo-sqlite | MIT | No | On-device database |

### CC BY 3.0 requirements (game-icons.net):
- Credit the original author(s) by name
- Link to game-icons.net
- Indicate if changes were made (e.g., "recolored" or "modified")
- Include this in the app's About screen AND the App Store description or metadata

### App Store attribution text (draft):
```
Item type icons by Lorc, Delapouite, and contributors (game-icons.net), 
licensed under CC BY 3.0. Icons have been recolored to match the app theme.
Item database sourced from blizzhackers/d2data (MIT license).
```

Update the author names once you know which specific icons were selected.

---

## Roadmap

### Completed
- [x] MVP — realms, containers, items, autocomplete search, cross-container Find Item
- [x] SDK 54 upgrade (React 19.1, RN 0.81, Reanimated v4)
- [x] Phase 2 — swipe-to-delete, sort/filter, category stats, recent items, pull-to-refresh, haptics, category filters on search
- [x] Phase 3 — bulk select/move/delete, squished cancel button fix, filter chip fix
- [x] Variable stats — shows which rolls vary and their ranges when adding/editing items
- [x] Phase 4 — Item type icons (game-icons.net SVGs), snapshot/share export
- [x] Base item sockets — maxSockets in index, socket picker in add/edit modals, sockets column in DB (migration v2)
- [x] Runeword variable stats — extracts T1Code/T1Min/T1Max variable rolls
- [x] Collections tab — set completion tracker, runeword calculator

### Next
- [ ] Interactive Codex — set bonuses (2pc, 3pc, full), runeword details (rune sequence, base types, stats, level req), inventory cross-referencing
- [ ] Custom tags — tag items (For Trade, God Roll, etc.), filter by tags
- [ ] Phase 5 — App Store prep (icon, splash screen, developer license, store listing, screenshots)

### Maybe-Todo (only if needed)
- [ ] Auto cloud sync (iCloud Drive / Google Drive background sync) — manual export/import already covers backup via native share sheet. Only add if users request it.
- [ ] Item sprites (actual D2 inventory art) — copyright risk with Blizzard assets, using game-icons.net type icons instead

---

## Common Gotchas

1. **expo-sqlite doesn't work on web.** The Metro resolver in `metro.config.js` stubs it out. The `_layout.tsx` has a Platform check that shows a fallback. Don't remove either of these.
2. **The item index JSON is large (~280KB).** It's loaded into memory once. Don't re-parse it on every render. The `ITEM_MAP` in `lib/itemIndex.ts` provides O(1) lookups.
3. **Nickname search terms must be lowercase.** The search algorithm lowercases the query before matching against `searchTerms`.
4. **Era detection uses word-boundary matching.** The keyword `'sling'` must not match `'Doomslinger'`. The `keywordMatches()` function in the build script handles this.
5. **d2data property codes are NOT display names.** `dmg%` → "Enhanced Damage", `mag%` → "Magic Find", etc. The mapping is in `cleanPropertyName()` in the build script.
6. **Modals with cancel buttons: don't use `flex: 1` on the cancel button** if it's below a ScrollView. The ScrollView takes all the space and the button becomes invisible. Use explicit padding with no flex.
7. **Container header buttons go BELOW the name**, not beside it. Putting buttons in the same row as the container name causes long names to wrap/truncate. Use a vertical stack layout for the header.
8. **Database migrations must be additive.** Schema version 3 adds `item_tags` table. Future migrations must check `if (current < N)` and only apply their changes. Never drop or rename columns — existing user data must be preserved.
9. **Runeword property fields use `T1Code{N}` prefix**, not `prop{N}` like uniques/sets. Any code that extracts item properties must handle both naming conventions.
10. **Set bonuses use `pieceCount: -1` for full set bonuses.** This is a sentinel value. When displaying bonuses, check if `pieceCount === -1` to determine if it's a full set bonus (requires all pieces) vs. a partial bonus (requires specific piece count).
11. **Each set item contains the FULL bonus structure for its set.** The `setBonuses` array is duplicated across all items in a set. This allows any set item to display complete set information without cross-referencing other items in the index.
