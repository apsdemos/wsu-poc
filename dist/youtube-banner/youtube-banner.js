function d(e){const n=document.createElement("div");n.classList.add("youtube-banner__inner"),[...e.children].forEach(r=>{const t=r.querySelectorAll("div"),i=t[0].innerText.trim().replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=|https?:\/\/youtu\.be\//,"").trim(),a=t[1].innerHTML,o=`
            <div class="youtube-banner__video">

                <iframe src="https://www.youtube.com/embed/${i}" allowfullscreen frameborder="0"></iframe>
            </div>
            <div class="youtube-banner__text">
                    ${a}
            </div>
        `;n.innerHTML=o}),e.innerHTML="",e.appendChild(n)}export{d as default};
//# sourceMappingURL=youtube-banner.js.map
