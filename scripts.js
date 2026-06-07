// ========== 全局状态 ==========
let products = [];
let activeProduct = null;
let activeGallery = [];
let activeGalleryIndex = 0;
const cart = new Map();

// ========== DOM 引用 ==========
const filterButtons = document.querySelectorAll(".filter-button");
const dialog = document.querySelector(".image-dialog");
const dialogImage = dialog?.querySelector("img");
const dialogTitle = dialog?.querySelector("h3");
const dialogClose = dialog?.querySelector(".dialog-close");
const dialogAddCart = dialog?.querySelector(".dialog-add-cart");
const dialogThumbnails = dialog?.querySelector(".dialog-thumbnails");
const dialogGalleryControls = dialog?.querySelector(".dialog-gallery-controls");
const galleryPrev = dialog?.querySelector(".gallery-prev");
const galleryNext = dialog?.querySelector(".gallery-next");
const galleryCount = dialog?.querySelector(".gallery-count");
const agentFloat = document.querySelector(".agent-float");
const agentToggle = document.querySelector(".agent-toggle");
const agentClose = document.querySelector(".agent-close");
const cartDrawer = document.querySelector(".cart-drawer");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartTotal = document.querySelector(".cart-total");
const cartClose = document.querySelector(".cart-close");
const cartOpenButtons = document.querySelectorAll(".open-cart");
const mobileCartButton = document.querySelector(".mobile-cart-button");
const copyCartButton = document.querySelector(".copy-cart");
const spotlightGrid = document.querySelector(".spotlight-grid");
const productGrid = document.querySelector(".product-grid");

// ========== 数据加载 ==========
async function loadProducts() {
  try {
    const res = await fetch("products.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    products = await res.json();
  } catch (err) {
    console.error("加载商品数据失败:", err);
    if (productGrid) {
      productGrid.innerHTML =
        '<p class="load-error">商品数据加载失败，请稍后刷新页面。</p>';
    }
    products = [];
  }
}

// ========== 商品渲染 ==========
function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";
  article.dataset.id = product.id;
  article.dataset.category = product.category;
  article.dataset.price = product.price;

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  article.innerHTML =
    '<img src="' +
    product.image +
    '" alt="' +
    product.alt +
    '"' +
    (outOfStock ? ' class="out-of-stock-img"' : "") +
    " />" +
    "<div>" +
    "<span>" +
    product.spec +
    "</span>" +
    "<h3>" +
    product.name +
    "</h3>" +
    '<p class="price-line">' +
    product.price +
    " 元</p>" +
    (outOfStock
      ? '<p class="stock-badge out">无库存</p>'
      : lowStock
        ? '<p class="stock-badge low">仅剩 ' + product.stock + " 件</p>"
        : "") +
    '<button class="add-cart-button" type="button"' +
    (outOfStock ? " disabled" : "") +
    ">" +
    (outOfStock ? "暂时无货" : "加入清单") +
    "</button>" +
    "</div>";

  if (outOfStock) {
    const overlay = document.createElement("div");
    overlay.className = "out-of-stock-overlay";
    article.appendChild(overlay);
  }

  return article;
}

function renderProducts(filter) {
  if (!productGrid) return;
  productGrid.innerHTML = "";

  const filtered =
    filter === "全部"
      ? products
      : products.filter(function (p) {
          return p.category === filter;
        });

  filtered.forEach(function (product) {
    productGrid.appendChild(createProductCard(product));
  });
}

function renderSpotlight() {
  if (!spotlightGrid) return;
  spotlightGrid.innerHTML = "";

  var featured = products.filter(function (p) {
    return p.featured;
  });

  featured.forEach(function (product) {
    var card = document.createElement("article");
    card.className = "spotlight-card";
    card.dataset.id = product.id;
    card.dataset.price = product.price;

    card.innerHTML =
      '<img src="' +
      product.image +
      '" alt="' +
      product.alt +
      '" />' +
      "<div>" +
      "<span>" +
      product.category +
      "</span>" +
      "<h3>" +
      product.name +
      "</h3>" +
      "<p>" +
      product.spec +
      "</p>" +
      '<a href="#contact">咨询这款</a>' +
      "</div>";

    spotlightGrid.appendChild(card);
  });
}

// ========== 从卡片获取商品数据 ==========
function getProductFromCard(card) {
  var id = card.dataset.id;
  var product = products.find(function (p) {
    return p.id === id;
  });
  if (!product) return null;

  return {
    id: product.id,
    title: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    image: product.image,
    alt: product.alt,
    details: product.details || [],
  };
}

// ========== 购物车 ==========
function addToCart(product) {
  if (!product || !product.id) return;

  var data = products.find(function (p) {
    return p.id === product.id;
  });
  if (data && data.stock <= 0) {
    alert("该商品暂时无库存，无法加入清单。");
    return;
  }

  var current = cart.get(product.id);
  if (current) {
    if (data && current.qty + 1 > data.stock) {
      alert("该商品库存仅剩 " + data.stock + " 件。");
      return;
    }
    current.qty += 1;
  } else {
    cart.set(product.id, { id: product.id, title: product.title, price: product.price, image: product.image, alt: product.alt, qty: 1 });
  }
  renderCart();
}

function updateCartButtons() {
  document.querySelectorAll(".product-card").forEach(function (card) {
    var id = card.dataset.id;
    var button = card.querySelector(".add-cart-button");
    var qty = cart.get(id) ? cart.get(id).qty : 0;
    if (!button || button.disabled) return;

    button.classList.toggle("added", qty > 0);
    button.textContent = qty > 0 ? "已加入 ×" + qty : "加入清单";
  });
}

function getCartTotal() {
  var total = 0;
  var count = 0;
  cart.forEach(function (item) {
    total += item.price * item.qty;
    count += item.qty;
  });
  return { total: total, count: count };
}

function renderCart() {
  if (!cartItems || !cartEmpty || !cartTotal) return;

  cartItems.innerHTML = "";
  var stats = getCartTotal();
  cartEmpty.hidden = cart.size > 0;
  cartTotal.textContent = stats.total + " 元";
  if (mobileCartButton) {
    mobileCartButton.textContent =
      stats.count > 0 ? "清单 " + stats.total + " 元" : "清单 0";
  }

  cart.forEach(function (item) {
    var row = document.createElement("article");
    row.className = "cart-item";
    row.innerHTML =
      '<img src="' +
      item.image +
      '" alt="' +
      item.alt +
      '">' +
      "<div>" +
      "<h4>" +
      item.title +
      "</h4>" +
      "<p>" +
      item.price +
      " 元 × " +
      item.qty +
      " = " +
      item.price * item.qty +
      " 元</p>" +
      '<div class="cart-item-controls">' +
      '<button type="button" data-action="decrease" data-id="' +
      item.id +
      '">-</button>' +
      "<span>" +
      item.qty +
      "</span>" +
      '<button type="button" data-action="increase" data-id="' +
      item.id +
      '">+</button>' +
      '<button type="button" data-action="remove" data-id="' +
      item.id +
      '">删</button>' +
      "</div>" +
      "</div>";
    cartItems.appendChild(row);
  });

  updateCartButtons();
}

// ========== 大图弹窗 ==========
function setDialogImage(index) {
  if (!dialogImage || activeGallery.length === 0) return;

  activeGalleryIndex =
    ((index % activeGallery.length) + activeGallery.length) %
    activeGallery.length;
  var image = activeGallery[activeGalleryIndex];
  dialogImage.src = image.src;
  dialogImage.alt = image.alt;

  if (galleryCount) {
    galleryCount.textContent =
      activeGalleryIndex + 1 + " / " + activeGallery.length;
  }

  if (dialogThumbnails) {
    dialogThumbnails.querySelectorAll("button").forEach(function (button, i) {
      button.classList.toggle("active", i === activeGalleryIndex);
    });
  }
}

function buildDialogGallery(product) {
  var detailImages = product.details || [];
  activeGallery = [{ src: product.image, alt: product.alt }].concat(
    detailImages.map(function (src, index) {
      return { src: src, alt: product.title + " 详情图 " + (index + 1) };
    })
  );
  activeGalleryIndex = 0;

  if (dialogThumbnails) {
    dialogThumbnails.innerHTML = "";
    activeGallery.forEach(function (image, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "查看第 " + (index + 1) + " 张图");
      button.innerHTML = '<img src="' + image.src + '" alt="">';
      button.addEventListener("click", function () {
        setDialogImage(index);
      });
      dialogThumbnails.appendChild(button);
    });
  }

  if (dialogGalleryControls) {
    dialogGalleryControls.hidden = activeGallery.length <= 1;
  }

  setDialogImage(0);
}

function openProductDialog(product) {
  if (!dialog || !dialogImage || !dialogTitle) return;

  activeProduct = product;
  buildDialogGallery(product);
  dialogTitle.innerHTML =
    product.title + "<span>" + product.price + " 元</span>";
  if (dialogAddCart) {
    if (product.stock <= 0) {
      dialogAddCart.textContent = "暂时无货";
      dialogAddCart.disabled = true;
    } else {
      dialogAddCart.textContent = "加入咨询清单";
      dialogAddCart.disabled = false;
    }
  }
  dialog.showModal();
}

// ========== 购物车抽屉 ==========
function openCart() {
  if (cartDrawer) {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
  }
}

function closeCart() {
  if (cartDrawer) {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
  }
}

// ========== 复制文本 ==========
function copyText(text) {
  return new Promise(function (resolve) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        resolve(true);
      }).catch(function () {
        resolve(false);
      });
      return;
    }

    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    var copied = document.execCommand("copy");
    textarea.remove();
    resolve(copied);
  });
}

// ========== 事件委托 - 产品图册 ==========
if (productGrid) {
  productGrid.addEventListener("click", function (event) {
    var card = event.target.closest(".product-card");
    if (!card) return;

    // 点击了加入清单按钮
    if (event.target.closest(".add-cart-button")) {
      var product = getProductFromCard(card);
      if (product) addToCart(product);
      return;
    }

    // 打开大图预览
    var product = getProductFromCard(card);
    if (product) openProductDialog(product);
  });
}

// ========== 事件委托 - 新客常看 ==========
if (spotlightGrid) {
  spotlightGrid.addEventListener("click", function (event) {
    // spotlight 的链接和整卡点击都导向 contact
    // 保持默认行为即可
  });
}

// ========== 筛选按钮 ==========
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    var filter = button.dataset.filter;

    filterButtons.forEach(function (item) {
      item.classList.remove("active");
    });
    button.classList.add("active");

    renderProducts(filter);
  });
});

// ========== 弹窗事件 ==========
galleryPrev?.addEventListener("click", function () {
  setDialogImage(activeGalleryIndex - 1);
});
galleryNext?.addEventListener("click", function () {
  setDialogImage(activeGalleryIndex + 1);
});

dialogAddCart?.addEventListener("click", function () {
  if (activeProduct && activeProduct.stock <= 0) {
    alert("该商品暂时无库存。");
    return;
  }
  if (activeProduct) addToCart(activeProduct);
  dialog?.close();
  openCart();
});

dialogClose?.addEventListener("click", function () {
  dialog.close();
});

dialog?.addEventListener("click", function (event) {
  if (event.target === dialog) {
    dialog.close();
  }
});

// ========== 代理招募 ==========
agentClose?.addEventListener("click", function () {
  agentFloat?.classList.add("collapsed");
  agentToggle?.setAttribute("aria-expanded", "false");
});

agentToggle?.addEventListener("click", function () {
  agentFloat?.classList.remove("collapsed");
  agentToggle.setAttribute("aria-expanded", "true");
});

// ========== 购物车抽屉事件 ==========
cartOpenButtons.forEach(function (button) {
  button.addEventListener("click", openCart);
});

cartClose?.addEventListener("click", closeCart);

cartDrawer?.addEventListener("click", function (event) {
  if (event.target === cartDrawer) {
    closeCart();
  }
});

cartItems?.addEventListener("click", function (event) {
  var button = event.target.closest("button[data-action]");
  if (!button) return;

  var item = cart.get(button.dataset.id);
  if (!item) return;

  if (button.dataset.action === "increase") {
    var data = products.find(function (p) {
      return p.id === item.id;
    });
    if (data && item.qty + 1 > data.stock) {
      alert("该商品库存仅剩 " + data.stock + " 件。");
      return;
    }
    item.qty += 1;
  }

  if (button.dataset.action === "decrease") {
    item.qty -= 1;
    if (item.qty <= 0) cart.delete(item.id);
  }

  if (button.dataset.action === "remove") {
    cart.delete(item.id);
  }

  renderCart();
});

// ========== 复制清单 ==========
copyCartButton?.addEventListener("click", function () {
  if (cart.size === 0) {
    openCart();
    return;
  }

  var stats = getCartTotal();
  var lines = ["你好，我想咨询以下商品："];
  cart.forEach(function (item) {
    lines.push(
      item.title +
        " × " +
        item.qty +
        "，" +
        item.price +
        " 元/件，小计 " +
        item.price * item.qty +
        " 元"
    );
  });
  lines.push("合计：" + stats.total + " 元");
  lines.push("请帮我确认库存、付款方式和到手细节。");

  copyText(lines.join("\n")).then(function (ok) {
    copyCartButton.textContent = ok
      ? "已复制，去微信粘贴"
      : "复制失败，请手动截图清单";
  });
});

// ========== 初始化 ==========
async function init() {
  await loadProducts();
  renderSpotlight();
  renderProducts("全部");
  renderCart();
}

init();
