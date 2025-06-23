import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Store original content before making any changes
  const originalContent = block.cloneNode(true);
  
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  
  // Add navigation sections from fragment
  const sections = document.createElement('div');
  sections.classList.add('nav-sections');
  
  // Find the picture element for the logo
  const picture = originalContent.querySelector('picture');
  if (picture) {
    // Create a section for the logo
    const logoSection = document.createElement('div');
    logoSection.classList.add('section');
    logoSection.dataset.sectionStatus = 'loaded';
    
    const logoWrapper = document.createElement('div');
    logoWrapper.classList.add('default-content-wrapper');
    
    // Clone the picture element
    const pictureClone = picture.cloneNode(true);
    
    // Ensure the picture element is properly formed
    if (!pictureClone.querySelector('source') || !pictureClone.querySelector('img')) {
      // If picture element is not properly formed, create a simple img element
      const img = document.createElement('img');
      img.src = 'https://main--eds-ue--monendra.aem.page/media_1539a7929c0d087edc0dadadecdfdd527ecc591ed.png';
      img.alt = 'Western Sydney University';
      img.width = 1435;
      img.height = 212;
      logoWrapper.appendChild(img);
    } else {
      logoWrapper.appendChild(pictureClone);
    }
    
    logoSection.appendChild(logoWrapper);
    sections.appendChild(logoSection);
  } else {
    // If no picture element is found, create a simple img element as fallback
    const logoSection = document.createElement('div');
    logoSection.classList.add('section');
    logoSection.dataset.sectionStatus = 'loaded';
    
    const logoWrapper = document.createElement('div');
    logoWrapper.classList.add('default-content-wrapper');
    
    const img = document.createElement('img');
    img.src = 'https://main--eds-ue--monendra.aem.page/media_1539a7929c0d087edc0dadadecdfdd527ecc591ed.png';
    img.alt = 'Western Sydney University';
    img.width = 1435;
    img.height = 212;
    
    logoWrapper.appendChild(img);
    logoSection.appendChild(logoWrapper);
    sections.appendChild(logoSection);
  }
  
  // Find navigation items from the original content or fragment
  const navItems = originalContent.querySelector('ul');
  if (navItems) {
    // Create a section for navigation items
    const navSection = document.createElement('div');
    navSection.classList.add('section');
    navSection.dataset.sectionStatus = 'loaded';
    
    const navWrapper = document.createElement('div');
    navWrapper.classList.add('default-content-wrapper');
    navWrapper.appendChild(navItems.cloneNode(true));
    
    navSection.appendChild(navWrapper);
    sections.appendChild(navSection);
  } else {
    // Move content from fragment to sections if no navigation items found in original content
    while (fragment.firstElementChild) {
      const el = fragment.firstElementChild;
      // Skip the first element (which would be the brand/logo in the original fragment)
      if (!sections.querySelector('.section:nth-child(2)') && el.querySelector('a')?.textContent.trim() === 'Button') {
        fragment.removeChild(el);
        continue;
      }
      
      // Skip any search/tools sections
      if (el.querySelector('form') || el.querySelector('input[type="search"]')) {
        fragment.removeChild(el);
        continue;
      }
      
      // Skip any picture elements or standalone images (that aren't part of navigation)
      if (el.querySelector('picture') || (el.querySelector('img') && !el.querySelector('ul'))) {
        fragment.removeChild(el);
        continue;
      }
      
      sections.append(fragment.firstElementChild);
    }
  }
  
  nav.append(sections);

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
