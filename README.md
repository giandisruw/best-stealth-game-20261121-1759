# The Night Courier

[![make.fun](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/giandisruw/best-stealth-game-20261121-1759/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/giandisruw/best-stealth-game-20261121-1759/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)

An original top-down 2D stealth game in vanilla canvas JavaScript — no
libraries, no network requests. You are the Night Courier, carrying sealed
letters through a moonlit museum after hours. Slip past the guards' vision
cones, hide in the bushes and shadows, collect the letters, and reach the
golden exit door unseen.

## How to play

- **WASD / arrow keys** — walk (hold **Shift** to sneak: slower, harder to spot)
- **Click** — set a walk target
- **Right-click** — throw a pebble to lure a nearby guard away (5 per wing)
- **P** — pause, **R** — restart, **M** — mute, **Enter** — start

## The stealth

- Guards patrol fixed routes with visible vision cones that change colour
  with their alert state: green calm, yellow suspicious, orange alerted,
  red chase.
- A suspicion meter (the arc over each guard's head and the bar in the HUD)
  rises while you are seen and decays when you break line of sight — being
  spotted is not instant failure; you can recover.
- Bushes hide you completely unless a guard is almost on top of you;
  shadow zones slow how fast you are spotted; walls block sight entirely.
- Caught guards chase; suspicious guards investigate the last place they
  saw you, look around, then return to patrol.

Three wings of rising difficulty (2, then 3, then 4 guards, tighter
patrols), letters to collect in each, a timer, and a win screen that totals
your run.

## Sound

All sound is generated with WebAudio — footsteps, the alert sting, the
pebble clatter, pickup chimes and the win arpeggio. No audio files.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are staged states of the real game (`game/src/shots.js`,
`?shot=start|play|play2|end&seed=1`): the mid-game sneak (the cover),
the title screen, the near-miss alert moment, and the win screen.

## Layout

- `game/index.html` — the page and canvas
- `game/src/config.js` — all tuning numbers and colours
- `game/src/random.js` — seeded RNG for deterministic layouts and shots
- `game/src/level.js` — the three wings as plain level data
- `game/src/guards.js` — patrol, vision cones, line of sight, suspicion
- `game/src/player.js` — movement, pebbles, letters, win/caught checks
- `game/src/input.js` — keyboard and mouse, mapped to field coordinates
- `game/src/audio.js` — generated WebAudio sounds
- `game/src/render.js` — all drawing: world, HUD, title/win/caught screens
- `game/src/shots.js` — staged screenshot states driven by an autopilot
- `game/src/main.js` — game loop and state machine
- `main.ts` — copies `game/` and `screenshots/` to `/output`, writes the dossier
- `serve.ts` — tiny local static server for play-testing

MIT licensed. Built for the make.fun best stealth game bounty.
