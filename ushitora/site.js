async function boot(){
  const app=document.getElementById("app");
  try{
    const parts=await Promise.all(["content-a1.html","content-a2.html","content-b.html"].map(u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.text()})));
    app.innerHTML=parts.join("\n");
    const lb=document.getElementById('lightbox'), lbimg=lb.querySelector('img');
    document.querySelectorAll('.plate img').forEach(img=>img.addEventListener('click',()=>{lbimg.src=img.src;lbimg.alt=img.alt;lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}));
    function closeLb(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.style.overflow=''}
    lb.querySelector('.close').addEventListener('click',closeLb);lb.addEventListener('click',e=>{if(e.target===lb)closeLb()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb()});
  }catch(e){app.innerHTML='<div style="padding:80px 20px;text-align:center">ページの読み込みに失敗しました。再読み込みしてください。</div>';}
}
boot();