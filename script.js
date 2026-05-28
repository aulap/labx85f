(function () {
  const fallbackTopbar = `
<div class="fixed-top-bar">
  <a href="https://instagram.com/aulapsoftware" target="_blank" rel="noopener noreferrer"><span>Instagram: @aulapsoftware</span></a>
</div>
  `;

  const fallbackMenu = `
<header class="site-header">
  <nav class="site-nav container" aria-label="Primary navigation">
    <a class="brand" href="index.html#home" aria-label="Aulap Software home">
      <span class="brand-mark brand-mark-logo"><img src="garuda.png" alt="" aria-hidden="true" loading="eager"></span>
      <span class="brand-text">Aulap Software</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
    <ul id="primary-navigation" class="nav-links">
      <li><a href="index.html#home">Home</a></li>
      <li><a href="index.html#software">Software</a></li>
      <li><a href="index.html#services">Services</a></li>
      <li><a href="guides.html">Guides</a></li>
      <li><a href="index.html#contact">Contact</a></li>
    </ul>
  </nav>
</header>
  `;

  const fallbackFooter = `
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <p><strong>Aulap Software</strong></p>
      <p>&copy; 2025 - 2026 Aulap Software by Fajar Anggiawan</p>
    </div>
    <nav class="footer-links" aria-label="Footer navigation">
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
      <a href="download-safety.html">Download Safety</a>
      <a href="privacy-policy.html">Privacy Policy</a>
      <a href="terms-of-use.html">Terms</a>
      <a href="disclaimer.html">Disclaimer</a>
      <a href="refund-policy.html">Refund Policy</a>
    </nav>
  </div>
</footer>
  `;

  const loadInclude = async (selector, fileName, fallbackHtml) => {
    const slots = document.querySelectorAll(selector);
    if (!slots.length) return;

    try {
      const response = await fetch(fileName, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`${fileName} include failed`);
      const html = await response.text();
      slots.forEach((slot) => { slot.innerHTML = html; });
    } catch (error) {
      slots.forEach((slot) => { slot.innerHTML = fallbackHtml; });
    }
  };

  const initNavigation = () => {
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!header) return;

    const setHeaderShadow = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    setHeaderShadow();
    window.addEventListener('scroll', setHeaderShadow, { passive: true });

    if (!navToggle || !navLinks) return;

    const closeNav = () => {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    navLinks.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav();
    });
  };

  const initPaymentModal = () => {
    const purchaseBtn = document.getElementById('purchase-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closeBtn = document.getElementById('close-btn');

    const showModal = () => {
      if (!paymentModal) return;
      paymentModal.classList.add('is-open');
      paymentModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    };

    const hideModal = () => {
      if (!paymentModal) return;
      paymentModal.classList.remove('is-open');
      paymentModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      purchaseBtn?.focus();
    };

    if (paymentModal) {
      paymentModal.setAttribute('aria-hidden', 'true');
      paymentModal.setAttribute('role', 'dialog');
      paymentModal.setAttribute('aria-modal', 'true');
    }

    purchaseBtn?.addEventListener('click', showModal);
    closeBtn?.addEventListener('click', hideModal);
    paymentModal?.addEventListener('click', (event) => {
      if (event.target === paymentModal) hideModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && paymentModal?.classList.contains('is-open')) hideModal();
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showModal') === '1') showModal();
  };

  const initToolsToggle = () => {
    const toggleToolsBtn = document.getElementById('toggle-tools-btn');
    const toolListGrid = document.querySelector('.tool-list-grid');
    if (!toggleToolsBtn || !toolListGrid) return;

    toolListGrid.hidden = true;
    toolListGrid.style.display = 'none';
    toggleToolsBtn.setAttribute('aria-expanded', 'false');

    toggleToolsBtn.addEventListener('click', () => {
      const shouldShow = toolListGrid.hidden;
      toolListGrid.hidden = !shouldShow;
      toolListGrid.style.display = shouldShow ? 'grid' : 'none';
      toggleToolsBtn.textContent = shouldShow ? 'Hide Software' : 'Show All Software';
      toggleToolsBtn.classList.toggle('active', shouldShow);
      toggleToolsBtn.setAttribute('aria-expanded', String(shouldShow));
    });
  };

  const init = async () => {
    await loadInclude('[data-include="topbar"]', 'topbar.html', fallbackTopbar);
    await loadInclude('[data-include="menu"]', 'menu.html', fallbackMenu);
    await loadInclude('[data-include="footer"]', 'footer.html', fallbackFooter);
    initNavigation();
    initPaymentModal();
    initToolsToggle();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

function googleTranslateElementInit() {
  if (!window.google || !document.getElementById('google_translate_element')) return;
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,id',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
}
