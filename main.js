function getDistance2(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return { distance2: dx * dx + dy * dy + dz * dz, dx: dx, dy: dy, dz: dz };
  }
  //constante gravitacional no relativista
  function getForce(point1, point2, mass1, mass2, k) {
    const distance = getDistance2(point1, point2);
    const fVal = k * mass1 * mass2 / distance.distance2;
    return {
      f: fVal,
      fx: fVal * distance.dx,
      fy: fVal * distance.dy,
      fz: fVal * distance.dz
    };
  }
  
  function randomVal(lower, higher) {
    const RANGE = higher - lower;
    return lower + RANGE * Math.random();
  }
  
   
  const FRAME = document.getElementById("main");
  
  let frameWidth = FRAME.clientWidth;
  let frameHeight = FRAME.clientHeight;
  const frameDepth = 1000;
  let minx = 0,
    maxx = frameHeight,
    miny = 0,
    maxy = frameWidth,
    minz = 0,
    maxz = frameDepth;
  
  class Bubble {
    constructor(
      domId,
      position,
      velocity,
      mass,
      diameter,
      backgroundColor,
      borderColor
    ) {
      this.domId = domId;
      [this.x, this.y, this.z] = position;
      [this.vx, this.vy, this.vz] = velocity;
      [this.ax, this.ay, this.az] = [0, 0, 0];
      this.mass = mass;
      this.diameter = diameter;
      this.domElement = undefined;
      this.backgroundColor = backgroundColor;
      this.borderColor = borderColor;
    }
  
    getPoint() {
      return { x: this.x, y: this.y, z: this.z };
    }
  
    generate(frame) {
      this.domElement = document.createElement("div");
      this.domElement.id = this.domId;
      this.domElement.className = "bubble";
      this.domElement.style.backgroundColor = this.backgroundColor;
      this.domElement.style.borderColor = this.borderColor;
      this.domElement = frame.appendChild(this.domElement);
    }
  
    refresh(dt = 1) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.z += this.vz * dt;
      this.vx += this.ax * dt;
      this.vy += this.ay * dt;
      this.vz += this.az * dt;
      if (this.x < minx) minx = this.x;
      else if (this.x > maxx) maxx = this.x;
      if (this.y < miny) miny = this.y;
      else if (this.y > maxy) maxy = this.y;
      if (this.z < minz) minz = this.z;
      else if (this.z > maxz) maxz = this.z;
      this.ax = this.ay = this.az = 0;
      return [this.x, this.y, this.z];
    }
  
    refreshAcceleration(force, reverse = false) {
      let k = 1;
      if (reverse) k = -1;
      this.ax += force.fx / this.mass * k;
      this.ay += force.fy / this.mass * k;
      this.az += force.fz / this.mass * k;
    }
  
    putAt(x, y) {
      this.x = x;
      this.y = y;
      this.paint();
    }
  
    paint() {
      const apparentDiameter = this.diameter * this.z / frameDepth * fracSiz;
      this.domElement.style.height = this.domElement.style.width =
        apparentDiameter + "px";
      this.domElement.style.left = (this.x - minx) * fracWidth + "px";
      this.domElement.style.top = (this.y - miny) * fracHeight + "px";
      this.domElement.style.zIndex = Math.floor(this.z);
    }
  }
  
  let bubbleArray = [];
  let k;
  let sol = new Bubble(
    "b1",
    [frameWidth / 2, frameHeight / 2, frameDepth / 2],
    [0, 0, 0],
    100000,
    50,
    "cornsilk",
    "yellow"
  );
  sol.generate(FRAME);
  bubbleArray.push(sol);
  let fracWidth = frameWidth;
  let fracHeight = frameHeight;
  let fracSiz = 1;
  
  for (let i = 0; i < 1000; i++) {
    k = new Bubble(
      "b1",
      [
        Math.random() * frameWidth / 10 + frameWidth / 3,
        Math.random() * frameHeight / 10 + frameHeight / 1.3,
        Math.random() * frameDepth / 10 + frameDepth / 5
      ],
      [randomVal(2, 3), randomVal(-0.2, 0.2), randomVal(-0.2, 0.2)],
      1,
      10,
      "orange",     
    );
    k.generate(FRAME);
    bubbleArray.push(k);
  }
  
  function draw() {
    let f, b1, b2;
    let maxDiff;
    frameWidth = FRAME.clientWidth;
    frameHeight = FRAME.clientHeight;
    for (let i = 0; i < bubbleArray.length; i++)
      for (let k = i + 1; k < bubbleArray.length; k++) {
        b1 = bubbleArray[i];
        b2 = bubbleArray[k];
        f = getForce(b1.getPoint(), b2.getPoint(), b1.mass, b2.mass, -0.0002);
        b1.refreshAcceleration(f, false);
        b2.refreshAcceleration(f, true);
      }
    (minx = 0),
      (maxx = frameWidth),
      (miny = 0),
      (maxy = frameHeight),
      (minz = 0),
      (maxz = frameDepth);
    for (let bubble of bubbleArray) bubble.refresh(1);
    maxDiff = Math.max(maxx - frameWidth, -minx);
    maxx = frameWidth + maxDiff;
    minx = -maxDiff;
    fracWidth = frameWidth / (maxx - minx);
    maxDiff = Math.max(maxy - frameHeight, -miny);
    maxy = frameHeight + maxDiff;
    miny = -maxDiff;
    fracHeight = frameHeight / (maxy - miny);
    fracSiz = Math.min(fracHeight, fracWidth);
    for (let bubble of bubbleArray) bubble.paint();
  
    window.requestAnimationFrame(draw);
  }
  
  draw();
  