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
        renderCart(); // Update cart display if on cart page
        showNotification(`${product.name} sepete eklendi!`, 'success'); // Görsel bildirim
        updateCartAndFavoriteCounts(); // Sayaçları güncelle
        // updateFavoriteButtons(); // Sepete eklemek favoriyi etkilemez
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        renderCart(); // Update cart display if on cart page
        showNotification('Ürün sepetten çıkarıldı.', 'warning'); // Görsel bildirim
        updateCartAndFavoriteCounts(); // Sayaçları güncelle
        // updateFavoriteButtons(); // Sepetten çıkarmak favoriyi etkilemez
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            const newQuantity = parseInt(quantity, 10); // Ensure quantity is a number
            if (!isNaN(newQuantity)) {
                 item.quantity = newQuantity;
                 if (item.quantity <= 0) {
                     this.remove(productId); // remove fonksiyonu zaten sayaç güncelliyor
                 } else {
                    this.save();
                    renderCart(); // Update cart display if on cart page
                    // showNotification(`${item.name} adeti güncellendi.`, 'success'); // Opsiyonel bildirim
                    updateCartAndFavoriteCounts(); // Sayaçları güncelle
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
            };
            this.items.push(productToAdd);
            this.save();
            renderFavorites(); // Favoriler sayfasındaysa listeyi yeniden çiz
            showNotification(`${product.name} favorilere eklendi!`, 'success'); // Görsel bildirim
            updateFavoriteButtons(); // Sayfadaki tüm favori butonlarının durumunu güncelle
            updateCartAndFavoriteCounts(); // Sayaçları güncelle
        } else {
            // Zaten favorilerde ise çıkaralım (toggle davranışı)
            this.remove(product.id); // remove fonksiyonu zaten sayaç ve buton güncelliyor
        }
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        renderFavorites(); // Favoriler sayfasındaysa listeyi yeniden çiz
        showNotification('Ürün favorilerden çıkarıldı.', 'warning'); // Görsel bildirim
        updateFavoriteButtons(); // Sayfadaki tüm favori butonlarının durumunu güncelle
        updateCartAndFavoriteCounts(); // Sayaçları güncelle
    },

    isFavorite(productId) {
        return this.items.some(item => item.id === productId);
    }
};

// --- Notification Functions ---
function showNotification(message, type = 'success') {
    const notificationElement = document.getElementById('notification');
    if (notificationElement) {
        notificationElement.innerText = message;
        notificationElement.classList.remove('success', 'error', 'warning');
        notificationElement.classList.add(type);
        notificationElement.classList.add('show');

        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    }
}

// --- Update Counts Function ---
function updateCartAndFavoriteCounts() {
    const cartCountBadge = document.querySelector('.cart-count-badge');
    const favoriteCountBadge = document.querySelector('.favorite-count-badge');

    if (cartCountBadge) {
        const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0); // Adet toplamını al
        cartCountBadge.innerText = cartCount > 0 ? cartCount : ''; // 0'dan büyükse sayıyı, değilse boş stringi yaz
        // JavaScript ile sayacın gizlenmesi/gösterilmesi
        if (cartCount > 0) {
            cartCountBadge.style.display = 'inline-block';
        } else {
            cartCountBadge.style.display = 'none';
        }
    }

    if (favoriteCountBadge) {
        const favoriteCount = favorites.items.length; // Sadece favori ürün adedi
        favoriteCountBadge.innerText = favoriteCount > 0 ? favoriteCount : ''; // 0'dan büyükse sayıyı, değilse boş stringi yaz
         // JavaScript ile sayacın gizlenmesi/gösterilmesi
        if (favoriteCount > 0) {
            favoriteCountBadge.style.display = 'inline-block';
        } else {
            favoriteCountBadge.style.display = 'none';
        }
    }
}


// Dummy product data (replace with actual data fetching)
const productsData = [
    {
        id: 'yzk001',
        name: 'Pırlanta Tektaş Yüzük',
        price: 950,
        image: 'placeholder_yuzuk_pirlanta.jpg',
        description: 'Klasik ve zarif pırlanta tektaş yüzük. 0.25 karat, 14 ayar beyaz altın.',
        details: [
            "0.25 Karat Pırlanta",
            "14 Ayar Beyaz Altın",
            "Sertifikalı Ürün",
            "Farklı Boyut Seçenekleri"
        ]
    },
    {
        id: 'kly002',
        name: 'Altın Kelebek Kolye',
        price: 420,
        image: 'placeholder_kolye_kelebek.jpg',
        description: 'İnce zincirli, zarif altın kelebek figürlü kolye. 8 ayar sarı altın.',
        details: [
            "8 Ayar Sarı Altın",
            "Hafif ve Zarif Tasarım",
            "Günlük Kullanıma Uygun",
            "Hediye Kutusu ile Gönderilir"
        ]
    },
    {
        id: 'st003',
        name: 'Minimalist Bayan Saat',
        price: 680,
        image: 'placeholder_saat_minimalist.jpg',
        description: 'Modern ve sade tasarımlı bayan kol saati. Deri kayış, Japon mekanizma.',
        details: [
            "Deri Kayış",
            "Japon Quartz Mekanizma",
            "Suya Dayanıklı",
            "2 Yıl Garanti"
        ]
    },
    {
        id: 'kp004',
        name: 'Gümüş Halka Küpe',
        price: 180,
        image: 'placeholder_kupe_halka.jpg',
        description: 'Günlük kullanıma uygun, orta boy gümüş halka küpe. 925 Ayar gümüş.',
        details: [
            "925 Ayar Gümüş",
            "Antialerjenik Malzeme",
            "Hafif ve Rahat Kullanım",
            "Farklı Boyut Seçenekleri"
        ]
    },
    {
        id: 'yzk005',
        name: 'Safir Taşlı Yüzük',
        price: 750,
        image: 'placeholder_yuzuk_safir.jpg',
        description: 'Göz alıcı safir taşı ve etrafında zirkon taşlarla süslenmiş yüzük.',
        details: [
            "Doğal Safir Taşı",
            "Zirkon Taş Detayları",
            "925 Ayar Gümüş Üzeri Altın Kaplama",
            "Özel Tasarım"
        ]
    },
    {
        id: 'kly006',
        name: 'İnci Detaylı Kolye',
        price: 350,
        image: 'placeholder_kolye_inci.jpg',
        description: 'Zarif bir tatlı su incisi ile tamamlanan gümüş kolye.',
        details: [
            "Tatlı Su İncisi",
            "925 Ayar Gümüş",
            "Ayarlanabilir Zincir Uzunluğu",
            "Klasik ve Zamansız Tasarım"
        ]
    }
];


// --- Quick View Modal Functions ---
const quickViewModal = document.getElementById('quick-view-modal');
const closeModalButton = document.querySelector('.modal .close-button');
const modalProductImage = document.querySelector('.modal-product-image img');
const modalProductName = document.querySelector('.modal-product-name');
const modalProductPrice = document.querySelector('.modal-product-price');
const modalProductDescription = document.querySelector('.modal-product-description p');
const modalAddToCartButton = document.querySelector('.modal-add-to-cart');
const modalAddToFavoritesButton = document.querySelector('.modal-add-to-favorites');

// Function to populate the modal with product data
function populateModal(product) {
    if (!product) {
        console.error("Product data is missing for modal.");
        return;
    }

    modalProductImage.src = product.image;
    modalProductImage.alt = product.name + " görseli";
    modalProductName.innerText = product.name;
    modalProductPrice.innerText = `${product.price} TL`;
    modalProductDescription.innerText = product.description;

    // Add event listeners to modal buttons using the current product data
    // Önceki event listener'ları kaldırıp yenilerini eklemek önemlidir, aksi halde birden fazla listener olabilir
    const newAddToCartBtn = modalAddToCartButton.cloneNode(true);
    modalAddToCartButton.parentNode.replaceChild(newAddToCartBtn, modalAddToCartButton);
    newAddToCartBtn.onclick = () => {
        cart.add(product);
        closeModal(); // Sepete ekledikten sonra modalı kapat
    };

     const newAddToFavoritesBtn = modalAddToFavoritesButton.cloneNode(true);
     modalAddToFavoritesButton.parentNode.replaceChild(newAddToFavoritesBtn, modalAddToFavoritesButton);
     newAddToFavoritesBtn.onclick = () => {
         favorites.add(product);
         // Favorilere ekledikten sonra modalı açık bırakabilir veya kapatabilirsiniz
         // closeModal(); // İsterseniz favorilere ekledikten sonra modalı kapatın
     };
    // Favori butonu durumunu modal açıldığında da güncelle
    updateFavoriteButtons(); // updateFavoriteButtons fonksiyonu modal içindeki butonu da bulup güncelleyecektir
}

// Function to open the modal
function openModal(productId) {
    const product = productsData.find(p => p.id === productId);
    if (product) {
        populateModal(product);
        quickViewModal.classList.add('show'); // CSS ile modalı görünür yap
    } else {
        console.error(`Product with ID ${productId} not found.`);
        showNotification("Ürün bilgisi yüklenemedi.", 'error'); // Hata bildirimi
    }
}

// Function to close the modal
function closeModal() {
    quickViewModal.classList.remove('show'); // CSS ile modalı gizle
    // Modal içeriğini temizlemek isterseniz buraya ekleyebilirsiniz
    // modalProductImage.src = '';
    // modalProductImage.alt = '';
    // modalProductName.innerText = '';
    // modalProductPrice.innerText = '';
    // modalProductDescription.innerText = '';
}

// Event listeners for modal close actions
if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
}

// Arka plana tıklayınca modalı kapatma
window.addEventListener('click', (event) => {
    if (event.target === quickViewModal) {
        closeModal();
    }
});

// ESC tuşuna basınca modalı kapatma
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && quickViewModal.classList.contains('show')) {
        closeModal();
    }
});


// --- Rendering Functions (Güncellenmiş - Ürün linkleri modalı açacak) ---

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
                <a href="urun-detay.html?id=${product.id}" data-product-id="${product.id}" class="product-link">
                     <img src="${product.image}" alt="${product.name} görseli">
                     <h3>${product.name}</h3>
                </a>
                <p>${product.price} TL</p>
                <button class="remove-favorite" onclick="favorites.remove('${product.id}')" data-product-id="${product.id}">Favoriden Çıkar</button>
                <button onclick="cart.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})">Sepete Ekle</button>
            </div>
        `;
    });

     // Favoriler sayfasındaki
        
