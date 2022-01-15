# FF7 - Fenrir

> Web based game engine for FF7 - Work-in-progress

![FF7 Fenrir](https://i.ibb.co/bdNzhtR/good.png)

We all love FF7, there are lots of mods and an amazing community. As part of my personal foray into 3D graphics, I wanted to work to better understand the assets, data and logic, ideally with result of creating a new Game Engine that runs using FF7 data.

I will prodeminately be looking at recreating the fields in the first instance. Ideally it will use the in game assets (`.lgp`'s etc), but I will start using generated json fields and pngs for a start.

I've also added a huge amount of functionality to [https://github.com/dangarfield/kujata](kujata) also - Web-friendly FF7 assets

Live Link - [https://ff7-fenrir.netlify.app/](https://ff7-fenrir.netlify.app/)

### Installation

- None, [https://ff7-fenrir.netlify.app/](https://ff7-fenrir.netlify.app/) link. If you want to install locally:
- Clone this repo `git clone https://github.com/dangarfield/ff7-fenrir.git`
- Clone `git clone https://github.com/dangarfield/kujata-data.git` into a seperate directory and symlink into a previously created `ff7-fenrir` folder, ensuring that it is called `kujata-data`. Alternatively, edit `KUJATA_BASE` variable in `kernel-fetch-data.mjs` to NOT point to localhost
- Install `node.js`, `git clone https://github.com/dangarfield/ff7-fenrir.git`, `cd` to folder, `npm install` (or any other static web server), run `npm run dev` and `npm run dev-k` in 2 separate terminals, open `http://localhost:3000` in browser

### Progress - Field

- :white_check_mark: Extract model assets from kujata
- :white_check_mark: Extract field data - Added a lot more to kujata
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
- :white_check_mark: Refactor into cleaner code
- :white_check_mark: Implement remaining trigger behaviours
- :white_check_mark: Extract kernel.bin(s) to helpful format
- :white_check_mark: Extract window.bin to helpful format
- :white_check_mark: Extract window.bin individual paletted pngs
- :white_check_mark: Field position helpers -> Hand and animated arrows (not figured out scale or gatewayArrow positions yet)
- :white_check_mark: Field screen fades and action locks (menu, talk, gateway transition etc)
- :white_check_mark: Field to field transitions
- :white_check_mark: Visualise asset loading progress
- :white_check_mark: Dialog and choices - Just FLASH and RAINBOW and transparent windows todo another day
- :white_check_mark: Add 'full screen' window.config.sizing.factor config to expand to all available space
- :white_check_mark: Fix all remaining background imagery bugs (dark spots - DONE, layer 2/3 - DONE, blending/typeTrans - DONE with 1 bug)
- :white_check_mark: Add keyboard instruction image
- :white_check_mark: Begin kernel initial and save data information
- :white_check_mark: Do something about lazing loading windowTextures...
- :white_check_mark: Begin properly implementing field op codes - 93% complete. 1 -> I can do later. 3 -> Character graphics ops, undocumented / graphics model changes. 2 -> Undocumented / unknown. 12 -> Paletting, eg different approach required, eg custom shader
- :white_check_mark: Update savemap with all non op-code data, movements, directions, game time, steps etc
- :white_check_mark: Implement proper save, import, export mechanism
- :black_square_button: Add visual savemap debug mechanism
- :white_check_mark: Ensure all bg textures are loaded before fadeIn of fields
- :white_check_mark: Add visual script progress debug mechanism
- :white_check_mark: Fix npc movement speed, direction and z raycasting
- :white_check_mark: Fix player direction direction (seems to change based on keys pressed)
- :white_check_mark: Switch event loop to use render loop rather than individual async methods (performance - tin_1). I did this, but the performance was worse and there was more of a stutter in the background on / off. Replacing console.log solves all performance issues
- :white_check_mark: Add animation root translation the kujata models and apply in game
- :white_check_mark: Tweens are not paused on fade / eg window.anim.clock.stop()
- :white_check_mark: Doors models don't have correct textures / look right - bybf (door w/ lights)
- :white_check_mark: Save model doesn't rotate
- :black_square_button: Many broken field models and animations. Mostly seem to be inanimate objects, bydd (gold chest) - Investigate in kujata.
- :black_square_button: rootmap models aren't correct
- :white_check_mark: Gold chest seems to have a shine (?) animation permanently, but not in the op codes
- :white_check_mark: Add directional lighting to each model as per flevel, rather than general downlight. Implemented roughly, but there is a bug for per model lighting based on threejs limitations
- :white_check_mark: Sound loops metadata needs to be extracted properly
- :white_check_mark: Adjust ray casting so it is not the centre point, eg, no side-to-side movement on 'thin' walkmesh corridors
- :white_check_mark: Slippability sometimes looks very jagged
- :white_check_mark: Adjust all lines / gateways to 'cross' the in the required direction to trigger, instead of simple proximity check
- :white_check_mark: Relook at go, go 1x, go away. Save crystal in nmkin_4 triggers muliple go 1x
- :black_square_button: Deal with a few misaligned fields (nmkin_2,3,4)
- :white_check_mark: Decontruct Moviecamera.lgp, interpret camera movements and implement
- :white_check_mark: Implement / restrict camera movement by implementing the camera range (mds5_3, move_f)
- :black_square_button: Try and use the background images to cull the entity objects
- :black_square_button: Need to fix / properly implement animations that reset to previous state
- :black_square_button: Some animations stop mid-walk
- :white_check_mark: Need to implement SHAKE properly
- :white_check_mark: Figure out when player movement doesn't move the camera at all. eg, md1stin, cargoin, think this should be done now
- :black_square_button: Figure out relative priorities of LINE and COLLISION / TALK triggered scripts
- :white_check_mark: Investigation of parallax (eg, mds5_4). Not 100% perfect yet midgal)
- :black_square_button: Fix and finalise UInt Int arrays math for 1 and 2 byte savemap banks
- :black_square_button: Investigation of moveable washmesh (eg elevators, dolphin minigame)
- :black_square_button: Basic sounds, including collisions, triggers, talk with objects (eg, anything not from op codes)
- :black_square_button: Document and draw out the event loop logic
- :black_square_button: Reimplement the field loop in a official way, looping through 8 ops per script
- :black_square_button: Movement tweens should 'pause' when the op is not called
- :white_check_mark: MOVE etc op codes should follow walkmesh more closely on a frame by frame basis - blin69_1 - game moment 308
- :black_square_button: Investigate animation reset states, document and implement
- :black_square_button: Still need to improve background image rendering - mds6_22. Need to go through makou reactor line by line to get this all right as its horriby wrong still in some places
- :black_square_button: field fades to white then trnsitions - mds6_1, ealin_12
- :white_check_mark: NPC walk (moveEntity) speed is wrong
- :black_square_button: NPC walk (moveEntity) JOIN and LEAVE speed needs to re implemented
- :black_square_button: Add rather than hardcode collision and talk distances
- :black_square_button: Line, gateway and entity collisions should really be in the main rendering loop rather than player movement
- :black_square_button: nivl_b1 - Game moment 376 is a real mess with walkmesh, and strangely, camera positioning
- :black_square_button: Get jump height right - Game moment 400 - ujunon2
- :black_square_button: Ensure talk, collision & other entity scripts can only execute one at a time
- :black_square_button: Should check all if not at least which scroll commands are instant no wait (1 frame exec, command continues to execute in subsequent frames, field command stacks continue), instant with wait (async), sync
- :black_square_button: Need to check that JUMP animations are not broken
- :white_check_mark: Ensure PHS menu action at the end of midgar ensures that there are at least 3 people in the group
- :black_square_button: Camera movement op codes are not 100% perfect
- :black_square_button: Borderless texts show line below characters
- :black_square_button: Multi line text writes all, rather that just what is visible
- :white_check_mark: Multi page choices doesn't show the cursor
- :black_square_button: Animation reset states aren't 100% correct
- :white_check_mark: Fades aren't perfect - Should be good now, wiki updated with findingsdd
- :black_square_button: Field pointer sizes are wrong
- :black_square_button: Many gateway pointers are missing
- :white_check_mark: Implement KAWAI graphic effects
- :black_square_button: Offsets are not 100% - mds7_w2 -> save, pillar_3, mtnvl3
- :black_square_button: Have assumed all movies are disc1, need to improve
- :black_square_button: ASK pointer shadow is too dark
- :black_square_button: BUG: blin66_5 cloud anim not running
- :black_square_button: Implement remaining difficult op codes
- :white_check_mark: Add blinking eyes

### OP Code Completion Status

See the [OPS_CODES_README.md](https://github.com/dangarfield/ff7-fenrir/blob/master/OPS_CODES_README.md) for updates

### Thanks

- Picklejar76 and his work with `https://github.com/picklejar76/kujata` and `https://github.com/picklejar76/kujata-data` for game assets and services
- Myst6re and his work with `https://github.com/myst6re/makoureactor` for understanding a huge amount of the field logic and field op code behaviours
- All of the Tsunamods Discord and Qhimm community for their extensive work so far
- Many others as I begin to work through further
