class CartManager {
  constructor() {
    this.items = this.loadCartItems();
    this.currentUser = this.getCurrentUser();
    this.updateCartBadge();
  }

  loadCartItems() {
    const items = localStorage.getItem("restaurant-cart");
    return items ? JSON.parse(items) : [];
  }

  saveCartItems() {
    localStorage.setItem("restaurant-cart", JSON.stringify(this.items));
    this.updateCartBadge();
  }

  getCurrentUser() {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  addItem(product) {
    const existingItem = this.items.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        category: product.category,
        addedAt: new Date().toISOString(),
      });
    }
    this.saveCartItems();
    this.showAddToCartAnimation(product);
    this.refreshCartDisplay();
    return true;
  }

  removeItem(productId) {
    const item = this.items.find((item) => item.id === productId);
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCartItems();
    if (item) {
      this.showCartNotification(`${item.name} removed from cart!`, "danger");
    }

    this.refreshCartDisplay();
    return true;
  }

  showCartNotification(
    message,
    type = "success",
    icon = "fas fa-shopping-cart"
  ) {
    const notification = document.createElement("div");
    notification.className = `card-notification card-notification-${type} alert-dismissible fade show`;
    let iconClass;
    switch (type) {
      case "success":
        iconClass = "fas fa-plus-circle";
        break;
      case "danger":
        iconClass = "fas fa-trash-alt";
        break;
      case "warning":
        iconClass = "fas fa-minus-circle";
        break;
      case "info":
        iconClass = "fas fa-info-circle";
        break;
      default:
        iconClass = "fas fa-shopping-cart";
        break;
    }
    notification.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="${iconClass} me-2"></i>
      <span>${message}</span>
    </div>
    
    
    `;

    const existingNotifications = document.querySelectorAll(".card-notification");
    const topPosition = 100 + existingNotifications.length * 70;
    notification.style.cssText = `
    position: fixed;
    top: ${topPosition}px;
    right: 20px;
    z-index: 1000;
    animation: fadeIn 0.3s ease-in-out;
    width: 300px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    padding: 15px;
    margin-bottom: 10px;
    border: 1px solid #e0e0e0;
    color: #333;
    font-size: 14px;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateY(100%)";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 3000);
    }, 3000);
  }

  refreshCartDisplay() {
    this.updateCartBadge();
    renderCartInDashboard();
  }

  updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    if (badge) {
      const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-block" : "none";
    }
  }


  showAddToCartAnimation(product) {
    this.showCartNotification(
      `${product.name} added to cart`,
      "success",
      "fas fa-shopping-cart"
    );
  }
}

// Instantiate CartManager globally
const cardManager = new CartManager();

// --- Modal Helper ---
function showBootstrapModal(title, content, buttons = []) {
    let modalEl = document.getElementById('dynamicModal');
    
    // Create modal if it doesn't exist
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'dynamicModal';
        modalEl.className = 'modal fade';
        modalEl.setAttribute('tabindex', '-1');
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);
    }
    
    // Update Content
    modalEl.querySelector('.modal-title').textContent = title;
    modalEl.querySelector('.modal-body').innerHTML = content;
    
    // Update Buttons
    const footer = modalEl.querySelector('.modal-footer');
    footer.innerHTML = '';
    
    if(buttons.length === 0) {
        // Default Close Button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-secondary';
        closeBtn.setAttribute('data-bs-dismiss', 'modal');
        closeBtn.textContent = 'Close';
        footer.appendChild(closeBtn);
    } else {
        buttons.forEach(btnConfig => {
            const btn = document.createElement('button');
            btn.className = `btn ${btnConfig.class || 'btn-primary'}`;
            btn.textContent = btnConfig.label;
            if (btnConfig.dismiss) {
                btn.setAttribute('data-bs-dismiss', 'modal');
            }
            if (btnConfig.onClick) {
                btn.onclick = () => {
                   btnConfig.onClick();
                   // Close modal if needed, or let handler do it
                   const modalInstance = bootstrap.Modal.getInstance(modalEl);
                   if(!btnConfig.keepOpen) modalInstance.hide();
                };
            }
            footer.appendChild(btn);
        });
    }

    // Show Modal using Bootstrap API
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}


// --- Auth Functions ---
function login(email, password) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    cardManager.showCartNotification(`Welcome back, ${user.name}!`, "success", "fas fa-user-check");
    setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "admin-dashboard.html";
        } else {
          window.location.href = "customer-dashboard.html";
        }
    }, 1000);
  } else {
    cardManager.showCartNotification("Invalid email or password", "danger", "fas fa-exclamation-circle");
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

function checkAuth() {
  const user = cardManager.getCurrentUser();
  const currentPath = window.location.pathname;
  const isDashboard = currentPath.includes("dashboard.html");

  if (!user && isDashboard) {
    window.location.href = "login.html"; 
  }
}


// --- Dashboard Functions ---
function showSection(sectionId) {
  document.querySelectorAll(".dashboard-section").forEach((section) => {
    section.style.display = "none";
  });
  const target = document.getElementById(sectionId);
  if(target){
      target.style.display = "block";
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  
  const activeLink = document.querySelector(`a[onclick="showSection('${sectionId}')"]`);
  if(activeLink) activeLink.classList.add('active');

  // Trigger specific renders if needed
  if(sectionId === 'my-orders') {
      renderOrders();
  }
}


// --- Helpers ---

function addCard(ProductElement) {
  const productCard = ProductElement.closest(".product-card");
  const productName = productCard.querySelector(".product-title").textContent?.replace("$", "") || "0";
  const productPrice = productCard.querySelector(".product-price").textContent?.replace("$", "") || "0";
  
  const categoryEl = productCard.closest('.product-item');
  const productCategory = categoryEl ? categoryEl.getAttribute('data-category') : 'appetizers';

  const productImageStyle = productCard.querySelector(".product-image").style.backgroundImage || "";

  let productImage = "";
  if (productImageStyle) {
    const urlMatch = productImageStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
    productImage = urlMatch ? urlMatch[1] : "";
  }

  const productId = productName.replace(/\s+/g, '-').toLowerCase();

  const product = {
    id: productId,
    name: productName,
    price: parseFloat(productPrice),
    category: productCategory,
    image: productImage,
  };
  cardManager.addItem(product);
}

function initializeCategoryFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productItems = document.querySelectorAll(".product-item");
  
  if(!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      filterButtons.forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");

      filterProducts(filter, productItems);
    });
  });
}
function filterProducts(filter, productItems) {
  let visibleCount = 0;
  productItems.forEach((item) => {
     const itemCategory = item.getAttribute("data-category");
     
    if (filter === "all" || itemCategory === filter) {
      item.style.display = "block";
      item.parentElement.style.display = "block"; 
      item.style.animation = "fadeIn 0.5s ease-in-out";
      visibleCount++;
    } else {
      item.style.display = "none";
      item.parentElement.style.display = "none"; 
      item.style.animation = "fadeOut 0.5s ease-in-out";
    }
  });
  showFilterMessage(filter, visibleCount);
}

function showFilterMessage(filter, count) {
  const existingMessage = document.querySelector(".no-items-message");
  if (existingMessage) {
    existingMessage.remove();
  }
  
  if (count === 0 && filter !== "all") {
    const menuSection = document.getElementById("menu") || document.querySelector(".row.mb-4")?.parentElement; 
    const message = document.createElement("div");
    message.className = "no-items-message text-center py-5";
    message.innerHTML = `<p class="lead text-muted">No items found for ${filter}.</p>`;
    if(menuSection) menuSection.appendChild(message);
  }
}

function initializerCartBadge() {
    cardManager.updateCartBadge();
}

function setupNavigation() {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const dashboardBtn = document.getElementById("dashboardBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const cartBtn = document.getElementById("cartBtn");
    const user = cardManager.getCurrentUser();

    if (user) {
        if(loginBtn) loginBtn.classList.add("d-none");
        if(registerBtn) registerBtn.classList.add("d-none");
        if(dashboardBtn) {
            dashboardBtn.classList.remove("d-none");
            dashboardBtn.onclick = function() {
                if(user.role === 'admin') window.location.href = 'admin-dashboard.html';
                else window.location.href = 'customer-dashboard.html';
            };
        }
        if(logoutBtn) {
            logoutBtn.classList.remove("d-none");
            logoutBtn.onclick = logout;
        }
    } else {
        if(loginBtn) {
            loginBtn.classList.remove("d-none");
            loginBtn.onclick = function() { window.location.href = 'login.html'; };
        }
        if(registerBtn) {
            registerBtn.classList.remove("d-none");
            registerBtn.onclick = function() { window.location.href = 'login.html'; }; 
        }
        if(dashboardBtn) dashboardBtn.classList.add("d-none");
        if(logoutBtn) logoutBtn.classList.add("d-none");
    }

    if(cartBtn) {
        cartBtn.onclick = function() {
            if(cardManager.items.length === 0) {
                 cardManager.showCartNotification("Your cart is empty! Add some delicious items first.", "warning");
                 return;
            }

            if(user) {
                if(user.role === 'customer') window.location.href = 'customer-dashboard.html?section=my-card';
                else window.location.href = 'admin-dashboard.html'; 
            } else {
                 cardManager.showCartNotification("Please login to view your cart", "info");
                 setTimeout(() => window.location.href = "login.html", 1500);
            }
        };
    }
}

// Function to render cart in dashboard and handle checkout button
function renderCartInDashboard() {
    const cartItemsContainer = document.querySelector("#carItems"); 
    const summaryTotalItems = document.getElementById("summary-total-items");
    const summaryTotalPrice = document.getElementById("summary-total-price");
    
    if(!cartItemsContainer) return;
    
    // Update Checkout Button
    const checkoutBtn = document.getElementById('proceedCheckoutBtn');
    
    const items = cardManager.items;
    
    // Calculate totals
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if(summaryTotalItems) summaryTotalItems.textContent = totalItems;
    if(summaryTotalPrice) summaryTotalPrice.textContent = "$" + totalPrice.toFixed(2);

    // RESTRICTION: Disable checkout if empty
    if(items.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center p-3">Your cart is empty</p>';
        if(checkoutBtn) {
            checkoutBtn.classList.add('btn-disabled');
            checkoutBtn.onclick = null;
        }
        return;
    } else {
        if(checkoutBtn) {
            checkoutBtn.classList.remove('btn-disabled');
            checkoutBtn.onclick = function() {
                 window.location.href = 'checkout.html';
            };
        }
    }

    cartItemsContainer.innerHTML = items.map(item => `
        <div class="card-item border border-bottom py-3">
            <div class="row align-items-center px-3">
                <div class="col-md-2">
                    <div class="cart-item-image" style="width: 60px; height: 60px; background-image: url('${item.image || ''}'); background-size: cover; background-position: center; border-radius: 8px;"></div>
                </div>
                <div class="col-md-4">
                    <h6>${item.name}</h6>
                    <small class="text-muted">${item.category}</small>
                </div>
                 <div class="col-md-3">
                    <div class="quantity-controls d-flex align-items-center">
                      <span class="mx-3 f-bold">Qty: ${item.quantity}</span>
                    </div>
                  </div>
                <div class="col-md-2">
                    <strong class="text-primary">$${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-sm btn-outline-danger" onclick="cardManager.removeItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Order Management
function renderOrders() {
    const ordersBody = document.getElementById("ordersItems");
    if(!ordersBody) return;

    const orders = JSON.parse(localStorage.getItem("restaurant-orders") || "[]");
    const currentUser = cardManager.getCurrentUser();
    
    // Filter for current user
    const userOrders = orders.filter(o => o.userEmail === currentUser.email);
    userOrders.sort((a,b) => new Date(b.date) - new Date(a.date)); // Newest first

    if (userOrders.length === 0) {
        ordersBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found.</td></tr>';
        return;
    }

    ordersBody.innerHTML = userOrders.map(order => `
        <tr>
          <td>#${order.id}</td>
          <td>${new Date(order.date).toLocaleDateString()}</td>
          <td>${order.items.reduce((s, i)=>s+i.quantity,0)} Items</td>
          <td>$${order.total.toFixed(2)}</td>
          <td><span class="badge ${getStatusBadge(order.status)}">${order.status}</span></td>
          <td>
            <button class="btn btn-sm btn-primary me-2" onclick="viewOrder('${order.id}')">View</button>
            ${order.status === 'Pending' ? `<button class="btn btn-sm btn-danger" onclick="cancelOrder('${order.id}')">Cancel</button>` : ''}
          </td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    switch(status) {
        case 'Pending': return 'bg-warning text-dark';
        case 'Completed': return 'bg-success';
        case 'Cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function viewOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem("restaurant-orders") || "[]");
    const order = orders.find(o => o.id === orderId);
    if(!order) return;

    const itemsHtml = order.items.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${item.name}
            <span>${item.quantity} x $${item.price.toFixed(2)}</span>
        </li>
    `).join('');

    const content = `
        <div class="row mb-3">
            <div class="col-6">
                <strong>Date:</strong> ${new Date(order.date).toLocaleString()}
            </div>
            <div class="col-6 text-end">
                <strong>Status:</strong> <span class="badge ${getStatusBadge(order.status)}">${order.status}</span>
            </div>
        </div>
        <h6>Order Items:</h6>
        <ul class="list-group mb-3">
            ${itemsHtml}
        </ul>
        <div class="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5 class="text-primary">$${order.total.toFixed(2)}</h5>
        </div>
        <hr>
        <h6>Shipping Details:</h6>
        <p class="mb-0">
            ${order.shipping.firstName} ${order.shipping.lastName}<br>
            ${order.shipping.address}
        </p>
    `;

    showBootstrapModal(`Order Details #${order.id}`, content, [
        { label: "Close", class: "btn-secondary", dismiss: true }
    ]);
}

function cancelOrder(orderId) {
    showBootstrapModal(
        "Cancel Order?",
        "<p>Are you sure you want to cancel this order? This action cannot be undone.</p>",
        [
            { label: "No, Keep Order", class: "btn-secondary", dismiss: true },
            { 
                label: "Yes, Cancel Order", 
                class: "btn-danger",
                onClick: () => {
                    const orders = JSON.parse(localStorage.getItem("restaurant-orders") || "[]");
                    const orderIndex = orders.findIndex(o => o.id === orderId);
                    
                    if(orderIndex > -1) {
                        orders[orderIndex].status = "Cancelled";
                        localStorage.setItem("restaurant-orders", JSON.stringify(orders));
                        renderOrders();
                        cardManager.showCartNotification("Order cancelled successfully", "info");
                    }
                }
            }
        ]
    );
}


function showOrderSuccess() {
    const overlay = document.createElement("div");
    overlay.className = "order-success-overlay";
    overlay.innerHTML = `
        <div class="checkmark-circle">
            <div class="checkmark"></div>
        </div>
        <div class="order-success-text">Order Placed Successfully!</div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            overlay.remove();
             window.location.href = 'customer-dashboard.html?section=my-orders';
        }, 500);
    }, 2500);
}


function initCheckout() {
    const cartItemsContainer = document.getElementById("checkout-cart-items");
    const totalItemsEl = document.getElementById("checkout-total-items");
    const totalPriceEl = document.getElementById("checkout-total-price");
    const checkoutForm = document.getElementById("checkout-form");

    if(!cartItemsContainer) return;

    // CHECKOUT RESTRICTION
    if(cardManager.items.length === 0) {
        cardManager.showCartNotification("Your cart is empty.", "warning");
        setTimeout(() => window.location.href = "index.html", 1500);
        return;
    }

    const items = cardManager.items;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if(totalItemsEl) totalItemsEl.textContent = totalItems;
    if(totalPriceEl) totalPriceEl.textContent = "$" + totalPrice.toFixed(2);

    cartItemsContainer.innerHTML = items.map(item => `
        <li class="list-group-item d-flex justify-content-between lh-condensed">
            <div>
                <h6 class="my-0">${item.name}</h6>
                <small class="text-muted">Qty: ${item.quantity}</small>
            </div>
            <span class="text-muted">$${(item.price * item.quantity).toFixed(2)}</span>
        </li>
    `).join('');

    if(checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if(!this.checkValidity()) {
                 e.stopPropagation();
                 this.classList.add('was-validated');
                 return;
            }
            
            // Save Order
            const currentUser = cardManager.getCurrentUser();
            const newOrder = {
                id: Math.floor(Math.random() * 100000).toString(),
                date: new Date().toISOString(),
                userEmail: currentUser.email,
                items: cardManager.items,
                total: totalPrice,
                status: "Pending",
                shipping: {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    address: document.getElementById('address').value
                }
            };
            
            const orders = JSON.parse(localStorage.getItem("restaurant-orders") || "[]");
            orders.push(newOrder);
            localStorage.setItem("restaurant-orders", JSON.stringify(orders));

            // Clear Cart and Show Effect
            cardManager.items = [];
            cardManager.saveCartItems();
            
            showOrderSuccess();
        });
    }
}


// --- Admin Dashboard Functions ---
function renderAdminDashboard() {
    const orders = JSON.parse(localStorage.getItem("restaurant-orders") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Stats Elements
    const totalOrdersEl = document.getElementById("admin-total-orders");
    const totalRevenueEl = document.getElementById("admin-total-revenue");
    const totalCustomersEl = document.getElementById("admin-total-customers");
    const recentOrdersBody = document.getElementById("admin-recent-orders-body");
    const allOrdersBody = document.getElementById("admin-all-orders-body");
    const customersBody = document.getElementById("admin-customers-body");


    // 1. Stats Calculations
    const totalRevenue = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.total, 0);
    
    const customers = users.filter(u => u.role === 'customer');

    if(totalOrdersEl) totalOrdersEl.textContent = orders.length;
    if(totalRevenueEl) totalRevenueEl.textContent = "$" + totalRevenue.toFixed(2);
    if(totalCustomersEl) totalCustomersEl.textContent = customers.length;
    
    // 2. Recent Orders (Last 5)
    if(recentOrdersBody) {
        const recentOrders = [...orders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        if(recentOrders.length === 0) {
            recentOrdersBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders yet.</td></tr>';
        } else {
            recentOrdersBody.innerHTML = recentOrders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.shipping.firstName} ${order.shipping.lastName}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>${order.items.length}</td>
                    <td>$${order.total.toFixed(2)}</td>
                    <td><span class="badge ${getStatusBadge(order.status)}">${order.status}</span></td>
                </tr>
            `).join('');
        }
    }

    // 3. All Orders Table
    if(allOrdersBody) {
        if(orders.length === 0) {
            allOrdersBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found.</td></tr>';
        } else {
            allOrdersBody.innerHTML = orders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.shipping.firstName} ${order.shipping.lastName}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td><span class="badge ${getStatusBadge(order.status)}">${order.status}</span></td>
                    <td>$${order.total.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-info text-white" onclick="viewOrder('${order.id}')">View</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // 4. Customers Table
    if(customersBody) {
        if(customers.length === 0) {
            customersBody.innerHTML = '<tr><td colspan="3" class="text-center">No customers found.</td></tr>';
        } else {
            customersBody.innerHTML = customers.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                </tr>
            `).join('');
        }
    }
}


// --- Event Listeners ---

document.addEventListener("DOMContentLoaded", function () {
  initializerCartBadge();
  
  // Initial static buttons (if any left)
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      addCard(this);
    });
  });

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email, password);
      });
  }

  // Default Users setup
  const defaultUsers = [
    {
      id: 1,
      email: "admin@restaurant.com",
      password: "admin123",
      role: "admin",
      name: "alaa eldin alhallak",
    },
    {
      id: 2,
      email: "customer@restaurant.com",
      password: "customer123",
      role: "customer",
      name: "mohammed",
    },
  ];

  if(!localStorage.getItem("users")) {
      localStorage.setItem("users", JSON.stringify(defaultUsers));
  }
  
  // Render Menu if on index page
  if(document.getElementById('menu-container')) {
      renderMenu();
      initializeCategoryFilters(); 
  } else {
       initializeCategoryFilters(); 
  }

  setupNavigation();
  initCheckout();
  
  // Page Specific Init
  if (window.location.pathname.includes("admin-dashboard.html")) {
      checkAuth();
      renderAdminDashboard();
      
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      if(section) showSection(section);
  }
  
  if (window.location.pathname.includes("customer-dashboard.html")) {
      checkAuth();
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get("section");
      if (section) {
        showSection(section);
      } else {
         showSection('profile');
      }
      renderCartInDashboard();
      renderOrders();
      
      const user = cardManager.getCurrentUser();
      if(user) {
          document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.name);
      }
  }
  
  if (window.location.pathname.includes("checkout.html")) {
       checkAuth();
       initCheckout();
  }
});

// --- Menu Data & Rendering ---

const menuItems = [
    // APPETIZERS
    {
        id: "caesar-salad",
        name: "Caesar Salad",
        category: "appetizers",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Fresh romaine lettuce, parmesan cheese, croutons, and our signature Caesar dressing."
    },
    {
        id: "caprese-salad",
        name: "Caprese Salad",
        category: "appetizers",
        price: 10.99,
        image: "data:image/jpeg;base64,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",
        description: "Fresh mozzarella, tomatoes, and sweet basil, seasoned with salt and olive oil."
    },
    {
        id: "garlic-bread",
        name: "Garlic Bread",
        category: "appetizers",
        price: 6.99,
        image: "data:image/jpeg;base64,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",
        description: "Toasted french bread topped with garlic butter and parsley."
    },

    // MAIN DISHES
    {
        id: "grilled-salmon",
        name: "Grilled Salmon",
        category: "main-dishes",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Fresh Atlantic salmon grilled to perfection, served with lemon herb butter."
    },
    {
        id: "beef-steak",
        name: "Beef Steak",
        category: "main-dishes",
        price: 32.99,
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Premium ribeye steak cooked to your preference, served with garlic mashed potatoes."
    },
    {
        id: "roast-chicken",
        name: "Roast Chicken",
        category: "main-dishes",
        price: 18.99,
        image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Herb-roasted half chicken served with seasonal vegetables."
    },

    // PASTA
    {
        id: "spaghetti-carbonara",
        name: "Spaghetti Carbonara",
        category: "Pasta",
        price: 16.99,
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Classic Italian pasta with eggs, cheese, pancetta, and black pepper."
    },
    {
        id: "penne-arrabbiata",
        name: "Penne Arrabbiata",
        category: "Pasta",
        price: 14.99,
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Spicy tomato sauce with garlic and red chili peppers."
    },
    {
        id: "fettuccine-alfredo",
        name: "Fettuccine Alfredo",
        category: "Pasta",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Fettuccine tossed with parmesan cheese and butter."
    },

    // PIZZA
    {
        id: "margherita-pizza",
        name: "Margherita Pizza",
        category: "Pizza",
        price: 13.99,
        image: "data:image/jpeg;base64,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",
        description: "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil."
    },
    {
        id: "pepperoni-pizza",
        name: "Pepperoni Pizza",
        category: "Pizza",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Topped with savory pepperoni slices and mozzarella cheese."
    },

    // DESSERTS
    {
        id: "lava-cake",
        name: "Chocolate Lava Cake",
        category: "desserts",
        price: 9.99,
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Warm chocolate cake with molten center, served with vanilla ice cream."
    },
    {
        id: "tiramisu",
        name: "Tiramisu",
        category: "desserts",
        price: 8.99,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Coffee-flavoured Italian dessert. Ladyfingers dipped in coffee, layered with mascarpone."
    },

    // DRINKS
    {
        id: "mojito",
        name: "Mojito Mocktail",
        category: "drinks",
        price: 6.99,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Refreshing mint and lime mocktail."
    },
    {
        id: "orange-juice",
        name: "Fresh Orange Juice",
        category: "drinks",
        price: 5.99,
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Freshly squeezed orange juice."
    }
];

function renderMenu(filter = 'all') {
    const menuContainer = document.getElementById('menu-container');
    if(!menuContainer) return;

    menuContainer.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === filter);

    if(filteredItems.length === 0) {
        menuContainer.innerHTML = `<div class="col-12 text-center my-5"><p class="lead text-muted">No items found for ${filter}.</p></div>`;
        return;
    }

    filteredItems.forEach(item => {
        const itemHtml = `
          <div class="col-lg-4 col-md-6 col-sm-12 mt-5 mb-1 product-item" data-category="${item.category}">
            <div class="product-card">
              <div class="product-image" style="background-image: url('${item.image}');">
                <div class="product-overlay">
                  <button class="btn btn-primary add-to-cart-btn" onclick="addCardFromData('${item.id}')">
                    <i class="fas fa-shopping-cart me-1"></i>
                    <i class="fas fa-plus me-1"></i> add to cart
                  </button>
                </div>
              </div>
              <div class="product-info">
                <div class="product-category text-uppercase text-secondary small mb-1">${item.category}</div>
                <div class="product-title fw-bold font-monospace fs-5">${item.name}</div>
                <div class="product-description text-muted small mb-2 text-truncate" style="max-width: 100%;" title="${item.description}">
                  ${item.description}
                </div>
                <div class="product-price fw-bold text-primary fs-5">$${item.price.toFixed(2)}</div>
              </div>
            </div>
          </div>
        `;
        menuContainer.innerHTML += itemHtml;
    });
}

function addCardFromData(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if(item) {
        cardManager.addItem(item);
    }
}

function initializeCategoryFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  
  if(!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Check if we are using the new render logic
      if(document.getElementById('menu-container')) {
          renderMenu(filter);
      } else {
          // Fallback to old logic if container not found (should not happen after update)
          const productItems = document.querySelectorAll(".product-item");
          filterProducts(filter, productItems);
      }
    });
  });
}

