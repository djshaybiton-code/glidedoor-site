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

/* ===== Lead conversion: fires when the estimate form is submitted (delegated) ===== */
document.addEventListener('click', function(e){
  try{
    var btn = (e.target && e.target.closest) ? e.target.closest('.cf-submit') : null;
    if (!btn) return;
    var scope = btn.closest('#contact') || document;
    var fields = scope.querySelectorAll('input, textarea, select');
    var nameOk = false, phoneOk = false;
    fields.forEach(function(f){
      var v = (f.value || '').trim();
      if (f.type === 'text' && v) nameOk = true;
      if (f.type === 'tel' && v.replace(/\D/g,'').length >= 7) phoneOk = true;
    });
    if (nameOk && phoneOk && typeof gtag === 'function' && !window.__leadConvFired){
      window.__leadConvFired = true;
      gtag('event', 'conversion', {'send_to': 'AW-18163940291/fd48CKmrhdUcEMP3ntVD'});
    }
  } catch (err) {}
}, true);

/* ===== Lead delivery: emails the estimate form to the business via Web3Forms ===== */
document.addEventListener('click', function(e){
  try{
    var btn = (e.target && e.target.closest) ? e.target.closest('.cf-submit') : null;
    if (!btn) return;
    if (window.__leadSent) return;
    var scope = btn.closest('#contact') || document;
    var f = scope.querySelectorAll('input, textarea, select');
    var g = function(i){ return f[i] ? (f[i].value || '').trim() : ''; };
    var first = g(0), last = g(1), phone = g(2), city = g(3), service = g(4), message = g(5);
    if (!first || phone.replace(/\D/g,'').length < 7) return;
    window.__leadSent = true;
    var name = (first + ' ' + last).trim();
    var payload = {
      access_key: 'c771587f-fc05-400e-88be-fc74cf232c5d',
      subject: 'New Estimate Request - ' + name,
      from_name: 'Glide Door Website',
      Name: name,
      Phone: phone,
      City: city,
      Service: service,
      Message: message
    };
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function(){ window.__leadSent = false; });
  } catch (err) {}
}, true);
/* build: web3forms-live */
