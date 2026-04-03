// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// ──────────────────────────────────────────────
// NASA APOD API
// Replace DEMO_KEY with your key from https://api.nasa.gov
// ──────────────────────────────────────────────
const API_KEY = 'DEMO_KEY';
const BASE_URL = 'https://api.nasa.gov/planetary/apod';

// ──────────────────────────────────────────────
// DOM references
// ──────────────────────────────────────────────
const gallery = document.getElementById('gallery');
const button = document.getElementById('fetchBtn');

// Modal elements
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalDesc = document.getElementById('modalDesc');
const modalVideo = document.getElementById('modalVideo');
const modalClose = document.getElementById('modalClose');

// ──────────────────────────────────────────────
// Random Space Facts
// ──────────────────────────────────────────────
const spaceFacts = [
  'A day on Venus is longer than its year — it takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.',
  'Neutron stars are so dense that a teaspoon of their material would weigh about 6 billion tons.',
  'There are more stars in the observable universe than grains of sand on all of Earth\'s beaches.',
  'The Voyager 1 spacecraft, launched in 1977, is the most distant human-made object from Earth at over 15 billion miles away.',
  'Saturn\'s density is low enough that it would float if you could find a bathtub big enough to hold it.',
  'The Great Red Spot on Jupiter is a storm that has been raging for at least 350 years and is larger than Earth.',
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  'The Milky Way galaxy is on a collision course with the Andromeda Galaxy — they\'ll merge in about 4.5 billion years.',
  'Space is completely silent because there is no atmosphere to carry sound waves.',
  'Olympus Mons on Mars is the tallest known volcano and mountain in the solar system, standing nearly 3 times the height of Mount Everest.',
  'One million Earths could fit inside the Sun.',
  'The International Space Station orbits Earth every 90 minutes, meaning astronauts see about 16 sunrises per day.',
  'Footprints left on the Moon will remain there for millions of years because there is no wind or water to erode them.',
  'A year on Mercury is just 88 Earth days, but a single day-night cycle lasts 176 Earth days.',
  'The observable universe is about 93 billion light-years in diameter.'
];

(function showRandomFact() {
  const factText = document.getElementById('factText');
  if (factText) {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);
    factText.textContent = spaceFacts[randomIndex];
  }
})();

// ──────────────────────────────────────────────
// Fetch images
// ──────────────────────────────────────────────
button.addEventListener('click', fetchImages);

async function fetchImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showMessage('⚠️', 'Please select both a start and end date.');
    return;
  }
  if (startDate > endDate) {
    showMessage('⚠️', 'Start date must be before end date.');
    return;
  }

  // Loading state
  showMessage('🔄', 'Loading space photos…');
  button.disabled = true;

  try {
    const url = `${BASE_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
    const response = await fetch(url);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.msg || `API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      showMessage('🔭', 'No images found for that range. Try different dates!');
      return;
    }

    renderGallery(data);
  } catch (error) {
    console.error('APOD fetch error:', error);
    showMessage('❌', `Something went wrong: ${error.message}`);
  } finally {
    button.disabled = false;
  }
}

// ──────────────────────────────────────────────
// Render gallery cards
// ──────────────────────────────────────────────
function renderGallery(items) {
  gallery.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'gallery-item';

    const isVideo = item.media_type === 'video';
    const imgSrc = isVideo ? item.thumbnail_url : item.url;

    const shortDesc =
      item.explanation && item.explanation.length > 180
        ? item.explanation.slice(0, 180) + '…'
        : item.explanation || '';

    card.innerHTML = `
      <div class="card-img-wrap">
        ${
          imgSrc
            ? `<img src="${imgSrc}" alt="${item.title}" loading="lazy" />`
            : `<div class="no-image">No preview available</div>`
        }
      </div>
      <div class="card-body">
        <h3 class="card-title">${item.title}</h3>
        <span class="card-date">${item.date}</span>
        <p class="card-desc">${shortDesc}</p>
        ${isVideo ? '<span class="card-video-badge">▶ Video</span>' : ''}
      </div>
    `;

    // Open modal on card click
    card.addEventListener('click', () => openModal(item));

    gallery.appendChild(card);
  });
}

// ──────────────────────────────────────────────
// Modal
// ──────────────────────────────────────────────
function openModal(item) {
  const isVideo = item.media_type === 'video';
  const imgSrc = isVideo ? item.thumbnail_url : item.url;

  modalImg.src = imgSrc || '';
  modalImg.alt = item.title;
  modalImg.style.display = imgSrc ? 'block' : 'none';
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalDesc.textContent = item.explanation || 'No description available.';

  if (isVideo && item.url) {
    modalVideo.href = item.url;
    modalVideo.style.display = 'inline-block';
  } else {
    modalVideo.style.display = 'none';
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Close button
modalClose.addEventListener('click', closeModal);

// Click outside modal content to close
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Escape key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

// ──────────────────────────────────────────────
// Helper: show placeholder / loading message
// ──────────────────────────────────────────────
function showMessage(icon, text) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">${icon}</div>
      <p>${text}</p>
    </div>
  `;
}