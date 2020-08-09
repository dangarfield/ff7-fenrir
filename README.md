# FF7 - Fenrir
> Web based game engine for FF7 - Work-in-proress

![FF7 Fenrir](https://i.ibb.co/LR51c6f/title.png)

We all love FF7, there are lots of Mods and an amazing community. As part of my personal foray into 3D graphics, I wanted to work to better understand the assets, data and logic, ideally with result of creating a new Game Engine that runs using FF7 data.

I will prodeminately be looking at recreating the fields in the first instance. Ideally it will use the in game assets (`.lgp`'s etc), but I will start using generated json fields and pngs for a start.

Live Link - [https://ff7-fenrir.netlify.app/](https://ff7-fenrir.netlify.app/)

### Installation
- None, [https://ff7-fenrir.netlify.app/](https://ff7-fenrir.netlify.app/) link. If you want to install locally:
- Clone this repo `git clone https://github.com/dangarfield/ff7-fenrir.git`
- Clone `git clone https://github.com/dangarfield/kujata-data.git` into a seperate directory and symlink into a previously created `ff7-fenrir` folder, ensuring that it is called `kujata-data-dg`. Alternatively, edit `KUJATA_BASE` variable in `app.mjs` to NOT point to localhost
- Install `node.js`, `git clone https://github.com/dangarfield/ff7-fenrir.git`, `cd` to folder, `npm install serve` (or any other static web server), run `serve`, open `http://localhost:5000` in browser

### Progress - Field
- :white_check_mark: Extract all assets
- :white_check_mark: Render walkmesh and models
- :white_check_mark: Align walkmesh with static renders (Some mismatches on some fields. although this appears to be simple lateral movement)
- :white_check_mark: Extract layer by layer field data and add to kujata-data
- :white_check_mark: Apply 3D occlussion culling using Perspective Camera approach (may change approach to multiple blended orthogonal approaches) - Roughly right
- :white_check_mark: Orientation and scale of models on walkmesh (About right)
- :white_check_mark: Control character on screen
- :white_check_mark: Crop, zoom and centering for non-default viewport fields (320x240)
- :white_check_mark: Viewport follows character on screen
- :white_check_mark: Triggers and gateways have collisions and behaviours
- :white_check_mark: Model collision detection and talking area collision
- :white_check_mark: Model collision detection and talking collision
- :white_check_mark: Refactor into cleaner code
- :white_check_mark: Implement remaing trigger behaviours
- :point_right: Implement ladders / jumps Or will this be part of op codes?
- :black_square_button: BUG - can fall off walkmesh easily
- :black_square_button: Field position helpers -> Hand and arrows
- :black_square_button: Field transitions
- :black_square_button: Text and text interactions
- :black_square_button: Fix all remaining background imagery bugs (dark spots, layer 3, blending/typeTrans)
- :black_square_button: Investigation of parallax (eg, whirlwind maze)
- :black_square_button: Investigation of moveable washmesh (eg elevators, dolphin minigame)
- :black_square_button: Begin properly implementing field op codes
- :black_square_button: Basic sounds, including collisions, triggers, talk with objects (eg, anything not from op codes)


### Thanks
- Picklejar76 and his work with `https://github.com/picklejar76/kujata` and `https://github.com/picklejar76/kujata-data` for game assets and services
- All of the Tsunamods Discord and Qhimm community for their extensive work so far
- Many others as I begin to work through further