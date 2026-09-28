// JavaScript source code
document.documentElement.classList.add('js-enabled');

const dishes = [
  { id: 'plov', name: 'Палави хонагӣ', category: 'main', label: 'МАШҲУР', price: 48, description: 'Биринҷи хушбӯй, гӯсфанди нарм, сабзӣ ва зира.', image: 'photo-1512058564366-18510be2db19' },
  { id: 'steak', name: 'Гӯшти бирён', category: 'main', label: 'ИНТИХОБИ ШЕФ', price: 82, description: 'Гӯшти нарм бо сабзавоти мавсимӣ ва чошнии хонагӣ.', image: 'photo-1544025162-d76694265947' },
  { id: 'salad', name: 'Хӯриши боғ', category: 'salad', label: 'ТОЗА', price: 32, description: 'Помидори ширин, бодиринги тару тоза ва гиёҳҳои хушбӯй.', image: 'photo-1512621776951-a57141f2eefd' },
  { id: 'soup', name: 'Шӯрбои кӯҳистон', category: 'main', label: 'АНЪАНАВӢ', price: 38, description: 'Шӯрбои серғизои хонагӣ бо сабзавоти тоза ва кабудӣ.', image: 'photo-1547592180-85f173990554' },
  { id: 'cake', name: 'Торти шоколадӣ', category: 'dessert', label: 'ШИРИНӢ', price: 29, description: 'Шоколади сиёҳ, қаймоқи нарм ва буттамеваи мавсимӣ.', image: 'photo-1578985545062-69928b1d9587' },
  { id: 'tea', name: 'Чойи кӯҳӣ', category: 'drink', label: 'ХОНАГӢ', price: 12, description: 'Чойи гиёҳии хушбӯй бо асали табиӣ.', image: 'photo-1544787219-7f47ccb76574' }
];

const cart = new Map();
const $ = selector => document.querySelector(selector);
const money = amount => `${new Intl.NumberFormat('tg-TJ').format(amount)} сомонӣ`;
const foodGrid = $('#foodGrid');
const cartItems = $('#cartItems');
const cartDrawer = $('#cartDrawer');
const overlay = $('#overlay');
const cartEmpty = $('#cartEmpty');
const cartSummary = $('#cartSummary');

function renderDishes(category = 'all') {
  const visible = dishes.filter(dish => category === 'all' || dish.category === category);
  foodGrid.innerHTML = visible.map((dish, index) => `
    <article class="food-card" style="animation-delay:${index * 55}ms">
      <div class="food-image" style="background-image:url('https://images.unsplash.com/${dish.image}?auto=format&fit=crop&w=800&q=80')"><span class="food-tag">${dish.label}</span></div>
      <div class="food-info"><h3>${dish.name}</h3><p>${dish.description}</p>
        <div class="food-bottom"><span class="food-price">${money(dish.price)}</span><button class="add-button" data-add="${dish.id}" aria-label="Илова кардани ${dish.name} ба сабад">+</button></div>
      </div>
    </article>`).join('');
}

function renderCart() {
  const items = [...cart.entries()];
  const count = items.reduce((sum, [, item]) => sum + item.quantity, 0);
  const total = items.reduce((sum, [, item]) => sum + item.dish.price * item.quantity, 0);
  $('#cartCount').textContent = count;
  $('#cartSubtotal').textContent = money(total);
  $('#cartTotal').textContent = money(total);
  $('#modalTotal').textContent = money(total);
  cartEmpty.hidden = items.length > 0;
  cartSummary.classList.toggle('is-empty', items.length === 0);
  cartItems.innerHTML = items.map(([id, item]) => `
    <div class="cart-row"><div><h4>${item.dish.name}</h4><small>${money(item.dish.price * item.quantity)}</small></div>
      <div class="quantity"><button data-quantity="${id}" data-change="-1" aria-label="Кам кардан">−</button><span>${item.quantity}</span><button data-quantity="${id}" data-change="1" aria-label="Зиёд кардан">+</button></div>
    </div>`).join('');
}

function setDrawer(open) {
  cartDrawer.classList.toggle('open', open);
  overlay.classList.toggle('visible', open);
  cartDrawer.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('drawer-open', open);
}

$('#filters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  document.querySelectorAll('.filter-chip').forEach(chip => {
    const active = chip === button;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
  renderDishes(button.dataset.category);
});

foodGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const dish = dishes.find(item => item.id === button.dataset.add);
  const current = cart.get(dish.id);
  cart.set(dish.id, { dish, quantity: (current?.quantity || 0) + 1 });
  renderCart();
  button.textContent = '✓';
  setTimeout(() => { if (button.isConnected) button.textContent = '+'; }, 650);
});

cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-quantity]');
  if (!button) return;
  const item = cart.get(button.dataset.quantity);
  item.quantity += Number(button.dataset.change);
  if (item.quantity <= 0) cart.delete(button.dataset.quantity);
  renderCart();
});

$('#cartTrigger').addEventListener('click', () => setDrawer(true));
$('#closeCart').addEventListener('click', () => setDrawer(false));
overlay.addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setDrawer(false); });

const modal = $('#orderModal');
$('#checkoutButton').addEventListener('click', () => {
  if (!cart.size) return;
  setDrawer(false);
  $('#formMessage').textContent = '';
  modal.showModal();
});
$('#closeModal').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
$('#orderForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = new FormData(event.currentTarget).get('name').trim();
  $('#formMessage').textContent = `Ташаккур, ${name}! Фармоиши шумо қабул шуд. Мо ба наздикӣ занг мезанем.`;
  cart.clear();
  renderCart();
  event.currentTarget.reset();
});

const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mainNav.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
});

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
}

renderDishes();
renderCart();

