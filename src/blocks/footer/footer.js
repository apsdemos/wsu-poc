import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import './footer.css';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer-da';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footerContent = document.createElement('div');
  const footerTop = document.createElement('div');
  footerTop.className = 'footer-top';


  const footerOverlay = document.createElement('div');
  footerOverlay.className = 'footer-overlay';

  const footerInner = document.createElement('div');
  footerInner.className = 'footer__inner';

  const footer = document.createElement('div');

  while (fragment.firstElementChild) {
    footer.append(fragment.firstElementChild);
  }

  const sections = footer.querySelectorAll('.default-content-wrapper');

  let logoUrl = ''
  if (sections[0].querySelector('img')) {
    logoUrl = sections[1].querySelector('img').src;
  } else {
    logoUrl = sections[1].querySelector('p').innerText;
  }

  const linksTitles = sections[0].querySelectorAll('h2');
  const linksList = sections[0].querySelectorAll('ul');


  for (let x = 0; x < linksTitles.length; x++) {
    const sectionTitle = linksTitles[x].innerText
    const sectionLinks = linksList[x]

    const section = document.createElement('div');
    section.className = 'footer-section';

    const sectionTitleElement = document.createElement('h2');
    sectionTitleElement.innerText = sectionTitle;
    section.append(sectionTitleElement);

    const sectionLinksElement = document.createElement('ul');
    sectionLinksElement.innerHTML = sectionLinks.innerHTML;
    section.append(sectionLinksElement);
    footerInner.append(section);
  }



  const helpLinks = sections[2].querySelector('ul')
  const copyrightText = sections[3].querySelector('p').innerText

  const footerCopyright = document.createElement('div');
  footerCopyright.className = 'footer-copyright';
  footerCopyright.append(helpLinks);
  footerCopyright.append(copyrightText);


  const footerLogo = document.createElement('div');
  footerLogo.className = 'footer-logo';
  const logoImage = document.createElement('img');
  logoImage.src = logoUrl;
  footerLogo.append(logoImage);
  footerInner.append(footerLogo);


  footerOverlay.append(footerInner);
  footerTop.append(footerOverlay);

  footerContent.append(footerTop);
  footerContent.append(footerCopyright);

  block.append(footerContent);
}
