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
        alert(`${product.name} sepete eklendi!`); // Simple notification
        updateFavoriteButtons(); // Favori butonlarının durumunu güncelle
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        renderCart(); // Update cart display
        alert('Ürün sepetten çıkarıldı.');
        updateFavoriteButtons(); // Favori butonlarının durumunu güncelle
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            const newQuantity = parseInt(quantity, 10); // Ensure quantity is a number
            if (!isNaN(newQuantity)) {
                 item.quantity = newQuantity;
                 if (item.quantity <= 0) {
                     this.remove(productId);
                 } else {
                    this.save();
                    renderCart(); // Update cart display
                 }
            } else {
                console.error("Invalid quantity provided:", quantity);
                // Optionally, provide user feedback for invalid input
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
             // Ensure we only store necessary product info in cart/favorites
            const productToAdd = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                // quantity here might be optional depending on how you use it
            };
            this.items.push(productToAdd);
            this.save();
            renderFavorites(); // Update favorites display
            alert(`${product.name} favorilere eklendi!`);
            updateFavoriteButtons(); // Favori butonlarının durumunu güncelle
        } else {
            alert(`${product.name} zaten favorilerde!`);
        }
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        renderFavorites(); // Update favorites display
        alert('Ürün favorilerden çıkarıldı.');
        updateFavoriteButtons(); // Favori butonlarının durumunu güncelle
    },

    isFavorite(productId) {
        return this.items.some(item => item.id === productId);
    }
};


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
        favoritesListElement.innerHTML += `
            <div class="product">
                <a href="urun-detay.html?id=${product.id}">
                     <img src="${product.image}" alt="${product.name} görseli">
                     <h3>${product.name}</h3>
                </a>
                <p>${product.price} TL</p>
                <button class="remove-favorite" onclick="favorites.remove('${product.id}')">Favoriden Çıkar</button>
                <button onclick="cart.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})">Sepete Ekle</button>
            </div>
        `;
    });
}

// Dummy product data (replace with actual data fetching)
// Ürün verileri güncellendi ve detaylandırıldı
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

    // Ürün verisini productsData'dan al
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
        // Sepete Ekle ve Favorilere Ekle butonlarına event listener'lar eklendi
        const addToCartButton = productDetailContainer.querySelector('.add-to-cart');
        if (addToCartButton) {
             addToCartButton.onclick = () => cart.add(product);
        }

        const addToFavoritesButton = productDetailContainer.querySelector('.add-to-favorites');
        if (addToFavoritesButton) {
            addToFavoritesButton.onclick = () => favorites.add(product);
        }

        // Ürün detay sayfasında favori durumunu kontrol et ve butonu güncelle
        if (addToFavoritesButton) {
             if (favorites.isFavorite(product.id)) {
                addToFavoritesButton.innerText = 'Favorilerde ✅';
                addToFavoritesButton.disabled = true;
                addToFavoritesButton.classList.add('favorited');
             } else {
                 addToFavoritesButton.innerText = 'Favorilere Ekle';
                 addToFavoritesButton.disabled = false;
                 addToFavoritesButton.classList.remove('favorited');
             }
        }


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
}


// Simple example of populating product list on index.html
function renderProductList() {
    const productListElement = document.querySelector('#featured-products .product-list');
     if (!productListElement) return;

     productListElement.innerHTML = ''; // Clear existing placeholders

    productsData.forEach(product => {
        const isFav = favorites.isFavorite(product.id);
        const favButtonText = isFav ? 'Favorilerde ✅' : 'Favorilere Ekle';
        const favButtonClass = isFav ? 'add-to-favorites favorited' : 'add-to-favorites'; // CSS için class eklendi
        const favButtonDisabled = isFav ? 'disabled' : ''; // Butonu devre dışı bırak

        productListElement.innerHTML += `
            <div class="product">
                <a href="urun-detay.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name} görseli">
                    <h3>${product.name}</h3>
                </a>
                <p>${product.price} TL</p>
                <button onclick="cart.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})">Sepete Ekle</button>
                 <button class="${favButtonClass}" onclick="favorites.add({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})" ${favButtonDisabled}>${favButtonText}</button>
            </div>
        `;
    });
     // Ürün listesi render edildikten sonra favori butonlarının durumunu güncelle
    updateFavoriteButtons();
}

// Helper function to update the state of favorite buttons across the site
function updateFavoriteButtons() {
    // Find all favorite buttons
    const favButtons = document.querySelectorAll('.add-to-favorites');

    favButtons.forEach(button => {
        // Get the product ID - this depends on how you associate the button with a product
        // A common way is to use a data attribute
        // For now, we'll rely on the onclick handler which passes product data
        // This function is mainly called after cart/favorite changes to refresh states
        // A more robust approach would involve data attributes like data-product-id="..."
    });

    // For index.html product list, we re-render the list which handles button state.
    // For product detail page, we update the specific button.
    // Let's add a check specific to the product detail page button.
    if (window.location.pathname.includes('urun-detay.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const addToFavoritesButton = document.querySelector('#product-detail .add-to-favorites');
        if (addToFavoritesButton && productId) {
             if (favorites.isFavorite(productId)) {
                addToFavoritesButton.innerText = 'Favorilerde ✅';
                addToFavoritesButton.disabled = true;
                addToFavoritesButton.classList.add('favorited');
             } else {
                 addToFavoritesButton.innerText = 'Favorilere Ekle';
                 addToFavoritesButton.disabled = false;
                 addToFavoritesButton.classList.remove('favorited');
             }
        }
    } else { // For index.html and other pages with product listings
         const productsInList = document.querySelectorAll('.product');
         productsInList.forEach(productElement => {
             // Assuming product ID can be retrieved from a link or data attribute within the product div
             // This part needs refinement based on how you add product IDs to HTML
             // For now, we'll assume the product ID is somehow accessible or the re-render is sufficient for index page.
             // Let's re-render for simplicity on index page for now.
             if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                 renderProductList(); // Re-render the entire list to update button states
             }
         });
    }
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

    // Update favorite button states on load as well
    updateFavoriteButtons();

    // Add more page-specific initializations here if needed
});

// --- Contact Form Handling ---
function initContactForm() {
    const contactForm = document.querySelector('#contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual form submission

            // Basic Frontend Validation (can be expanded)
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                alert('Lütfen tüm gerekli alanları doldurun.');
                return;
            }

            // Basic Email Format Check (can be expanded with regex)
            // Daha kapsamlı bir regex eklendi
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                 alert('Lütfen geçerli bir e-posta adresi girin.');
                 return;
            }

            // Here you would typically send the form data to a backend server
            console.log('Form Submitted!');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Subject:', document.getElementById('subject').value.trim()); // Subject is optional
            console.log('Message:', message);

            // Simulate successful submission
            alert('Mesajınız alındı! Teşekkür ederiz.');

            // Optionally clear the form
            contactForm.reset();

            // In a real application, you would use Fetch API or XMLHttpRequest to send data:
            /*
            fetch('YOUR_BACKEND_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: document.getElementById('subject').value.trim(),
                    message: message
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert('Mesajınız başarıyla gönderildi!');
                contactForm.reset();
            })
            .catch((error) => {
                console.error('Error sending form:', error);
                alert('Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            });
            */
        });
    }
}

// Basic Checkout Handler (Placeholder)
function handleCheckout() {
    if (cart.items.length === 0) {
        alert('Sepetiniz boş. Ödeme yapılamaz.');
        return;
    }
    const total = cart.getTotal();
    alert(`Toplam ${total} TL için ödeme adımına yönlendiriliyorsunuz. (Bu sadece bir simülasyondur)`);
    // In a real application, redirect to a payment page or show a payment modal
    console.log("Proceeding to checkout with items:", cart.items);
        }
            
