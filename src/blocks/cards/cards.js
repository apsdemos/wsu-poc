import { createOptimizedPicture } from '../../scripts/aem.js';
import './cards.css';

export default function decorate(block) {
  const cardsInner = document.createElement('div');
  cardsInner.classList.add('cards__inner');

  [...block.children].forEach((row) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    const paragraphs = row.querySelectorAll('p');
    const a = paragraphs[1].querySelector('a');
    const aHref = a ? a.href : '';
    const aText = a ? a.innerText : paragraphs[1].innerText.trim();
    const mediaImage = paragraphs[0].querySelector('picture');

    cardDiv.innerHTML = `
      <div class="card">
          <a href="${aHref}" alt="${aText}">
              <div class="card-image-container">
                ${mediaImage.outerHTML}
              </div>
              <h4>${aText}</h4>
          </a>
      </div>
    `;
    cardsInner.appendChild(cardDiv);

  });

  cardsInner.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400', height: "333" }])));

  block.innerHTML = '';
  block.appendChild(cardsInner);
}
