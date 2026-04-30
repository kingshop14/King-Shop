# 🚀 KING SHOP — Інструкція з запуску

Привіт! Цей документ допоможе тобі запустити твій додаток так, щоб **клієнти могли користуватися** ним з будь-якого телефону.

## 📋 Що ти отримаєш в кінці

✅ Сайт за адресою типу `kingshop.vercel.app` (або власний домен)  
✅ Дані товарів та замовлень зберігаються в "хмарі" (не зникають)  
✅ Працює як додаток (можна встановити на телефон)  
✅ Працює офлайн (PWA)  
✅ Все БЕЗКОШТОВНО на старті  

---

## ⏱️ Час: ~1.5 години

---

# 🔵 КРОК 1: Створення Firebase (база даних)

Firebase зберігає всі товари, замовлення, новини, фото.

### 1.1 Реєстрація

1. Йдеш на 👉 https://console.firebase.google.com
2. Заходиш через свій Google акаунт
3. Натискаєш **"Add project"** (Створити проект)
4. Назва: `king-shop` → Continue
5. Google Analytics: **вимикаєш** → Create project
6. Чекаєш ~30 секунд

### 1.2 Додавання Web App

1. На головній сторінці проекту натискаєш іконку **`</>`** (Web)
2. Назва додатку: `KING SHOP`
3. **НЕ** ставиш галочку "Firebase Hosting"
4. Натискаєш **Register app**
5. **Копіюєш код** який з'являється — він виглядає так:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXX...",
  authDomain: "king-shop-xxxxx.firebaseapp.com",
  projectId: "king-shop-xxxxx",
  storageBucket: "king-shop-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

6. **Зберігаєш цей код** — потрібно буде вставити в файл `firebase-config.js`

### 1.3 Активація бази даних (Firestore)

1. У лівому меню → **Build** → **Firestore Database**
2. Натискаєш **Create database**
3. Вибираєш **"Start in test mode"** (важливо!)
4. Локація: `eur3 (europe-west)` 
5. **Enable** → чекаєш

### 1.4 Активація сховища фото (Storage)

1. У лівому меню → **Build** → **Storage**
2. **Get started** → **Start in test mode** → **Done**

### 1.5 Налаштування правил безпеки

**Firestore Rules** (Firestore Database → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Товари і новини — читання для всіх, запис лише для адміна
    match /products/{document=**} {
      allow read: if true;
      allow write: if true; // На старті дозволяємо. Потім додамо аутентифікацію.
    }
    match /news/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    match /orders/{document=**} {
      allow read, write: if true;
    }
    match /users/{document=**} {
      allow read, write: if true;
    }
    match /settings/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

⚠️ **Важливо**: Це для старту. Пізніше додамо справжню аутентифікацію.

**Storage Rules** (Storage → Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 1.6 Вставка ключів у код

1. Відкриваєш файл `firebase-config.js`
2. Знаходиш блок `const firebaseConfig = { ... }`
3. Замінюєш плейсхолдери на свої ключі з кроку 1.2

---

# 🟢 КРОК 2: Запуск на хостинг (Vercel)

Vercel — безкоштовний хостинг, ідеально для нашого додатку.

### 2.1 Реєстрація на GitHub (якщо ще немає)

1. https://github.com → Sign up
2. Реєструєшся (це безкоштовно)

### 2.2 Завантаження коду на GitHub

**Варіант А — через сайт (легше):**

1. Йдеш на https://github.com → **New repository**
2. Назва: `king-shop`
3. **Public** → Create repository
4. Натискаєш **"uploading an existing file"**
5. Перетягуєш ВСІ файли з папки `king-shop`:
   - `index.html`
   - `firebase-config.js`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
6. **Commit changes**

**Варіант Б — через термінал:**

```bash
cd king-shop
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ТВІЙ-LOGIN/king-shop.git
git push -u origin main
```

### 2.3 Деплой через Vercel

1. https://vercel.com → **Sign Up with GitHub**
2. Дозволяєш доступ до своїх репозиторіїв
3. На головній → **Add New** → **Project**
4. Знаходиш `king-shop` → **Import**
5. Налаштування за замовчуванням → **Deploy**
6. Чекаєш 30-60 секунд
7. Готово! Отримуєш URL типу `king-shop-xxxxx.vercel.app`

🎉 **Твій додаток вже працює онлайн!**

---

# 🟡 КРОК 3: Підключення Firebase до додатку

Зараз додаток працює, але дані не зберігаються. Виправляємо.

### 3.1 Інтеграція в HTML

Відкрий `index.html`. У самому **початку тегу `<script>`** (перед `let products = ...`) встав:

```javascript
// Імпорт Firebase
import { 
  loadProducts, saveProduct as saveProductFB, deleteProduct as deleteProductFB,
  loadOrders, saveOrder, updateOrderStatus,
  loadNews, saveNews as saveNewsFB, deleteNews as deleteNewsFB,
  uploadPhoto, listenOrders, loadSettings, saveSettings,
  findUserByPhone, createUser
} from './firebase-config.js';

// Завантаження даних на старті
async function initApp() {
  try {
    products = await loadProducts();
    if(products.length === 0) {
      // Перший запуск — додаємо демо-товари
      products = [/* default products */];
    }
    orders = await loadOrders();
    news = await loadNews();
    
    renderProducts('products-grid');
    renderProducts('catalog-grid');
    renderNews();
  } catch(e) {
    console.error('Firebase помилка:', e);
  }
}

initApp();
```

Також зміни тег `<script>` на:

```html
<script type="module">
```

### 3.2 Завантаження фото в Storage

У функції `handlePhotosUpload` заміни локальне base64 на:

```javascript
async function handlePhotosUpload(event) {
  const files = Array.from(event.target.files);
  for(const file of files) {
    try {
      const url = await uploadPhoto(file, 'products');
      tempPhotos.push(url);
      renderPhotosPreview();
    } catch(e) {
      alert('Помилка завантаження: ' + e.message);
    }
  }
  event.target.value = '';
}
```

⚠️ **Я залишив цей крок як ручний — щоб ти краще зрозумів код. Якщо потрібна допомога — кажи!**

---

# 🟣 КРОК 4: Тестування PWA (встановлення на телефон)

### На Android:
1. Відкриваєш `king-shop-xxxxx.vercel.app` в Chrome
2. Через 30 сек з'явиться запит на встановлення
3. Або: меню (3 точки) → **"Add to Home screen"**

### На iPhone:
1. Відкриваєш в Safari
2. Знизу натискаєш кнопку "Поділитися" 📤
3. **"On Home Screen"** (Додати на головний)
4. Готово!

Тепер це **повноцінний додаток** — без браузерних рамок!

---

# 🔴 КРОК 5: Власний домен (опціонально)

### Купівля домену

Найкращі реєстратори в Україні:
- **Imena.ua** — від 200 ₴/рік
- **Ukrnames** — від 250 ₴/рік
- **Hostpro** — від 300 ₴/рік

Купуєш `kingshop.com.ua` або `kingshop.shop`

### Підключення до Vercel

1. У Vercel → твій проект → **Settings** → **Domains**
2. Вводиш `kingshop.com.ua` → **Add**
3. Vercel дає тобі DNS-записи (A та CNAME)
4. У панелі реєстратора додаєш ці записи
5. Чекаєш 1-24 години
6. Сайт доступний за твоєю адресою!

---

# 💰 ВАРТІСТЬ

### Безкоштовний тариф (вистачає для старту):

| Сервіс | Ліміт | Достатньо для |
|--------|-------|---------------|
| **Firebase Firestore** | 50K читань/день | ~500 покупців/день |
| **Firebase Storage** | 5 GB | ~5000 фото |
| **Vercel** | 100 GB трафіку/міс | ~10K візитів/міс |

### Якщо переростеш безкоштовне:

- Firebase Blaze: ~$5-25/міс залежно від трафіку
- Vercel Pro: $20/міс (рідко потрібно)

---

# 🎯 ЩО ДАЛІ

Коли все запрацює, наступні кроки:

### 🟢 Швидкі покращення:
1. **Купити домен** (200-400 ₴/рік)
2. **Підключити Google Analytics** (безкоштовно)
3. **Додати favicon** (іконка в браузері)

### 🟡 Середні покращення:
4. **LiqPay** — онлайн-оплата
5. **TurboSMS** — SMS про статус замовлення
6. **Telegram Bot** — повідомлення тобі про нові замовлення
7. **Безпечна аутентифікація** — Firebase Auth

### 🔴 Великі покращення:
8. **Native додаток** (Apple Store + Google Play)
9. **Інтеграція з Новою Поштою API** — автоматичні ТТН
10. **Складська система** — облік залишків

---

# 🆘 ДОПОМОГА

Якщо щось не виходить — **скажи на якому кроці застряг**, і я допоможу!

Також можу:
- Покрокові скрін-шоти для будь-якого кроку
- Допомогти з налаштуванням домену
- Інтегрувати оплату LiqPay
- Налаштувати Telegram-бота
- Додати решту фіч

🚀 **Удачі з KING SHOP!**
