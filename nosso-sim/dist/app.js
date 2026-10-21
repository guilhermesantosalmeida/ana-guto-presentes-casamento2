const gifts=[
{id:'jantar',name:'Um jantar a dois',description:'Para um jantar sem olhar o relógio.',price:200,category:'momentos',tag:'Bons momentos',image:'photo-1414235077428-338989a2e8c0'},
{id:'cafe',name:'Café com amor',description:'Para começar o dia juntinhos.',price:100,category:'casa',tag:'Nosso lar',image:'photo-1442512595331-e89e73853f31'},
{id:'paraiso',name:'Um dia no paraíso',description:'Um dia de sol e pé na areia.',price:300,category:'viagem',tag:'Lua de mel',image:'photo-1519046904884-53103b34b206'},
{id:'casa',name:'Um cantinho só nosso',description:'Para deixar a casa com a nossa cara.',price:400,category:'casa',tag:'Nosso lar',image:'photo-1600210492486-724fe5c67fb0'},
{id:'brinde',name:'Um brinde ao amor',description:'Uma boa desculpa para brindar.',price:150,category:'momentos',tag:'Bons momentos',image:'photo-1510812431401-41d2bd2722f3'},
{id:'aventura',name:'Nossa próxima aventura',description:'Para voltar com histórias para contar.',price:500,category:'viagem',tag:'Lua de mel',image:'photo-1476514525535-07fb3b4ae5f1'}
];
const currency=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});let filter='todos',selected=null;const grid=document.querySelector('#gift-grid'),dialog=document.querySelector('#gift-dialog'),form=document.querySelector('#gift-form'),amount=document.querySelector('#amount');
function render(){let list=gifts.filter(g=>filter==='todos'||g.category===filter);const order=document.querySelector('#sort').value;if(order!=='default')list.sort((a,b)=>order==='asc'?a.price-b.price:b.price-a.price);grid.innerHTML=list.map((g,i)=>`<article class="gift-card" style="animation-delay:${i*45}ms"><div class="gift-image"><img src="https://images.unsplash.com/${g.image}?auto=format&fit=crop&w=700&q=80" alt="${g.name}" loading="lazy"><span class="gift-tag">${g.tag}</span></div><div class="gift-content"><h3>${g.name}</h3><p>${g.description}</p><div class="gift-bottom"><span class="price">${currency.format(g.price)}</span><button data-gift="${g.id}" aria-label="Presentear: ${g.name}">Presentear <span>↗</span></button></div></div></article>`).join('')}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});render()}));document.querySelector('#sort').addEventListener('change',render);
function openGift(gift){selected=gift;form.reset();form.hidden=false;document.querySelector('#gift-success').hidden=true;document.querySelector('#pix-copy-status').textContent='';document.querySelector('#dialog-title').textContent=gift?gift.name:'Um presente do seu jeito';document.querySelector('#dialog-description').textContent=gift?gift.description:'Escolha o valor que ficar bom para você.';amount.value=gift?gift.price:'';amount.readOnly=Boolean(gift);dialog.showModal()}
grid.addEventListener('click',e=>{const button=e.target.closest('[data-gift]');if(button)openGift(gifts.find(g=>g.id===button.dataset.gift))});document.querySelector('#custom-open').addEventListener('click',()=>openGift(null));document.querySelector('.close').addEventListener('click',()=>dialog.close());document.querySelector('#done').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
form.addEventListener('submit', event => {
  event.preventDefault();
  const value = Number(amount.value);
  const name = document.querySelector('#guest').value.trim();
  const message = document.querySelector('#message').value.trim();
  if (!Number.isFinite(value) || value < 1 || !name) return;
  const intention = {gift: selected?.id || 'livre', amount: value, name, message, createdAt: new Date().toISOString()};
  // Local storage is optional: it must not block Pix or the WhatsApp message.
  try {
    let saved;
    try { saved = JSON.parse(localStorage.getItem('nosso-sim-intentions') || '[]'); } catch { saved = []; }
    if (!Array.isArray(saved)) saved = [];
    saved.push(intention);
    localStorage.setItem('nosso-sim-intentions', JSON.stringify(saved));
  } catch {}
  const text = [
    'Oi, Ana e Augusto! Quero compartilhar meu presente com voc'+String.fromCharCode(234)+'s.',
    '',
    'Nome: ' + name,
    'Presente: ' + (selected?.name || 'Valor livre'),
    'Valor: ' + currency.format(value),
    '',
    'Recadinho: ' + (message || 'Sem recadinho.')
  ].join('\n');
  document.querySelector('#send-whatsapp').href = 'https://wa.me/5585999023629?text=' + encodeURIComponent(text);
  form.hidden = true;
  document.querySelector('#gift-success').hidden = false;
  document.querySelector('#pix-amount').textContent = currency.format(value);
  document.querySelector('#copy-pix').focus();
});
render();
// Reveal each element once, only when it reaches the viewport.
function setupScrollReveal() {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || motionPreference.matches) return;

  const reveal = element => {
    element.classList.add('is-visible');
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) reveal(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  function watch(elements, stagger = false) {
    const columns = window.matchMedia('(max-width: 650px)').matches ? 2 : 3;
    elements.forEach((element, index) => {
      if (element.classList.contains('reveal')) return;
      element.style.setProperty('--reveal-delay', `${stagger ? (index % columns) * 100 : 0}ms`);
      element.classList.add('reveal');
      observer.observe(element);
    });
  }

  watch(document.querySelectorAll('.hero-copy, .hero-art, .story > *, .section-top, .toolbar, .custom-gift, .closing > *'));
  watch(grid.querySelectorAll('.gift-card'), true);

  // Filters and sorting replace the cards, so register their new elements too.
  const gridObserver = new MutationObserver(records => {
    records.forEach(record => record.removedNodes.forEach(node => {
      if (node.nodeType === 1) observer.unobserve(node);
    }));
    watch(grid.querySelectorAll('.gift-card'), true);
  });
  gridObserver.observe(grid, { childList: true });

  // Keyboard navigation must never land on an invisible control.
  document.addEventListener('focusin', event => {
    const element = event.target.closest('.reveal');
    if (element) reveal(element);
  });
  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    gridObserver.disconnect();
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  });
}
setupScrollReveal();

// Copy Pix, including a fallback for local files and older browsers.
document.querySelector('#copy-pix').addEventListener('click', async () => {
  const code = document.querySelector('#pix-code');
  const status = document.querySelector('#pix-copy-status');
  const button = document.querySelector('#copy-pix');
  button.disabled = true;
  try {
    try {
      await navigator.clipboard.writeText(code.value);
    } catch {
      code.focus();
      code.select();
      code.setSelectionRange(0, code.value.length);
      if (!document.execCommand('copy')) throw new Error('copy unavailable');
    }
    status.textContent = 'Pix copiado! Cole no aplicativo do seu banco.';
  } catch {
    code.focus();
    code.select();
    status.textContent = 'Copie manualmente o c'+String.fromCharCode(243)+'digo selecionado acima.';
  } finally {
    button.disabled = false;
  }
});
