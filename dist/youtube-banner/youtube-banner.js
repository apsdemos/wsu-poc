function d(e){const t=document.createElement("div");t.classList.add("youtube-banner__inner"),[...e.children].forEach(r=>{const n=r.querySelectorAll("div"),i=n[0].innerText.trim().replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=|https?:\/\/youtu\.be\//,"").trim(),o=n[1].innerHTML,a=`
            <div class="youtube-banner__video">

                <iframe title="Youtube video" src="https://www.youtube.com/embed/${i}" allowfullscreen frameborder="0"></iframe>
            </div>
            <div class="youtube-banner__text">
                    ${o}
            </div>
        `;t.innerHTML=a}),e.innerHTML="",e.appendChild(t)}export{d as default};
//# sourceMappingURL=youtube-banner.js.map
