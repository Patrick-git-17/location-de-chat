// Cart functionality
      let cart = [];
      let quantities = {
        minou: 1,
        luna: 1,
        felix: 1,
        bella: 1,
      };

      function changeQuantity(catId, change) {
        quantities[catId] = Math.max(1, quantities[catId] + change);
        document.getElementById(`quantity-${catId}`).textContent =
          quantities[catId];
      }

      function addToCart(catId, name, price, emoji) {
        const existingItem = cart.find((item) => item.id === catId);
        const quantity = quantities[catId];

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({
            id: catId,
            name: name,
            price: price,
            emoji: emoji,
            quantity: quantity,
          });
        }

        updateCartDisplay();
        updateCartCount();

        // Show success animation on button
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = "Ajouté! ✓";
        button.style.background = "#D4A574"; // Keep within theme
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = "#D4A574";
        }, 1500);
      }

      function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById("cartCount").textContent = totalItems;
      }

      function updateCartDisplay() {
        const cartContent = document.getElementById("cartContent");
        const checkoutBtn = document.querySelector(".checkout-btn");

        if (cart.length === 0) {
          cartContent.innerHTML = `
                    <div class="empty-cart">
                        <div class="empty-cart-icon">🛒</div>
                        <p>Votre panier est vide</p>
                    </div>
                `;
          if (checkoutBtn) checkoutBtn.disabled = true; // Disable checkout if cart is empty
          return;
        }

        let cartHTML = "";
        let total = 0;

        cart.forEach((item) => {
          const itemTotal = item.price * item.quantity;
          total += itemTotal;

          cartHTML += `
                    <div class="cart-item">
                        <div class="cart-item-image">${item.emoji}</div>
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${item.price}€/jour</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">×</button>
                    </div>
                `;
        });

        cartHTML += `
                <div class="cart-total">
                    <div class="cart-total-line">
                        <span>Sous-total:</span>
                        <span>${total}€</span>
                    </div>
                    <div class="cart-total-line">
                        <span>Frais de service:</span>
                        <span>15€</span>
                    </div>
                    <div class="cart-total-line">
                        <span>Assurance:</span>
                        <span>10€</span>
                    </div>
                    <div class="cart-total-line cart-total-final">
                        <span>Total:</span>
                        <span>${total + 25}€</span>
                    </div>
                    <button class="checkout-btn" onclick="proceedToCheckout()">Procéder au paiement</button>
                </div>
            `;

        cartContent.innerHTML = cartHTML;
        if (checkoutBtn) checkoutBtn.disabled = false; // Enable checkout if cart has items
      }

      function updateCartQuantity(catId, change) {
        const item = cart.find((item) => item.id === catId);
        if (item) {
          item.quantity = Math.max(1, item.quantity + change);
          updateCartDisplay();
          updateCartCount();
        }
      }

      function removeFromCart(catId) {
        cart = cart.filter((item) => item.id !== catId);
        updateCartDisplay();
        updateCartCount();
      }

      function toggleCart() {
        const sidebar = document.getElementById("cartSidebar");
        const overlay = document.getElementById("overlay");

        if (sidebar.classList.contains("open")) {
          sidebar.classList.remove("open");
          overlay.classList.remove("active");
        } else {
          sidebar.classList.add("open");
          overlay.classList.add("active");
        }
      }

      function proceedToCheckout() {
        if (cart.length === 0) {
          alert("Votre panier est vide et ne peut pas être commandé !");
          return;
        }
        showPaymentPage();
        toggleCart();
      }

      function showPaymentPage() {
        document.getElementById("mainContent").style.display = "none";
        document.getElementById("paymentPage").classList.add("active");
        updateOrderSummary();

        // Set minimum date to today
        const today = new Date().toISOString().split("T")[0];
        document.getElementById("startDate").min = today;
        document.getElementById("endDate").min = today;
      }

      function showHomePage() {
        document.getElementById("mainContent").style.display = "block";
        document.getElementById("paymentPage").classList.remove("active");
      }

      function updateOrderSummary() {
        const orderItems = document.getElementById("orderItems");
        let itemsHTML = "";
        let subtotal = 0;

        cart.forEach((item) => {
          const itemTotal = item.price * item.quantity;
          subtotal += itemTotal;

          itemsHTML += `
                    <div class="summary-item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>${itemTotal}€</span>
                    </div>
                `;
        });

        orderItems.innerHTML = itemsHTML;
        document.getElementById("subtotal").textContent = subtotal + "€";
        document.getElementById("finalTotal").textContent = subtotal + 25 + "€"; // Base fees + insurance
      }

      function placeOrder() {
        // Validate form
        const form = document.getElementById("reservationForm");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        if (cart.length === 0) {
          alert(
            "Votre panier est vide. Veuillez ajouter des chats avant de réserver."
          );
          return;
        }

        // Show success message
        document.getElementById("overlay").classList.add("active");
        document.getElementById("successMessage").classList.add("active");

        // Clear cart
        cart = [];
        updateCartCount();
        updateCartDisplay(); // Update cart sidebar to show empty message
      }

      function closeSuccessMessage() {
        document.getElementById("overlay").classList.remove("active");
        document.getElementById("successMessage").classList.remove("active");
        showHomePage();
      }

      // Payment method selection
      document.querySelectorAll(".payment-method").forEach((method) => {
        method.addEventListener("click", function () {
          document
            .querySelectorAll(".payment-method")
            .forEach((m) => m.classList.remove("selected"));
          this.classList.add("selected");

          // Show/hide payment details based on selection
          const cardDetails = document.getElementById("cardDetails");
          if (this.dataset.method === "card") {
            cardDetails.style.display = "block";
            // Make card fields required when selected
            document.getElementById("cardNumber").setAttribute("required", "");
            document.getElementById("expiryDate").setAttribute("required", "");
            document.getElementById("cvv").setAttribute("required", "");
            document.getElementById("cardName").setAttribute("required", "");
          } else {
            cardDetails.style.display = "none";
            // Remove required attribute when not selected
            document.getElementById("cardNumber").removeAttribute("required");
            document.getElementById("expiryDate").removeAttribute("required");
            document.getElementById("cvv").removeAttribute("required");
            document.getElementById("cardName").removeAttribute("required");
          }
        });
      });

      // Smooth scrolling for navigation links
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute("href"));
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
          // Close cart if open when navigating
          const cartSidebar = document.getElementById("cartSidebar");
          if (cartSidebar.classList.contains("open")) {
            toggleCart();
          }
        });
      });

      // Animation on scroll
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target); // Stop observing once animated
          }
        });
      }, observerOptions);

      // Observe all fade-in elements
      document.querySelectorAll(".fade-in").forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        observer.observe(el);
      });

      // Interactive cat cards
      document.querySelectorAll(".cat-card").forEach((card) => {
        card.addEventListener("mouseenter", function () {
          this.style.transform = "translateY(-10px) scale(1.02)";
        });

        card.addEventListener("mouseleave", function () {
          this.style.transform = "translateY(0) scale(1)";
        });
      });

      // Header background change on scroll
      window.addEventListener("scroll", function () {
        const header = document.querySelector("header");
        if (window.scrollY > 100) {
          header.style.background = "rgba(139, 69, 19, 0.95)"; /* Darker brown with opacity */
          header.style.backdropFilter = "blur(10px)";
        } else {
          header.style.background =
            "linear-gradient(135deg, #D4A574 0%, #8B4513 100%)";
          header.style.backdropFilter = "none";
        }
      });

      // Close cart when clicking overlay
      document.getElementById("overlay").addEventListener("click", function () {
        const cartSidebar = document.getElementById("cartSidebar");
        const successMessage = document.getElementById("successMessage");

        if (cartSidebar.classList.contains("open")) {
          toggleCart();
        } else if (successMessage.classList.contains("active")) {
          closeSuccessMessage();
        }
      });

      // Date validation
      document
        .getElementById("startDate")
        .addEventListener("change", function () {
          const startDate = new Date(this.value);
          const endDateInput = document.getElementById("endDate");

          // Set minimum end date to start date
          endDateInput.min = this.value;

          // If end date is before start date, clear it
          if (endDateInput.value && new Date(endDateInput.value) < startDate) {
            endDateInput.value = "";
          }
        });

      // Card number formatting
      document
        .getElementById("cardNumber")
        .addEventListener("input", function () {
          let value = this.value.replace(/\s/g, "");
          let formattedValue = value.replace(/(.{4})/g, "$1 ").trim();
          if (formattedValue.length > 19) {
            formattedValue = formattedValue.substring(0, 19);
          }
          this.value = formattedValue;
        });

      // Expiry date formatting
      document
        .getElementById("expiryDate")
        .addEventListener("input", function () {
          let value = this.value.replace(/\D/g, "");
          if (value.length >= 2) {
            value = value.substring(0, 2) + "/" + value.substring(2, 4);
          }
          this.value = value;
        });

      // CVV validation
      document.getElementById("cvv").addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").substring(0, 3);
      });

      // Initial update for cart display and count on page load
      document.addEventListener("DOMContentLoaded", () => {
        updateCartCount();
        updateCartDisplay();
        // Ensure card details are hidden by default unless card is selected
        document.getElementById("cardDetails").style.display = "block"; // Start with card selected based on HTML
        document
          .querySelector('.payment-method[data-method="card"]')
          .click(); // Programmatically click to set required attributes
      });