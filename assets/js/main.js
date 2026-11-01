/* ==========================================================================
   Atlantic View Apartments — site behaviour
   --------------------------------------------------------------------------
   CONFIG is the single source of truth for the property's contact details.
   Change whatsappNumber here and every button, link and display value on the
   page follows. Nothing else in the project hard-codes the number.
   ========================================================================== */

const CONFIG = {
  propertyName: 'Atlantic View Apartments',

  /* WhatsApp number in international format — digits only, no +, spaces or
     dashes (for Cameroon that is 237 followed by the 9-digit mobile number).
     Change this single line and every button, link and the footer display
     follow automatically. */
  whatsappNumber: '237653317507',

  generalMessage:
    'Hello Atlantic View Apartments, I found your website and would like to ask about ' +
    'availability for a stay in Limbe. Please let me know which dates are open and the rates. Thank you!'
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- phone number helpers ---------------------------------------- */

/* A usable number: digits only, plausible length, not a placeholder such as
   000000000 or 111111111. */
function isUsableNumber(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (digits.length < 8 || digits.length > 15) return false;
  if (/^(\d)\1+$/.test(digits)) return false;      // all the same digit
  if (/^0+$/.test(digits)) return false;
  return true;
}

/* Human-readable form, derived from the one configured value so there is
   never a second copy of the number to keep in sync. */
function formatNumber(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (digits.length === 12) {
    return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' +
           digits.slice(6, 9) + ' ' + digits.slice(9);
  }
  return '+' + digits;
}

const WA_DISPLAY = formatNumber(CONFIG.whatsappNumber);
const WA_NUMBER = String(CONFIG.whatsappNumber || '').replace(/[^\d]/g, '');

function waLink(message) {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
}

function openWhatsApp(message) {
  window.open(waLink(message), '_blank', 'noopener');
}

/* Guard: if the number is unusable, fail loudly in the console and take the
   WhatsApp buttons out of service rather than sending anyone to a dead link. */
function configIsValid() {
  if (isUsableNumber(WA_NUMBER)) return true;
  console.error(
    '[Atlantic View] CONFIG.whatsappNumber is not a usable number (' + WA_NUMBER + '). ' +
    'Set a real international number in assets/js/main.js.'
  );
  return false;
}
const WA_OK = configIsValid();

/* Every element marked .js-wa gets its destination from CONFIG. Elements with
   data-wa="booking" are handled by refresh() because their message is built
   from the form. */
function wireWhatsAppLinks() {
  $$('a.js-wa').forEach((el) => {
    const kind = el.getAttribute('data-wa') || 'general';
    if (kind === 'booking') return;
    if (!WA_OK) {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      return;
    }
    el.setAttribute('href', waLink(CONFIG.generalMessage));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
}

/* ---------- header + sticky bar ------------------------------------------ */

const header = $('#siteHeader');
const mobileBar = $('#mobileBar');

function onScroll() {
  const y = window.scrollY || window.pageYOffset;
  if (header) header.classList.toggle('is-scrolled', y > 8);
  if (mobileBar) mobileBar.classList.toggle('is-visible', y > 520);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- active section in the nav ----------------------------------- */

(function activeNav() {
  const links = $$('.nav a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map();
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.charAt(0) !== '#') return;
    const section = document.getElementById(href.slice(1));
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

/* ---------- scroll reveals ---------------------------------------------- */

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
  window.setTimeout(() => items.forEach((el) => el.classList.add('is-in')), 2200);
  window.addEventListener('beforeprint', () => items.forEach((el) => el.classList.add('is-in')));
})();

/* ---------- footer bits -------------------------------------------------- */

(function footerBits() {
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
  const num = $('#footerNumber');
  if (num) num.textContent = WA_DISPLAY;
  $$('.js-wa-display').forEach((el) => { el.textContent = WA_DISPLAY; });
})();

/* ---------- booking form ------------------------------------------------- */

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
const bookingCta = $('#bookingCta');
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

/* The WhatsApp message — carries apartment, both dates, nights, guest count,
   and the optional name and notes. */
function buildMessage() {
  const unit = unitSelect ? unitSelect.value : '';
  const guestsValue = guests ? guests.value : '';
  const guestLabel = !guestsValue
    ? ''
    : (guestsValue === '1' ? '1 guest' : guestsValue + ' guests');
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
    '• Apartment: ' + (unit === 'Not sure yet' ? 'Not sure yet — please advise' : (unit || 'Not sure yet — please advise')),
    '• Check-in: ' + (inDate || 'flexible — please advise'),
    '• Check-out: ' + (outDate || 'flexible — please advise')
  ];
  if (nights > 0) lines.push('• Nights: ' + nights);
  if (guestLabel) lines.push('• Guests: ' + guestLabel);
  if (guestName) lines.push('• Name: ' + guestName);
  if (extraNotes) lines.push('', 'Notes: ' + extraNotes);
  lines.push('', 'Could you please confirm availability and the total price? Thank you!');
  return lines.join('\n');
}

/* Required: apartment, check-in, check-out, guests. Optional: name, notes. */
function findProblems() {
  const problems = [];
  const unitVal = unitSelect ? unitSelect.value.trim() : '';
  const inVal = checkin ? checkin.value : '';
  const outVal = checkout ? checkout.value : '';
  const guestsVal = guests ? guests.value.trim() : '';

  if (!unitVal) problems.push('Choose an apartment — or pick “Not sure yet”.');
  if (!inVal) problems.push('Choose a check-in date.');
  if (!outVal) problems.push('Choose a check-out date.');
  if (!guestsVal) problems.push('Choose how many guests are coming.');

  if (inVal && outVal && nightsBetween(inVal, outVal) <= 0) {
    problems.push('Your check-out date needs to be after your check-in date.');
  }
  if (inVal && inVal < toISO(new Date())) {
    problems.push('Your check-in date can’t be in the past.');
  }
  return problems;
}

function showError(message) {
  if (!errorBox) return;
  if (message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  } else {
    errorBox.hidden = true;
  }
}

function validate(showNow) {
  const problems = findProblems();
  if (!problems.length) {
    showError('');
    return true;
  }
  showError(showNow ? problems.join(' ') : '');
  return false;
}

function refresh() {
  if (bubble) bubble.textContent = buildMessage();

  if (bookingCta) {
    if (!WA_OK) {
      bookingCta.removeAttribute('href');
      bookingCta.setAttribute('aria-disabled', 'true');
    } else {
      bookingCta.setAttribute('href', waLink(buildMessage()));
      bookingCta.setAttribute('target', '_blank');
      bookingCta.setAttribute('rel', 'noopener');
    }
  }

  if (waTime) {
    waTime.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

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

/* Pre-fill a sensible example window: tomorrow -> four nights. */
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
    if (!WA_OK) return;
    openWhatsApp(buildMessage());
  });
}

/* The booking CTA is a link, so validate on click and stop it when invalid. */
document.addEventListener('click', (event) => {
  const cta = event.target.closest('#bookingCta');
  if (!cta) return;
  if (!validate(true)) {
    event.preventDefault();
    if (errorBox) errorBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
    cta.removeAttribute('href');
  }
});

/* Apartment cards: "Choose this apartment" pushes the choice into the form. */
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

/* ---------- gallery lightbox -------------------------------------------- */

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
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();

/* ---------- boot --------------------------------------------------------- */
wireWhatsAppLinks();
refresh();
