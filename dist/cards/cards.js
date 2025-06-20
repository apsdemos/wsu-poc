import"../chunks/aem-CseYPO2m.js";function v(t){const c=document.createElement("div");c.classList.add("cards__inner"),[...t.children].forEach(l=>{const n=document.createElement("div");n.classList.add("card");const d=l.querySelectorAll("div"),a=d[0],s=d[1];let e="";a.querySelector("img")?e=a.querySelector("img").src:e=a.innerText.trim();const r=s.querySelector("a"),o=r?r.href:"",i=r?r.innerText:s.innerText.trim();console.log(o,i,e),n.innerHTML=`
      <div class="card">
          <a href="${o}" alt="${i}">
              <div class="card-image-container" >
                <div class="card__image" style="background: url('${e}') center center / cover;">
                </div>
              </div>
              <h4>${i}</h4>
          </a>
      </div>
    `,c.appendChild(n)}),t.innerHTML="",t.appendChild(c)}export{v as default};
//# sourceMappingURL=cards.js.map
