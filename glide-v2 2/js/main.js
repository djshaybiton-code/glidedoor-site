document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

const toggle = document.querySelector('.mn-toggle');
const links = document.querySelector('.mn-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    if (!open) {
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '64px';
      links.style.left = '0'; links.style.right = '0';
      links.style.background = '#fff';
      links.style.padding = '1rem 2rem';
      links.style.borderBottom = '1px solid #E9ECEF';
      links.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)';
      links.style.zIndex = '99';
    }
  });
}

/* ===== Google Ads tag (added for ads conversion tracking) ===== */
(function(){
  try{
    if (window.__gadsInit) return;
    window.__gadsInit = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + 'AW-18163940291';
    (document.head || document.documentElement).appendChild(s);
    gtag('js', new Date());
    gtag('config', 'AW-18163940291');
  } catch (e) {}
})();
