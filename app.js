/**
 * Sukoon by Pardos Okas - Main Interactive Application
 * Sushant Golf City, Lucknow
 * Rate: Rs. 10,400 / sq. ft.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initPlotsDirectory();
  initCalculator();
  initGallery();
  initMasterplanHotspots();
  initFaqAccordion();
  initContactForm();
});

/* -------------------------------------------------------------
 * 1. Theme Management (Obsidian Gold / Ivory Gold)
 * ------------------------------------------------------------- */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const storedTheme = localStorage.getItem('sukoon-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', storedTheme);
  updateThemeIcon(storedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('sukoon-theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const iconSlot = document.getElementById('themeIconSlot');
  if (!iconSlot) return;
  if (theme === 'light') {
    // Moon icon for dark mode option
    iconSlot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  } else {
    // Sun icon for light mode option
    iconSlot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  }
}

/* -------------------------------------------------------------
 * 2. Navigation & Scroll Spy
 * ------------------------------------------------------------- */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggle.innerHTML = isOpen ? '&times;' : '&#9776;';
    });

    // Close menu when clicking any nav item
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        if (mobileToggle) mobileToggle.innerHTML = '&#9776;';
      });
    });
  }

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 120;
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* -------------------------------------------------------------
 * 3. 192 Plots Directory (Live Search, Filtering, CSV Export)
 * ------------------------------------------------------------- */
let currentCategoryFilter = 'all';
let searchQuery = '';
let currentPlotsList = [];

function initPlotsDirectory() {
  const tableBody = document.getElementById('plotsTableBody');
  const countDisplay = document.getElementById('plotResultCount');
  const searchInput = document.getElementById('plotSearchInput');
  const chipButtons = document.querySelectorAll('.chip-btn');
  const exportBtn = document.getElementById('exportCsvBtn');

  if (!window.SUKOON_PLOTS || !tableBody) return;
  currentPlotsList = [...window.SUKOON_PLOTS];

  renderPlotsTable();

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderPlotsTable();
    });
  }

  // Filter chips handler
  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chipButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategoryFilter = btn.getAttribute('data-filter') || 'all';
      renderPlotsTable();
    });
  });

  // CSV Export handler
  if (exportBtn) {
    exportBtn.addEventListener('click', exportPlotsToCSV);
  }
}

function renderPlotsTable() {
  const tableBody = document.getElementById('plotsTableBody');
  const countDisplay = document.getElementById('plotResultCount');
  if (!tableBody) return;

  const filtered = window.SUKOON_PLOTS.filter(item => {
    // 1. Search Query
    const matchSearch = !searchQuery || 
      item.plot.toLowerCase().includes(searchQuery) ||
      item.sno.toString() === searchQuery;

    // 2. Category Filter
    let matchCat = true;
    const sqm = item.sqm;
    if (currentCategoryFilter === '128') {
      matchCat = sqm >= 127 && sqm <= 134;
    } else if (currentCategoryFilter === '140') {
      matchCat = sqm >= 135 && sqm <= 149;
    } else if (currentCategoryFilter === '160') {
      matchCat = sqm >= 150 && sqm <= 165;
    } else if (currentCategoryFilter === '172') {
      matchCat = sqm >= 166 && sqm <= 180;
    } else if (currentCategoryFilter === '192') {
      matchCat = sqm >= 181 && sqm <= 199;
    } else if (currentCategoryFilter === '200plus') {
      matchCat = sqm >= 200;
    }

    return matchSearch && matchCat;
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${window.SUKOON_PLOTS.length} plots (Rate: ₹10,400 / sq. ft.)`;
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No plots found matching "<strong>${escapeHtml(searchQuery)}</strong>". Try another plot number or reset the filter.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(plot => {
    const formattedBase = formatCurrency(plot.basePrice);
    const formattedTotal = formatCurrency(plot.estimatedTotal);
    const formattedMaint = formatCurrency(plot.maintenance);

    return `
      <tr>
        <td><span class="plot-badge">${plot.plot}</span></td>
        <td>${plot.sqm.toFixed(2)}</td>
        <td>${plot.sqyd.toFixed(2)}</td>
        <td><strong>${plot.sqft.toFixed(1)}</strong></td>
        <td><span style="color: var(--gold-light); font-weight: 600;">${formattedBase}</span></td>
        <td><span style="font-weight: 700; color: var(--text-primary);">${formattedTotal}</span></td>
        <td>
          <button class="btn-table-action" onclick="selectPlotAndEnquire('${plot.plot}', '${plot.sqft.toFixed(0)}', '${formattedTotal}')">
            Enquire Plot
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.selectPlotAndEnquire = function(plotNo, sqft, totalEstimate) {
  const contactSec = document.getElementById('contact');
  const plotInput = document.getElementById('formPlotNo');
  const sizeSelect = document.getElementById('formPlotSize');
  const notesInput = document.getElementById('formNotes');

  if (plotInput) plotInput.value = plotNo;
  if (sizeSelect) sizeSelect.value = 'custom';
  if (notesInput) {
    notesInput.value = `Interested in Plot No. ${plotNo} (${sqft} sq.ft. @ ₹10,400/sq.ft. Est: ${totalEstimate}). Please share current availability and payment plan.`;
  }

  showToast(`Plot ${plotNo} selected! Scroll to contact form.`);
  if (contactSec) {
    contactSec.scrollIntoView({ behavior: 'smooth' });
  }
};

function exportPlotsToCSV() {
  if (!window.SUKOON_PLOTS) return;
  const headers = ['Plot No', 'Area (Sq. Mtr)', 'Area (Sq. Yd)', 'Area (Sq. Ft)', 'Rate per Sq.Ft', 'Base Price (INR)', 'Est. Total Price (INR)', 'Maintenance Deposit (INR)'];
  const rows = window.SUKOON_PLOTS.map(p => [
    p.plot,
    p.sqm,
    p.sqyd,
    p.sqft,
    10400,
    p.basePrice,
    p.estimatedTotal,
    p.maintenance
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'Sukoon_Pardos_Okas_192_Plots_PriceList_10400.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Downloaded Sukoon 192 Plots Price Sheet (CSV)');
}

/* -------------------------------------------------------------
 * 4. Interactive Plot Budget & EMI Calculator (at Rs. 10,400/sq.ft)
 * ------------------------------------------------------------- */
const RATE_SQFT = 10400;

function initCalculator() {
  const areaSlider = document.getElementById('calcAreaSlider');
  const areaValueDisplay = document.getElementById('calcAreaVal');
  const areaSqydDisplay = document.getElementById('calcAreaSqyd');
  const plcRadios = document.querySelectorAll('input[name="plcType"]');
  const downPaymentSlider = document.getElementById('calcDownPaymentSlider');
  const downPaymentValDisplay = document.getElementById('calcDownPaymentVal');
  const tenureSlider = document.getElementById('calcTenureSlider');
  const tenureValDisplay = document.getElementById('calcTenureVal');

  const basePriceDisplay = document.getElementById('calcBasePriceDisplay');
  const plcPriceDisplay = document.getElementById('calcPlcDisplay');
  const totalPriceDisplay = document.getElementById('calcTotalPriceDisplay');
  const downPaymentAmountDisplay = document.getElementById('calcDownPaymentAmountDisplay');
  const emiDisplay = document.getElementById('calcEmiDisplay');
  const applyBtn = document.getElementById('calcApplyBtn');

  if (!areaSlider) return;

  function calculate() {
    const sqft = parseFloat(areaSlider.value);
    const sqyd = (sqft / 9).toFixed(1);
    const downPercent = parseFloat(downPaymentSlider.value);
    const tenureYears = parseFloat(tenureSlider.value);

    // Update slider readouts
    areaValueDisplay.textContent = `${sqft.toLocaleString('en-IN')} sq. ft.`;
    areaSqydDisplay.textContent = `(~${sqyd} sq. yd.)`;
    downPaymentValDisplay.textContent = `${downPercent}%`;
    tenureValDisplay.textContent = `${tenureYears} Years`;

    // PLC Percentage
    let plcFactor = 0;
    plcRadios.forEach(radio => {
      if (radio.checked) {
        plcFactor = parseFloat(radio.value);
      }
    });

    const basePrice = sqft * RATE_SQFT;
    const plcAmount = basePrice * plcFactor;
    const otherCharges = basePrice * 0.05; // Standard 5% development / connection fee
    const totalPrice = basePrice + plcAmount + otherCharges;

    const downPaymentAmount = totalPrice * (downPercent / 100);
    const loanPrincipal = totalPrice - downPaymentAmount;

    // Monthly EMI Calculation: P * r * (1+r)^n / ((1+r)^n - 1)
    const annualInterestRate = 0.085; // 8.5%
    const monthlyRate = annualInterestRate / 12;
    const totalMonths = tenureYears * 12;
    const emi = (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

    // Display formatted outputs
    basePriceDisplay.textContent = formatCurrency(Math.round(basePrice));
    plcPriceDisplay.textContent = plcAmount > 0 ? `+ ${formatCurrency(Math.round(plcAmount))}` : 'Included';
    totalPriceDisplay.textContent = formatCurrency(Math.round(totalPrice));
    downPaymentAmountDisplay.textContent = formatCurrency(Math.round(downPaymentAmount));
    emiDisplay.textContent = `${formatCurrency(Math.round(emi))} / mo`;
  }

  [areaSlider, downPaymentSlider, tenureSlider].forEach(el => {
    el.addEventListener('input', calculate);
  });
  plcRadios.forEach(r => r.addEventListener('change', calculate));

  calculate();

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const sqft = areaSlider.value;
      const total = totalPriceDisplay.textContent;
      const notesInput = document.getElementById('formNotes');
      const sizeSelect = document.getElementById('formPlotSize');
      if (sizeSelect) sizeSelect.value = 'custom';
      if (notesInput) {
        notesInput.value = `Custom Budget Plan: Calculated for ${sqft} sq.ft. @ ₹10,400/sq.ft. Total Est: ${total}. Please send availability options.`;
      }
      showToast('Calculated budget transferred to inquiry form!');
      const contactSec = document.getElementById('contact');
      if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* -------------------------------------------------------------
 * 5. Visual Bento Gallery & Lightbox Modal
 * ------------------------------------------------------------- */
const galleryImages = [
  { src: 'assets/images/site-4-pergola.jpg', title: 'Pergola & Landscaped Garden Pavilion', tag: 'Gardens & Parks', cat: 'gardens' },
  { src: 'assets/images/site-1-park.jpg', title: 'Central Park Seating & Recreation Zone', tag: 'Gardens & Parks', cat: 'gardens' },
  { src: 'assets/images/site-2-roads.jpg', title: 'Paved Internal Roads with LED Lighting', tag: 'Roads & Infrastructure', cat: 'roads' },
  { src: 'assets/images/site-3-trees.jpg', title: 'Tree-Lined Boulevards & Underground Services', tag: 'Roads & Infrastructure', cat: 'roads' },
  { src: 'assets/images/site-5-entrance.jpg', title: 'Township Entrance & High-Rise Boulevard', tag: 'Township Surroundings', cat: 'township' },
  { src: 'assets/images/site-6-avenue.jpg', title: 'Wide Internal Avenue with Play Zone', tag: 'Roads & Infrastructure', cat: 'roads' }
];

let activeLightboxIndex = 0;

function initGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');

  if (!galleryGrid) return;

  function renderGallery(category = 'all') {
    const items = category === 'all' ? galleryImages : galleryImages.filter(img => img.cat === category);
    galleryGrid.innerHTML = items.map((img, idx) => `
      <div class="gallery-item glass-card" onclick="openLightbox(${galleryImages.indexOf(img)})">
        <img src="${img.src}" alt="${escapeHtml(img.title)}" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-tag">${img.tag}</span>
          <h4 class="gallery-caption">${img.title}</h4>
        </div>
      </div>
    `).join('');
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat') || 'all';
      renderGallery(cat);
    });
  });

  renderGallery('all');

  window.openLightbox = function(index) {
    activeLightboxIndex = index;
    updateLightbox();
    if (modal) modal.classList.add('active');
  };

  function updateLightbox() {
    const current = galleryImages[activeLightboxIndex];
    if (modalImg) modalImg.src = current.src;
    if (modalCaption) modalCaption.textContent = current.title;
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeLightboxIndex = (activeLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
      updateLightbox();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeLightboxIndex = (activeLightboxIndex + 1) % galleryImages.length;
      updateLightbox();
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') modal.classList.remove('active');
    if (e.key === 'ArrowLeft') prevBtn && prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
  });
}

/* -------------------------------------------------------------
 * 6. Masterplan Hotspots
 * ------------------------------------------------------------- */
function initMasterplanHotspots() {
  const hotspots = document.querySelectorAll('.masterplan-hotspot');
  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', () => {
      const label = hotspot.getAttribute('data-name');
      showToast(`Masterplan Highlight: ${label}`);
    });
  });
}

/* -------------------------------------------------------------
 * 7. FAQ Accordion
 * ------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

/* -------------------------------------------------------------
 * 8. Contact & Site Visit Form
 * ------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('siteVisitForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim();
    const size = document.getElementById('formPlotSize').value;
    const plotNo = document.getElementById('formPlotNo').value.trim();
    const date = document.getElementById('formDate').value;
    const notes = document.getElementById('formNotes').value.trim();

    if (!name || !phone) {
      showToast('Please enter your Name and Phone Number');
      return;
    }

    // Build WhatsApp message
    let waMsg = `Hi Bandhan Realty, I am interested in *Sukoon by Pardos Okas* (Sushant Golf City, Lucknow).\n`;
    waMsg += `Name: ${name}\n`;
    waMsg += `Phone: ${phone}\n`;
    if (plotNo) waMsg += `Specific Plot: ${plotNo}\n`;
    waMsg += `Preferred Size: ${size}\n`;
    if (date) waMsg += `Preferred Visit Date: ${date}\n`;
    waMsg += `Current Rate: Rs. 10,400 / sq. ft.\n`;
    if (notes) waMsg += `Notes: ${notes}\n`;

    const encoded = encodeURIComponent(waMsg);
    const waUrl = `https://wa.me/919140943615?text=${encoded}`;

    showToast('Inquiry submitted! Redirecting to WhatsApp for instant response...');

    setTimeout(() => {
      window.open(waUrl, '_blank');
      form.reset();
    }, 1200);
  });
}

/* -------------------------------------------------------------
 * Helpers: Toast & Currency
 * ------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span>${escapeHtml(message)}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}

function formatCurrency(amount) {
  if (isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
