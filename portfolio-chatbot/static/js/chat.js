console.log('chat.js loaded');
const $messages = document.getElementById('messages');
const $form = document.getElementById('chat-form');
const $input = document.getElementById('message');
let isComposing = false;

if (!$messages || !$form || !$input){
  console.error('Chat UI elements not found. Check template structure.');
}

function timeNow(){
  try{ return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }catch{ return '' }
}
function addMsg({text, role}){
  const li = document.createElement('li');
  li.className = `msg ${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'bot' ? '🤖' : '🙂';
  const wrap = document.createElement('div');
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  // Normalize Windows newlines and trim excessive line breaks
  bubble.textContent = (text || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = timeNow();
  wrap.appendChild(bubble); wrap.appendChild(meta);
  if (role === 'bot'){ li.appendChild(avatar); li.appendChild(wrap); }
  else { li.appendChild(wrap); li.appendChild(avatar); }
  $messages.appendChild(li);
  const scroller = $messages.parentElement;
  scroller.scrollTop = scroller.scrollHeight;
  return li;
}
function addTyping(){
  const li = document.createElement('li');
  li.className = 'msg bot'; li.dataset.typing = '1';
  const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = '🤖';
  const bubble = document.createElement('div'); bubble.className = 'bubble';
  const dots = document.createElement('div'); dots.className = 'typing';
  dots.innerHTML = '<span class="dot-typing"></span><span class="dot-typing"></span><span class="dot-typing"></span>';
  const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = 'Typing…';
  const wrap = document.createElement('div'); bubble.appendChild(dots); wrap.appendChild(bubble); wrap.appendChild(meta);
  li.appendChild(avatar); li.appendChild(wrap); $messages.appendChild(li);
  $messages.parentElement.scrollTop = $messages.parentElement.scrollHeight;
}
function removeTyping(){ const t = $messages.querySelector('li[data-typing="1"]'); if (t) t.remove(); }

window.addEventListener('DOMContentLoaded', ()=>{
  if (window.INITIAL_MSG){ addMsg({text: window.INITIAL_MSG, role: 'bot'}); }
  // Initialize textarea height and focus
  if ($input){
    const maxPx = Math.floor(window.innerHeight * 0.4);
    $input.style.maxHeight = maxPx + 'px';
    $input.style.height = 'auto';
    $input.style.height = Math.min($input.scrollHeight, maxPx) + 'px';
    $input.focus();
  }
});

$form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const text = ($input.value || '').trim(); if (!text) return;
  addMsg({text, role:'user'}); $input.value=''; $input.style.height='44px';
  addTyping();
  try{
    const res = await fetch('/send_message', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message: text})
    });
    const data = await res.json().catch(()=>({error:'Invalid response'}));
    removeTyping();
    if (!res.ok || data.error){ addMsg({text: data.error || 'Something went wrong. Please try again.', role:'bot'}); }
    else { addMsg({text: data.response || '...', role:'bot'}); }
  }catch{ removeTyping(); addMsg({text:'Network error. Please try again.', role:'bot'}); }
});

$input?.addEventListener('compositionstart', ()=>{ isComposing = true; });
$input?.addEventListener('compositionend', ()=>{ isComposing = false; });
$input?.addEventListener('input', ()=>{
  const maxPx = Math.floor(window.innerHeight * 0.4);
  $input.style.maxHeight = maxPx + 'px';
  $input.style.height = 'auto';
  $input.style.height = Math.min($input.scrollHeight, maxPx) + 'px';
});
$input?.addEventListener('keydown', (e)=>{
  // Shift+Enter inserts newline
  if (e.key === 'Enter' && e.shiftKey) return;
  // Allow IME composition and only submit when not composing
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isComposing){
    e.preventDefault();
    $form.requestSubmit();
  }
});
