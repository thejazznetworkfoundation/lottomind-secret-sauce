(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const creditsEl = document.getElementById("credits");
  const vitalsEl = document.getElementById("vitals");
  const startButton = document.getElementById("startButton");

  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = 444;
  const WORLD_WIDTH = 4300;
  const GRAVITY = 1500;

  ctx.imageSmoothingEnabled = false;

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const assets = {
    hero: null,
    bgAmethyst: null,
    bgGold: null,
    sprites: {},
  };

  const frames = {
    idle: { x: 200, y: 8, w: 92, h: 110 },
    standShoot: { x: 314, y: 8, w: 145, h: 112 },
    run: [
      { x: 20, y: 130, w: 92, h: 104 },
      { x: 126, y: 130, w: 92, h: 104 },
      { x: 224, y: 130, w: 92, h: 104 },
      { x: 324, y: 130, w: 96, h: 104 },
      { x: 426, y: 130, w: 96, h: 104 },
      { x: 522, y: 130, w: 96, h: 104 },
      { x: 622, y: 130, w: 96, h: 104 },
      { x: 722, y: 130, w: 96, h: 104 },
      { x: 822, y: 130, w: 118, h: 104 },
    ],
    jump: { x: 498, y: 244, w: 112, h: 118 },
    crouch: { x: 134, y: 358, w: 116, h: 102 },
    melee: { x: 332, y: 458, w: 142, h: 126 },
    prone: { x: 14, y: 584, w: 146, h: 68 },
    death: { x: 472, y: 646, w: 148, h: 78 },
  };

  const spriteManifest = {
    platformPanel: "IMG_3209_15.jpg",
    bridgePanel: "IMG_3209_16.jpg",
    turret: "IMG_3209_17.jpg",
    run1: "IMG_3209_18.jpg",
    run2: "IMG_3209_19.jpg",
    run3: "IMG_3209_20.jpg",
    run4: "IMG_3209_21.jpg",
    run5: "IMG_3209_22.jpg",
    run6: "IMG_3209_23.jpg",
    run7: "IMG_3209_24.jpg",
    run8: "IMG_3209_25.jpg",
    runFire: "IMG_3209_26.jpg",
    stand1: "IMG_3209_27.jpg",
    stand2: "IMG_3209_28.jpg",
    stand3: "IMG_3209_29.jpg",
    standFire1: "IMG_3209_30.jpg",
    jumpFire1: "IMG_3209_31.jpg",
    jumpFire2: "IMG_3209_32.jpg",
    jump1: "IMG_3209_33.jpg",
    jump2: "IMG_3209_34.jpg",
    treeWide: "IMG_3209_35.jpg",
    treeTall: "IMG_3209_36.jpg",
    rocks: "IMG_3209_37.jpg",
    crouch1: "IMG_3209_38.jpg",
    crouch2: "IMG_3209_39.jpg",
    crouchFire1: "IMG_3209_40.jpg",
    crouchFire2: "IMG_3209_41.jpg",
    proneFire1: "IMG_3209_42.jpg",
    prone1: "IMG_3209_43.jpg",
    prone2: "IMG_3209_44.jpg",
    proneFire2: "IMG_3209_45.jpg",
    prone3: "IMG_3209_46.jpg",
    burst: "IMG_3209_47.jpg",
    weaponPickup: "IMG_3209_48.jpg",
    creditCard: "IMG_3209_49.jpg",
    dataBook: "IMG_3209_50.jpg",
    fireBadge: "IMG_3209_51.jpg",
    fireSign: "IMG_3209_52.jpg",
    flame: "IMG_3209_53.jpg",
    skullBadge: "IMG_3209_54.jpg",
    scoreBadge: "IMG_3209_55.jpg",
    fenceWide: "IMG_3209_56.jpg",
    gate: "IMG_3209_57.jpg",
    fenceTall: "IMG_3209_58.jpg",
    leap1: "IMG_3209_59.jpg",
    leap2: "IMG_3209_60.jpg",
    swordJump1: "IMG_3209_61.jpg",
    swordJump2: "IMG_3209_62.jpg",
    swing1: "IMG_3209_63.jpg",
    hang1: "IMG_3209_64.jpg",
    hang2: "IMG_3209_65.jpg",
    swing2: "IMG_3209_66.jpg",
    swing3: "IMG_3209_67.jpg",
    stonePost1: "IMG_3209_68.jpg",
    fall1: "IMG_3209_69.jpg",
    stonePost2: "IMG_3209_70.jpg",
    stoneLedge: "IMG_3209_71.jpg",
    dirtBlock: "IMG_3209_72.jpg",
    grassTile: "IMG_3209_73.jpg",
    ladder1: "IMG_3209.jpg",
    ladder2: "IMG_3209_1.jpg",
    ropeClimb: "IMG_3209_2.jpg",
    death1: "IMG_3209_3.jpg",
    death2: "IMG_3209_4.jpg",
    death3: "IMG_3209_5.jpg",
    waterfall: "IMG_3209_6.jpg",
    smallTile: "IMG_3209_7.jpg",
    riverTile: "IMG_3209_8.jpg",
    idleFront: "IMG_3209_9.jpg",
    idleSide: "IMG_3209_10.jpg",
    idleRifle: "IMG_3209_11.jpg",
    standFire2: "IMG_3209_12.jpg",
    standFire3: "IMG_3209_13.jpg",
    run9: "IMG_3209_14.jpg",
  };

  const spriteSequences = {
    idle: ["idleRifle", "idleSide"],
    standShoot: ["standFire1", "standFire2", "standFire3"],
    run: ["run1", "run2", "run3", "run4", "run5", "run6", "run7", "run8", "run9"],
    runShoot: ["runFire", "standFire2"],
    jump: ["leap1", "leap2", "jump1", "jump2"],
    jumpShoot: ["jumpFire1", "jumpFire2"],
    crouch: ["crouch1", "crouch2"],
    crouchShoot: ["crouchFire1", "crouchFire2"],
    prone: ["prone1", "prone2", "prone3"],
    proneShoot: ["proneFire1", "proneFire2"],
    melee: ["swordJump1", "swordJump2", "swing1", "swing2", "swing3"],
    death: ["death1", "death2", "death3", "fall1"],
  };

  const pickupSpriteKeys = ["creditCard", "dataBook", "weaponPickup", "fireBadge", "scoreBadge"];

  const state = {
    mode: "ready",
    time: 0,
    score: 0,
    credits: 0,
    cameraX: 0,
    best: Number(localStorage.getItem("gothtechnology-best") || 0),
    player: null,
    platforms: [],
    enemies: [],
    bullets: [],
    enemyBullets: [],
    pickups: [],
    particles: [],
    keys: {
      left: false,
      right: false,
      down: false,
      jump: false,
      fire: false,
      melee: false,
    },
  };

  function resetGame() {
    state.mode = "running";
    state.time = 0;
    state.score = 0;
    state.credits = 0;
    state.cameraX = 0;
    state.bullets = [];
    state.enemyBullets = [];
    state.particles = [];
    state.player = {
      x: 90,
      y: GROUND_Y - 94,
      w: 44,
      h: 88,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      fireCooldown: 0,
      meleeTimer: 0,
      invincible: 0,
      hp: 5,
    };
    state.platforms = [
      { x: 0, y: GROUND_Y, w: 760, h: 120 },
      { x: 860, y: 382, w: 240, h: 30 },
      { x: 1220, y: 334, w: 230, h: 30 },
      { x: 1610, y: 396, w: 320, h: 30 },
      { x: 2100, y: 346, w: 260, h: 30 },
      { x: 2550, y: 302, w: 220, h: 30 },
      { x: 2940, y: 382, w: 330, h: 30 },
      { x: 3480, y: 334, w: 270, h: 30 },
      { x: 3880, y: GROUND_Y, w: 520, h: 120 },
    ];
    state.enemies = [
      makeEnemy(710, GROUND_Y - 58, "runner"),
      makeEnemy(1050, 382 - 58, "turret"),
      makeEnemy(1370, 334 - 58, "runner"),
      makeEnemy(1800, 396 - 58, "runner"),
      makeEnemy(2260, 346 - 58, "turret"),
      makeEnemy(2680, 302 - 58, "runner"),
      makeEnemy(3160, 382 - 58, "runner"),
      makeEnemy(3620, 334 - 58, "turret"),
      makeEnemy(4040, GROUND_Y - 98, "core"),
    ];
    state.pickups = [
      makePickup(520, 360, "creditCard"),
      makePickup(930, 320, "dataBook"),
      makePickup(1280, 268, "weaponPickup"),
      makePickup(1710, 336, "fireBadge"),
      makePickup(2160, 286, "scoreBadge"),
      makePickup(2620, 240, "creditCard"),
      makePickup(3040, 322, "dataBook"),
      makePickup(3530, 274, "weaponPickup"),
      makePickup(3980, 368, "scoreBadge"),
    ];
    startButton.textContent = "Restart";
    updateHud();
  }

  function makeEnemy(x, y, type) {
    const isCore = type === "core";
    return {
      x,
      y,
      w: isCore ? 76 : 46,
      h: isCore ? 92 : 58,
      vx: type === "runner" ? -46 : 0,
      type,
      hp: isCore ? 12 : type === "turret" ? 4 : 3,
      fireCooldown: 0.5 + Math.random() * 1.4,
      patrolMin: x - 88,
      patrolMax: x + 88,
      dead: false,
    };
  }

  function makePickup(x, y, spriteKey = "creditCard") {
    return { x, y, w: 28, h: 28, taken: false, pulse: Math.random() * 10, spriteKey };
  }

  function makeTransparentSprite(image) {
    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d");
    buffer.width = image.width;
    buffer.height = image.height;
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(image, 0, 0);

    const pixels = bctx.getImageData(0, 0, buffer.width, buffer.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const r = pixels.data[index];
      const g = pixels.data[index + 1];
      const b = pixels.data[index + 2];
      const isGrayBackdrop = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && r > 100 && r < 225;
      const isWashedEdge = r > 232 && g > 232 && b > 232;

      if (isGrayBackdrop || isWashedEdge) {
        pixels.data[index + 3] = 0;
      }
    }

    bctx.putImageData(pixels, 0, 0);
    return buffer;
  }

  function loadSpriteAssets() {
    const entries = Object.entries(spriteManifest);

    return Promise.all(
      entries.map(([key, file]) =>
        loadImage(`./assets/sprites/${file}`)
          .then((image) => [key, makeTransparentSprite(image)])
          .catch(() => null)
      )
    ).then((loadedEntries) => Object.fromEntries(loadedEntries.filter(Boolean)));
  }

  function sprite(key) {
    return assets.sprites[key] || null;
  }

  function sequenceFrame(sequenceName, fps = 12) {
    const sequence = spriteSequences[sequenceName] || spriteSequences.idle;
    const key = sequence[Math.floor(state.time * fps) % sequence.length];

    return sprite(key);
  }

  function drawSpriteImage(image, x, y, w, h, options = {}) {
    if (!image) return false;

    const { flip = false, alpha = 1, shadowColor = null, shadowBlur = 0 } = options;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = shadowColor || "transparent";
    ctx.shadowBlur = shadowBlur;

    if (flip) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, 0, w, h);
    } else {
      ctx.drawImage(image, x, y, w, h);
    }

    ctx.restore();
    return true;
  }

  function drawTiledSprite(image, x, y, w, h) {
    if (!image) return false;

    const tileWidth = Math.max(32, image.width * (h / image.height));
    for (let tileX = x; tileX < x + w; tileX += tileWidth - 4) {
      drawSpriteImage(image, tileX, y, tileWidth, h);
    }

    return true;
  }

  function update(dt) {
    if (state.mode !== "running") {
      return;
    }

    state.time += dt;
    const p = state.player;
    p.fireCooldown = Math.max(0, p.fireCooldown - dt);
    p.meleeTimer = Math.max(0, p.meleeTimer - dt);
    p.invincible = Math.max(0, p.invincible - dt);

    const targetSpeed = state.keys.down ? 105 : 230;
    if (state.keys.left) {
      p.vx = -targetSpeed;
      p.facing = -1;
    } else if (state.keys.right) {
      p.vx = targetSpeed;
      p.facing = 1;
    } else {
      p.vx *= Math.pow(0.001, dt);
      if (Math.abs(p.vx) < 8) p.vx = 0;
    }

    if (state.keys.jump && p.onGround && !state.keys.down) {
      p.vy = -560;
      p.onGround = false;
      burst(p.x + p.w / 2, p.y + p.h, "#67f4ff", 8);
    }

    if (state.keys.fire && p.fireCooldown <= 0) {
      firePlayerBullet();
    }

    if (state.keys.melee && p.meleeTimer <= 0) {
      p.meleeTimer = 0.24;
      burst(p.x + p.w / 2 + p.facing * 44, p.y + 34, "#c76cff", 12);
    }

    p.vy += GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.x = clamp(p.x, 20, WORLD_WIDTH - 110);
    resolvePlayerPlatforms();

    updateBullets(dt, state.bullets, true);
    updateBullets(dt, state.enemyBullets, false);
    updateEnemies(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateCamera();
    updateHud();

    if (p.hp <= 0) {
      endGame(false);
    }

    const core = state.enemies.find((enemy) => enemy.type === "core");
    if (p.x > WORLD_WIDTH - 320 && (!core || core.dead)) {
      endGame(true);
    }
  }

  function resolvePlayerPlatforms() {
    const p = state.player;
    p.onGround = false;

    for (const platform of state.platforms) {
      const crossedTop = p.y + p.h >= platform.y && p.y + p.h - p.vy / 60 <= platform.y + 8;
      if (p.x + p.w > platform.x && p.x < platform.x + platform.w && crossedTop && p.vy >= 0) {
        p.y = platform.y - p.h;
        p.vy = 0;
        p.onGround = true;
      }
    }

    if (p.y > H + 140) {
      damagePlayer(5);
    }
  }

  function firePlayerBullet() {
    const p = state.player;
    p.fireCooldown = 0.14;
    const crouchOffset = state.keys.down ? 28 : 36;
    state.bullets.push({
      x: p.x + (p.facing > 0 ? p.w + 8 : -12),
      y: p.y + crouchOffset,
      vx: p.facing * 650,
      w: 18,
      h: 6,
      life: 1.2,
    });
    burst(p.x + p.w / 2 + p.facing * 42, p.y + crouchOffset, "#ffc95f", 3);
  }

  function updateBullets(dt, bullets, isPlayerBullet) {
    for (const bullet of bullets) {
      bullet.x += bullet.vx * dt;
      bullet.life -= dt;

      if (isPlayerBullet) {
        for (const enemy of state.enemies) {
          if (!enemy.dead && rectsOverlap(bullet, enemy)) {
            enemy.hp -= 1;
            bullet.life = 0;
            state.score += enemy.type === "core" ? 250 : 90;
            burst(bullet.x, bullet.y, "#ffc95f", 8);
            if (enemy.hp <= 0) {
              enemy.dead = true;
              state.score += enemy.type === "core" ? 1500 : 300;
              burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.type === "core" ? "#c76cff" : "#67f4ff", 22);
            }
          }
        }
      } else if (rectsOverlap(bullet, state.player)) {
        bullet.life = 0;
        damagePlayer(1);
      }
    }

    for (let i = bullets.length - 1; i >= 0; i -= 1) {
      const bullet = bullets[i];
      if (bullet.life <= 0 || bullet.x < state.cameraX - 180 || bullet.x > state.cameraX + W + 180) {
        bullets.splice(i, 1);
      }
    }
  }

  function updateEnemies(dt) {
    const p = state.player;

    for (const enemy of state.enemies) {
      if (enemy.dead) continue;

      if (enemy.type === "runner") {
        enemy.x += enemy.vx * dt;
        if (enemy.x < enemy.patrolMin || enemy.x > enemy.patrolMax) {
          enemy.vx *= -1;
        }
      }

      if (p.meleeTimer > 0) {
        const slash = {
          x: p.facing > 0 ? p.x + p.w : p.x - 64,
          y: p.y + 10,
          w: 64,
          h: 74,
        };
        if (rectsOverlap(slash, enemy)) {
          enemy.hp -= enemy.type === "core" ? 0.7 : 1.4;
          burst(enemy.x + enemy.w / 2, enemy.y + 24, "#c76cff", 5);
          if (enemy.hp <= 0) {
            enemy.dead = true;
            state.score += enemy.type === "core" ? 1600 : 360;
          }
        }
      }

      if (rectsOverlap(enemy, p)) {
        damagePlayer(1);
      }

      enemy.fireCooldown -= dt;
      const onScreen = enemy.x > state.cameraX - 120 && enemy.x < state.cameraX + W + 120;
      if (enemy.fireCooldown <= 0 && onScreen) {
        enemy.fireCooldown = enemy.type === "core" ? 0.75 : enemy.type === "turret" ? 1.35 : 1.9;
        const direction = p.x < enemy.x ? -1 : 1;
        state.enemyBullets.push({
          x: enemy.x + enemy.w / 2,
          y: enemy.y + enemy.h * 0.45,
          vx: direction * (enemy.type === "core" ? 410 : 320),
          w: enemy.type === "core" ? 18 : 14,
          h: enemy.type === "core" ? 10 : 7,
          life: 2.4,
        });
      }
    }
  }

  function updatePickups(dt) {
    const p = state.player;
    for (const pickup of state.pickups) {
      if (pickup.taken) continue;
      pickup.pulse += dt * 5;
      if (rectsOverlap(p, pickup)) {
        pickup.taken = true;
        state.credits += 1;
        state.score += 175;
        burst(pickup.x + 14, pickup.y + 14, "#ffc95f", 14);
      }
    }
  }

  function damagePlayer(amount) {
    const p = state.player;
    if (p.invincible > 0) return;
    p.hp = Math.max(0, p.hp - amount);
    p.invincible = 0.85;
    p.vx = -p.facing * 150;
    p.vy = -180;
    burst(p.x + p.w / 2, p.y + p.h / 2, "#ff5f87", 18);
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 170;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.28 + Math.random() * 0.42,
        size: 2 + Math.random() * 4,
      });
    }
  }

  function updateParticles(dt) {
    for (const particle of state.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 180 * dt;
      particle.life -= dt;
    }
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      if (state.particles[i].life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  }

  function updateCamera() {
    const target = state.player.x - W * 0.38;
    state.cameraX += (clamp(target, 0, WORLD_WIDTH - W) - state.cameraX) * 0.12;
  }

  function endGame(won) {
    state.mode = won ? "won" : "lost";
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem("gothtechnology-best", String(state.best));
    }
    startButton.textContent = "Run Again";
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawWorld();
    drawPickups();
    drawEnemies();
    drawBullets();
    drawPlayer();
    drawParticles();
    drawPortal();
    drawOverlay();
  }

  function drawBackground() {
    ctx.save();
    drawParallax(assets.bgAmethyst, 0.18, 0.92, -12);
    ctx.globalAlpha = 0.34;
    drawParallax(assets.bgGold, 0.34, 1, 12);
    ctx.globalAlpha = 1;

    const vignette = ctx.createLinearGradient(0, 0, 0, H);
    vignette.addColorStop(0, "rgba(1, 2, 8, 0.74)");
    vignette.addColorStop(0.48, "rgba(1, 2, 8, 0.1)");
    vignette.addColorStop(1, "rgba(1, 2, 8, 0.82)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawParallax(image, factor, scale = 1, y = 0) {
    if (!image) return;
    const drawHeight = H * scale;
    const drawWidth = image.width * (drawHeight / image.height);
    const offset = -((state.cameraX * factor) % drawWidth);
    for (let x = offset - drawWidth; x < W + drawWidth; x += drawWidth) {
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
    }
  }

  function drawScenerySprites() {
    const scenery = [
      { key: "treeWide", x: 560, y: GROUND_Y - 126, w: 136, h: 112 },
      { key: "rocks", x: 820, y: GROUND_Y - 42, w: 86, h: 48 },
      { key: "ladder1", x: 1036, y: 296, w: 58, h: 92 },
      { key: "treeTall", x: 1510, y: 270, w: 94, h: 126 },
      { key: "fenceWide", x: 1970, y: GROUND_Y - 112, w: 118, h: 112 },
      { key: "ropeClimb", x: 2184, y: 214, w: 58, h: 124 },
      { key: "waterfall", x: 2380, y: 260, w: 108, h: 166 },
      { key: "gate", x: 3320, y: 244, w: 102, h: 124 },
      { key: "fenceTall", x: 3770, y: GROUND_Y - 116, w: 106, h: 116 },
    ];

    for (const item of scenery) {
      const x = item.x - state.cameraX;
      if (x + item.w < -160 || x > W + 160) continue;
      drawSpriteImage(sprite(item.key), x, item.y, item.w, item.h, { alpha: 0.88 });
    }
  }

  function drawWorld() {
    drawScenerySprites();

    for (const platform of state.platforms) {
      const x = Math.round(platform.x - state.cameraX);
      if (x + platform.w < -80 || x > W + 80) continue;

      if (platform.y === GROUND_Y) {
        drawTiledSprite(sprite("smallTile") || sprite("riverTile"), x, platform.y + 38, platform.w, 44);
      }

      const topSprite = platform.y === GROUND_Y ? sprite("grassTile") || sprite("dirtBlock") : sprite("bridgePanel") || sprite("platformPanel");
      const drewTop = drawTiledSprite(topSprite, x, platform.y - 30, platform.w, platform.y === GROUND_Y ? 68 : 46);

      if (!drewTop) {
        const topGrad = ctx.createLinearGradient(0, platform.y - 18, 0, platform.y + 14);
        topGrad.addColorStop(0, "#a3d35a");
        topGrad.addColorStop(1, "#22351d");
        ctx.fillStyle = topGrad;
        roundRect(x, platform.y - 18, platform.w, 28, 9);
        ctx.fill();
      }

      const bodyGrad = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.h);
      bodyGrad.addColorStop(0, "#2b211d");
      bodyGrad.addColorStop(1, "#080907");
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(x, platform.y + 4, platform.w, platform.h);

      if (platform.y !== GROUND_Y) {
        drawSpriteImage(sprite("stonePost1"), x + platform.w * 0.18, platform.y + 12, 70, 72, { alpha: 0.78 });
        if (platform.w > 220) {
          drawSpriteImage(sprite("stonePost2"), x + platform.w - 86, platform.y + 12, 70, 72, { alpha: 0.78 });
        }
      }

      ctx.strokeStyle = "rgba(199, 108, 255, 0.32)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 20, platform.y + 18);
      ctx.lineTo(x + platform.w - 24, platform.y + 18);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.fillRect(0, GROUND_Y + 80, W, H - GROUND_Y);
  }

  function drawPickups() {
    for (const pickup of state.pickups) {
      if (pickup.taken) continue;
      const x = pickup.x - state.cameraX;
      const y = pickup.y + Math.sin(pickup.pulse) * 5;

      const pickupImage = sprite(pickup.spriteKey) || sprite(pickupSpriteKeys[Math.floor(pickup.pulse) % pickupSpriteKeys.length]);
      if (drawSpriteImage(pickupImage, x - 7, y - 9, 42, 42, {
        shadowColor: "#ffc95f",
        shadowBlur: 12,
      })) {
        continue;
      }

      ctx.save();
      ctx.translate(x + pickup.w / 2, y + pickup.h / 2);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#ffc95f";
      ctx.shadowColor = "#ffc95f";
      ctx.shadowBlur = 16;
      ctx.fillRect(-9, -9, 18, 18);
      ctx.restore();
    }
  }

  function drawEnemies() {
    for (const enemy of state.enemies) {
      if (enemy.dead) continue;
      const x = enemy.x - state.cameraX;
      if (x < -120 || x > W + 120) continue;

      if (enemy.type === "turret" && drawSpriteImage(sprite("turret"), x - 28, enemy.y - 28, 108, 88, {
        flip: enemy.vx > 0,
        shadowColor: "#ffc95f",
        shadowBlur: 10,
      })) {
        continue;
      }

      if (enemy.type === "runner") {
        const enemySprite = sequenceFrame("run", 9) || sprite("idleRifle");
        if (drawSpriteImage(enemySprite, x - 20, enemy.y - 42, 94, 112, {
          flip: enemy.vx > 0,
          alpha: 0.9,
          shadowColor: "#ff5f87",
          shadowBlur: 8,
        })) {
          continue;
        }
      }

      if (enemy.type === "core") {
        const coreOpen = Math.sin(state.time * 5) > 0.15;
        drawSpriteImage(sprite("gate"), x - 28, enemy.y - 38, 126, 152, {
          alpha: 0.92,
          shadowColor: "#c76cff",
          shadowBlur: 22,
        });
        drawSpriteImage(sprite(coreOpen ? "fireSign" : "skullBadge"), x + 8, enemy.y - 8, 62, 62, {
          shadowColor: coreOpen ? "#ffc95f" : "#ff5f87",
          shadowBlur: 16,
        });
        if (coreOpen) {
          drawSpriteImage(sprite("flame"), x + 26, enemy.y + 44, 42, 42, {
            shadowColor: "#ffc95f",
            shadowBlur: 18,
          });
        }
        drawEnemyHealthBar(enemy, x, "#c76cff", 12);
        continue;
      }

      ctx.save();
      ctx.translate(x + enemy.w / 2, enemy.y + enemy.h / 2);
      ctx.shadowColor = enemy.type === "core" ? "#c76cff" : "#ff5f87";
      ctx.shadowBlur = enemy.type === "core" ? 24 : 10;
      ctx.fillStyle = enemy.type === "core" ? "#1d0e2a" : "#23131d";
      roundRect(-enemy.w / 2, -enemy.h / 2, enemy.w, enemy.h, enemy.type === "core" ? 18 : 8);
      ctx.fill();
      ctx.strokeStyle = enemy.type === "core" ? "#c76cff" : "#ff5f87";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffc95f";
      ctx.fillRect(-enemy.w * 0.22, -enemy.h * 0.1, enemy.w * 0.44, 5);
      ctx.fillStyle = "#67f4ff";
      ctx.fillRect(enemy.w * 0.08, -enemy.h * 0.28, 6, 6);
      ctx.restore();

      drawEnemyHealthBar(enemy, x, enemy.type === "turret" ? "#ffc95f" : "#ff5f87", enemy.type === "turret" ? 4 : 3);
    }
  }

  function drawEnemyHealthBar(enemy, x, color, maxHp) {
    const barWidth = enemy.type === "core" ? 90 : 44;
    const y = enemy.y - 18;
    ctx.fillStyle = "rgba(0, 0, 0, 0.56)";
    ctx.fillRect(x - 4, y, barWidth, 8);
    ctx.fillStyle = color;
    ctx.fillRect(x - 4, y, barWidth * clamp(enemy.hp / maxHp, 0, 1), 8);
  }

  function drawBullets() {
    ctx.save();
    for (const bullet of state.bullets) {
      if (!drawSpriteImage(sprite("burst"), bullet.x - state.cameraX - 4, bullet.y - 12, 30, 30, {
        shadowColor: "#ffc95f",
        shadowBlur: 14,
      })) {
        ctx.fillStyle = "#ffc95f";
        ctx.shadowColor = "#ffc95f";
        ctx.shadowBlur = 14;
        roundRect(bullet.x - state.cameraX, bullet.y, bullet.w, bullet.h, 5);
        ctx.fill();
      }
    }
    for (const bullet of state.enemyBullets) {
      if (!drawSpriteImage(sprite("flame"), bullet.x - state.cameraX - 5, bullet.y - 16, 32, 32, {
        shadowColor: "#ff5f87",
        shadowBlur: 10,
      })) {
        ctx.fillStyle = "#ff5f87";
        ctx.shadowColor = "#ff5f87";
        ctx.shadowBlur = 10;
        roundRect(bullet.x - state.cameraX, bullet.y, bullet.w, bullet.h, 5);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawPlayer() {
    const p = state.player;
    if (!p) return;
    if (p.invincible > 0 && Math.floor(state.time * 18) % 2 === 0) return;

    const moving = Math.abs(p.vx) > 35;
    let sequenceName = "idle";
    let fps = 10;

    if (p.meleeTimer > 0) {
      sequenceName = "melee";
      fps = 12;
    } else if (!p.onGround) {
      sequenceName = state.keys.fire ? "jumpShoot" : "jump";
      fps = 8;
    } else if (state.keys.down && moving) {
      sequenceName = state.keys.fire ? "proneShoot" : "prone";
      fps = 10;
    } else if (state.keys.down) {
      sequenceName = state.keys.fire ? "crouchShoot" : "crouch";
      fps = 8;
    } else if (state.keys.fire && moving) {
      sequenceName = "runShoot";
      fps = 12;
    } else if (state.keys.fire) {
      sequenceName = "standShoot";
      fps = 10;
    } else if (moving) {
      sequenceName = "run";
      fps = 14;
    }

    const spriteFrame = sequenceFrame(sequenceName, fps);
    if (spriteFrame) {
      const scale = sequenceName.includes("prone") ? 1.18 : sequenceName.includes("crouch") ? 1.26 : 1.32;
      const dw = spriteFrame.width * scale;
      const dh = spriteFrame.height * scale;
      const dx = Math.round(p.x - state.cameraX + p.w / 2 - dw / 2);
      const dy = Math.round(p.y + p.h - dh + (sequenceName.includes("prone") ? 24 : 12));

      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.ellipse(p.x - state.cameraX + p.w / 2, p.y + p.h + 3, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      drawSpriteImage(spriteFrame, dx, dy, dw, dh, {
        flip: p.facing < 0,
        shadowColor: p.meleeTimer > 0 ? "#c76cff" : "#67f4ff",
        shadowBlur: p.meleeTimer > 0 ? 18 : 9,
      });
      return;
    }

    let frame = frames.idle;
    if (p.meleeTimer > 0) {
      frame = frames.melee;
    } else if (!p.onGround) {
      frame = frames.jump;
    } else if (state.keys.down && moving) {
      frame = frames.prone;
    } else if (state.keys.down) {
      frame = frames.crouch;
    } else if (state.keys.fire) {
      frame = frames.standShoot;
    } else if (moving) {
      frame = frames.run[Math.floor(state.time * 14) % frames.run.length];
    }

    const scale = state.keys.down && frame === frames.prone ? 1.08 : 1.18;
    const dw = frame.w * scale;
    const dh = frame.h * scale;
    const dx = Math.round(p.x - state.cameraX + p.w / 2 - dw / 2);
    const dy = Math.round(p.y + p.h - dh + 12);

    ctx.save();
    ctx.shadowColor = p.meleeTimer > 0 ? "#c76cff" : "#67f4ff";
    ctx.shadowBlur = p.meleeTimer > 0 ? 18 : 9;
    if (p.facing < 0) {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(assets.hero, frame.x, frame.y, frame.w, frame.h, 0, 0, dw, dh);
    } else {
      ctx.drawImage(assets.hero, frame.x, frame.y, frame.w, frame.h, dx, dy, dw, dh);
    }
    ctx.restore();

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(p.x - state.cameraX + p.w / 2, p.y + p.h + 3, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParticles() {
    for (const particle of state.particles) {
      ctx.globalAlpha = clamp(particle.life / 0.7, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - state.cameraX, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawPortal() {
    const core = state.enemies.find((enemy) => enemy.type === "core");
    const open = !core || core.dead;
    const x = WORLD_WIDTH - 180 - state.cameraX;
    const y = GROUND_Y - 132;
    ctx.save();
    drawSpriteImage(sprite("gate"), x - 6, y - 14, 112, 144, {
      alpha: open ? 1 : 0.58,
      shadowColor: open ? "#ffc95f" : "#c76cff",
      shadowBlur: open ? 24 : 12,
    });
    ctx.strokeStyle = open ? "#ffc95f" : "rgba(199, 108, 255, 0.45)";
    ctx.lineWidth = 5;
    ctx.shadowColor = open ? "#ffc95f" : "#c76cff";
    ctx.shadowBlur = open ? 26 : 14;
    roundRect(x, y, 100, 130, 18);
    ctx.stroke();
    ctx.fillStyle = open ? "rgba(255, 201, 95, 0.14)" : "rgba(199, 108, 255, 0.08)";
    ctx.fill();
    ctx.restore();
  }

  function drawOverlay() {
    if (state.mode === "running") return;

    ctx.save();
    ctx.fillStyle = "rgba(1, 2, 8, 0.72)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f7eeff";
    ctx.font = "900 48px Trebuchet MS, sans-serif";
    const title = state.mode === "won" ? "Core Shut Down" : state.mode === "lost" ? "Signal Lost" : "Gothtechnology";
    ctx.fillText(title, W / 2, H / 2 - 40);
    ctx.fillStyle = "#c76cff";
    ctx.font = "800 18px Trebuchet MS, sans-serif";
    const prompt =
      state.mode === "ready"
        ? "Press Start Run, Enter, or Space to begin"
        : `Score ${state.score.toLocaleString()} - Best ${state.best.toLocaleString()} - press Start Run`;
    ctx.fillText(prompt, W / 2, H / 2 + 4);
    ctx.fillStyle = "#bbaed0";
    ctx.font = "700 14px Trebuchet MS, sans-serif";
    ctx.fillText("Move, jump, shoot, slash, collect mind credits, and break the cathedral core.", W / 2, H / 2 + 36);
    ctx.restore();
  }

  function drawBootScreen(message = "Loading updated sprite build...") {
    ctx.clearRect(0, 0, W, H);
    const background = ctx.createLinearGradient(0, 0, W, H);
    background.addColorStop(0, "#03040a");
    background.addColorStop(0.55, "#090512");
    background.addColorStop(1, "#061116");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f7eeff";
    ctx.font = "900 48px Trebuchet MS, sans-serif";
    ctx.fillText("Gothtechnology", W / 2, H / 2 - 24);
    ctx.fillStyle = "#ffc95f";
    ctx.font = "800 16px Trebuchet MS, sans-serif";
    ctx.fillText(message, W / 2, H / 2 + 20);
    ctx.textAlign = "start";
  }

  function updateHud() {
    scoreEl.textContent = String(state.score).padStart(6, "0");
    creditsEl.textContent = String(state.credits);
    vitalsEl.textContent = state.player ? String(state.player.hp) : "5";
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  function setAction(action, value) {
    if (action in state.keys) {
      state.keys[action] = value;
    }
  }

  const keyMap = new Map([
    ["arrowleft", "left"],
    ["a", "left"],
    ["arrowright", "right"],
    ["d", "right"],
    ["arrowdown", "down"],
    ["s", "down"],
    ["arrowup", "jump"],
    ["w", "jump"],
    [" ", "fire"],
    ["j", "fire"],
    ["k", "melee"],
  ]);

  window.addEventListener("keydown", (event) => {
    const normalizedKey = event.key.toLowerCase();
    if (normalizedKey === "enter" && state.mode !== "running") {
      event.preventDefault();
      resetGame();
      return;
    }

    const action = keyMap.get(normalizedKey);
    if (!action) return;
    event.preventDefault();
    if ((event.key === " " || event.key === "Enter") && state.mode !== "running") {
      resetGame();
      return;
    }
    setAction(action, true);
  });

  window.addEventListener("keyup", (event) => {
    const action = keyMap.get(event.key.toLowerCase());
    if (!action) return;
    event.preventDefault();
    setAction(action, false);
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.getAttribute("data-action");
    const hold = (value) => {
      button.classList.toggle("is-held", value);
      setAction(action, value);
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      hold(true);
    });
    button.addEventListener("pointerup", () => hold(false));
    button.addEventListener("pointerleave", () => hold(false));
    button.addEventListener("pointercancel", () => hold(false));
  });

  startButton.addEventListener("click", resetGame);

  let previous = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - previous) / 1000);
    previous = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  drawBootScreen();

  Promise.all([
    loadSpriteAssets(),
    loadImage("./assets/goth-hero-sheet.png"),
    loadImage("./assets/goth-bg-amethyst.png"),
    loadImage("./assets/goth-bg-gold.png"),
  ]).then(([sprites, hero, bgAmethyst, bgGold]) => {
    assets.sprites = sprites;
    assets.hero = hero;
    assets.bgAmethyst = bgAmethyst;
    assets.bgGold = bgGold;
    state.player = {
      x: 90,
      y: GROUND_Y - 94,
      w: 44,
      h: 88,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: true,
      fireCooldown: 0,
      meleeTimer: 0,
      invincible: 0,
      hp: 5,
    };
    updateHud();
    requestAnimationFrame(loop);
  }).catch(() => {
    drawBootScreen("Could not load the game art. Refresh the arcade preview.");
  });
})();
