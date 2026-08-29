# Disdrometer

A lightweight macOS menu-bar app that adds a customizable rain overlay to your desktop. It’s built to be entirely non-intrusive—perfect for ambient background visuals while you work.

## Features

* **Lives in the menu bar:** No Dock icon clutter. All controls are tucked away in the menu bar dropdown.
* **Multi-display support:** Automatically detects connected monitors and spans the rain effect across all of them.
* **Click-through overlays:** The rain windows ignore mouse events, so they never interfere with your actual work.
* **Hardware-accelerated:** Uses `CAEmitterLayer` to keep CPU and GPU usage close to zero.
* **Tweakable physics:** Adjust drop intensity, fall speed, wind angle, opacity, and lifetime on the fly. Settings save automatically via `UserDefaults`.

## Requirements

* macOS 13.0+ (relies on SwiftUI's `MenuBarExtra`)
* Xcode 14+ / Swift 5.9
* Zero external dependencies.

## Installation

**Download the app:**
Grab the latest pre-built binary from the **Releases** page, unzip it, and drag `Disdrometer.app` to your `/Applications` folder.

**Build from source:**

```sh
git clone https://github.com/yourusername/disdrometer.git
cd disdrometer
open Disdrometer/Disdrometer.xcodeproj

```

Once open in Xcode, select the **Disdrometer** scheme and hit `⌘R` to build and run.

To build via the command line:

```sh
xcodebuild -scheme Disdrometer -configuration Release
# The binary will output to ./build/Release/Disdrometer.app

```

## Architecture

The project uses a lightweight MVVM approach, mixing SwiftUI for the menu-bar interface with Core Animation for the actual rain rendering.

```text
DisdrometerApp.swift  → Entry point, handles app lifecycle and screen change observation
MenuBarView.swift     → The SwiftUI dropdown menu (sliders, toggles, reset button)
RainController.swift  → Manages user settings and the lifecycle of the rain windows
RainWindow.swift      → The borderless, click-through NSWindow (one per display)
RainView.swift        → The NSView rendering the CAEmitterLayer rain effect

```

## Settings

You can tweak the environment in real-time from the menu bar. Hit the **Reset** button at any time to revert to the default drizzle.

| Parameter | Range | What it does |
| --- | --- | --- |
| **Intensity** | 20–400 drops/s | How heavily it's raining |
| **Fall Speed** | 200–1600 pt/s | The vertical velocity of the raindrops |
| **Wind Angle** | -30° to 30° | Horizontal drift (left to right) |
| **Opacity** | 0.1–1.0 | Visual transparency of the drops |
| **Lifetime** | 1–15 s | How long a drop exists before disappearing |

---
