import{g as L}from"../chunks/aem-CseYPO2m.js";function f(n){const e=document.createElement("div");e.classList.add("hero__contents");const t=document.createElement("ul");t.classList.add("hero__tabs"),[...n.children].forEach(a=>{const m=a.querySelectorAll("div"),p=m[0],o=m[1],r=o.querySelector("a"),_=p.querySelector("picture"),d=r?r.href:"",h=r?r.innerText:o.innerText.trim(),b=Array.from(o.querySelectorAll("p")).slice(1).map(c=>c.innerText.trim()).join(" "),s=document.createElement("div");s.classList.add("hero__tab-content"),s.innerHTML=`
            <a href="${d}" class="hero__tab-link">
            ${_.outerHTML}
            </a> 
            <a class="tab-content-blurb" href="${d}"> 
                        <h3>${h}</h3> 
                </a>
        `,e.appendChild(s);const i=document.createElement("li"),l=document.createElement("button");i.classList.add("hero__tab"),l.innerText=h,l.addEventListener("click",()=>{t.querySelectorAll(".hero__tab").forEach(c=>c.classList.remove("active")),e.querySelectorAll(".hero__tab-content").forEach(c=>c.classList.remove("active")),l.closest("li").classList.add("active"),s.classList.add("active")}),i.appendChild(l);const u=document.createElement("div");u.classList.add("hero__blurb"),u.innerHTML=`<a href="${d}"> 
                        <h3>${h}</h3> 
                    <div class="hero__blurb-content">
                        <p>${b}</p>
                        <p>Find out more...</p>
                    </div>
                </a>`,i.appendChild(u),t.appendChild(i)}),e.querySelectorAll("picture > img").forEach(a=>a.closest("picture").replaceWith(L(a.src,a.alt,!1,[{width:"1200",height:"508"}]))),n.innerHTML="",n.appendChild(e),n.appendChild(t),t.children.length>0&&(t.children[0].classList.add("active"),e.children[0].classList.add("active"))}export{f as default};
//# sourceMappingURL=hero-banner.js.map
