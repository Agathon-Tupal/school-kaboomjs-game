import kaboom from './libs/kaboom.mjs';
import { LEVELS_JS } from './scripts/levels.js';

//"use strict";

kaboom({
    debug: true
})

loadSprite("hell_grass", "sprites/backgrounds/misc/hell_grass.png");

//loadSprite("metal_sand", "sprites/textures/metal_wall.png")


// GLOBAL: can be used anywhere
loadSprite("ejector", "sprites/textures/ejector.png")
loadSprite("chest", "sprites/textures/chest.png")
loadSprite("spawner", "sprites/textures/spawner.png")
loadSprite("note", "sprites/textures/note.png", {
    sliceX: 2,
    sliceY: 1,
    scale: 0.8,
    anims: {
        "bounce": {
            from: 0,
            to: 1,
            speed: 3,
            loop: true
        }
        
    }
})
loadSprite("bullet", "sprites/textures/bullet.png")
loadSprite("bullet-explosion", "sprites/textures/bullet-explosion.png")
loadSprite("activator", "sprites/textures/activator.png")
loadSprite("stationer", "sprites/textures/stationer.png")
loadSprite("portal", "sprites/textures/portal.png")
loadSprite("lava", "sprites/textures/lava.png")
loadSprite("portalShard", "sprites/textures/portalShard.png")


// LEVEL 1
loadSprite("dark_tile", "sprites/textures/level-1/lvl1-tile-up_scaled_3x_pngcrushed.png")
loadSprite("level-1-bg", "sprites/backgrounds/level-1-bg.png")
loadSprite("level-1-enemy", "sprites/enemies/level-1-enemy.png", {
    sliceX: 4,
    sliceY: 1,
    scale: 1,
    anims: {
        move: {
            from: 0,
            to: 3,
            speed: 4,
            loop: true
        },
        idle: {
            from: 1,
            to: 2,
            speed: 2,
            loop: true
        }
    }
})

// LEVEL 2
loadSprite("sand_tile", "sprites/textures/level-2/sand.png")
loadSprite("sandbrick_tile", "sprites/textures/level-2/sandbrick.png")
loadSprite("level-2-bg", "sprites/backgrounds/level-2-bg.png")
loadSprite("sandpillar_tile", "sprites/textures/level-2/sandpillar.png")
loadSprite("desert-fig", "sprites/textures/level-2/desert-fig.png", {
    sliceX: 3,
    sliceY: 1,
    scale: 1,
    anims: {
        sway: {
            from: 0,
            to: 2,
            speed: 6,
            loop: true
        }
    }
})
loadSprite("level-2-enemy", "sprites/enemies/level-2-enemy.png", {
    sliceX: 4,
    sliceY: 1,
    scale: 1,
    anims: {
        move: {
            from: 0,
            to: 3,
            speed: 4,
            loop: true
        },
        idle: {
            from: 1,
            to: 2,
            speed: 2,
            loop: true
        }
    }
})

// font
loadFont("myFont", "fonts/DotGothic16-Regular.ttf")


// global vars
const GRAVITY = 1400
const LEVELS = LEVELS_JS;
const PLAYER_HEALTH = 200
const BASE_PLAYER_SPEED = 400
let JUMP_STRENGTH = 670;

const GUN_DAMAGE = 50;
const BULLET_SPEED = 1200

const SPAWNER_LIMIT = 5;
let currentLevel = 0;    





scene("main_menu", () => {
    setBackground(23, 23, 23)

    const title = add([
        text("ESCAPE FROM THE UNKNOWN", {font: "myFont"}),
        pos(width()/2, height()/2- 100),
        anchor("center"),
        scale(2)
    ])

    onKeyPress("enter", () => {
        go("game", LEVELS[currentLevel])
    })
})

scene("ending_scene", () => {
    setBackground(155, 144, 155)
})

scene("failed", () => {
    setBackground(23, 23, 23);

    const title = add([
        text("YOU DIED", {font: "myFont"}),
        pos(width()/2, height()/2- 100),
        anchor("center"),
        scale(2)
    ])

    onKeyPress("enter", () => {
        go("game", LEVELS[currentLevel])
    })
})

scene("game", (LEVEL) => {

    setGravity(GRAVITY)
    
    // BACKGROUND
    const bg = add([
        sprite(LEVEL.backgroundSprite),
        z(-1),
        anchor("center"),
        fixed(),
        pos(width()/2, height()/2),
        scale(LEVEL.backgroundScale)
    ])
    
    /* -------------------------- level setup --------------------------*/


    const createPlayer = () => {
        return [
            rect(17, 28),
            color(255, 3, 23),
            area(),
            body(),
            health(PLAYER_HEALTH),
            anchor("bot"),
            scale(2.7),
            // player properties
            {
                // status
                health: PLAYER_HEALTH,
                oxygen: 200,
                // items
                inventory: {
                    portal_shards: 0,
                    healing_potions: 1,
                    tools: [

                    ]
                },
                weapons: {
                    gun: true
                },
                // abilities
                jumpMultiplier: 1,
                speedMultiplier: 1,
                // misc
                helmetOn: true,
                // 
                canGoToNextLevel: true // by default
            },
            "player"
        ]
    }

    
    const createEnemy = () => {
        if (LEVEL.hasEnemy) {
            return [
                sprite(`level-${currentLevel+1}-enemy`, {flipY: getGravity() == GRAVITY ? false : true}),
                area(),
                body(),
                //pos(x, y),
                anchor("bot"),
                health(rand(100, 200)),
                scale(LEVEL.enemyScale),
                offscreen({hide: true}),
                {
                    agro: false
                },
                "enemy"
            ]
        } else {
            return;
        }
    };
    
    
    const createNote = (text) => {
        return [
            sprite("note"),
            area(),
            body({isStatic: true}),
            anchor("bot"),
            scale(2.3), {
                text: text,
            },
            "note",
        ]
    }

    const level = addLevel(LEVEL.map, {
        tileWidth: 48,
        tileHeight: 48,
        tiles: {
            // DARK TILE
            "=" : () => [
                sprite("dark_tile"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(1),
                tile({ isObstacle: true }),
                offscreen({hide: true}),
                "solid"
            ],
            // UPSIDE DOWN DARK TILE
            "-" : () => [
                sprite("dark_tile", {flipY: true}),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(1),
                tile({ isObstacle: true }),
                offscreen({hide: true}),
                "solid"
            ],
            // SAND
            "2" : () => [
                sprite("sand_tile"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                //tile({ isObstacle: true }),
                offscreen({hide: true}),
                "solid"
            ],
            // SAND BRICK
            "3" : () => [
                sprite("sandbrick_tile"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                //tile({ isObstacle: true }),
                offscreen({hide: true}),
                "solid"
            ],
            "|" : () => [
                sprite("sandpillar_tile"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                //tile({ isObstacle: true }),
                offscreen({hide: true}),
                "solid"
            ],
            // SPIKE
            "^" : () => [
                sprite("hell_grass"),
                color(BLACK),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(1.5),
                offscreen({hide: true}),
                "spike"
            ],
            // EJECTOR
            "B" : () => [
                sprite("ejector"),
                area(),
                body(),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "ejector", "movable"
            ],
            // CHEST
            "C" : () => [
                sprite("chest"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "chest"
            ],
            // PORTAL
            "@" : () => [
                sprite("portal"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "portal",
            ],
            // ACTIVATOR
            ")" : () => [
                sprite("activator"),
                area(),
                body(),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "activator", "movable"
            ],
            // STATIONER
            "(" : () => [
                sprite("stationer", {flipX: true}),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "stationer"
            ],
            "~" : () => [
                sprite("lava"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "lava"
            ],
            "*" : () => [
                sprite("portalShard"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "portalShard"
            ],
            // creates enemy
            "!" : () => createEnemy(),
            // CREATES MORE ENEMY :3
            "S" : () => [
                sprite("spawner"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "spawner"
            ],
            // spawns player
            "P" : () => createPlayer(),
            // creates note
            "&" : () => createNote(LEVEL.levelNote.text),
            // desert-fig
            "F" : () => [
                sprite("desert-fig"),
                area(),
                body({isStatic: true}),
                anchor("bot"),
                scale(3),
                offscreen({hide: true}),
                "desertfig"
            ]
        }
    })


    /* --------------------- PLAYER ------------------------- */
    // setting the tag player as a workable object
    const player = level.get("player")[0];

    player.onUpdate(() => {
        camPos(player.pos)
    })

    
    /* --------------------- MOVEMENT ----------------------------*/
    let left = -BASE_PLAYER_SPEED;
    let right = BASE_PLAYER_SPEED;

    onKeyDown("a", () => {
        player.move(left * player.speedMultiplier, 0);
        player.flipX = true;
    })
    
    onKeyDown("d", () => {
        player.move(right * player.speedMultiplier, 0);
        player.flipX = false;
    })

    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_STRENGTH * player.jumpMultiplier)
        }
    })

    

    /* --------------------- SOME FUNCS -----------------------*/
    // INIT UI

    const ui = add([
        fixed(),
        z(99)
    ])
    
    // DAMAGE PLAYER
    async function damagePlayer(amount) {
        await player.hurt(amount);
        player.health -= amount;
    }
    // the player gets healed every 5 seconds
    async function passivelyHealPlayer(amount) {
        loop(5, async () => {
            await player.heal(amount);
            if ((player.health + amount) > PLAYER_HEALTH) {
                player.health += PLAYER_HEALTH - player.health;
            } else {
                player.health += amount;
            }
        })
    }
    passivelyHealPlayer(20)
    
    // GUN ATTACK
    async function fireGun(dir) {
        return add([
            sprite("bullet"),
            scale(1.5),
            area(),
            pos(player.pos.sub(0, 20)),
            move(dir, BULLET_SPEED),
            offscreen({destroy: true}),
            {DIR: dir}, // wala direction data sa gin butang ko na lang diri
            "bullet"
        ])
    }

    let fireGunRIGHT = 0;
    let fireGunLEFT = 180;  

    onMousePress("left", () => {
        if(player.flipX == true) {
            fireGun(fireGunLEFT);
        } else {
            fireGun(fireGunRIGHT);
        }
    })

    function grow(rate) {
		return {
			update() {
				const n = rate * dt()
				this.scale.x += n
				this.scale.y += n
			},
		}
	}
	function addExplode(p, n, rad, size) {
		for (let i = 0; i < n; i++) {
			wait(rand(n * 0.1), () => {
				for (let i = 0; i < 2; i++) {
					add([
						pos(p.add(rand(vec2(-rad), vec2(rad)))),
						sprite("bullet-explosion"),
						scale(1 * size, 1 * size),
						lifespan(0.2),
						grow(rand(9, 30) * size),
						anchor("center"),
					])
				}
			})
		}
	}



    onCollide("enemy", "bullet", (e, b) => {
        addExplode(b.pos,1, 1, 1)
        e.hurt(GUN_DAMAGE)
        destroy(b)
    })
    onCollide("solid", "bullet", (s, b) => {
        addExplode(b.pos, 1, 1, 1)
        destroy(b)
    })


    //MOVABLE STUFF
    onCollide("movable", "bullet", function(m, b) {
        if(b.DIR === fireGunLEFT) {
            m.pos.x += 10;
        } else if (b.DIR === fireGunRIGHT) {
            m.pos.x -= 10
        }
        destroy(b)
    })

    /* ----------------- TILE ANIMATIONS -------------------*/
    // DESERT FIG
    if (LEVEL.level === 2) {
        for(const desertfig of level.get("desertfig")) {
            desertfig.play("sway")
        }
    }
    
    // NOTES
    for(const note of level.get("note")) {
        note.play("bounce")
    }

    
    


    /* --------------------- EVENTS -------------------------- */

    // desert figs
    
    // jumping on bouncer blocks
    onCollide("player", "ejector", () => {
        player.jumpMultiplier = 1.5;
    })
    onCollideEnd("player", "ejector", () => {
        player.jumpMultiplier = 1;
    });
    

    // spikes 
    onCollide("player", "spike", () => {
        damagePlayer(5) 
        shake(1)
        debug.log("ouch")   // aray
    })

    onCollide("player", "portalShard", (pl, ps) => {
        destroy(ps),
        addExclaim("obtained portal shard", pl.pos)
        player.inventory.portal_shards += 1;
        debug.log(player.inventory.portal_shards);
    })

    // lava
    onCollide("player", "lava", (p, l) => {
        go("failed")
    })

      /* ----------------------- CHESTS ---------------------------------- */

    let currentChest = "";
    onCollide("player", "chest", (player, chest) => {
        currentChest = chest;
        onKeyPress("e", () => {
            if(LEVEL.item !== undefined) {
                player.inventory.tools.push(LEVEL.item);
                if(currentChest) {
                    destroy(currentChest);
                    addExclaim(`obtained ${LEVEL.item}`, player.pos)
                }
            }
        })
    })

    onCollideEnd("player", "chest", () => {
        currentChest = "";
    })


    onCollide("player", "portal", (pl, po) => {
        if (player.canGoToNextLevel == true) {
            if (currentLevel+1 !== LEVEL.length) {
                currentLevel += 1;
                go("game", LEVELS[currentLevel])
            } else {
                go("ending_scene")
            }
        } else {
            addExclaim("You cant yet enter", pl.pos)
        }   
    })

    
    
    /* ----------------------- DIALOG --------------------- */
    function addDialog() {
		const pad = 16  // padding
        const border = add([
            pos(width()/2, height()/2),
			rect(830, 510),
			color(255, 255, 255),
            anchor("center"),
			z(100),
            fixed()
        ])
		const bg = add([
			pos(border.pos),
			rect(820, 500),
			color(18, 32, 32),
            anchor("center"),
			z(100),
            fixed()
		])
		const txt = add([
			text("", {
				width: width(), font: "myFont"
			}),
			pos(width()/2 - 390, height()/2 + pad),
			z(100),
            fixed(),
            anchor('left'),
            scale(0.6)
		])
        // hides the sprites by default
        border.hidden = true;
		bg.hidden = true
		txt.hidden = true
		return {
			say(t) {
				txt.text = t
				bg.hidden = false
				txt.hidden = false
                border.hidden = false;
			},
			dismiss() {
				if (!this.active()) {
					return
				}
				txt.text = ""
				bg.hidden = true
				txt.hidden = true
                border.hidden = true;
			},
			active() {
				return !bg.hidden
			},
			destroy() {
				bg.destroy()
                border.destroy()
				txt.destroy()
			},
		}
	}

    function addExclaim(txt, p) {
        
        const bg = add([
            rect(150, 40), 
            pos(p.x, p.y-50),
            anchor("center"),
            color(18, 32, 32),
            lifespan(2),
            z(100),
        ])
        const t1xt = add([
            text(txt, {font: "myFont"}),
            pos(bg.pos),
            anchor("center"),
            scale(0.4),
            lifespan(2, {fade: 2}),
            z(100),
        ])
    }

    const dialog = addDialog() // initialize dialog per level

    player.onCollide("note", (note) => {
		dialog.say(note.text)
	})
    // when player moves away the dialog is removed
    player.onCollideEnd("note", (note) => {
        dialog.dismiss()
    })

    

    
    /* --------------------- GAME LOOP RELATED ------------------------ */
    /* ------------ Code that runs continously / onUpdate ------------- */


    /* -------- enemy spawner ---------- */
    
    
    // every spawner present will activate and spawn enemies
    async function activateEnemySpawners() {
        // loops every 9-12s 
        
        await loop(rand(9, 12), async () => {
            // if the number of enemies is less than: THE ENEMY LIMIT OF EACH SPAWNER COMBINED + ENEMIES THAT ALREADY SPAWNED IN THE LEVEL
            if (level.get("spawner").length > 0) {
                if(level.get("enemyFromSpawner").length <= (SPAWNER_LIMIT * level.get("spawner").length)) {
                    const spawner = level.get("spawner")
                    // loop through all the spawners and spawn enemies around a certain area
                    for(let i = 0; i < spawner.length; i++) {
                        const enemy = level.spawn("!", spawner[i].tilePos.sub(rand(2, -2), 1));
                        enemy.use("enemyFromSpawner")
                    }
                }
            }
        });
    }

    // checks if spawners do exist in this level
    if (level.get("spawner")) {
        
        activateEnemySpawners() // hindi paglimtan i run 
        
        // if player is next to a spawner and is carrying a pickaxe, the spawner will break
        let currentSpawner = "";
        player.onCollide("spawner", async (spawner) => {
            // to prevent all spawners from breaking in certain cases the current spawner is stored
            currentSpawner = spawner;
            await onKeyPress("r", function() {
                if (currentSpawner && spawner) {
                    if (player.inventory.tools.includes("pickaxe") === true) {
                        addExplode(player.pos, 1, 1, 1)
                        destroy(spawner)
                    } else {
                        addExclaim("you need a pickaxe", player.pos)
                    }
                } 
            })
        })
        player.onCollideEnd("spawner", async () => {
            await wait(0.3) // since kis a ga jump ka, so may delay para ma catch gyapon
            currentSpawner = "";
        })
    }
    
    /* --------------------- ENEMY AI ----------------------- */

    // runs a function every frame where if the enemy sees me or
    // if they see me within a certain y level range then they attack me
    async function makeEnemyComeAfterPlayer() {
        await player.onUpdate(async function() {
            // for enemies that are spawned in the level
            for(const enemy of level.get("enemy")) {
                if (
                    // if player is within: 1000 px x, and between -100 and +20 px from the enemy
                    player.pos.y >= enemy.pos.y - 100 && 
                    player.pos.y <= enemy.pos.y + 20 && 
                    player.pos.x >= enemy.pos.x - 1000 && 
                    player.pos.x <= enemy.pos.x + 1000
                ) {
                    // attack
                    //debug.log("spotted")
                    await enemy.move((player.pos.sub(enemy.pos).unit()).scale(LEVEL.enemySpeed))
                    if ((player.pos.sub(enemy.pos).unit()).scale(1).x < 0) {
                        enemy.flipX = true;
                        debug.log("left")
                    } else {
                        enemy.flipX = false;
                        debug.log("right")
                    }
                    enemy.agro = true;
                    
                    
                } else {
                    // they just be roaming
                    await enemy.move(rand(0, 180), 100)
                    enemy.agro = false;
                }

            }
        })
    }
    // run function
    makeEnemyComeAfterPlayer()

    // animates enemy
    loop(3, async() => {
        for(const enemy of level.get("enemy")) {
            await enemy.play("move")
        }
    })

    // when enemy dies they are expelled from reality
    on("death", "enemy", (e) => {
        destroy(e);
    })

    // enemy fire, when enemy fires bullets
    // idk recursion
    async function enemyFire() {
        // loops through all enemies
        for(const enemy of level.get("enemy")) {
            // enemy is agressive or the player has been seen
            if(enemy.agro) {
                return add([
                    pos(enemy.pos.sub(-20, 50)),
                    move(player.pos.sub(enemy.pos).unit(), BULLET_SPEED),
                    circle(5),
                    area(),
                    offscreen({ destroy: true }),
                    anchor("center"),
                    color(RED),
                    "enemybullet",
                ])
            }
        }
        
        // just a 0.1 second delay
        await wait(0.1, enemyFire)
    }
    // run the enemy fire ever 1 second
    loop(1, async () => {
        enemyFire()
    })

    // when player collides with the bullet of the enemy the player is hurt
    player.onCollide("enemybullet", async ()=> {
        await damagePlayer(10)
    })

    onCollide("enemybullet", "solid", async (eb, s) => {
        await addExplode(s.pos, 0.5, 0.5, 0.5)
        await destroy(eb);
    })
    
  

    // fall off the map for some reason
    // more dying
    player.onUpdate(() => {
        // i think 5000 ang max
        if (player.pos.y > 5000 || player.pos.y < -5000) {
            go("failed")
        }
    })

    // when you die
    on("death", "player", () => {
        go("failed")
    })

    async function reverseGravity() {
        let angle = 0; // var to store current angle para ma check in conditions
        await wait(10)  // waits 10 seconds before it starts the loop so hindi siya ma run at launch
        await loop(10, async function() {

            // para magbalik sa 0 and make our lives easier
            if (angle === 360) {
                angle = 0;
            }

            angle += 180; // change camera angle

            // reverses the gravity to the camRotation that matches
            if (angle === 180) {
                setGravity(GRAVITY*(-1))
            } else {
                setGravity(GRAVITY)
            }

            // funcs that makes sure that hindi weird when upside down
            await shake(10)             // *planet's core exploding*
            await camRot(angle);        // then i rotate
            await reverseControls()     // reverse controls
            await flipEntities();       // reverse sprites of entities
           
        })
    }
    
    function flipEntities() {
        if (getGravity() == GRAVITY) {
            player.flipY = false;
        } else {
            player.flipY = true;
        }
        
        for(const enemy of level.get("enemy")) {
            if(getGravity() == GRAVITY) {
                enemy.flipY = false;
            } else {
                enemy.flipY = true;
            }
        }
    }


    function reverseControls() {
        // reverse movement
        let temp1 = right;
        right = left;
        left = temp1;

        // reverse gun fire
        let temp2 = fireGunRIGHT;
        fireGunRIGHT = fireGunLEFT;
        fireGunLEFT = temp2
        //JUMP_STRENGTH *= (-1); // hindi pwede negative ang jump :<
    }

    /* ---------------------- USER INTERFACE ----------------------- */

    

    var healthLabel = make([
        text("hp: "+player.health, {font: "myFont"}),
        pos(width()/40, height()/40),
        scale(0.9),
    ])

    var healthBar = make([
        rect(player.health*1.5, 30),
        pos(healthLabel.pos.x + 140, healthLabel.pos.y - 5),
        outline(3),
        color(WHITE),
        scale(1.05)
    ])

    // add ui elements
    ui.add(healthLabel)
    ui.add(healthBar)
    

    // handles ui updates when stuff changes
    ui.onUpdate(() => {
        healthLabel.text = "hp: "+player.health;
        healthBar.width = player.health*1.5;
        const p = player.health;
        if (p >= 150) {
            healthBar.color = WHITE;
        } else if (p <= 149 && p >= 100) {
            healthBar.color = GREEN;
        } else if (p <= 99 && p >= 50) {
            healthBar.color = YELLOW;
        } else if (p <= 49 && p >= 0) {
            healthBar.color = RED
        }
        
    })



    // =========================== CONDITIONS ==============================
    // ====================== C O N D I T I O N S ==========================
    // ================== C* O  N  D  I  T  I  O  N *S =====================
    // ====================== C O N D I T I O N S ==========================
    // =========================== CONDITIONS ==============================



    /* --------- oxygen loss ----------*/

   // if oxygenloss is true for the level
    if (LEVEL.level === 1) {
        loop(0.8, () => {
            if (player.oxygen > 0) {
                player.oxygen -= 2;
            }
        })

        var oxygenBar = make([
            text("Oxygen:"+player.oxygen, {font: "myFont"}),
            pos(healthLabel.pos.x, healthLabel.pos.y + 50),
            scale(0.8)
        ])

        ui.add(oxygenBar);

        oxygenBar.onUpdate(() => {
            oxygenBar.text = "Oxygen: "+player.oxygen
        })

        // when player sufficates
        function sufficate(amount) {
            loop(2, () => {
                damagePlayer(amount)
            })
        }

        // if player does lose oxygen or oxygen is 0
        player.onUpdate(() => {
            if (player.oxygen < 1) {
                sufficate(20);
            }
        })

        player.onUpdate(async() => {
            if(level.get("spawner").length <= 0 && player.inventory.portal_shards == level.get("portalShards").length) {
                player.canGoToNextLevel = true;
            } else {
                player.canGoToNextLevel = false;
            }
        })
        
        
        camScale(1)
    } else if (LEVEL.level === 2) {
        // slows the player down
        player.speedMultiplier = 0.5;

        // for deserts and stuff
        let currentDesertFig  = "";
        onCollide("player", "desertfig", (player, desertfig) => {
            currentDesertFig = desertfig;
            onKeyPress("c", () => {
                if(currentDesertFig && player.inventory.tools.includes("shears") == true) {
                    addExplode(currentDesertFig.pos, 1, 1, 0.5)
                    destroy(currentDesertFig);
                } else {
                    addExclaim("you need shears", player.pos)
                }
            })
        })

        onCollideEnd("player", "desertfig", () => {
            currentDesertFig = "";
        })

        
        camScale(1.2)
    } else if (LEVEL.level === 3) {
        let activated = 0;
        let areAllStationersActivated = false;

        if ((level.get("stationer").length > 0 && level.get("activator").length > 0 ) && level.get("activator").length === level.get("stationer").length) {
            
            onCollide("activator", "stationer", () => {
            activated++;
            console.log(activated)
            if(activated >= level.get("stationer").length) {
                areAllStationersActivated = true;
            }
            })
    
            onCollideEnd("activator", "stationer", () => {
                activated--;
                console.log(activated)
            })
        }


        if(
            level.get("spawner").length <= 0 && 
            level.get("portalShards").length <= 0 && 
            areAllStationersActivated == true
        ) {
            player.canGoToNextLevel = true;
        } else {
            player.canGoToNextLevel = false;
        }

    } else if (LEVEL.level === 4) {

    } else if (LEVEL.level === 5) {

    }

    
})


// is this necessary????
document.addEventListener("DOMContentLoaded", () => {
    go("main_menu")
})

