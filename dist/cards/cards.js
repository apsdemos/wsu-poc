import{g as l}from"../chunks/aem-D3RMVdVl.js";function h(a){const r=document.createElement("div");r.classList.add("cards__inner"),[...a.children].forEach(e=>{const c=document.createElement("div");c.classList.add("card");const i=e.querySelectorAll("p"),t=i[1].querySelector("a"),d=t?t.href:"",n=t?t.innerText:i[1].innerText.trim(),s=i[0].querySelector("picture");c.innerHTML=`
      <div class="card">
          <a href="${d}" alt="${n}">
              <div class="card-image-container">
                ${s.outerHTML}
              </div>
              <h4>${n}</h4>
          </a>
      </div>
    `,r.appendChild(c)}),r.querySelectorAll("picture > img").forEach(e=>e.closest("picture").replaceWith(l(e.src,e.alt,!1,[{width:"400",height:"333"}]))),a.innerHTML="",a.appendChild(r)}export{h as default};
//# sourceMappingURL=cards.js.map
