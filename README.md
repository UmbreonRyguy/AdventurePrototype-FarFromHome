A simple adventure game by {Ryan Funk} based on a simple adventure game engine by [Adam Smith](https://github.com/rndmcnlly).

Code requirements:
- **4+ scenes based on `AdventureScene`**: Hub, Planet1, Canyon, Planet2, Planet3, Planet3-Moon, Moonbase.
- **2+ scenes *not* based on `AdventureScene`**: Intro, Peace Ending, War Ending.
- **2+ methods or other enhancement added to the adventure game engine to simplify my scenes**:
    - Enhancement 1: Scanner - Popup window shows data about planet being collected.
    - Enhancement 2: Sample Collection - popup window that shows data sample being colected.

Experience requirements:
- **4+ locations in the game world**: Spaceship Hub, XS-26, R-40, Belabog.
- **2+ interactive objects in most scenes**: Sample Collection & Scanning on Each Planet, Different Objects to find, Secret moonbase to unlock.
- **Many objects have `pointerover` messages**: Almost every object in each scene has one
- **Many objects have `pointerdown` effects**: Each scan and sample can be clicked, every object that can be picked up has one.
- **Some objects are themselves animated**: The sample and scan have tween animation in addition to the intro scene

Asset sources:
- All assets are simple shapes created through phaser


Code sources:
- `adventure.js` and `index.html` were created for this project [Adam Smith](https://github.com/rndmcnlly) and edited by me.
- `game.js` was sketched by [Adam Smith](https://github.com/rndmcnlly) and rewritten by me.
