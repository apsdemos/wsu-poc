import { createOptimizedPicture } from '../../scripts/aem.js';
import './cards.css';

export default function decorate(block) {


  const cardsInner = document.createElement('div');
  cardsInner.classList.add('cards__inner');

  [...block.children].forEach((row) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const div = row.querySelectorAll('div');

    const imageCol = div[0];
    const textCol = div[1];

    let imgSrc = '';
    if (imageCol.querySelector('img')) {
      imgSrc = imageCol.querySelector('img').src
    } else {
      imgSrc = imageCol.innerText.trim();
    }

    const a = textCol.querySelector('a');
    const aHref = a ? a.href : '';
    const aText = a ? a.innerText : textCol.innerText.trim();

    cardDiv.innerHTML = `
      <div class="card">
          <a href="${aHref}" alt="${aText}">
              <div class="card-image-container" >
                <div class="card__image" style="background: url('${imgSrc}') center center / cover;">
                </div>
              </div>
              <h4>${aText}</h4>
          </a>
      </div>
    `;


    cardsInner.appendChild(cardDiv);

  });

  // replace images with optimized versions
  // ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  block.innerHTML = '';
  block.appendChild(cardsInner);
}
