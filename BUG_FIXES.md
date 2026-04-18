# Pre-existing TypeScript Error Fixes

## Bug #1: Settings Never Persist (CRITICAL) 🔥

**File:** `lib/settings.tsx` line 51

**Problem:** Using async `file.text()` instead of sync `file.textSync()`
- Returns `Promise<string>` not `string`
- `JSON.parse()` throws, falls to defaults
- **Runtime impact:** Motion, density, and tutorialCompleted never persist!

**Fix:**
```typescript
// OLD (line 51):
const raw = file.text();

// NEW:
const raw = file.textSync();
```

---

## Bug #2: letterSpacing TypeScript Error

**File:** `app/_layout.tsx` lines 140-143

**Problem:** Native stack headers don't support `letterSpacing`
- Type only allows: `fontFamily`, `fontSize`, `fontWeight`, `color`
- Even if it compiled, iOS/Android wouldn't render it

**Fix Option 1 (Simple):** Remove the property
```typescript
headerTitleStyle: {
  fontFamily: 'Cinzel-SemiBold',
  // letterSpacing: 2,  // <-- remove
},
```

**Fix Option 2 (Custom):** Use headerTitle render prop
```typescript
headerTitle: ({ children }) => (
  <Text style={{
    fontFamily: 'Cinzel-SemiBold',
    letterSpacing: 2,
    color: colors.text,
  }}>
    {children}
  </Text>
),
```

**Recommendation:** Option 1 (remove) - simpler, native header is fine

---

## Application Order

1. Fix Bug #1 FIRST (critical runtime bug)
2. Fix Bug #2 (cosmetic TypeScript error)

Both are one-line changes, safe to commit together.
