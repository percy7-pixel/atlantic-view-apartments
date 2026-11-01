/* ==========================================================================
   Atlantic View Apartments — demonstration showcase
   Vanilla JavaScript. No dependencies, no build step.

   BEFORE GOING LIVE: change CONFIG.whatsappNumber below to the client's
   real WhatsApp number in full international format, digits only
   (example: Cameroon 6XX XXX XXX -> "2376XXXXXXXX").
   ========================================================================== */

const CONFIG = {
  propertyName: 'Atlantic View Apartments',

  /* ⬇︎ PLACEHOLDER — replace with the client's real number (digits only) */
  whatsappNumber: '237000000000',

  /* Shown in the footer as a readable version of the number above */
  whatsappDisplay: '+237 000 000 000',

  /* Message used by the general "Book on WhatsApp" buttons */
  generalMessage:
    'Hello Atlantic View Apartments, I found your website and would like to ask about ' +
    'availability for a stay in Limbe. Please let me know which dates are open and the rates. Thank you!'
};

/* ---------------------------------------------------------------- helpers */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function waLink(message) {
  return 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message);
}

function openWhatsApp(message) {
  window.open(waLink(message), '_blank', 'noopener');
}

/* ------------------------------------------------------------ header state */
const header = $('#siteHeader');
const mobileBar = $('#mobileBar');

function onScroll() {
  const y = window.scrollY || window.pageYOffset;
  if (header) header.classList.toggle('is-scrolled', y > 8);
  if (mobileBar) mobileBar.classList.toggle('is-visible', y > 520);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* --------------------------------------------------- active nav highlight */
(function activeNav() {
  const links = $$('.nav a');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map = new Map();
  links.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) map.set(section, link);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('is-active'));
          const link = map.get(entry.target);
          if (link) link.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  map.forEach((_, section) => io.observe(section));
})();

/* ------------------------------------------------------- reveal animation */
(function reveals() {
  const items = $$('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));

  /* failsafe: never leave content hidden (crawlers, print, odd viewports) */
  window.setTimeout(() => items.forEach((el) => el.classList.add('is-in')), 2200);
  window.addEventListener('beforeprint', () => items.forEach((el) => el.classList.add('is-in')));
})();

/* ------------------------------------------------------- footer year/number */
(function footerBits() {
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const num = $('#footerNumber');
  if (num) num.textContent = CONFIG.whatsappDisplay;
})();

/* ------------------------------------------------------------- the booking */
const form = $('#bookingForm');
const unitSelect = $('#unit');
const checkin = $('#checkin');
const checkout = $('#checkout');
const guests = $('#guests');
const nameInput = $('#name');
const notes = $('#notes');
const errorBox = $('#formError');
const hint = $('#dateHint');
const bubble = $('#waBubble');
const waTime = $('#waTime');

const DAY = 86400000;

function toISO(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}
function fromISO(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function prettyDate(value) {
  const date = fromISO(value);
  if (!date) return null;
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}
function nightsBetween(a, b) {
  const start = fromISO(a);
  const end = fromISO(b);
  if (!start || !end) return 0;
  return Math.round((end - start) / DAY);
}

function buildMessage() {
  const unit = unitSelect ? unitSelect.value : 'The Atlantic Studio';
  const guestsValue = guests ? guests.value : '2';
  const guestLabel = guestsValue === '1' ? '1 guest' : guestsValue + ' guests';
  const inDate = prettyDate(checkin && checkin.value);
  const outDate = prettyDate(checkout && checkout.value);
  const nights = nightsBetween(checkin && checkin.value, checkout && checkout.value);
  const guestName = nameInput ? nameInput.value.trim() : '';
  const extraNotes = notes ? notes.value.trim() : '';

  const lines = [
    'Hello ' + CONFIG.propertyName + ',',
    '',
    'I would like to request a booking:',
    '',
    '• Apartment: ' + (unit === 'Not sure yet' ? 'Not sure yet — please advise' : unit),
    '• Check-in: ' + (inDate || 'flexible — please advise'),
    '• Check-out: ' + (outDate || 'flexible — please advise')
  ];

  if (nights > 0) lines.push('• Nights: ' + nights);
  lines.push('• Guests: ' + guestLabel);

  if (guestName) lines.push('• Name: ' + guestName);
  if (extraNotes) lines.push('', 'Notes: ' + extraNotes);

  lines.push('', 'Could you please confirm availability and the total price? Thank you!');
  return lines.join('\n');
}

function refresh() {
  if (!bubble) return;
  bubble.textContent = buildMessage();

  /* keep the CTA pointing at the same message */
  const cta = $('#bookingCta');
  if (cta) cta.setAttribute('href', waLink(buildMessage()));

  if (waTime) {
    waTime.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  /* date hygiene */
  if (checkin && checkin.value && checkout) {
    const min = toISO(new Date(fromISO(checkin.value).getTime() + DAY));
    checkout.min = min;
    if (checkout.value && checkout.value < min) checkout.value = '';
  }
  if (hint) {
    hint.hidden = Boolean((checkin && checkin.value) || (checkout && checkout.value));
  }
  validate(false);
}

function validate(showError) {
  if (!errorBox) return true;
  const inVal = checkin ? checkin.value : '';
  const outVal = checkout ? checkout.value : '';
  let message = '';

  if (inVal && outVal) {
    const nights = nightsBetween(inVal, outVal);
    if (nights <= 0) message = 'Your check-out date needs to be after your check-in date.';
  }
  if (!message && (inVal || outVal) && !(inVal && outVal)) {
    message = 'Please choose both a check-in and a check-out date — or leave both empty.';
  }

  if (message && showError) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  } else {
    errorBox.hidden = true;
  }
  return !message;
}

/* pre-fill an example stay so the preview immediately looks real */
(function prefillDates() {
  if (!checkin || !checkout) return;
  const today = new Date();
  const start = new Date(today.getTime() + DAY);
  const end = new Date(today.getTime() + 4 * DAY);
  const minISO = toISO(start);
  checkin.min = minISO;
  checkout.min = toISO(new Date(start.getTime() + DAY));
  checkin.value = minISO;
  checkout.value = toISO(end);
})();

if (form) {
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate(true)) return;
    openWhatsApp(buildMessage());
  });
}

/* the CTA is an anchor: intercept and validate first */
document.addEventListener('click', (event) => {
  const cta = event.target.closest('#bookingCta');
  if (!cta) return;
  if (!validate(true)) {
    event.preventDefault();
    if (errorBox) errorBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
});

/* -------------------------------------------------- "choose this apartment" */
$$('[data-choose]').forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.getAttribute('data-choose');
    if (unitSelect) {
      unitSelect.value = value;
      refresh();
    }
    const booking = $('#booking');
    if (booking) {
      booking.scrollIntoView({ behavior: 'smooth', block: 'start' });
      booking.classList.add('is-flash');
      window.setTimeout(() => booking.classList.remove('is-flash'), 1200);
    }
    if (unitSelect) window.setTimeout(() => unitSelect.focus({ preventScroll: true }), 600);
  });
});

/* ------------------------------------------- general WhatsApp links (no JS) */
$$('.js-wa').forEach((el) => {
  if (el.id === 'bookingCta') return; /* handled by refresh() */
  el.setAttribute('href', waLink(CONFIG.generalMessage));
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener');
});

/* ------------------------------------------------------------ gallery viewer */
(function lightbox() {
  const dialog = $('#lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const img = $('#lbImg');
  const cap = $('#lbCap');
  const triggers = $$('.g-btn');
  let index = 0;

  function show(i) {
    index = (i + triggers.length) % triggers.length;
    const trigger = triggers[index];
    const source = trigger.getAttribute('data-full');
    const thumb = trigger.querySelector('img');
    img.src = source;
    img.alt = thumb ? thumb.alt : '';
    if (cap) cap.textContent = trigger.getAttribute('data-caption') || '';
  }

  triggers.forEach((trigger, i) => {
    trigger.addEventListener('click', () => {
      show(i);
      dialog.showModal();
    });
  });

  $('#lbClose').addEventListener('click', () => dialog.close());
  $('#lbPrev').addEventListener('click', () => show(index - 1));
  $('#lbNext').addEventListener('click', () => show(index + 1));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });

  /* click on the dark surround closes */
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();

/* ------------------------------------------------------------- first paint */
refresh();
