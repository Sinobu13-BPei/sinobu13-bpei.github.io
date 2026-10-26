/* Shared unobtrusive return-to-top control. Does not modify page content. */
(()=>{
  "use strict";
  function init(){
    if(document.querySelector(".reading-top")) return;
    const link=document.createElement("a");
    link.className="reading-top";
    link.href="#";
    link.setAttribute("aria-label","ページ先頭へ戻る");
    link.textContent="↑ 上へ";
    document.body.appendChild(link);
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    link.addEventListener("click",ev=>{ev.preventDefault();window.scrollTo({top:0,behavior:reduced?"auto":"smooth"});});
    let scheduled=false;
    const refresh=()=>{scheduled=false;const shown=window.scrollY>Math.max(420,window.innerHeight*.7);link.classList.toggle("is-visible",shown);link.setAttribute("aria-hidden",shown?"false":"true");link.tabIndex=shown?0:-1;};
    window.addEventListener("scroll",()=>{if(!scheduled){scheduled=true;window.requestAnimationFrame(refresh)}},{passive:true});
    refresh();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
