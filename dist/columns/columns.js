function t(c){const s=[...c.firstElementChild.children];c.classList.add(`columns-${s.length}-cols`),[...c.children].forEach(i=>{[...i.children].forEach(o=>{const l=o.querySelector("picture");if(l){const e=l.closest("div");e&&e.children.length===1&&e.classList.add("columns-img-col")}})}),console.log("EMREEEEEE")}export{t as default};
//# sourceMappingURL=columns.js.map
