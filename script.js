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
        updateCartBadge();
        showNotification(`${product.name} sepete eklendi!`, 'success');
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        renderCart(); // Update cart display if on cart page
        updateCartBadge();
        showNotification('Ürün sepetten çıkarıldı!', 'danger');
    },

    setQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.save();
            renderCart(); // Update cart display if on cart page
            updateCartBadge();
        }
    },

    getTotal() {
        return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    clear() {
        this.items = [];
        this.save();
        renderCart();
        updateCartBadge();
        showNotification('Sepet temizlendi!', 'info');
    }
};

// Favorites Module
const favorites = {
    items: getLocalStorageItem('favorites') || [],

    save() {
        setLocalStorageItem('favorites', this.items);
    },

    add(product) {
        const existingItemIndex = this.items.findIndex(item => item.id === product.id);

        if (existingItemIndex === -1) {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            });
            this.save();
            updateFavoriteButtons();
            updateFavoritesBadge();
            showNotification(`${product.name} favorilere eklendi!`, 'success');
        }
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        renderFavorites();
        updateFavoriteButtons();
        updateFavoritesBadge();
        showNotification('Ürün favorilerden çıkarıldı!', 'danger');
    },

    isFavorite(productId) {
        return this.items.some(item => item.id === productId);
    },

    clear() {
        this.items = [];
        this.save();
        renderFavorites();
        updateFavoriteButtons();
        updateFavoritesBadge();
        showNotification('Favoriler temizlendi!', 'info');
    }
};

// --- Notification Module
const notification = {
    element: document.getElementById('notification'),
    timeoutId: null,

    show(message, type) {
        this.element.textContent = message;
        this.element.className = `notification ${type}`;
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            this.element.classList.remove('show');
        }, 3000); // Duration in milliseconds
        this.element.classList.add('show');
    },
};

function showNotification(message, type) {
    notification.show(message, type);
}

// --- Render Cart Function
function renderCart() {
    const cartListElement = document.querySelector('#cart-content .cart-list');
    const cartSummaryElement = document.querySelector('#cart-content .cart-summary');

    if (!cartListElement || !cartSummaryElement) return;

    cartListElement.innerHTML = '';
    let totalPrice = 0;

    if (cart.items.length === 0) {
        cartListElement.innerHTML = '<p>Sepetiniz boş.</p>';
        cartSummaryElement.innerHTML = '';
    } else {
        cart.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            cartListElement.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name} görseli">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p class="item-price">${item.price} TL x ${item.quantity} = ${itemTotal.toFixed(2)} TL</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-from-cart" data-id="${item.id}">Kaldır</button>
                    </div>
                </div>
            `;
        });

        cartSummaryElement.innerHTML = `
            <div class="cart-total">
                <strong>Toplam: ${totalPrice.toFixed(2)} TL</strong>
            </div>
            <button class="clear-cart">Sepeti Temizle</button>
            <button class="checkout">Ödeme Yap</button>
        `;

        // Add event listeners for quantity changes and item removal
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.id;
                const change = btn.classList.contains('increase-quantity') ? 1 : -1;
                const newQuantity = Math.max(1, cart.items.find(item => item.id === productId).quantity + change);
                cart.setQuantity(productId, newQuantity);
            });
        });

        document.querySelectorAll('.remove-from-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                cart.remove(btn.dataset.id);
            });
        });

        document.querySelector('.clear-cart').addEventListener('click', () => {
            cart.clear();
        });

        document.querySelector('.checkout').addEventListener('click', () => {
            alert('Ödeme sayfasına yönlendiriliyor...');
        });
    }
}

// --- Render Favorites List
function renderFavorites() {
    const favoritesListElement = document.querySelector('#favorites-content .favorites-list');
    if (!favoritesListElement) return;

    favoritesListElement.innerHTML = '';

    if (favorites.items.length === 0) {
        favoritesListElement.innerHTML = '<p>Favori listeniz boş.</p>';
    } else {
        favorites.items.forEach(item => {
            favoritesListElement.innerHTML += `
                <div class="favorite-item">
                    <img src="${item.image}" alt="${item.name} görseli">
                    <div class="favorite-item-details">
                        <h3>${item.name}</h3>
                        <p class="item-price">${item.price} TL</p>
                        <button class="remove-from-favorites" data-id="${item.id}">Favorilerden Çıkar</button>
                    </div>
                </div>
            `;
        });

        // Add event listeners for removing items from favorites
        document.querySelectorAll('.remove-from-favorites').forEach(btn => {
            btn.addEventListener('click', () => {
                favorites.remove(btn.dataset.id);
            });
        });
    }
}

// --- Update Cart Badge
function updateCartBadge() {
    const cartBadge = document.querySelectorAll('.cart-count-badge');
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.forEach(badge => badge.textContent = totalItems.toString());
}

// --- Update Favorites Badge
function updateFavoritesBadge() {
    const favoritesBadge = document.querySelectorAll('.favorite-count-badge');
    favoritesBadge.forEach(badge => badge.textContent = favorites.items.length.toString());
}

// --- Update Favorite Buttons
function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.add-to-favorites');
    favoriteButtons.forEach(button => {
        const productId = button.dataset.productId || button.getAttribute('data-product-id');
        if (favorites.isFavorite(productId)) {
            button.classList.add('favorited');
            button.textContent = 'Favorilerde';
            button.disabled = true;
        } else {
            button.classList.remove('favorited');
            button.textContent = 'Favorilere Ekle';
            button.disabled = false;
        }
    });
}

// --- Render Product List on index.html
function renderProductList() {
    const productListElement = document.querySelector('#featured-products .product-list');
    if (!productListElement) return;

    productListElement.innerHTML = ''; // Clear existing placeholders

    productsData.forEach(product => {
        // Ürün linkine ve favori butonuna data-product-id eklendi
        productListElement.innerHTML += `
            <div class="product">
                <a href="urun-detay.html?id=${product.id}" data-product-id="${product.id}" class="product-link">
                    <img src="${product.image}" alt="${product.name} görseli">
                    <h3>${product.name}</h3>
                </a>
                <p>${product.price} TL</p>
                <button onclick="cart.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})">Sepete Ekle</button>
                <button class="add-to-favorites" onclick="favorites.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})\" data-product-id=\"${product.id}\">Favorilere Ekle</button>
            </div>
        `;
    });

    // Ürün listesi render edildikten sonra modal event listener'larını ekle
    addModalEventListeners('.product-list');
    updateFavoriteButtons(); // Favori butonlarının durumunu güncelle
}

// Function to add event listeners to product links to open modal
function addModalEventListeners(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener('click', function(event) {
        let target = event.target;
        // Tıklanan eleman veya üst elemanlarından herhangi biri ürün linki mi kontrol et
        const productLink = target.closest('.product-link');
        if (productLink) {
            event.preventDefault(); // Sayfa geçişini engelle
            const productId = productLink.dataset.productId || productLink.getAttribute('data-product-id');
            openQuickViewModal(productId);
        }
    });
}

// --- Open Quick View Modal
function openQuickViewModal(productId) {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    const product = productsData.find(p => p.id === productId);
    if (product) {
        modal.querySelector('.modal-product-image img').src = product.image;
        modal.querySelector('.modal-product-name').textContent = product.name;
        modal.querySelector('.modal-product-price').textContent = `${product.price} TL`;
        modal.querySelector('.modal-product-description p').textContent = product.description;

        const addToCartButton = modal.querySelector('.modal-add-to-cart');
        addToCartButton.onclick = () => {
            cart.add({ id: product.id, name: product.name, price: product.price, image: product.image });
            modal.style.display = 'none';
        };

        const addToFavoritesButton = modal.querySelector('.modal-add-to-favorites');
        addToFavoritesButton.onclick = () => {
            favorites.add({ id: product.id, name: product.name, price: product.price, image: product.image });
            updateFavoriteButtons(); // Update buttons after adding to favorites
            modal.style.display = 'none';
        };

        modal.style.display = 'block';
    }
}

// --- Close Quick View Modal
document.querySelectorAll('.close-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('quick-view-modal').style.display = 'none';
    });
});

// --- Initialize
document.addEventListener('DOMContentLoaded', () => {
    cart.items = getLocalStorageItem('cart') || [];
    favorites.items = getLocalStorageItem('favorites') || [];

    renderCart();
    renderFavorites();
    renderProductList();
    updateCartBadge();
    updateFavoritesBadge();
    updateFavoriteButtons();
});

// 1. Gelişmiş Filtreleme ve Sıralama
const categoryFilter = document.getElementById('category-filter');
const priceSort = document.getElementById('price-sort');
const filterButton = document.getElementById('filter-button');
const productListElement = document.querySelector('#featured-products .product-list'); // Seçiciyi güncelledim

if (filterButton) {
    filterButton.addEventListener('click', () => {
        const selectedCategory = categoryFilter.value;
        const selectedPriceSort = priceSort.value;

        let filteredProducts = [...productsData];

        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
        }

        if (selectedPriceSort === 'asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (selectedPriceSort === 'desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        renderProductList(filteredProducts);
    });
}

// 2. Akıllı Arama
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');

if (searchButton) {
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const results = productsData.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        displayResults(results);
    });

    function displayResults(results) {
        searchResults.innerHTML = '';
        if (results.length === 0) {
            searchResults.innerHTML = '<p>Ürün bulunamadı.</p>';
        } else {
            results.forEach(product => {
                searchResults.style.display = 'block'; // Sonuçları göster
                searchResults.innerHTML += `
                    <a href="urun-detay.html?id=${product.id}">${product.name}</a><br>
                `;
            });
        }
    }

    searchInput.addEventListener('input', () => {
        if (searchInput.value.length > 2) {
            searchButton.click();
        } else {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none'; // Sonuçları gizle
        }
    });

    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target)) {
            searchResults.style.display = 'none'; // Arama çubuğu dışına tıklanınca sonuçları gizle
        }
    });
}

// Mevcut productsData dizisi (unutmayın, bu verileri kendi ürünlerinizle değiştirin):
const productsData = [
    { id: 'yzk001', name: 'Pırlanta Tektaş Yüzük', price: 950, image: 'placeholder_yuzuk_pirlanta.jpg', description: 'Klasik ve zarif pırlanta tektaş yüzük. 0.25 karat, 14 ayar beyaz altın.', category: 'yuzuk' },
    { id: 'kly002', name: 'Altın Kelebek Kolye', price: 420, image: 'placeholder_kolye_kelebek.jpg', description: 'İnce zincirli, zarif altın kele
    
