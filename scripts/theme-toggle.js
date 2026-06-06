// Simple theme toggler: toggles .dark class on root, persists to localStorage,
// and respects system preference on first load.
(function(){
  const root = document.documentElement;
  const key = 'ui-theme';
  const toggleBtn = document.getElementById('themeToggle');

  function applyTheme(theme){
    if(theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }

  function detectSystemPref(){
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  let saved = localStorage.getItem(key);
  if(!saved) {
    saved = detectSystemPref();
    // apply system preference initially
  }
  applyTheme(saved);

  if(toggleBtn){
    toggleBtn.addEventListener('click', ()=>{
      const now = root.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(now);
      localStorage.setItem(key, now);
      toggleBtn.blur();
    });
  }

  // Observe system changes (optional): only if user hasn't set a preference.
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e=>{
    if(!localStorage.getItem(key)) applyTheme(e.matches ? 'dark' : 'light');
  });
})();
