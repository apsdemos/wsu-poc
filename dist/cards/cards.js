import"../chunks/aem-CseYPO2m.js";function v(r){const t=document.createElement("div");t.classList.add("cards__inner"),[...r.children].forEach(l=>{const c=document.createElement("div");c.classList.add("card");const i=l.querySelectorAll("div"),n=i[0],d=i[1];let a="";n.querySelector("img")?a=n.querySelector("img").src:a=n.innerText.trim();const e=d.querySelector("a"),o=e?e.href:"",s=e?e.innerText:d.innerText.trim();c.innerHTML=`
      <div class="card">
          <a href="${o}" alt="${s}">
              <div class="card-image-container" >
                <div class="card__image" style="background: url('${a}') center center / cover;">
                </div>
              </div>
              <h4>${s}</h4>
          </a>
      </div>
    `,t.appendChild(c)}),r.innerHTML="",r.appendChild(t)}export{v as default};
//# sourceMappingURL=cards.js.map
