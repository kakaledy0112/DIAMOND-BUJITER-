// script.js

// Initialize cart and favorites from local storage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Function to save cart and favorites to local storage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Function to add product to cart
function addToCart(product) {
    // Check if the product already exists in the cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        // If product exists, increase quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // If product doesn't exist, add with quantity 1
        cart.push({...product, quantity: 1});
    }

    saveCart();
    renderCart(); // Update cart display
    alert(`${product.name} sepete eklendi!`); // Simple notification
}

// Function to remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart(); // Update cart display
    alert('Ürün sepetten çıkarıldı.');
}

// Function to update product quantity in cart
function updateCartQuantity(productId, quantity) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity = quantity;
        if (product.quantity <= 0) {
            removeFromCart(productId); // Remove if quantity is 0 or less
        } else {
            saveCart();
            renderCart(); // Update cart display
        }
    }
}

// Function to render cart items on sepet.html
function renderCart() {
    const cartListElement = document.querySelector('.cart-list');
    const cartSummaryElement = document.querySelector('.cart-summary');

    if (!cartListElement || !cartSummaryElement) return; // Only run on sepet.html

    cartListElement.innerHTML = ''; // Clear current list
    let total = 0;

    if (cart.length === 0) {
        cartListElement.innerHTML = '<p>Sepetiniz boş.</p>';
        cartSummaryElement.innerHTML = '';
        return;
    }

    cart.forEach(product => {
        const itemTotal = product.price * product.quantity;
        total += itemTotal;
        cartListElement.innerHTML += `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}" width="50">
                <div class="item-details">
                    <h3>${product.name}</h3>
                    <p>${product.price} TL</p>
                    <div class="quantity-control">
                        <button onclick="updateCartQuantity('${product.id}', ${product.quantity - 1})">-</button>
                        <span>${product.quantity}</span>
                        <button onclick="updateCartQuantity('${product.id}', ${product.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart('${product.id}')">Kaldır</button>
                </div>
            </div>
        `;
    });

    cartSummaryElement.innerHTML = `
        <h3>Toplam: ${total} TL</h3>
        <button class="checkout-button">Ödeme Yap</button>
    `;
}

// Function to add product to favorites
function addToFavorites(product) {
    const existingProduct = favorites.find(item => item.id === product.id);

    if (!existingProduct) {
        favorites.push(product);
        saveFavorites();
        renderFavorites(); // Update favorites display
        alert(`${product.name} favorilere eklendi!`);
    } else {
        alert(`${product.name} zaten favorilerde!`);
    }
}

// Function to remove product from favorites
function removeFromFavorites(productId) {
    favorites = favorites.filter(item => item.id !== productId);
    saveFavorites();
    renderFavorites(); // Update favorites display
    alert('Ürün favorilerden çıkarıldı.');
}

// Function to render favorite items on favoriler.html
function renderFavorites() {
    const favoritesListElement = document.querySelector('.favorites-list');

    if (!favoritesListElement) return; // Only run on favoriler.html

    favoritesListElement.innerHTML = ''; // Clear current list

    if (favorites.length === 0) {
        favoritesListElement.innerHTML = '<p>Favori listeniz boş.</p>';
        return;
    }

    favorites.forEach(product => {
        favoritesListElement.innerHTML += `
            <div class="product">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.price} TL</p>
                <button class="remove-favorite" onclick="removeFromFavorites('${product.id}')">Favoriden Çıkar</button>
                <button onclick="addToCart('${product.id}')">Sepete Ekle</button>
            </div>
        `;
    });
}

// Function to display product detail on urun-detay.html (basic example using URL params)
function renderProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); // Assuming product ID is passed in URL

    // In a real site, you would fetch product data based on ID from an API or list
    // For this example, we'll use placeholder or dummy data if no ID is found
    const dummyProduct = {
        id: 'dummy-1',
        name: 'Örnek Ürün',
        price: 200,
        image: 'placeholder.jpg',
        description: 'Bu bir örnek ürün açıklamasıdır. Detaylı bilgiler burada yer alır.'
    };

    const productDetailContainer = document.querySelector('.product-detail-container');

    if (!productDetailContainer) return; // Only run on urun-detay.html

    // Use dummy data for demonstration
    productDetailContainer.querySelector('.product-image img').src = dummyProduct.image;
    productDetailContainer.querySelector('.product-image img').alt = dummyProduct.name;
    productDetailContainer.querySelector('.product-name').innerText = dummyProduct.name;
    productDetailContainer.querySelector('.product-price').innerText = `${dummyProduct.price} TL`;
    productDetailContainer.querySelector('.product-description p').innerText = dummyProduct.description;
    // Attach event listeners to buttons
    productDetailContainer.querySelector('.add-to-cart').onclick = () => addToCart(dummyProduct);
    productDetailContainer.querySelector('.add-to-favorites').onclick = () => addToFavorites(dummyProduct);

}


// Simple example of populating product list on index.html (you'd replace this with actual data)
function renderProductList() {
    const productListElement = document.querySelector('#featured-products .product-list');
     if (!productListElement) return; // Only run on index.html

     // Clear existing placeholders
     productListElement.innerHTML = '';

    // Dummy products array (replace with your actual product data)
    const products = [
        { id: 'p1', name: 'Şık Yüzük', price: 150, image: 'placeholder.jpg' },
        { id: 'p2', name: 'Zarif Kolye', price: 250, image: 'placeholder.jpg' },
        { id: 'p3', name: 'Modern Saat', price: 400, image: 'placeholder.jpg' },
        { id: 'p4', name: 'Klasik Küpe', price: 80, image: 'placeholder.jpg' },
    ];

    products.forEach(product => {
        productListElement.innerHTML += `
            <div class="product">
                <a href="urun-detay.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                </a>
                <p>${product.price} TL</p>
                <button onclick="addToCart({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})">Sepete Ekle</button>
                 <button onclick="addToFavorites({id: '${product.id}', name: '${product.name}', price: ${product.price}, image: '${product.image}'})">Favorilere Ekle</button>
            </div>
        `;
    });
}


// Event listeners for page load
window.addEventListener('load', () => {
    // Render content based on the current page
    if (window.location.pathname.includes('sepet.html')) {
        renderCart();
    } else if (window.location.pathname.includes('favoriler.html')) {
        renderFavorites();
    } else if (window.location.pathname.includes('urun-detay.html')) {
        renderProductDetail();
    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
         renderProductList(); // Render products on homepage
    }

    // Add more page-specific initializations here if needed
});


// Basic Contact Form Submission (Frontend only)
const contactForm = document.querySelector('#contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent actual form submission

        // Here you would typically send the form data to a backend server
        console.log('Form Submitted!');
        console.log('Name:', document.getElementById('name').value);
        console.log('Email:', document.getElementById('email').value);
        console.log('Subject:', document.getElementById('subject').value);
        console.log('Message:', document.getElementById('message').value);

        alert('Mesajınız alındı! Teşekkür ederiz.'); // Simple confirmation

        // Optionally clear the form
        contactForm.reset();
    });
}
