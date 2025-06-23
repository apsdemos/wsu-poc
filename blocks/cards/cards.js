import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  console.log('Cards block decoration started');
  console.log('Block content:', block.innerHTML);
  
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    console.log('Processing row:', row.innerHTML);
    
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    
    // Process each column in the row
    while (row.firstElementChild) li.append(row.firstElementChild);
    
    // Organize card content
    let imageDiv = null;
    let bodyDiv = null;
    
    [...li.children].forEach((div) => {
      console.log('Processing div:', div.innerHTML);
      
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
        imageDiv = div;
      } else {
        div.className = 'cards-card-body';
        bodyDiv = div;
        
        // Check for cardBody field
        const cardBodyField = [...div.children].find(child => {
          const keyElement = child.children[0];
          return keyElement && keyElement.textContent.trim().toLowerCase() === 'cardbody';
        });
        
        if (cardBodyField) {
          console.log('Found cardBody field:', cardBodyField.innerHTML);
          const valueElement = cardBodyField.children[1];
          if (valueElement) {
            div.innerHTML = valueElement.innerHTML;
            console.log('Set body content to:', div.innerHTML);
          }
        }
      }
    });
    
    // Log what we found
    console.log('Image div found:', imageDiv ? 'yes' : 'no');
    console.log('Body div found:', bodyDiv ? 'yes' : 'no');
    
    if (bodyDiv) {
      console.log('Body div content:', bodyDiv.innerHTML);
      
      // Ensure we have proper heading and paragraph structure
      if (!bodyDiv.querySelector('h2, h3') && bodyDiv.textContent.trim()) {
        console.log('Adding heading structure');
        const content = bodyDiv.innerHTML;
        const lines = bodyDiv.textContent.trim().split('\n');
        const titleText = lines[0] || '';
        
        bodyDiv.innerHTML = `
          <h3>:::${titleText}</h3>
          <p>:::${content.replace(titleText, '')}</p>
        `;
      }
      
      // Add button if we have one in the content
      const buttonLink = bodyDiv.querySelector('a[href]');
      if (buttonLink && !buttonLink.classList.contains('button')) {
        console.log('Converting link to button:', buttonLink.href);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const button = document.createElement('a');
        button.className = 'button';
        button.href = buttonLink.href;
        button.textContent = buttonLink.textContent || 'FIND OUT MORE';
        
        buttonContainer.appendChild(button);
        bodyDiv.appendChild(buttonContainer);
        
        // Remove the original link if it was just a button
        if (buttonLink.parentElement.childNodes.length === 1) {
          buttonLink.parentElement.remove();
        }
      }
    }
    
    ul.append(li);
  });
  
  // Optimize images
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  
  console.log('Final cards HTML:', ul.innerHTML);
  
  block.textContent = '';
  block.append(ul);
}
