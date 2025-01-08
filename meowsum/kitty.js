// Stop looking at the source code and play with the cat ;3

(function kitty() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  const kittyEl = document.createElement('div');
  const kittySpeed = 10;
  const spriteSize = 32;
  const halfSpriteSize = spriteSize / 2;
  const kittyFile = document.currentScript?.dataset.cat || './kitty.gif';

  let kittyPosX = halfSpriteSize;
  let kittyPosY = halfSpriteSize;
  let mousePosX = 0;
  let mousePosY = 0;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  let lastFrameTimestamp;

  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
    scratchWallN: [[0, 0], [0, -1]],
    scratchWallS: [[-7, -1], [-6, -2]],
    scratchWallE: [[-2, -2], [-2, -3]],
    scratchWallW: [[-4, 0], [-4, -1]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0], [-2, -1]],
    N: [[-1, -2], [-1, -3]],
    NE: [[0, -2], [0, -3]],
    E: [[-3, 0], [-3, -1]],
    SE: [[-5, -1], [-5, -2]],
    S: [[-6, -3], [-7, -2]],
    SW: [[-5, -3], [-6, -1]],
    W: [[-4, -2], [-4, -3]],
    NW: [[-1, 0], [-1, -1]],
  };

  function init() {
    setupKittyElement();
    document.body.appendChild(kittyEl);
    document.addEventListener('mousemove', updateMousePosition);
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setupKittyElement() {
    Object.assign(kittyEl.style, {
      width: `${spriteSize}px`,
      height: `${spriteSize}px`,
      position: 'fixed',
      pointerEvents: 'none',
      imageRendering: 'pixelated',
      left: `${kittyPosX - halfSpriteSize}px`,
      top: `${kittyPosY - halfSpriteSize}px`,
      zIndex: 2147483647,
      backgroundImage: `url(${kittyFile})`,
    });
    kittyEl.id = 'kitty';
    kittyEl.ariaHidden = true;
  }

  function updateMousePosition(event) {
    mousePosX = event.clientX;
    mousePosY = event.clientY;
  }

  function onAnimationFrame(timestamp) {
    if (!kittyEl.isConnected) return;
    if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    kittyEl.style.backgroundPosition = `${sprite[0] * spriteSize}px ${sprite[1] * spriteSize}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;
    if (idleTime > 10 && Math.random() < 0.005 && !idleAnimation) {
      const availableIdleAnimations = ['sleeping', 'scratchSelf'];
      if (kittyPosX < spriteSize) availableIdleAnimations.push('scratchWallW');
      if (kittyPosY < spriteSize) availableIdleAnimations.push('scratchWallN');
      if (kittyPosX > window.innerWidth - spriteSize) availableIdleAnimations.push('scratchWallE');
      if (kittyPosY > window.innerHeight - spriteSize) availableIdleAnimations.push('scratchWallS');
      idleAnimation = availableIdleAnimations[Math.floor(Math.random() * availableIdleAnimations.length)];
    }

    switch (idleAnimation) {
      case 'sleeping':
        if (idleAnimationFrame < 8) { setSprite('tired', 0); } else {
          setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) resetIdleAnimation();
        }
        break;
      case 'scratchWallN':
      case 'scratchWallS':
      case 'scratchWallE':
      case 'scratchWallW':
      case 'scratchSelf':
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) resetIdleAnimation();
        break;
      default:
        setSprite('idle', 0);
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = kittyPosX - mousePosX;
    const diffY = kittyPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < kittySpeed || distance < 48) {
      idle();
      return;
    }

    resetIdleAnimation();
    if (idleTime > 1) {
      setSprite('alert', 0);
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    const direction = getDirection(diffX, diffY, distance);
    setSprite(direction, frameCount);

    kittyPosX -= (diffX / distance) * kittySpeed;
    kittyPosY -= (diffY / distance) * kittySpeed;

    kittyPosX = Math.min(Math.max(halfSpriteSize, kittyPosX), window.innerWidth - halfSpriteSize);
    kittyPosY = Math.min(Math.max(halfSpriteSize, kittyPosY), window.innerHeight - halfSpriteSize);

    kittyEl.style.left = `${kittyPosX - halfSpriteSize}px`;
    kittyEl.style.top = `${kittyPosY - halfSpriteSize}px`;
  }

  function getDirection(diffX, diffY, distance) {
    let direction = '';
    if (diffY / distance > 0.5) direction += 'N';
    if (diffY / distance < -0.5) direction += 'S';
    if (diffX / distance > 0.5) direction += 'W';
    if (diffX / distance < -0.5) direction += 'E';
    return direction;
  }

  init();
})();