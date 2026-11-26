(() => {
  const canvas = document.querySelector('#network-globe');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const flags = [...document.querySelectorAll('.country-list img')];
  // Coordinates follow the order of the homepage flag strip.
  const locations = [[7,81], [36,128], [35,105], [22,79], [4,102], [42,13], [47,2], [54,-2], [58,60], [52,-100], [39,-98]];
  const control = document.querySelector('#network-spin');
  const touchControl = document.querySelector('#network-touch');
  let touchRotation = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const rad = Math.PI / 180;
  let yaw = 103 * rad, pitch = 22 * rad, paused = reduced.matches, onscreen = true, frame = 0, last = 0;
  let surface, dragging;
  const diameter = matchMedia('(max-width: 760px), (pointer: coarse)').matches ? 220 : 400;
  const earth = document.createElement('canvas');
  earth.width = earth.height = diameter;
  const earthContext = earth.getContext('2d');
  const pixels = earthContext.createImageData(diameter, diameter);
  const sphere = [];
  for (let row = 0; row < diameter; row++) {
    const north = 1 - (row + .5) * 2 / diameter;
    for (let col = 0; col < diameter; col++) {
      const east = (col + .5) * 2 / diameter - 1;
      const depthSquared = 1 - east * east - north * north;
      if (depthSquared <= 0) continue;
      const depth = Math.sqrt(depthSquared);
      const light = .60 + .44 * Math.max(0, depth * .82 - east * .43 + north * .37);
      sphere.push({east, north, depth, light, offset: (row * diameter + col) * 4});
    }
  }

  function paintEarth() {
    if (!surface) return;
    const tilt = Math.sin(pitch);
    const upright = Math.cos(pitch);
    const {data, width, height} = surface;
    for (const {east, north, depth, light, offset} of sphere) {
      const latitude = Math.asin(Math.max(-1, Math.min(1, north * upright + depth * tilt)));
      const longitude = Math.atan2(east, depth * upright - north * tilt) + yaw;
      const u = longitude / (2 * Math.PI) + .5;
      const x = Math.floor((u - Math.floor(u)) * width);
      const y = Math.min(height - 1, Math.floor((.5 - latitude / Math.PI) * height));
      const source = (y * width + x) * 4;
      pixels.data[offset] = data[source] * light;
      pixels.data[offset + 1] = data[source + 1] * light;
      pixels.data[offset + 2] = data[source + 2] * light + 8;
      pixels.data[offset + 3] = 255;
    }
    earthContext.putImageData(pixels, 0, 0);
    ctx.drawImage(earth, 108, 68, 464, 464);
  }
  const vector = (lat, lon) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
  const nodes = locations.map(([lat, lon], index) => ({point: vector(lat, lon), flag: flags[index]}));
  const project = ([x,y,z]) => {
    const d = x * Math.cos(yaw) + y * Math.sin(yaw);
    return [340 + (-x * Math.sin(yaw) + y * Math.cos(yaw)) * 232, 300 + (d * Math.sin(pitch) - z * Math.cos(pitch)) * 232, d * Math.cos(pitch) + z * Math.sin(pitch)];
  };
  const line = (points, color, width) => {
    ctx.beginPath(); let pen = false;
    for (const p of points) { const [x,y,z] = project(p); if (z < Math.sqrt(Math.max(0, 1 - ((x - 340) / 232) ** 2 - ((y - 300) / 232) ** 2)) - 1e-6 || z < 0) {pen=false;continue;} if(pen) ctx.lineTo(x,y); else ctx.moveTo(x,y); pen=true; }
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
  };
  const routes = nodes.slice(1).map(node => Array.from({length:81}, (_,i) => {
    const a=nodes[0].point,b=node.point,t=i/80,angle=Math.acos(Math.max(-1,Math.min(1,a.reduce((sum,v,j)=>sum+v*b[j],0))));
    const lift=1+.17*Math.sin(t*Math.PI);
    return a.map((v,j)=>lift*(v*Math.sin((1-t)*angle)+b[j]*Math.sin(t*angle))/Math.sin(angle));
  }));
  const grid=[];
  for(let lat=-60;lat<=60;lat+=30) grid.push(Array.from({length:181},(_,i)=>vector(lat,i*2)));
  for(let lon=0;lon<360;lon+=30) grid.push(Array.from({length:91},(_,i)=>vector(i*2-90,lon)));
  let lastPaint = 0;
  function draw(now=0) {
    frame=0;
    if (!paused && now - lastPaint < 40) {
      if (onscreen && !document.hidden) frame = requestAnimationFrame(draw);
      return;
    }
    lastPaint = now;
    if (!paused && !dragging && last) yaw += Math.min(now-last,50)*.000065;
    last=now;
    ctx.clearRect(0,0,680,600);
    const glow=ctx.createRadialGradient(310,260,100,340,300,270);glow.addColorStop(0,'#18595e');glow.addColorStop(.86,'#092c38');glow.addColorStop(1,'#092c3800');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(340,300,270,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#6ac4b326';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(340,300,273,260,-.3,0,Math.PI*2);ctx.stroke();
    paintEarth();
    ctx.strokeStyle = '#8ddfffaa';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(340, 300, 232, 0, Math.PI * 2);
    ctx.stroke();
    grid.forEach(g => line(g, '#b2e8ff20', .65));
    routes.forEach((route,i)=>{line(route,i===0?'#e4ce7e':'#73ceba65',i===0?2:1);if(!paused){const p=project(route[Math.floor(now/45+i*7)%81]);if(p[2]>0){ctx.fillStyle=i===0?'#fff0b5':'#b7f4df';ctx.beginPath();ctx.arc(p[0],p[1],2.5,0,Math.PI*2);ctx.fill();}}});
    nodes.forEach((node,i)=>{const [x,y,z]=project(node.point);if(z<.06)return;ctx.fillStyle=i<2?'#f3d887':'#a2e5cc';ctx.beginPath();ctx.arc(x,y,i<2?5:3,0,Math.PI*2);ctx.fill();if(i<2){ctx.strokeStyle='#f3d88780';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.stroke();}if(node.flag?.complete && node.flag.naturalWidth)ctx.drawImage(node.flag,x+12,y-12,25,17);});
    if(!paused && onscreen && !document.hidden) frame=requestAnimationFrame(draw);
  }
  function refresh(){last=0;if(!frame)frame=requestAnimationFrame(draw);}
  function sync(){control.textContent=paused?'Resume rotation':'Pause rotation';control.setAttribute('aria-pressed',String(paused));refresh();}
  control.addEventListener('click',()=>{paused=!paused;sync();});
  function rotate(horizontal, vertical) {
    yaw -= horizontal;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch + vertical));
    if (!frame) frame = requestAnimationFrame(draw);
  }
  touchControl.addEventListener('click', () => {
    touchRotation = !touchRotation;
    dragging = undefined;
    canvas.classList.toggle('touch-rotation-enabled', touchRotation);
    touchControl.setAttribute('aria-pressed', String(touchRotation));
    touchControl.textContent = touchRotation ? 'Done rotating' : 'Rotate globe';
    refresh();
  });
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    const touch = event.pointerType === 'touch';
    if (touch && !touchRotation) return;
    dragging = {id: event.pointerId, x: event.clientX, y: event.clientY};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!dragging || dragging.id !== event.pointerId) return;
    const horizontal = event.clientX - dragging.x;
    const vertical = event.clientY - dragging.y;
    const sensitivity = 3.6 / canvas.clientWidth;
    rotate(horizontal * sensitivity, vertical * sensitivity);
    dragging.x = event.clientX;
    dragging.y = event.clientY;
  });
  function finishDrag(event) {
    if (dragging?.id !== event.pointerId) return;
    dragging = undefined;
    refresh();
  }
  canvas.addEventListener('pointerup', finishDrag);
  canvas.addEventListener('pointercancel', finishDrag);
  canvas.addEventListener('lostpointercapture', finishDrag);
  canvas.addEventListener('keydown', event => {
    const directions = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    rotate(direction[0] * .12, direction[1] * .12);
  });
  flags.forEach(flag => flag.addEventListener('load', refresh));
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
  document.addEventListener('visibilitychange',refresh);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;if(onscreen)refresh();}).observe(canvas);
  const texture=new Image();
  texture.onload = () => {
    const map = document.createElement('canvas');
    map.width = 1800;
    map.height = 900;
    const context = map.getContext('2d');
    context.drawImage(texture, 0, 0, map.width, map.height);
    try {
      surface = context.getImageData(0, 0, map.width, map.height);
    } catch {
      // Local file previews may restrict pixel reads. The grid and routes still render.
    }
    refresh();
  };
  // NASA Earth Observatory Blue Marble satellite imagery.
  texture.src = 'assets/images/world-texture.webp';
  sync();
})();
