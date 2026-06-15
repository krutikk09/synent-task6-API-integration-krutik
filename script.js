/**
 * CineScope — Premium Movie Explorer
 * JavaScript Architecture | Vanilla JS | OMDb API
 */

// ============================================
// Configuration & State
// ============================================
const OMDB_API_URL = 'https://www.omdbapi.com';
const OMDB_API_KEY = 'YOUR_API_KEYU'; // Replace with your OMDb API key

const state = {
  isLoading: false,
  currentMovie: null,
  favorites: JSON.parse(localStorage.getItem('cinescope_favorites') || '[]'),
  recentSearches: JSON.parse(localStorage.getItem('cinescope_recent') || '[]'),
};

// ============================================
// DOM Elements
// ============================================
const elements = {
  loadingScreen: document.getElementById('loading-screen'),
  navbar: document.getElementById('navbar'),
  searchInput: document.getElementById('search-input'),
  searchBtn: document.getElementById('search-btn'),
  navSearchBtn: document.getElementById('nav-search-btn'),
  resultsSection: document.getElementById('results-section'),
  resultsContainer: document.getElementById('results-container'),
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  errorCard: document.getElementById('error-card'),
  recentSection: document.getElementById('recent-searches-section'),
  recentList: document.getElementById('recent-searches-list'),
  clearRecentBtn: document.getElementById('clear-recent-btn'),
  favoritesSection: document.getElementById('favorites-section'),
  favoritesGrid: document.getElementById('favorites-grid'),
  modalOverlay: document.getElementById('modal-overlay'),
  modalImage: document.getElementById('modal-image'),
  modalClose: document.getElementById('modal-close'),
  toastContainer: document.getElementById('toast-container'),
  particles: document.getElementById('particles'),
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  simulateLoading();
  bindEvents();
  renderRecentSearches();
  renderFavorites();
});

// Create floating particles
function createParticles() {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    p.style.opacity = 0.2 + Math.random() * 0.4;
    elements.particles.appendChild(p);
  }
}

// Simulate premium loading experience
function simulateLoading() {
  setTimeout(() => {
    elements.loadingScreen.classList.add('hidden');
  }, 2200);
}

// Bind all event listeners
function bindEvents() {
  // Search triggers
  elements.searchBtn.addEventListener('click', handleSearch);
  elements.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  elements.navSearchBtn.addEventListener('click', () => {
    elements.searchInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Keyboard shortcut Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      elements.searchInput.focus();
    }
    // Close modal with Escape
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      elements.navbar.classList.add('scrolled');
    } else {
      elements.navbar.classList.remove('scrolled');
    }
  });

  // Clear recent searches
  elements.clearRecentBtn.addEventListener('click', () => {
    state.recentSearches = [];
    saveRecentSearches();
    renderRecentSearches();
    showToast('Search history cleared', 'info');
  });

  // Modal close
  elements.modalClose.addEventListener('click', closeModal);
  elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) closeModal();
  });
}

// ============================================
// Search Logic
// ============================================
function handleSearch() {
  const query = elements.searchInput.value.trim();
  if (!query) {
    showError('Please enter a movie title', 'Empty Search');
    return;
  }
  addRecentSearch(query);
  fetchMovie(query);
}

async function fetchMovie(title) {
  if (state.isLoading) return;
  state.isLoading = true;

  // Show loading state
  hideAllSections();
  elements.loadingState.classList.add('active');

  try {
    const response = await fetch(`${OMDB_API_URL}/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
    if (!response.ok) {
      throw new Error('Network error. Please try again.');
    }
    const data = await response.json();

    elements.loadingState.classList.remove('active');

    if (data.Response === 'False') {
      showError(data.Error || 'Movie not found. Try another title.', 'No Results');
      return;
    }

    state.currentMovie = data;
    renderMovie(data);
  } catch (err) {
    elements.loadingState.classList.remove('active');
    showError(err.message || 'Something went wrong. Please check your connection.', 'Connection Error');
  } finally {
    state.isLoading = false;
  }
}

// ============================================
// Color Extraction from Poster
// ============================================

/**
 * Extract dominant colors from a movie poster using canvas pixel analysis.
 * Falls back to deterministic colors based on title if CORS blocks the image.
 */
function extractColorsFromPoster(imageUrl, fallbackTitle) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const colors = analyzeImageColors(img);
        resolve(colors);
      } catch (e) {
        resolve(generateColorsFromString(fallbackTitle || 'movie'));
      }
    };
    img.onerror = () => resolve(generateColorsFromString(fallbackTitle || 'movie'));

    // Try loading the image directly first. If CORS fails, we fall back to title-based colors.
    img.src = imageUrl;
  });
}

/**
 * Analyze image colors using weighted HSL clustering for accurate dominant colors.
 * Uses a monochromatic approach (same hue, different lightness) for a cohesive theme.
 */
function analyzeImageColors(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = 120;
  canvas.height = 180;
  ctx.drawImage(img, 0, 0, 120, 180);

  const imageData = ctx.getImageData(0, 0, 120, 180).data;
  const weightedHues = [];

  // Sample every 20th pixel for finer granularity
  for (let i = 0; i < imageData.length; i += 20) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    if (a < 128) continue;

    const hsl = rgbToHsl(r, g, b);
    const brightness = (r + g + b) / 3;

    // Skip near-grayscale pixels
    if (hsl.s < 0.12) continue;
    // Skip very dark and very light pixels
    if (brightness < 20 || brightness > 250) continue;

    // Weight by saturation — highly saturated pixels have stronger visual impact
    weightedHues.push({ h: hsl.h, s: hsl.s, l: hsl.l, weight: hsl.s });
  }

  // Find dominant hue using weighted circular mean
  const dominantHsl = findDominantHueWeighted(weightedHues, { fallback: { h: 270, s: 0.65, l: 0.55 } });

  // Primary: bright, saturated version of the dominant hue
  const primary = hslToRgbString(dominantHsl.h, Math.min(dominantHsl.s * 1.15, 0.85), 0.55);

  // Secondary: same hue, darker and slightly less saturated — monochromatic harmony
  const secondary = hslToRgbString(dominantHsl.h, Math.min(dominantHsl.s * 0.85, 0.70), 0.35);

  return { primary, secondary };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s, l };
}

function hslToRgbString(h, s, l) {
  h /= 360;
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return `rgb(${r}, ${g}, ${b})`;
}

function findDominantHue(hslArray, options) {
  return findDominantHueWeighted(
    hslArray.map(h => ({ ...h, weight: 1 })),
    options
  );
}

function findDominantHueWeighted(weightedHslArray, options) {
  if (weightedHslArray.length < 10) return options.fallback;

  // Bucket hues into 36 bins (10-degree bins), tracking weighted counts
  const buckets = new Array(36).fill(0).map(() => ({ totalWeight: 0, hues: [] }));
  for (const hsl of weightedHslArray) {
    const bin = Math.floor(hsl.h / 10) % 36;
    buckets[bin].totalWeight += hsl.weight;
    buckets[bin].hues.push(hsl);
  }

  // Find the best window of 3 consecutive bins (30 degrees), handling wrap-around
  let bestWeight = 0;
  let bestStart = 0;
  for (let i = 0; i < 36; i++) {
    const weight = buckets[i].totalWeight
      + buckets[(i + 1) % 36].totalWeight
      + buckets[(i + 2) % 36].totalWeight;
    if (weight > bestWeight) {
      bestWeight = weight;
      bestStart = i;
    }
  }

  if (bestWeight < 1) return options.fallback;

  // Gather all HSL values from the best window
  const merged = [
    ...buckets[bestStart].hues,
    ...buckets[(bestStart + 1) % 36].hues,
    ...buckets[(bestStart + 2) % 36].hues,
  ];

  // Compute weighted circular mean of hue (wrap-around safe)
  let sinSum = 0, cosSum = 0, totalWeight = 0;
  let avgS = 0, avgL = 0;
  for (const h of merged) {
    const rad = h.h * (Math.PI / 180);
    sinSum += Math.sin(rad) * h.weight;
    cosSum += Math.cos(rad) * h.weight;
    totalWeight += h.weight;
    avgS += h.s;
    avgL += h.l;
  }

  const circularMean = Math.atan2(sinSum / totalWeight, cosSum / totalWeight);
  const avgH = ((circularMean * (180 / Math.PI)) + 360) % 360;

  return {
    h: avgH,
    s: Math.min((avgS / merged.length) * 1.2, 0.9),
    l: Math.min((avgL / merged.length) * 1.15, 0.65)
  };
}

/**
 * Generate deterministic, pleasing colors from a string (e.g., movie title).
 * This ensures the same movie always gets the same color scheme.
 */
function generateColorsFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40 + (Math.abs(hash >> 8) % 60)) % 360;
  const primary = hslToRgbString(h1, 0.65, 0.55);
  const secondary = hslToRgbString(h2, 0.6, 0.45);
  return { primary, secondary };
}

function applyDynamicTheme(colors) {
  const root = document.documentElement;
  // Parse rgb(...) for creating rgba glows
  const rgbMatch = colors.primary.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  const r = rgbMatch ? rgbMatch[1] : 139;
  const g = rgbMatch ? rgbMatch[2] : 92;
  const b = rgbMatch ? rgbMatch[3] : 246;

  root.style.setProperty('--dynamic-primary', colors.primary);
  root.style.setProperty('--dynamic-secondary', colors.secondary);
  root.style.setProperty('--purple-glow', `rgba(${r}, ${g}, ${b}, 0.4)`);
  root.style.setProperty('--shadow-glow', `0 0 40px rgba(${r}, ${g}, ${b}, 0.15)`);
}

function resetTheme() {
  const root = document.documentElement;
  root.style.setProperty('--dynamic-primary', '#8B5CF6');
  root.style.setProperty('--dynamic-secondary', '#3B82F6');
  root.style.setProperty('--purple-glow', 'rgba(139, 92, 246, 0.4)');
  root.style.setProperty('--shadow-glow', '0 0 40px rgba(139, 92, 246, 0.15)');
}

// ============================================
// Render Movie Result
// ============================================
function renderMovie(movie) {
  const rating = parseFloat(movie.imdbRating) || 0;
  const ratingClass = rating >= 7.5 ? 'excellent' : rating >= 5 ? 'good' : 'poor';
  const isFavorite = isInFavorites(movie.imdbID);

  const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600/1a1a2e/ffffff?text=No+Poster';

  const html = `
    <div class="movie-card">
      <div class="movie-poster-wrapper" onclick="openModal('${posterUrl}')">
        <img src="${posterUrl}" alt="${movie.Title} poster" class="movie-poster" loading="lazy" />
        <div class="movie-poster-glow"></div>
      </div>
      <div class="movie-details">
        <div class="movie-header">
          <div>
            <h2 class="movie-title">${escapeHtml(movie.Title)}</h2>
            <div class="movie-meta">
              <span class="meta-tag">${escapeHtml(movie.Year)}</span>
              <span class="meta-tag">${escapeHtml(movie.Genre || 'N/A')}</span>
              <span class="meta-tag">${escapeHtml(movie.Runtime || 'N/A')}</span>
            </div>
          </div>
          <div class="rating-badge ${ratingClass}">
            <span class="rating-star">★</span>
            <span class="rating-value" data-target="${rating}">0</span>
          </div>
        </div>
        <p class="movie-plot">${escapeHtml(movie.Plot || 'No plot available.')}</p>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Director</span>
            <span class="info-value">${escapeHtml(movie.Director || 'N/A')}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Actors</span>
            <span class="info-value">${escapeHtml(movie.Actors || 'N/A')}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Language</span>
            <span class="info-value">${escapeHtml(movie.Language || 'N/A')}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Awards</span>
            <span class="info-value">${escapeHtml(movie.Awards || 'N/A')}</span>
          </div>
        </div>
        <div class="movie-actions">
          <button class="action-btn secondary ${isFavorite ? 'active' : ''}" id="fav-btn" onclick="toggleFavorite()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>${isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
          <button class="action-btn primary" onclick="window.open('https://www.imdb.com/title/${movie.imdbID}', '_blank')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path></svg>
            <span>View on IMDb</span>
          </button>
        </div>
      </div>
    </div>
  `;

  elements.resultsContainer.innerHTML = html;
  elements.resultsSection.classList.add('active');

  // Extract colors from poster and apply dynamic theme
  const posterImg = document.querySelector('.movie-poster');
  if (posterImg && posterImg.src && !posterImg.src.includes('placeholder')) {
    extractColorsFromPoster(posterImg.src, movie.Title).then(colors => {
      applyDynamicTheme(colors);
    });
  } else {
    // Even without a poster, generate a theme from the movie title
    const titleColors = generateColorsFromString(movie.Title || 'movie');
    applyDynamicTheme(titleColors);
  }

  // Animate rating counter
  animateRatingCounter();

  // Scroll to results
  setTimeout(() => {
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function animateRatingCounter() {
  const el = document.querySelector('.rating-value[data-target]');
  if (!el) return;
  const target = parseFloat(el.dataset.target) || 0;
  if (target === 0) {
    el.textContent = 'N/A';
    return;
  }
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = eased * target;
    el.textContent = current.toFixed(1);
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

// ============================================
// Error Handling
// ============================================
function showError(message, title = 'Error') {
  hideAllSections();
  const icon = title === 'No Results'
    ? '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>'
    : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>';

  elements.errorCard.innerHTML = `
    <div class="error-icon">${icon}</div>
    <h3 class="error-title">${escapeHtml(title)}</h3>
    <p class="error-message">${escapeHtml(message)}</p>
    <button class="retry-btn" onclick="retrySearch()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
      Try Again
    </button>
  `;
  elements.errorState.classList.add('active');
}

function retrySearch() {
  elements.errorState.classList.remove('active');
  resetTheme();
  elements.searchInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAllSections() {
  elements.resultsSection.classList.remove('active');
  elements.loadingState.classList.remove('active');
  elements.errorState.classList.remove('active');
  resetTheme();
}

// ============================================
// Recent Searches
// ============================================
function addRecentSearch(query) {
  // Remove duplicates and limit to 8
  state.recentSearches = state.recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
  state.recentSearches.unshift(query);
  if (state.recentSearches.length > 8) state.recentSearches.pop();
  saveRecentSearches();
  renderRecentSearches();
}

function saveRecentSearches() {
  localStorage.setItem('cinescope_recent', JSON.stringify(state.recentSearches));
}

function renderRecentSearches() {
  if (state.recentSearches.length === 0) {
    elements.recentSection.classList.remove('active');
    return;
  }
  elements.recentList.innerHTML = state.recentSearches.map(q => `
    <button class="recent-tag" onclick="searchFromRecent('${escapeHtml(q).replace(/'/g, "\\'")}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
      ${escapeHtml(q)}
    </button>
  `).join('');
  elements.recentSection.classList.add('active');
}

function searchFromRecent(query) {
  elements.searchInput.value = query;
  handleSearch();
}

// ============================================
// Favorites
// ============================================
function toggleFavorite() {
  if (!state.currentMovie) return;
  const id = state.currentMovie.imdbID;
  const index = state.favorites.findIndex(f => f.imdbID === id);

  if (index === -1) {
    state.favorites.push({
      imdbID: id,
      Title: state.currentMovie.Title,
      Year: state.currentMovie.Year,
      Poster: state.currentMovie.Poster,
    });
    showToast('Added to favorites', 'success');
  } else {
    state.favorites.splice(index, 1);
    showToast('Removed from favorites', 'info');
  }

  saveFavorites();
  renderFavorites();
  updateFavoriteButton();
}

function isInFavorites(imdbID) {
  return state.favorites.some(f => f.imdbID === imdbID);
}

function saveFavorites() {
  localStorage.setItem('cinescope_favorites', JSON.stringify(state.favorites));
}

function renderFavorites() {
  if (state.favorites.length === 0) {
    elements.favoritesSection.classList.remove('active');
    return;
  }
  elements.favoritesGrid.innerHTML = state.favorites.map(f => `
    <div class="favorite-card" onclick="searchFromFavorite('${f.imdbID}')">
      <button class="favorite-remove" onclick="event.stopPropagation(); removeFavorite('${f.imdbID}')" aria-label="Remove favorite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
      </button>
      <img src="${f.Poster !== 'N/A' ? f.Poster : 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Poster'}" alt="${escapeHtml(f.Title)} poster" loading="lazy" />
      <div class="favorite-card-info">
        <div class="favorite-card-title">${escapeHtml(f.Title)}</div>
        <div class="favorite-card-year">${escapeHtml(f.Year)}</div>
      </div>
    </div>
  `).join('');
  elements.favoritesSection.classList.add('active');
}

function updateFavoriteButton() {
  const btn = document.getElementById('fav-btn');
  if (!btn || !state.currentMovie) return;
  const isFav = isInFavorites(state.currentMovie.imdbID);
  btn.classList.toggle('active', isFav);
  const svg = btn.querySelector('svg');
  svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
  btn.querySelector('span').textContent = isFav ? 'Favorited' : 'Add to Favorites';
}

function removeFavorite(imdbID) {
  state.favorites = state.favorites.filter(f => f.imdbID !== imdbID);
  saveFavorites();
  renderFavorites();
  if (state.currentMovie && state.currentMovie.imdbID === imdbID) {
    updateFavoriteButton();
  }
  showToast('Removed from favorites', 'info');
}

function searchFromFavorite(imdbID) {
  // Search by imdbID using i parameter
  if (state.isLoading) return;
  state.isLoading = true;
  hideAllSections();
  elements.loadingState.classList.add('active');

  fetch(`${OMDB_API_URL}/?i=${imdbID}&apikey=${OMDB_API_KEY}`)
    .then(r => r.json())
    .then(data => {
      elements.loadingState.classList.remove('active');
      if (data.Response === 'False') {
        showError(data.Error || 'Movie not found.', 'Error');
        return;
      }
      state.currentMovie = data;
      elements.searchInput.value = data.Title;
      renderMovie(data);
    })
    .catch(err => {
      elements.loadingState.classList.remove('active');
      showError(err.message || 'Failed to load movie.', 'Error');
    })
    .finally(() => {
      state.isLoading = false;
    });
}

// ============================================
// Modal
// ============================================
function openModal(src) {
  if (!src || src.includes('placeholder')) return;
  elements.modalImage.src = src;
  elements.modalOverlay.classList.add('active');
  elements.modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  elements.modalOverlay.classList.remove('active');
  elements.modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  elements.modalImage.src = '';
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>',
  };

  toast.innerHTML = `${icons[type] || icons.info}<span>${escapeHtml(message)}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// ============================================
// Utilities
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// API Key Check on Load
// ============================================
if (OMDB_API_KEY === 'YOUR_API_KEY') {
  console.warn('CineScope: Please set your OMDb API key in script.js');
}
