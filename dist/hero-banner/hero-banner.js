import{g as L}from"../chunks/aem-CseYPO2m.js";function y(a){const e=document.createElement("div");e.classList.add("hero__contents");const t=document.createElement("ul");t.classList.add("hero__tabs"),[...a.children].forEach(c=>{const n=c.querySelectorAll("div"),l=n[0],d=n[1],i=d.querySelector("a"),_=l.querySelector("picture"),h=i?i.href:"",u=i?i.innerText:d.innerText.trim(),v=Array.from(d.querySelectorAll("p")).slice(1).map(b=>b.innerText.trim()).join(" "),r=document.createElement("div");r.classList.add("hero__tab-content"),r.innerHTML=`
            <a href="${h}" class="hero__tab-link">
            ${_.outerHTML}
            </a> 
            <a class="tab-content-blurb" href="${h}"> 
                        <h3>${u}</h3> 
                </a>
        `,e.appendChild(r);const s=document.createElement("li"),o=document.createElement("button");s.classList.add("hero__tab"),o.innerText=u,o.addEventListener("click",()=>{const f=e.querySelector(".hero__tab-content.active").offsetHeight;e.style.height=`${f}px`,t.querySelectorAll(".hero__tab").forEach(m=>m.classList.remove("active")),e.querySelectorAll(".hero__tab-content").forEach(m=>m.classList.remove("active")),o.closest("li").classList.add("active"),r.classList.add("active"),setTimeout(()=>{e.style.height="auto"},200)}),s.appendChild(o);const p=document.createElement("div");p.classList.add("hero__blurb"),p.innerHTML=`<a href="${h}"> 
                        <h3>${u}</h3> 
                    <div class="hero__blurb-content">
                        <p>${v}</p>
                        <p>Find out more...</p>
                    </div>
                </a>`,s.appendChild(p),t.appendChild(s)}),e.querySelectorAll("picture > img").forEach(c=>{const n=c.closest("picture");if(n){const l=L(c.src,c.alt,!1,[{width:"1200",height:"508"}]);n.replaceWith(l)}}),a.innerHTML="",a.appendChild(e),a.appendChild(t),t.children.length>0&&(t.children[0].classList.add("active"),e.children[0].classList.add("active"))}export{y as default};
//# sourceMappingURL=hero-banner.js.map
