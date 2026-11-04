function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const nav = document.querySelector('.nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const cartButton = document.querySelector('.cart-button');
    const cartDialog = document.querySelector('.cart-dialog');
    const cartItemsElement = document.querySelector('.cart-items');
    const cartCountElement = document.getElementById('cart-count');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartSummary = document.querySelector('.cart-summary');
    const toast = document.querySelector('.toast');
    const cart = new Map();
    let toastTimer;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 3200);
    }

    function updateCart() {
        const quantity = Array.from(cart.values()).reduce(function (total, item) {
            return total + item.quantity;
        }, 0);
        const subtotal = Array.from(cart.values()).reduce(function (total, item) {
            return total + item.price * item.quantity;
        }, 0);

        cartCountElement.textContent = String(quantity);
        cartButton.setAttribute('aria-label', `Open your bouquet bag with ${quantity} ${quantity === 1 ? 'item' : 'items'}`);
        cartItemsElement.replaceChildren();

        cart.forEach(function (item, name) {
            const row = document.createElement('div');
            row.className = 'cart-item';

            const details = document.createElement('div');
            const title = document.createElement('h3');
            title.textContent = name;
            const price = document.createElement('p');
            price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
            details.append(title, price);

            const controls = document.createElement('div');
            controls.className = 'cart-item-controls';

            const decrease = document.createElement('button');
            decrease.type = 'button';
            decrease.textContent = '−';
            decrease.setAttribute('aria-label', `Remove one ${name}`);
            decrease.addEventListener('click', function () {
                if (item.quantity === 1) {
                    cart.delete(name);
                } else {
                    item.quantity -= 1;
                }
                updateCart();
            });

            const count = document.createElement('span');
            count.textContent = String(item.quantity);
            count.setAttribute('aria-label', 'Quantity');

            const increase = document.createElement('button');
            increase.type = 'button';
            increase.textContent = '+';
            increase.setAttribute('aria-label', `Add one ${name}`);
            increase.addEventListener('click', function () {
                item.quantity += 1;
                updateCart();
            });

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'cart-remove';
            remove.textContent = '×';
            remove.setAttribute('aria-label', `Remove ${name} from your bag`);
            remove.addEventListener('click', function () {
                cart.delete(name);
                updateCart();
            });

            controls.append(decrease, count, increase, remove);
            row.append(details, controls);
            cartItemsElement.append(row);
        });

        const isEmpty = quantity === 0;
        cartEmpty.hidden = !isEmpty;
        cartSummary.hidden = isEmpty;
        document.querySelector('.cart-total').textContent = `$${subtotal.toFixed(2)}`;
    }

    menuToggle.addEventListener('click', function () {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
        nav.classList.toggle('is-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            nav.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open navigation');
        });
    });

    cartButton.addEventListener('click', function () {
        cartDialog.showModal();
    });

    document.querySelector('.cart-close').addEventListener('click', function () {
        cartDialog.close();
        cartButton.focus();
    });

    cartDialog.addEventListener('click', function (event) {
        if (event.target === cartDialog) {
            cartDialog.close();
            cartButton.focus();
        }
    });

    document.querySelector('.cart-shop-link').addEventListener('click', function () {
        cartDialog.close();
        scrollToSection('flowers');
    });

    document.querySelectorAll('.btn-secondary[data-name]').forEach(function (button) {
        button.addEventListener('click', function () {
            const name = button.dataset.name;
            const price = Number(button.dataset.price);
            if (!name || !Number.isFinite(price) || price <= 0) {
                showToast('Sorry, we couldn’t add that bouquet. Please try again.');
                return;
            }

            const item = cart.get(name);
            if (item) {
                item.quantity += 1;
            } else {
                cart.set(name, { price, quantity: 1 });
            }
            updateCart();
            showToast(`${name} added to your bouquet bag ♡`);
        });
    });

    const moodMessages = {
        love: 'A little romance, coming right up. These bouquets are full of heart.',
        joy: 'Sunshine in flower form. Here are a few ways to make them smile.',
        thanks: 'A thoughtful thank-you, wrapped up in something lovely.'
    };

    document.querySelectorAll('.mood-button').forEach(function (button) {
        button.addEventListener('click', function () {
            const mood = button.dataset.mood;
            document.querySelectorAll('.mood-button').forEach(function (option) {
                option.setAttribute('aria-pressed', String(option === button));
            });

            document.querySelectorAll('.flower-card').forEach(function (card) {
                const matchesMood = card.dataset.moods.split(' ').includes(mood);
                card.classList.toggle('is-recommended', matchesMood);
            });

            document.getElementById('mood-response').textContent = moodMessages[mood];
            scrollToSection('flowers');
        });
    });

    document.querySelector('.contact-form form').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        if (name) {
            showToast(`Thanks, ${name}! This demo form isn’t connected yet—please email us directly.`);
            this.reset();
        }
    });

    document.querySelector('.cart-checkout').addEventListener('click', function () {
        showToast('Lovely choice! Call or email us to arrange your flower delivery.');
    });
});
