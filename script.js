// script.js

// Helper function for safer Local Storage operations
function getLocalStorageItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error getting item from localStorage for key "${key}":`, error);
        return null; // Return null in case of error
    }
}

function setLocalStorageItem(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error setting item in localStorage for key "${key}":`, error);
        // Optionally, inform the user that data couldn't be saved
    }
}

// Cart Module
const cart = {
    items: getLocalStorageItem('cart') || [],

    save() {
        setLocalStorageItem('cart', this.items);
    },

    add(product) {
        const existingItemIndex = this.items.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            this.items[existingItemIndex].quantity += 1;
        } else {
            // Ensure we only store necessary product info in cart/favorites
            const productToAdd = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1 // Start with quantity 1
            };
            this.items.push(productToAdd);
        }

        this.save();
        renderCart(); // Update cart display
        showNotification(`${product.name} sepete eklendi!`, 'success'); // Görsel bildirim
        // updateFavoriteButtons(); // Favoriye eklemek sepete eklemeyi etkilemez, burada gerek yok
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        renderCart(); // Update cart display
        showNotification('Ürün sepetten çıkarıldı.', 'warning'); // Görsel bildirim
        // updateFavoriteButtons(); // Sepetten çıkarmak favoriyi etkilemez, burada gerek yok
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            const newQuantity = parseInt(quantity, 10); // Ensure quantity is a number
            if (!isNaN(newQuantity)) {
                 item.quantity = newQuantity;
                 if (item.quantity <= 0) {
                     this.remove(productId); // remove fonksiyonu zaten bildirim gösteriyor
                 } else {
                    this.save();
                    renderCart(); // Update cart display
                    // Adet güncellendiğinde bildirim opsiyonel olabilir veya farklı bir mesaj verilebilir
                    // showNotification(`${item.name} adeti güncellendi.`, 'success');
                 }
            } else {
                console.error("Invalid quantity provided:", quantity);
                showNotification("Geçersiz adet değeri.", 'error'); // Hata bildirimi
            }
        }
    },

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
};

// Favorites Module
const favorites = {
    items: getLocalStorageItem('favorites') || [],

    save() {
        setLocalStorageItem('favorites', this.items);
    },

    add(product) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (!existingItem) {
            const productToAdd = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                // quantity here might be optional depending on how you use it
            };
            this.items.push(productToAdd);
            this.save();
            renderFavorites(); // Favoriler sayfasındaysa listeyi yeniden çiz
            showNotification(`${product.name} favorilere eklendi!`, 'success'); // Görsel bildirim
            updateFavoriteButtons(); // Sayfadaki tüm favori butonlarının durumunu güncelle
        } else {
            // Zaten favorilerde ise çıkaralım (toggle davranışı)
            this.remove(product.id);
        }
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        renderFavorites(); // Favoriler sayfasındaysa listeyi yeniden çiz
        showNotification('Ürün favorilerden çıkarıldı.', 'warning'); // Görsel bildirim
        updateFavoriteButtons(); // Sayfadaki tüm favori butonlarının durumunu güncelle
    },

    isFavorite(productId) {
        return this.items.some(item => item.id === productId);
    }
};

// --- Notification Functions (Bir önceki adımdan) ---
function showNotification(message, type = 'success') {
    const notificationElement = document.getElementById('notification');
    if (notificationElement) {
        notificationElement.innerText = message;
        // Remove previous type classes
        notificationElement.classList.remove('success', 'error', 'warning');
        // Add current type class
        notificationElement.classList.add(type);
        notificationElement.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    }
}


// --- Rendering Functions ---

// Function to render cart items on sepet.html
function renderCart() {
    const cartListElement = document.querySelector('.cart-list');
    const cartSummaryElement = document.querySelector('.cart-summary');

    if (!cartListElement || !cartSummaryElement) return;

    cartListElement.innerHTML = ''; // Clear current list
    const total = cart.getTotal();

    if (cart.items.length === 0) {
        cartListElement.innerHTML = '<p>Sepetiniz boş.</p>';
        cartSummaryElement.innerHTML = '';
        return;
    }

    cart.items.forEach(product => {
        const itemTotal = product.price * product.quantity;
        cartListElement.innerHTML += `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}" width="50">
                <div class="item-details">
                    <h3>${product.name}</h3>
                    <p>${product.price} TL</p>
                    <div class="quantity-control">
                        <button onclick="cart.updateQuantity('${product.id}', ${product.quantity - 1})">-</button>
                        <span>${product.quantity}</span>
                        <button onclick="cart.updateQuantity('${product.id}', ${product.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="cart.remove('${product.id}')">Kaldır</button>
                </div>
            </div>
        `;
    });

    cartSummaryElement.innerHTML = `
        <h3>Toplam: ${total} TL</h3>
        <button class="checkout-button">Ödeme Yap</button>
    `;

    // Add event listener to the checkout button
    const checkoutButton = cartSummaryElement.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
}

// Function to render favorite items on favoriler.html
function renderFavorites() {
    const favoritesListElement = document.querySelector('.favorites-list');

    if (!favoritesListElement) return;

    favoritesListElement.innerHTML = ''; // Clear current list

    if (favorites.items.length === 0) {
        favoritesListElement.innerHTML = '<p>Favori listeniz boş.</p>';
        return;
    }

    favorites.items.forEach(product => {
         // Favori sayfasında favoriden çıkarma butonu için data-product-id eklendi
        favoritesListElement.innerHTML += `
            <div class="product">
                <a href="urun-detay.html?id=${product.id}">
                     <img src="${product.image}" alt="${product.name} görseli">
                     <h3>${product.name}</h3>
                </a>
                <p>${product.price} TL</p>
                <button class="remove-favorite" onclick="favorites.remove('${product.id}')" data-product-id="${product.id}">Favoriden Çıkar</button>
                <button onclick="cart.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})">Sepete Ekle</button>
            </div>
        `;
    });
}

// Dummy product data (replace with actual data fetching)
const productsData = [
    {
        id: 'yzk001',
        name: 'Pırlanta Tektaş Yüzük',
        price: 950,
        image: 'placeholder_yuzuk_pirlanta.jpg',
        description: 'Klasik ve zarif pırlanta tektaş yüzük. 0.25 karat, 14 ayar beyaz altın.'
    },
    {
        id: 'kly002',
        name: 'Altın Kelebek Kolye',
        price: 420,
        image: 'placeholder_kolye_kelebek.jpg',
        description: 'İnce zincirli, zarif altın kelebek figürlü kolye. 8 ayar sarı altın.'
    },
    {
        id: 'st003',
        name: 'Minimalist Bayan Saat',
        price: 680,
        image: 'placeholder_saat_minimalist.jpg',
        description: 'Modern ve sade tasarımlı bayan kol saati. Deri kayış, Japon mekanizma.'
    },
    {
        id: 'kp004',
        name: 'Gümüş Halka Küpe',
        price: 180,
        image: 'placeholder_kupe_halka.jpg',
        description: 'Günlük kullanıma uygun, orta boy gümüş halka küpe. 925 Ayar gümüş.'
    },
    {
        id: 'yzk005',
        name: 'Safir Taşlı Yüzük',
        price: 750,
        image: 'placeholder_yuzuk_safir.jpg',
        description: 'Göz alıcı safir taşı ve etrafında zirkon taşlarla süslenmiş yüzük.'
    },
     {
        id: 'kly006',
        name: 'İnci Detaylı Kolye',
        price: 350,
        image: 'placeholder_kolye_inci.jpg',
        description: 'Zarif bir tatlı su incisi ile tamamlanan gümüş kolye.'
    },
];


// Function to display product detail on urun-detay.html
function renderProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const product = productsData.find(p => p.id === productId);

    const productDetailContainer = document.querySelector('.product-detail-container');

    if (!productDetailContainer) return;

    if (product) {
        productDetailContainer.querySelector('.product-image img').src = product.image;
        productDetailContainer.querySelector('.product-image img').alt = product.name + " görseli";
        productDetailContainer.querySelector('.product-name').innerText = product.name;
        productDetailContainer.querySelector('.product-price').innerText = `${product.price} TL`;
        productDetailContainer.querySelector('.product-description p').innerText = product.description;

        // Attach event listeners using the product data
        const addToCartButton = productDetailContainer.querySelector('.add-to-cart');
        if (addToCartButton) {
             addToCartButton.onclick = () => cart.add(product);
        }

        const addToFavoritesButton = productDetailContainer.querySelector('.add-to-favorites');
        if (addToFavoritesButton) {
            // Favori butonuna data-product-id eklendi
            addToFavoritesButton.setAttribute('data-product-id', product.id);
            addToFavoritesButton.onclick = () => favorites.add(product);
        }

        // Ürün detay sayfasında favori durumunu kontrol et ve butonu güncelle (updateFavoriteButtons çağrılacak)


        // Update title and meta description based on product
        document.title = `${product.name} - DIAMOND - BUJITERI`;
        const metaDescription = document.querySelector('meta[name="description"]');
         if(metaDescription) {
             metaDescription.setAttribute('content', `${product.name} ürün detayları. ${product.description.substring(0, 150)}...`);
         }


    } else {
        // Handle case where product is not found
        productDetailContainer.innerHTML = '<p>Ürün bulunamadı.</p>';
        document.title = `Ürün Bulunamadı - DIAMOND - BUJITERI`;
         const metaDescription = document.querySelector('meta[name="description"]');
         if(metaDescription) {
             metaDescription.setAttribute('content', `Aradığınız ürün bulunamadı.`);
         }
    }
    // Sayfa yüklendiğinde veya ürün detay render edildiğinde buton durumunu güncelle
    updateFavoriteButtons();
}


// Simple example of populating product list on index.html
function renderProductList() {
    const productListElement = document.querySelector('#featured-products .product-list');
     if (!productListElement) return;

     productListElement.innerHTML = ''; // Clear existing placeholders

    productsData.forEach(product => {
        // Favori butonu için data-product-id eklendi
        productListElement.innerHTML += `
            <div class="product">
                <a href="urun-detay.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name} görseli">
                    <h3>${product.name}</h3>
                </a>
                <p>${product.price} TL</p>
                <button onclick="cart.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})">Sepete Ekle</button>
                 <button class="add-to-favorites" onclick="favorites.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})" data-product-id="${product.id}">Favorilere Ekle</button>
            </div>
        `;
    });
    // Ürün listesi render edildikten sonra favori butonlarının durumunu güncelle
    updateFavoriteButtons();
}

// Helper function to update the state of favorite buttons across the site
function updateFavoriteButtons() {
    // Sayfadaki tüm favori butonlarını seç
    const favButtons = document.querySelectorAll('.add-to-favorites');

    favButtons.forEach(button => {
        // Butonun data-product-id özniteliğinden ürün ID'sini al
        const productId = button.getAttribute('data-product-id');

        if (productId) {
            // Ürünün favorilerde olup olmadığını kontrol et
            const isFav = favorites.isFavorite(productId);

            // Butonun metnini ve sınıfını güncelle
            if (isFav) {
                button.innerText = 'Favorilerde ✅';
                button.classList.add('favorited');
                button.disabled = true; // Zaten favoride ise devre dışı bırakılabilir
            } else {
                button.innerText = 'Favorilere Ekle';
                button.classList.remove('favorited');
                button.disabled = false; // Favoride değilse etkinleştir
            }
        }
    });

    // Favoriler sayfasındaki "Favoriden Çıkar" butonları için de aynı logic uygulanabilir
    // Ancak favoriler sayfasında renderFavorites zaten tüm listeyi yeniden çiziyor,
    // bu da butonların güncel durumunu gösterecektir. Eğer renderFavorites tam sayfa
    // yenileme yapmıyorsa, bu butonları da update etmek gerekebilir.
    // Mevcut renderFavorites logic'i tam listeyi çizdiği için ayrıca update etmeye gerek yok.
}


// --- Page Specific Initialization ---
window.addEventListener('load', () => {
    const pathname = window.location.pathname;

    if (pathname.includes('sepet.html')) {
        renderCart();
    } else if (pathname.includes('favoriler.html')) {
        renderFavorites();
    } else if (pathname.includes('urun-detay.html')) {
        renderProductDetail();
    } else if (pathname.includes('index.html') || pathname === '/') {
         renderProductList();
    }

    // Initialize contact form if on the contact page
    if (pathname.includes('iletisim.html')) {
        initContactForm();
    }

    // Sayfa yüklendiğinde favori butonlarının durumunu kontrol et ve güncelle
    updateFavoriteButtons();

    // Add more page-specific initializations here if needed
});

// --- Contact Form Handling ---
function initContactForm() {
    const contactForm = document.querySelector('#contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showNotification('Lütfen tüm gerekli alanları doldurun.', 'warning'); // Görsel bildirim
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                 showNotification('Lütfen geçerli bir e-posta adresi girin.', 'warning'); // Görsel bildirim
                 return;
            }

            console.log('Form Submitted!');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Subject:', document.getElementById('subject').value.trim());
            console.log('Message:', message);

            // Simulate successful submission
            showNotification('Mesajınız alındı! Teşekkür ederiz.', 'success'); // Görsel bildirim

            contactForm.reset();

            // Backend gönderimi için fetch bloğu (yorum satırı)
        });
    }
}

// Basic Checkout Handler (Placeholder)
function handleCheckout() {
    if (cart.items.length === 0) {
        showNotification('Sepetiniz boş. Ödeme yapılamaz.', 'warning'); // Görsel bildirim
        return;
    }
    const total = cart.getTotal();
    showNotification(`Toplam ${total} TL için ödeme adımına yönlendiriliyorsunuz. (Bu sadece bir simülasyondur)`, 'success'); // Görsel bildirim
    console.log("Proceeding to checkout with items:", cart.items);
    }
            
