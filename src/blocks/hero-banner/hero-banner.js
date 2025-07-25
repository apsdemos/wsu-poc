import { createOptimizedPicture } from '../../scripts/aem.js';
import './hero-banner.css';

export default function decorate(block) {


    const tabContents = document.createElement('div');
    tabContents.classList.add('hero__contents');

    const tabs = document.createElement('ul');
    tabs.classList.add('hero__tabs');

    let index = 0;

    [...block.children].forEach((row) => {
        const items = row.querySelectorAll('div');
        const imageCol = items[0];
        const textCol = items[1];

        const link = textCol.querySelector('a');

        const mediaImage = imageCol.querySelector('picture');

        const url = link ? link.href : '';
        const title = link ? link.innerText : textCol.innerText.trim();
        const texts = Array.from(textCol.querySelectorAll('p')).slice(1).map(p => p.innerText.trim()).join(' ');

        const tabContent = document.createElement('div');
        tabContent.classList.add('hero__tab-content');
        tabContent.innerHTML = `
            <a href="${url}" class="hero__tab-link">
            ${mediaImage.outerHTML}
            </a> 
            <a class="tab-content-blurb" href="${url}"> 
                        <h3>${title}</h3> 
                </a>
        `;
        tabContents.appendChild(tabContent);

        const li = document.createElement('li');
        const tabBtn = document.createElement('button');
        li.classList.add('hero__tab');
        tabBtn.innerText = title;
        tabBtn.addEventListener('click', () => {
            const activeTabContent = tabContents.querySelector('.hero__tab-content.active');
            const height = activeTabContent.offsetHeight;
            tabContents.style.height = `${height}px`;

            // deactivate all tabs and contents
            tabs.querySelectorAll('.hero__tab').forEach((t) => t.classList.remove('active'));
            tabContents.querySelectorAll('.hero__tab-content').forEach((c) => c.classList.remove('active'));

            // activate the clicked tab and its content
            tabBtn.closest('li').classList.add('active');
            tabContent.classList.add('active');

            setTimeout(() => {
                tabContents.style.height = 'auto';
            }, 200);
        });
        li.appendChild(tabBtn);

        const blurb = document.createElement('div');
        blurb.classList.add('hero__blurb');
        blurb.innerHTML = `<a href="${url}"> 
                        <h3>${title}</h3> 
                    <div class="hero__blurb-content">
                        <p>${texts}</p>
                        <p>Find out more...</p>
                    </div>
                </a>`;


        li.appendChild(blurb);

        tabs.appendChild(li);
        index++;
    });

    tabContents.querySelectorAll('picture > img').forEach((img) => {
        const picture = img.closest('picture');
        if (picture) {
            const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '1200', height: '508' }]);
            picture.replaceWith(optimizedPicture);
        }
    });

    block.innerHTML = '';
    block.appendChild(tabContents);
    block.appendChild(tabs);

    // activate the first tab
    if (tabs.children.length > 0) {
        tabs.children[0].classList.add('active');
        tabContents.children[0].classList.add('active');
    }
}
