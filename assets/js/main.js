(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }


  // Ano do copyright
  document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Faixa rolando: duplica os itens para o loop ficar contínuo
  var tk = document.querySelector('.ticker div');
  if (tk) tk.innerHTML += tk.innerHTML;

  /* ---------- Idioma ----------
     Português vem do próprio HTML; inglês de assets/js/i18n.js. */
  var TEXTS = { pt: {}, en: window.TEXTOS_EN || {} };
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    TEXTS.pt[el.getAttribute('data-i18n')] = el.innerHTML.replace(/\s+/g, ' ').trim();
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
    TEXTS.pt[el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label');
  });

  // Junta a última palavra de cada linha com a anterior (sem palavra sozinha)
  function noOrphan(t) {
    return t.split('<br>').map(function (p) { return p.replace(/\s+(\S+)\s*$/, ' $1'); }).join('<br>');
  }

  function apply(l) {
    var d = TEXTS[l];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      el.innerHTML = noOrphan(d[k] || TEXTS.pt[k]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', d[k] || TEXTS.pt[k]);
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l));
    });
    root.setAttribute('lang', l === 'en' ? 'en' : 'pt-BR');
    set('onprime-lang', l);
  }

  var curLang = null;
  function setLang(l, animate) {
    if (l === curLang) return;
    var first = curLang === null;
    curLang = l;
    if (first || !animate || reduce) { apply(l); return; }

    var els = [].slice.call(document.querySelectorAll('[data-i18n]')).filter(function (e) {
      var r = e.getBoundingClientRect();
      return r.bottom > -50 && r.top < innerHeight + 50;
    });
    var sw = document.querySelector('.lang-sweep');
    if (sw) { sw.classList.remove('go'); void sw.offsetWidth; sw.classList.add('go'); }
    els.forEach(function (e, i) { e.style.animationDelay = (i * 18) + 'ms'; e.classList.add('i18n-out'); });
    setTimeout(function () {
      apply(l);
      els.forEach(function (e, i) {
        e.classList.remove('i18n-out');
        e.style.animationDelay = (i * 22) + 'ms';
        e.classList.add('i18n-in');
      });
      setTimeout(function () {
        els.forEach(function (e) { e.classList.remove('i18n-in'); e.style.animationDelay = ''; });
      }, 900);
    }, 220 + els.length * 18);
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
  });
  setLang(get('onprime-lang') === 'en' ? 'en' : 'pt', false);

  /* ---------- Tema ----------
     O tema salvo é aplicado no <head> do index.html, antes de pintar. */
  function isLight() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'light';
    return matchMedia('(prefers-color-scheme: light)').matches;
  }

  var tb = document.getElementById('theme');
  tb.addEventListener('click', function () {
    var next = isLight() ? 'dark' : 'light';
    function go() { root.setAttribute('data-theme', next); set('onprime-theme', next); }

    tb.classList.add('spin');
    setTimeout(function () { tb.classList.remove('spin'); }, 500);
    if (reduce) { go(); return; }

    if (document.startViewTransition) {
      // Círculo que cresce a partir do botão
      var r = tb.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(go).ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
    } else {
      root.classList.add('theme-fade');
      go();
      setTimeout(function () { root.classList.remove('theme-fade'); }, 600);
    }
  });

  /* ---------- Cursor personalizado (só mouse, sem redução de movimento) ---------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    var dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cur-dot';
    ring.className = 'cur-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    root.classList.add('cur-ready');

    var mx = -100, my = -100, rx = -100, ry = -100, running = false;
    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!running) { running = true; requestAnimationFrame(loop); }
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      root.classList.add('cur-on');
      root.classList.toggle('cur-hover', !!(e.target.closest && e.target.closest('a,button')));
    });
    // Esconde o cursor quando o mouse sai da janela
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) root.classList.remove('cur-on'); });
    addEventListener('pointerdown', function () { root.classList.add('cur-down'); });
    addEventListener('pointerup', function () { root.classList.remove('cur-down'); });

    // Anel segue o ponto com atraso suave; para quando alcança (não gasta CPU parado)
    function loop() {
      if (Math.abs(mx - rx) > .3 || Math.abs(my - ry) > .3) {
        rx += (mx - rx) * .18; ry += (my - ry) * .18;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }
  }

  /* ---------- Animação ao rolar ----------
     Blocos .rv aparecem quando entram na tela. Os que entram juntos
     saem em sequência (escada), somando ao --d do HTML. */
  var rvs = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var base = parseFloat(e.target.style.getPropertyValue('--d')) || 0;
        e.target.style.setProperty('--d', (base + i++ * .09) + 's');
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    rvs.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Carrossel de destaques ----------
     Cada slide recebe --o (0 = centro, 1 = próximo, -1 = anterior);
     o CSS transforma isso em posição. Passa sozinho a cada DELAY,
     pausa com o mouse em cima, fora da tela e com a aba escondida. */
  var car = document.querySelector('.car-sec');
  if (car) {
    var DELAY = 4000;
    var stage = car.querySelector('.car-stage');
    var slides = [].slice.call(stage.querySelectorAll('.slide'));
    var n = slides.length, cur = 0, timer = null, hover = false, inView = false;
    car.style.setProperty('--t', DELAY + 'ms');

    var dots = slides.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', s.getAttribute('data-name'));
      b.addEventListener('click', function () { go(i); });
      car.querySelector('.car-dots').appendChild(b);
      s.draggable = false;
      return b;
    });

    function layout() {
      slides.forEach(function (s, i) {
        var o = (i - cur + n) % n;
        if (o > n / 2) o -= n;
        s.style.setProperty('--o', o);
        s.classList.toggle('is-on', o === 0);
        s.classList.toggle('is-far', Math.abs(o) > 1);
        s.setAttribute('aria-hidden', String(o !== 0));
        s.tabIndex = o === 0 ? 0 : -1;
      });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', String(i === cur)); });
    }

    function playing() { return !reduce && inView && !hover && !document.hidden; }

    function schedule() {
      clearTimeout(timer);
      var on = playing();
      car.classList.toggle('paused', !on);
      if (!on) return;
      // Reinicia a barrinha da bolinha ativa junto com o tempo
      var d = dots[cur];
      d.removeAttribute('aria-current'); void d.offsetWidth; d.setAttribute('aria-current', 'true');
      timer = setTimeout(function () { go(cur + 1); }, DELAY);
    }

    function go(i) { cur = (i % n + n) % n; layout(); schedule(); }

    car.querySelectorAll('.car-btn').forEach(function (b) {
      b.addEventListener('click', function () { go(cur + Number(b.getAttribute('data-dir'))); });
    });
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(cur + 1);
      if (e.key === 'ArrowLeft') go(cur - 1);
    });

    // Arrastar com o dedo/mouse
    var sx = null, moved = false;
    stage.addEventListener('pointerdown', function (e) { sx = e.clientX; moved = false; });
    stage.addEventListener('pointermove', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 10) moved = true; });
    stage.addEventListener('pointercancel', function () { sx = null; });
    addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    });
    // Slide do lado só vem para o centro; o do centro abre o WhatsApp
    stage.addEventListener('click', function (e) {
      var s = e.target.closest('.slide');
      if (!s || (!moved && s.classList.contains('is-on'))) return;
      e.preventDefault();
      if (!moved) go(slides.indexOf(s));
    });

    function pause(v) { return function () { hover = v; schedule(); }; }
    car.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pause(true)(); });
    car.addEventListener('pointerleave', pause(false));
    // Só pausa com foco de teclado (no celular, tocar numa bolinha não trava o carrossel)
    car.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) pause(true)(); });
    car.addEventListener('focusout', pause(false));
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        // Perto da tela: carrega todas as imagens para nenhuma entrar em branco
        if (inView) slides.forEach(function (s) { s.querySelector('img').loading = 'eager'; });
        schedule();
      }, { threshold: .4 }).observe(stage);
    } else {
      inView = true;
    }

    layout();
    schedule();
  }

  // Barra de progresso no topo
  var bar = document.querySelector('.progress');
  if (bar && !reduce) {
    var ticking = false;
    function progress() {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1) : 0);
      ticking = false;
    }
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(progress); }
    }, { passive: true });
    addEventListener('resize', progress);
    progress();
  }

  // Brilho que segue o mouse no CTA e nos links
  document.querySelectorAll('.sheen-host').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
