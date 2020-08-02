# FF7 - Fenrir
> Web based game engine for FF7 - Work-in-proress

![FF7 Fenrir](https://i.ibb.co/brqhFdw/fenrir.png)

We all love FF7, there are lots of Mods and an amazing community. As part of my personal foray into 3D graphics, I wanted to work to better understand the assets, data and logic, ideally with result of creating a new Game Engine that runs using FF7 data.

I will prodeminately be looking at recreating the fields in the first instance. Ideally it will use the in game assets (`.lgp`'s etc), but I will start using generated json fields and pngs for a start.

Live Link - [https://ff7-fenrir.netlify.app/](https://ff7-fenrir.netlify.app/)

### Installation
- None, just use the github.io url to view: 'tbc'
- To run locally, install `node.js`, `git clone https://github.com/dangarfield/ff7-fenrir.git`, `cd` to folder, `npm install serve` (or any other static web server), run `serve`, open `http://localhost:5000` in browser

### Progress - Field
- :white_check_mark: Extract all assets
- :white_check_mark: Render walkmesh and models
- :white_check_mark: Align walkmesh with static renders (Some mismatches on some fields. although this appears to be simple lateral movement)
- :white_check_mark: Extract layer by layer field data and add to kujata-data
- :white_check_mark: Apply 3D occlussion culling using Perspective Camera approach (may change approach to multiple blended orthogonal approaches) - Roughly right
- :white_check_mark: Orientation and scale of models on walkmesh (About right)
- :point_right: Control character on screen
- :black_square_button: Crop, zoom and centering for non-default viewport fields (320x240)
- :black_square_button: Viewport follows character on screen
- :black_square_button: Investigation of parallax (eg, whirlwind maze)
- :black_square_button: Investigation of moveable washmesh (eg elevators, dolphin minigame)
- :black_square_button: Begin properly implementing field op codes


### Thanks
- Picklejar76 and his work with `https://github.com/picklejar76/kujata` and `https://github.com/picklejar76/kujata-data` for game assets and services
- All of the Tsunamods Discord and Qhimm community for their extensive work so far
- Many others as I begin to work through further