import"../chunks/aem-CseYPO2m.js";function L(a){const t=document.createElement("div");t.classList.add("hero__contents");const e=document.createElement("ul");e.classList.add("hero__tabs"),[...a.children].forEach(_=>{const p=_.querySelectorAll("div"),o=p[0],d=p[1],c=d.querySelector("a");let h="";o.querySelector("img")?h=o.querySelector("img").src:h=o.innerText.trim();const m=c?c.href:"",r=c?c.innerText:d.innerText.trim(),b=Array.from(d.querySelectorAll("p")).slice(1).map(n=>n.innerText.trim()).join(" "),s=document.createElement("div");s.classList.add("hero__tab-content"),s.innerHTML=`
            <a href="${m}" class="hero__tab-link">
            <img class="hero__image" src="${h}" alt="${r}" />
            </a> 
            <a class="tab-content-blurb" href="${m}"> 
                        <h3>${r}</h3> 
                </a>
        `,t.appendChild(s);const i=document.createElement("li"),l=document.createElement("button");i.classList.add("hero__tab"),l.innerText=r,l.addEventListener("click",()=>{e.querySelectorAll(".hero__tab").forEach(n=>n.classList.remove("active")),t.querySelectorAll(".hero__tab-content").forEach(n=>n.classList.remove("active")),l.closest("li").classList.add("active"),s.classList.add("active")}),i.appendChild(l);const u=document.createElement("div");u.classList.add("hero__blurb"),u.innerHTML=`<a href="${m}"> 
                        <h3>${r}</h3> 
                    <div class="hero__blurb-content">
                        <p>${b}</p>
                        <p>Find out more...</p>
                    </div>
                </a>`,i.appendChild(u),e.appendChild(i)}),a.innerHTML="",a.appendChild(t),a.appendChild(e),e.children.length>0&&(e.children[0].classList.add("active"),t.children[0].classList.add("active"))}export{L as default};
//# sourceMappingURL=hero-banner.js.map
