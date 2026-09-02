// scroll reveal
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .about-card');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.15});
  revealEls.forEach(el=>io.observe(el));

  // counters
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const dur = 1200;
        const start = performance.now();
        function tick(now){
          const p = Math.min((now-start)/dur, 1);
          const val = Math.floor(p * target);
          el.textContent = val + suffix;
          if(p < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      }
    });
  }, {threshold:0.4});
  counters.forEach(el=>cio.observe(el));

  // faq accordion
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if(item.classList.contains('open')) a.style.maxHeight = a.scrollHeight + 'px';
    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o=>{
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = 0;
      });
      if(!isOpen){
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // hero glow follows cursor
  const heroGlow = document.getElementById('heroGlow');
  const heroEl = document.getElementById('home');
  heroEl.addEventListener('mousemove', (e)=>{
    const r = heroEl.getBoundingClientRect();
    heroEl.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    heroEl.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // scrollspy for floating nav
  const sections = ['about','experience','tools','services','work','faq','contact'].map(id=>document.getElementById(id));
  const navLinks = document.querySelectorAll('.floatnav-links a');
  const spy = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navLinks.forEach(l=>l.classList.toggle('active', l.dataset.sec === entry.target.id));
      }
    });
  }, {rootMargin:'-45% 0px -45% 0px'});
  sections.forEach(s=>{ if(s) spy.observe(s); });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll progress HUD
  const scrollBar = document.getElementById('scrollProgress');
  function updateScrollProgress(){
    const h = document.documentElement;
    const scrolled = h.scrollHeight - h.clientHeight;
    scrollBar.style.width = (scrolled > 0 ? (h.scrollTop / scrolled) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, {passive:true});
  updateScrollProgress();

  // particle network background
  (function(){
    const canvas = document.getElementById('bg-canvas');
    if(!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = {x:null, y:null, radius:130};

    function resize(){
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor((innerWidth * innerHeight) / 22000));
      particles = Array.from({length:count}, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6
      }));
    }

    function frame(){
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > innerWidth) p.vx *= -1;
        if(p.y < 0 || p.y > innerHeight) p.vy *= -1;
        if(mouse.x != null){
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if(dist < mouse.radius && dist > 0.01){
            const f = (mouse.radius - dist) / mouse.radius;
            p.x += (dx / dist) * f * 1.1;
            p.y += (dy / dist) * f * 1.1;
          }
        }
      });
      for(let i = 0; i < particles.length; i++){
        for(let j = i + 1; j < particles.length; j++){
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if(dist < 120){
            ctx.strokeStyle = `rgba(138,155,174,${(1 - dist / 120) * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(111,214,201,0.55)';
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      if(!reduceMotion) requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    resize();
    frame();
  })();

  // custom trailing cursor (pointer devices only, respects reduced motion)
  if(window.matchMedia('(pointer: fine)').matches && !reduceMotion){
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.body.classList.add('has-cursor');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    });
    (function ringLoop(){
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(ringLoop);
    })();
    document.querySelectorAll('a, button, .btn, .service-row, .work-card, .about-card, .faq-q, .skill-badge').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  // 3D tilt on cards
  if(window.matchMedia('(pointer: fine)').matches && !reduceMotion){
    function addTilt(selector, max, lift){
      document.querySelectorAll(selector).forEach(card => {
        card.addEventListener('mouseenter', () => { card.style.transition = 'transform .15s ease-out'; });
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -max;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * max;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-${lift}px)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transition = 'transform .5s cubic-bezier(.2,.7,.3,1)';
          card.style.transform = '';
        });
      });
    }
    addTilt('.work-card', 8, 6);
    addTilt('.about-card', 8, 6);
  }

  // magnetic buttons
  if(window.matchMedia('(pointer: fine)').matches && !reduceMotion){
    document.querySelectorAll('.btn.primary, .navcta, .floatnav-cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35 - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }