document.addEventListener('DOMContentLoaded', () => {

  // ===== SCROLLSPY =====
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function getActiveSection() {
    const scrollY = window.pageYOffset;
    const windowH = window.innerHeight;
    let current = null;

    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        current = section.getAttribute('id');
      }
    });

    // If past everything, mark last section
    if (!current && scrollY + windowH >= document.documentElement.scrollHeight - 10) {
      current = sections[sections.length - 1]?.getAttribute('id');
    }

    // If nothing matched, mark first
    if (!current) {
      current = sections[0]?.getAttribute('id');
    }

    return current;
  }

  function updateNav() {
    const active = getActiveSection();
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) return;
      const isActive = href === `#${active}`;
      link.classList.toggle('active', isActive);
      link.style.opacity = isActive ? '1' : '0.5';
      link.style.transform = isActive ? 'scale(1.04)' : 'scale(1)';
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Smooth scroll on nav click
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const top = target.offsetTop - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ===== SEARCH =====
  const searchIcon = document.getElementById('searchIcon');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');
  const searchResults = document.getElementById('searchResults');
  const searchContainer = document.querySelector('.search-container');

  let isSearchOpen = false;

  function openSearch() {
    isSearchOpen = true;
    searchInput.classList.add('expanded');
    searchInput.focus();
  }

  function closeSearch() {
    isSearchOpen = false;
    searchInput.classList.remove('expanded');
    searchInput.value = '';
    searchResults.classList.remove('active');
    searchResults.innerHTML = '';
  }

  searchIcon.addEventListener('click', () => isSearchOpen ? closeSearch() : openSearch());
  searchClose.addEventListener('click', closeSearch);
  document.addEventListener('click', e => {
    if (!searchContainer.contains(e.target) && isSearchOpen) closeSearch();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isSearchOpen) closeSearch();
  });

  // Build search index
  const searchIndex = [];

  document.querySelectorAll('.video-card-compact').forEach(card => {
    searchIndex.push({
      element: card,
      title: card.getAttribute('data-title') || '',
      description: card.getAttribute('data-description') || '',
      category: 'Scripting',
      icon: 'fas fa-play-circle',
      action: 'video'
    });
  });

  document.querySelectorAll('#modeling .card').forEach(card => {
    searchIndex.push({
      element: card,
      title: card.getAttribute('data-title') || '',
      description: card.getAttribute('data-description') || '',
      category: 'Modeling',
      icon: 'fas fa-cube',
      action: 'scroll'
    });
  });

  [
    { id: 'about',     label: 'About',     icon: 'fas fa-user' },
    { id: 'scripting', label: 'Scripting', icon: 'fas fa-code' },
    { id: 'modeling',  label: 'Modeling',  icon: 'fas fa-cube' },
    { id: 'payments',  label: 'Payments',  icon: 'fas fa-credit-card' },
    { id: 'hire',      label: 'Hire Me',   icon: 'fas fa-briefcase' },
    { id: 'contact',   label: 'Contact',   icon: 'fas fa-envelope' },
  ].forEach(({ id, label, icon }) => {
    const el = document.getElementById(id);
    if (!el) return;
    searchIndex.push({
      element: el,
      title: label,
      description: `Jump to ${label} section`,
      category: 'Section',
      icon,
      action: 'scroll'
    });
  });

  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark style="background:rgba(255,255,255,0.15);color:#fff;border-radius:2px;padding:0 2px;">$1</mark>');
  }

  function performSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.classList.remove('active'); searchResults.innerHTML = ''; return; }

    const matches = searchIndex.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" style="font-size:22px;margin-bottom:8px;opacity:0.4;display:block;"></i>
          No results for "<strong>${q}</strong>"
        </div>`;
      searchResults.classList.add('active');
      return;
    }

    searchResults.innerHTML = matches.map((item, i) => {
      const desc = item.description.length > 80
        ? item.description.substring(0, 80) + '…'
        : item.description;
      return `
        <div class="search-result-item" data-index="${i}">
          <i class="${item.icon}"></i>
          <div>
            <div class="search-result-title">${highlight(item.title, q)}</div>
            <div class="search-result-description">${highlight(desc, q)}</div>
            <div class="search-result-category">${item.category}</div>
          </div>
        </div>`;
    }).join('');

    searchResults.classList.add('active');

    searchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const item = matches[el.getAttribute('data-index')];
        if (item.action === 'video') {
          item.element.click();
        } else {
          item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          item.element.style.transition = 'box-shadow 0.3s';
          item.element.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.25)';
          setTimeout(() => item.element.style.boxShadow = '', 1800);
        }
        closeSearch();
      });
    });
  }

  searchInput.addEventListener('input', performSearch);


  // ===== VIDEO MODAL =====
  const videoModal    = document.getElementById('videoModal');
  const expandedVideo = document.getElementById('expandedVideo');
  const closeVideoBtn = document.getElementById('closeVideoModal');
  const minimizeBtn   = document.getElementById('minimizeVideo');
  const fullscreenBtn = document.getElementById('fullscreenVideo');
  const videoTitleBar = document.getElementById('videoModalTitle');
  let isFullscreen = false;

  document.querySelectorAll('.video-card-compact').forEach(card => {
    const videoId = card.getAttribute('data-video-id');
    const iframe = card.querySelector('iframe');
    iframe.src = `https://player.vimeo.com/video/${videoId}?background=1&autoplay=0&loop=1&byline=0&title=0&muted=1`;

    card.addEventListener('click', () => {
      videoTitleBar.textContent = card.getAttribute('data-title');
      expandedVideo.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0`;
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeVideoModal() {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    expandedVideo.src = '';
    isFullscreen = false;
  }

  closeVideoBtn.addEventListener('click', closeVideoModal);

  minimizeBtn.addEventListener('click', () => {
    const win = document.querySelector('.mac-video-window');
    win.style.transform = 'scale(0.7)';
    win.style.opacity = '0.7';
    setTimeout(() => { win.style.transform = ''; win.style.opacity = ''; }, 300);
  });

  fullscreenBtn.addEventListener('click', () => {
    const win = document.querySelector('.mac-video-window');
    if (!isFullscreen) {
      (win.requestFullscreen || win.webkitRequestFullscreen || (() => {})).call(win);
      isFullscreen = true;
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
      isFullscreen = false;
    }
  });

  document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
  });

  videoModal.addEventListener('click', e => {
    if (e.target === videoModal) closeVideoModal();
  });


  // ===== IMAGE MODAL =====
  const imageModal = document.getElementById('imageModal');
  const modalImg   = document.getElementById('modalImage');
  const closeImgBtn = document.getElementById('closeModal');

  function openImageModal(src) {
    modalImg.src = src;
    modalImg.style.display = 'block';
    imageModal.classList.add('active');
    imageModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    closeImgBtn.focus();
  }

  function closeImageModal() {
    imageModal.classList.remove('active');
    imageModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    modalImg.style.display = 'none';
  }

  document.querySelectorAll('section img, .hero img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openImageModal(img.src));
  });

  closeImgBtn.addEventListener('click', closeImageModal);
  closeImgBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeImageModal(); }
  });
  imageModal.addEventListener('click', e => { if (e.target === imageModal) closeImageModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (videoModal.classList.contains('active')) closeVideoModal();
      if (imageModal.classList.contains('active')) closeImageModal();
    }
  });


  // ===== SCROLL BLUR =====
  let scrollTimer;
  window.addEventListener('scroll', () => {
    if (document.body.classList.contains('modal-open') || videoModal.classList.contains('active')) return;
    document.querySelectorAll('section img, section video').forEach(el => {
      el.style.filter = 'blur(2px)';
    });
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      document.querySelectorAll('section img, section video').forEach(el => {
        el.style.filter = '';
      });
    }, 120);
  }, { passive: true });

});