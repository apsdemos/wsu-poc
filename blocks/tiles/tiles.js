import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  console.log('Tiles block decoration started');
  console.log('Block content:', block.innerHTML);
  
  /* change to ul, li */
  const ul = document.createElement('ul');
  
  // Limit to maximum 2 tiles
  const rows = [...block.children];
  const maxTiles = 2;
  const tilesToProcess = rows.slice(0, maxTiles);
  
  if (rows.length > maxTiles) {
    console.log(`Note: Block has ${rows.length} rows, but only processing first ${maxTiles} tiles`);
  }
  
  tilesToProcess.forEach((row) => {
    console.log('Processing row:', row.innerHTML);
    
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    
    // Process each column in the row
    while (row.firstElementChild) li.append(row.firstElementChild);
    
    // Organize tile content
    let imageDiv = null;
    let bodyDiv = null;
    
    [...li.children].forEach((div) => {
      console.log('Processing div:', div.innerHTML);
      
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'tiles-tile-image';
        imageDiv = div;
      } else {
        div.className = 'tiles-tile-body';
        bodyDiv = div;
        
        // Check for tileBody field
        const tileBodyField = [...div.children].find(child => {
          const keyElement = child.children[0];
          return keyElement && keyElement.textContent.trim().toLowerCase() === 'tilebody';
        });
        
        if (tileBodyField) {
          console.log('Found tileBody field:', tileBodyField.innerHTML);
          const valueElement = tileBodyField.children[1];
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
      
      // Clean up the content and create proper structure
      const content = bodyDiv.textContent.trim();
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length > 0) {
        const titleText = lines[0].trim();
        const remainingContent = lines.slice(1).join(' ').trim();
        
        // Create clean HTML structure
        let htmlContent = '';
        if (titleText) {
          htmlContent += `<h3>${titleText}</h3>`;
        }
        if (remainingContent) {
          htmlContent += `<p>${remainingContent}</p>`;
        }
        
        bodyDiv.innerHTML = htmlContent;
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
  
  console.log('Final tiles HTML:', ul.innerHTML);
  
  block.textContent = '';
  block.append(ul);
}
