// Lightweight card tilt + pointer-parallax for interactive 3D feeling.
// Adds inline CSS variables --rx and --ry used by the .card.tilt transform.
(function(){
  const cards = document.querySelectorAll('[data-tilt]');
  const strength = 14; // degrees max
  
  function onMove(e, el){
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * strength;
    const rx = (0.5 - y) * strength;
    el.style.setProperty('--rx', rx.toFixed(2)+'deg');
    el.style.setProperty('--ry', ry.toFixed(2)+'deg');
    el.classList.add('tilt');
  }

  function onLeave(el){
    el.style.setProperty('--rx','0deg');
    el.style.setProperty('--ry','0deg');
    el.classList.remove('tilt');
  }

  cards.forEach(el=>{
    el.addEventListener('pointermove', (e)=> onMove(e, el));
    el.addEventListener('pointerleave', ()=> onLeave(el));
    el.addEventListener('pointercancel', ()=> onLeave(el));
  });
})();
