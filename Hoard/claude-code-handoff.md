# Hoard · Ember Abyssal → React Native Implementation Handoff

Visual redesign of the existing D2 Mule Tracker (Expo/React Native, SQLite, offline-first). **No architectural rewrite** — swap theme, add atoms, restyle screens. All existing queries, schema, navigation, and cross-platform support stay intact.

> Designs in `ember/*.jsx`. Tokens in `ember/tokens.jsx` are the source of truth; everything below is just a port of those tokens into RN idioms.

---

## 1 · Theme tokens (`lib/theme.ts`)

Replace the current color export. Keep any existing named keys the rest of the app imports (e.g. `colors.primary`, `colors.border`) — alias them so no other file has to change.

```ts
// lib/theme.ts
export const colors = {
  // ground
  void:     '#030201',
  bg:       '#070403',
  bgSoft:   '#0d0705',
  card:     '#130906',
  cardHi:   '#1c0d08',

  // lines
  border:    '#2a1408',
  borderHi:  '#3d1e0c',
  borderGold:'#5a3a18',

  // ink
  text:         '#f0d8b8',
  textSecondary:'#9a7a5c',
  textMuted:    '#5a4030',
  textDim:      '#3a2a1f',

  // accents
  primary:    '#e8b048', // gold — replaces prior "primary"
  primaryDim: '#8a5018',
  ember:      '#ff5020',
  emberHi:    '#ff8038',
  emberDim:   '#b03810',
  lava:       '#c83018',
  ash:        '#6a5040',

  // rarity (D2 canonical — color-as-language)
  unique:   '#d4a050',
  set:      '#6aae4a',
  runeword: '#bfa478',
  rune:     '#ff6a2a',
  gem:      '#6aa8d9',
  magic:    '#5a7acc',
  rare:     '#e8d048',
  base:     '#f0d8b8',
  crafted:  '#d48a3a',
  ethereal: '#a090c0',

  // semantic
  danger:  '#e04040',
  success: '#6aae4a',
} as const;

export const typography = {
  display:     'Cinzel-Bold',
  displaySemi: 'Cinzel-SemiBold',
  hand:        'CormorantGaramond-Italic',
  mono:        'JetBrainsMono-Regular',
  monoBold:    'JetBrainsMono-Bold',
  body:        undefined, // falls back to SF/Roboto — matches existing code
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius  = { sm: 4, md: 8, lg: 12, xl: 16 } as const;

export const rarityColor = (r: keyof typeof colors) => colors[r] ?? colors.text;
```

---

## 2 · Fonts

Install via `npx expo install expo-font` (already in Expo SDK).

Load in the root `_layout.tsx` — use `expo-splash-screen` to hold the splash until loaded so text never flashes in system font.

```ts
// app/_layout.tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

const [loaded] = useFonts({
  'Cinzel-SemiBold':            require('@/assets/fonts/Cinzel-SemiBold.ttf'),
  'Cinzel-Bold':                require('@/assets/fonts/Cinzel-Bold.ttf'),
  'CormorantGaramond-Italic':   require('@/assets/fonts/CormorantGaramond-Italic.ttf'),
  'JetBrainsMono-Regular':      require('@/assets/fonts/JetBrainsMono-Regular.ttf'),
  'JetBrainsMono-Bold':         require('@/assets/fonts/JetBrainsMono-Bold.ttf'),
});
useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
if (!loaded) return null;
```

Font source: Google Fonts (`@expo-google-fonts/cinzel`, `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/jetbrains-mono`) if you prefer package imports to bundled TTFs — either is fine.

---

## 3 · Motion settings

Two modes, user-switchable in Codex. Store in existing settings store (zustand / AsyncStorage — whichever the app uses; don't add a new lib).

```ts
// lib/settings.ts — extend existing store
type Motion  = 'subtle' | 'full';
type Density = 'comfortable' | 'dense';
type Palette = 'abyssal' | 'hellforge'; // reserved for later — ship 'abyssal' only

// defaults
motion:  'subtle',
density: 'comfortable',
palette: 'abyssal',
```

- **Subtle**: no particles, no pulse. Ember glow on hero elements is a static radial gradient.
- **Full Hellforge**: particles on screen root, pulse on search bar + FAB + hero icons, text-flicker on main title.

Every animated component reads `useSettings(s => s.motion)` and conditionally runs Reanimated loops. Stop loops when motion === 'subtle' — don't just hide the layer.

---

## 4 · Atoms (`components/ember/*`)

Build these first — everything else composes from them. Use `react-native-reanimated` (already Expo-bundled) and `expo-linear-gradient`. No `react-native-svg` needed for particles — plain `View` + Reanimated is cheaper and looks identical at this scale.

### EmberBG
Full-bleed background with layered radial gradients + optional particle emitter.

```tsx
// components/ember/EmberBG.tsx
// Structure:
//   <View style={StyleSheet.absoluteFill, bg: colors.bg}>
//     <LinearGradient> x2 — fake radial by using large offset + low opacity
//     {motion === 'full' && <ParticleField />}
//   </View>
//
// ParticleField: 18 <Animated.View> dots (2–3px, bg: ember, shadowColor: ember).
// Each has its own useSharedValue(y, opacity, drift) driven by withRepeat(withTiming(..., 4000–9000ms)).
// Stagger start via delay based on index.
// Position: absolute, random left%, starts at bottom, floats up & fades.
```

True radial gradients aren't native in RN — either use `react-native-linear-gradient` with `useAngle` tricks, or drop in a PNG radial blob once and scale it. Both look fine. Don't pull `react-native-svg` just for this.

### Diamond
4px rotated square, optional glow. Pure `View` with `transform: [{ rotate: '45deg' }]` and `shadowColor: ember`. Sizes sm (6), md (10), lg (14).

### RarityDot
8px circle. `backgroundColor: colors[rarity]`, `shadowColor: same`, `shadowOpacity: 0.9`, `shadowRadius: 6`. On Android add a second larger semi-transparent ring view underneath (Android ignores shadow on non-elevated views).

### Rule
Horizontal divider with centered double diamond + optional mono caps label. Used for section breaks in long scrolling screens.

### EmberBtn
Variants:
- **primary** — `LinearGradient` from `ember → emberDim`, text `#1a0805` Cinzel-Bold, shadow `ember` at 0.5.
- **ghost** — transparent, border `1px gold (primary)`, text `primary`, mono.
- **outline** — transparent, border `borderHi`, text `text`.
- **danger** — border `danger`, text `danger`.

Sizes: sm (h 36), md (h 44), lg (h 52). All radius 8.

Pressed state: drop opacity to 0.85 and scale to 0.98 via Reanimated `useAnimatedStyle` — snappy, not bouncy.

### Chip
Pill with `borderRadius: 999`, padding 6×12. Two styles: `active` (ember bg + dark text) / `inactive` (card bg + gold outline + dim text). Rarity variant colors border + text by rarity.

### SectionHead
```tsx
<View>
  <Text style={{ fontFamily: typography.mono, fontSize: 11, letterSpacing: 3,
                 color: colors.primary, textTransform: 'uppercase' }}>{eyebrow}</Text>
  <Text style={{ fontFamily: typography.display, fontSize: 32,
                 color: colors.text, letterSpacing: 2 }}>{title}</Text>
  {/* if motion==='full': Animated text-shadow via Reanimated on opacity of an ember layer */}
</View>
```

### NavBar · TabBar · FAB · Field · SegControl
Straightforward ports — see HTML designs. Key specifics:
- **TabBar**: 5 tabs (or 4 — see §5). Active tab has ember dot above icon + ember glow. Icons 22px, mono caps label 9px under.
- **FAB**: 56×56 circle, ember radial (fake with gradient), `elevation: 8`, plus icon, bottom-right above tab bar.
- **SegControl**: ember bg for active segment, card bg for rest, inside a borderHi container.

### Icons
Hand-drawn 24×24, 1.4 stroke. Port each one from `ember/icons.jsx` to `react-native-svg` components — same paths, just wrap with `<Svg><Path/></Svg>`. Don't pull in a general icon library; the set is specific (helm, armor, sword, mace, bow, wand, shield, ring, amulet, belt, boots, gloves, rune, gem, potion, scroll, charm, chest, flag, trade, fire, candle, cog, skull, eye, rune-sigil, tome, socket, moon, plus, search, sort, filter, check, x, chevron-*).

---

## 5 · Navigation (minimal change)

Keep the current 4-tab structure. Rename and restyle only:

| Current     | New name   | Icon        | Notes |
|-------------|------------|-------------|-------|
| Mules       | **Mules**  | skull       | Add dashboard ribbon to header (stats + recent) |
| Find Item   | **Seek**   | eye         | Same search, Ember styling |
| Collections | **Codex**  | tome        | Set tracker + runeword calc stay here |
| Settings    | **Forge**  | cog         | Motion + density toggles added |

Don't add a 5th tab. Chronicle dashboard lives as a scrollable header block on the Mules tab — stats ribbon, recent drops strip, craftable runeword cards. Avoids restructuring router while still surfacing the good parts of Chronicle.

A dedicated Runes tab is out-of-scope for v1; rune counts + runeword planner stay under Codex.

---

## 6 · Screen polish pass

Order screens by value; do the top three tightly, sketch the rest.

1. **Mules (index)** — `EmberBG` root. Sticky header: SectionHead "The Hoard" + 4-stat ribbon (items / mules / realms / runes). Realm section headers use `Rule` with realm name as label. Container rows: diamond bullet, name Cinzel, class/level mono, item count mono right-aligned. Gold border variant for shared stashes, ember for characters. Tap → Container detail.

2. **Container detail** — Sticky header (name, class/level/realm mono, rarity count strip: little RarityDot + count per rarity). List supports **Comfortable** (single column, 74pt, name + base + top property) and **Dense** (two columns, name + base only). FAB bottom-right → Add Item.

3. **Item detail** — Full-screen modal. Big rarity-colored SVG silhouette, name in rarity color (Cinzel), base in textDim (mono). Properties list — key rolls emphasized (ember text). Sockets row (empty sockets as hollow diamond, socketed as filled with contents). Metadata ledger (found date, source, realm — mono label + text value). Notes in `CormorantGaramond-Italic`, textDim. Action row: Wishlist toggle, Share (native share sheet — already in app).

4. **Add Item / Edit Item** — Rarity chip grid (ember active). Name + base Field. Sockets stepper + nested socketed-items capture. Key rolls Field. Location = realm picker → mule picker. Source chip row (drop/trade/gamble/craft/shop/gift). Tags ember-chip input. Notes textarea (mono input, italic preview under).

5. **Seek** — Unchanged functionality, restyled. Search bar with ember glow (pulse if motion=full). Filter chips below. Results list = Container detail row style with realm/mule breadcrumb.

6. **Codex (Collections)** — Two segments in a SegControl: Sets · Runewords. Set tracker: progress bar per set, completed pieces ember-filled, missing pieces textDim. Runeword "What Can I Make?" grid: each runeword a card with runes row (owned = ember, missing = textDim outline only), ready cards get `ember-glow-pulse` (motion=full only).

7. **Forge (Settings)** — Sections separated by `Rule`. Motion SegControl (Subtle / Full Hellforge). Density SegControl (Comfortable / Dense). Default sort picker. Data section: Export (existing), Import, Share Hoard. About.

8. **Empty states** — Big rotated Diamond with icon, Cinzel line, italic quote below. Variants: no mules, no items in container, no search results.

---

## 7 · Animation recipes (Reanimated)

All loops gate on `motion === 'full'`. Stop via `cancelAnimation(sv)` when toggled off.

```ts
// Ember pulse on hero element
const opacity = useSharedValue(0.85);
useEffect(() => {
  if (motion !== 'full') { cancelAnimation(opacity); opacity.value = 0.85; return; }
  opacity.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
}, [motion]);

// Particle float
// For each particle: y from 0 → -120, opacity 0→0.9→0.6→0 via interpolate, drift x randomized per cycle.
// useSharedValue(0) + withRepeat(withTiming(1, { duration: 4000 + random * 5000 }), -1, false)
// Stagger with initial delay = (index * 300) ms.

// Button press
const scale = useSharedValue(1);
onPressIn  = () => (scale.value = withTiming(0.98, { duration: 80 }));
onPressOut = () => (scale.value = withTiming(1,    { duration: 120 }));
```

No need for `react-native-skia` — views + transforms + shadows cover everything.

---

## 8 · Platform notes

- **Shadows**: iOS honors `shadowColor/Opacity/Radius/Offset` on Views. Android uses `elevation` (which can't color shadow — approximate ember glow with an absolutely-positioned backdrop view 2–4px larger, ember bg, opacity 0.25, blur not available natively; acceptable compromise).
- **Status bar**: `<StatusBar style="light" />` — content on black.
- **Safe area**: wrap every tab screen in `<SafeAreaView edges={['top']}>` — hero layouts bleed to edges, headers respect notch.
- **Scroll performance**: `FlashList` if the app already uses it; otherwise `FlatList` is fine. Keep `removeClippedSubviews` on for long container lists.
- **Haptics**: `expo-haptics` light impact on FAB, segment toggle, rarity chip select. Skip on list row tap.

---

## 9 · What NOT to do

- ❌ Don't restructure navigation or the 4-tab layout.
- ❌ Don't touch `db/queries.ts` or the SQLite schema.
- ❌ Don't add cloud sync, CloudKit, .d2s parser, Wishlist, or Trade log — those are all v1.1+.
- ❌ Don't pull in new icon libraries, animation libraries, or state libs. Reanimated + LinearGradient + Svg (for icons only) is enough.
- ❌ Don't invent new rarity colors — §1 values are canonical.

---

## 10 · Implementation order

**Phase 1 — Foundation** (half day)
1. Update `lib/theme.ts`.
2. Wire fonts + splash hold.
3. Extend settings store with `motion` / `density`.
4. Build `EmberBG` + verify on Mules tab.
5. Export Diamond Sigil icon set (§12) and wire `app.json`.

**Phase 2 — Atoms** (1 day)
6. Diamond, RarityDot, Rule.
7. EmberBtn (all 4 variants), Chip, SectionHead.
8. TabBar restyle + rename tabs. FAB.
9. Port icon set to `react-native-svg`.
10. Build `AnimatedSplash` component (§13).

**Phase 3 — Screen polish** (2 days)
11. Mules (dashboard ribbon + row restyle).
12. Container detail (header + Comfortable/Dense toggle).
13. Item detail modal.
14. Add/Edit Item form.
15. Seek restyle.
16. Codex (Sets + Runewords) restyle.
17. Forge (Settings) with Motion + Density segments.

**Phase 4 — Motion + polish** (half day)
18. Particle field in EmberBG.
19. Pulse loops on hero elements.
20. Press animations.
21. Empty states.
22. Haptics.

---

## 11 · Reference artifacts in this project

- `ember/tokens.jsx` — canonical tokens
- `ember/atoms.jsx` — web versions of every atom
- `ember/icons.jsx` — all 40 SVG paths
- `Mule Tracker Designs.html` — interactive pixel-fidelity reference (toggle motion via Tweaks panel to preview Subtle vs Full)
- `icons.html` — app icon directions. **Final pick: 02 Diamond Sigil** (forged gold with ember core). See §12.
- `splash.html` — static-splash → animated-first-paint sequence. See §13.

---

## 12 · App icon — Diamond Sigil

The chosen mark ties the home-screen glance to a motif the user sees everywhere inside the app (diamond bullets on mule rows, rarity dots, empty-state hero).

**Structure** (1024×1024 master SVG, export to PNG at all required sizes):
- **Background**: radial gradient, `#1c0d08` center → `#0a0403` edge.
- **Outer diamond**: 540pt rotated square, forged-gold linear gradient (`#f5cf7a` → `#e8b048` → `#c88a28` top→bottom), 6pt darker inner stroke for bevel.
- **Inner diamond frame**: 480pt black cutout, then 340pt inner gold diamond, then 280pt black cutout — produces the nested forged-metal effect.
- **Ember core**: radial gradient (`#ffd080` 0% → `#ff8038` 30% → `#ff5020` 70% → transparent), 95pt radius, center.
- **Hot center**: 40pt `#ffe8b0` → 16pt `#fff`.
- **Outer glow** (dark mode only): 280pt blurred `#ff5020` at 25% opacity behind the diamond.

**Export sizes** (place in `assets/icon/` and configure `app.json`):
- `icon.png` — 1024×1024 master (App Store)
- `adaptive-icon.png` — 1024×1024 foreground for Android (diamond only, no bg)
- `adaptive-icon-bg.png` — solid `#0a0403` background layer
- `favicon.png` — 48×48 (web fallback)
- `splash-icon.png` — 200×200 (used in §13)

**`app.json` config**:
```json
{
  "expo": {
    "icon": "./assets/icon/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon/adaptive-icon.png",
        "backgroundColor": "#0a0403"
      }
    }
  }
}
```

**Light tinted variant** (iOS 18 themed icons): same mark, swap backgrounds for `#f5e8cc` → `#e8d4a8` gradient, gold for `#8a5018` (darker), keep ember core unchanged. Export as `icon-tinted.png` and wire via the iOS icon composer.

Do NOT drop-shadow the glyph at small sizes — it muddies to mush at 60pt. The bevel + inner cutout already creates depth.

---

## 13 · Splash screen

iOS launch images must be static (Apple rule). Two-stage approach:

### Stage 1: Static splash (`expo-splash-screen`)
Pure black `#070403` background, Diamond Sigil centered at ~160pt, subtle ember radial glow baked into the PNG. No wordmark, no tagline, no version. Held until fonts + initial data load.

**`app.json`**:
```json
{
  "expo": {
    "plugins": [
      ["expo-splash-screen", {
        "image": "./assets/icon/splash-icon.png",
        "imageWidth": 200,
        "backgroundColor": "#070403",
        "dark": { "backgroundColor": "#070403" }
      }]
    ]
  }
}
```

In root `_layout.tsx`:
```ts
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 600, fade: true });
// call SplashScreen.hideAsync() once fonts + db ready — NOT before
```

### Stage 2: Animated hand-off (first React frame)
As soon as the app mounts, render a full-screen `<AnimatedSplash/>` on top of Mules that runs for 2.4s then fades out. This is where Full Hellforge introduces itself; in Subtle mode, skip straight to a 250ms crossfade and drop to Mules.

**Timing** (mirror `splash.html`, but trimmed for real-app cold-start tolerance):
- `0.0s` Diamond Sigil already drawn from static splash — no pop-in.
- `0.0 → 0.6s` Ember core ignites: center gradient alpha 0 → 1 (Easing.out).
- `0.4 → 1.0s` HOARD wordmark fades in with text-flicker (`ember-text-flicker` recipe from tokens), scale 0.98 → 1.0.
- `0.8 → 1.4s` Italic tagline appears: `"even in hell, the damned keep ledgers"` in Cormorant Garamond italic, `#9a7a5c`, letterSpacing 0.5.
- `1.4 → 2.0s` Hold.
- `2.0 → 2.4s` Full layer fades out (`opacity 1 → 0`, `Math.pow(t, 0.6)` curve so the reveal is front-loaded), Mules tab underneath is fully rendered and ready.
- `2.4s` Unmount splash component.

**Full Hellforge extras** (only when `motion === 'full'`):
- 14–16 floating ember particles behind the sigil from 0.4s onward (reuse `EmberBG`'s particle system, but scaled up — larger, slower, higher contrast).
- Ambient radial glow behind sigil pulses with `1 + 0.1*sin(t*2)` brightness.
- Text-flicker on the wordmark uses decaying sine: `1 + 0.25 * Math.sin(t*18) * Math.exp(-t*2)` for the first 800ms after reveal.

**Subtle mode**:
- No particles, no pulse, no flicker.
- Sigil + wordmark appear with a single 400ms fade, hold 1s, fade to app in 250ms. Total duration: 1.65s.

**Implementation (`components/AnimatedSplash.tsx`):**
```ts
// Full-screen absolute overlay, pointerEvents: 'none' after 2s,
// unmounted at 2.4s. Uses Reanimated useSharedValue(time) driven by
// useFrameCallback or a shared start-timestamp. Don't use setInterval.
// Read motion from settings store — skip particles if 'subtle'.
// On finish, set a ref flag so it never replays on warm starts.
```

**Cold vs warm starts**: the animated hand-off only plays on cold start. Track via a module-level `let hasPlayed = false`; set true after first unmount. Warm starts skip straight to Mules.

**Data load budget**: if SQLite bootstrap takes >2s (unlikely for this app), extend the static splash automatically — don't start the animated stage until queries resolve. Avoid animated splash "blocking" perceived startup.

Match the HTML spacing/sizing exactly unless RN constraints force a change — then err toward what feels native (larger hit targets, respect safe areas).
