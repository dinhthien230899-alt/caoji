const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".product-card");
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
const pricedCards = document.querySelectorAll("[data-price]");
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

const productGalleries = {
  "DRUM Bright Blue": [
    "assets/details/detail-01.jpg",
    "assets/details/detail-02.jpg",
    "assets/details/detail-03.jpg",
    "assets/details/detail-04.jpg",
    "assets/details/detail-05.jpg",
  ],
  "DRUM The Original": [
    "assets/details/detail-06.jpg",
    "assets/details/detail-07.jpg",
    "assets/details/detail-08.jpg",
    "assets/details/detail-09.jpg",
    "assets/details/detail-10.jpg",
  ],
  "Mac Baren Original Choice": [
    "assets/details/detail-11.jpg",
    "assets/details/detail-12.jpg",
    "assets/details/detail-13.jpg",
    "assets/details/detail-14.jpg",
    "assets/details/detail-15.jpg",
  ],
  "Mac Baren Aromatic Choice": [
    "assets/details/detail-16.jpg",
    "assets/details/detail-17.jpg",
  ],
  "Golden Virginia": [
    "assets/details/detail-18.jpg",
    "assets/details/detail-19.jpg",
    "assets/details/detail-20.jpg",
    "assets/details/detail-21.jpg",
  ],
  "Amber Leaf": [
    "assets/details/detail-22.jpg",
    "assets/details/detail-23.jpg",
    "assets/details/detail-24.jpg",
    "assets/details/detail-25.jpg",
    "assets/details/detail-26.jpg",
  ],
  "Mac Baren Original Virginia": [
    "assets/details/detail-27.jpg",
    "assets/details/detail-28.jpg",
    "assets/details/detail-29.jpg",
    "assets/details/detail-30.jpg",
  ],
  "Captain Black Cherry": [
    "assets/details/detail-31.jpg",
    "assets/details/detail-32.jpg",
    "assets/details/detail-33.jpg",
    "assets/details/detail-34.jpg",
    "assets/details/detail-35.jpg",
  ],
  "Captain Black Original": [
    "assets/details/detail-36.jpg",
    "assets/details/detail-37.jpg",
    "assets/details/detail-38.jpg",
    "assets/details/detail-39.jpg",
  ],
  "Peterson 经典系列": [
    "assets/details/detail-40.jpg",
    "assets/details/detail-42.jpg",
  ],
  "Peterson Early Morning Pipe": ["assets/details/detail-41.jpg"],
  "Captain Black Royal Dark": [
    "assets/details/detail-43.jpg",
    "assets/details/detail-44.jpg",
  ],
  "Captain Black Royal Pouch": [
    "assets/details/detail-45.jpg",
    "assets/details/detail-46.jpg",
    "assets/details/detail-47.jpg",
  ],
  "Captain Black Gold": [
    "assets/details/detail-48.jpg",
    "assets/details/detail-49.jpg",
    "assets/details/detail-50.jpg",
    "assets/details/detail-51.jpg",
    "assets/details/detail-52.jpg",
  ],
  "Mac Baren Double Apple Choice": [
    "assets/details/detail-53.jpg",
    "assets/details/detail-54.jpg",
  ],
  "Mac Baren Dark Chocolate Choice": [
    "assets/details/detail-55.jpg",
    "assets/details/detail-56.jpg",
  ],
};

let activeProduct = null;
let activeGallery = [];
let activeGalleryIndex = 0;
const cart = new Map();

pricedCards.forEach((card) => {
  const content = card.querySelector("div");
  if (!content || content.querySelector(".price-line")) return;

  const priceLine = document.createElement("p");
  priceLine.className = "price-line";
  priceLine.textContent = card.dataset.price + " 元";
  content.appendChild(priceLine);
});

productCards.forEach((card) => {
  const content = card.querySelector("div");
  if (!content || content.querySelector(".add-cart-button")) return;

  const button = document.createElement("button");
  button.className = "add-cart-button";
  button.type = "button";
  button.textContent = "加入清单";
  content.appendChild(button);
});

const getProductFromCard = (card) => {
  const title = card.querySelector("h3")?.textContent.trim();
  const category = card.querySelector("span")?.textContent.trim();
  const image = card.querySelector("img");

  return {
    id: title,
    title,
    category,
    price: Number(card.dataset.price || 0),
    image: image?.getAttribute("src"),
    alt: image?.alt || title,
  };
};

const updateCartButtons = () => {
  productCards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim();
    const button = card.querySelector(".add-cart-button");
    const qty = cart.get(title)?.qty || 0;
    if (!button) return;

    button.classList.toggle("added", qty > 0);
    button.textContent = qty > 0 ? `已加入 ×${qty}` : "加入清单";
  });
};

const getCartTotal = () => {
  let total = 0;
  let count = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    count += item.qty;
  });
  return { total, count };
};

const renderCart = () => {
  if (!cartItems || !cartEmpty || !cartTotal) return;

  cartItems.innerHTML = "";
  const { total, count } = getCartTotal();
  cartEmpty.hidden = cart.size > 0;
  cartTotal.textContent = total + " 元";
  if (mobileCartButton) {
    mobileCartButton.textContent = count > 0 ? `清单 ${total} 元` : "清单 0";
  }

  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.alt}">
      <div>
        <h4>${item.title}</h4>
        <p>${item.price} 元 × ${item.qty} = ${item.price * item.qty} 元</p>
        <div class="cart-item-controls">
          <button type="button" data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button type="button" data-action="increase" data-id="${item.id}">+</button>
          <button type="button" data-action="remove" data-id="${item.id}">删</button>
        </div>
      </div>
    `;
    cartItems.appendChild(row);
  });

  updateCartButtons();
};

const addToCart = (product) => {
  if (!product?.id) return;

  const current = cart.get(product.id);
  if (current) {
    current.qty += 1;
  } else {
    cart.set(product.id, { ...product, qty: 1 });
  }
  renderCart();
};

const setDialogImage = (index) => {
  if (!dialogImage || activeGallery.length === 0) return;

  activeGalleryIndex = (index + activeGallery.length) % activeGallery.length;
  const image = activeGallery[activeGalleryIndex];
  dialogImage.src = image.src;
  dialogImage.alt = image.alt;

  if (galleryCount) {
    galleryCount.textContent = `${activeGalleryIndex + 1} / ${activeGallery.length}`;
  }

  dialogThumbnails?.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === activeGalleryIndex);
  });
};

const buildDialogGallery = (product) => {
  const detailImages = productGalleries[product.title] || [];
  activeGallery = [
    { src: product.image, alt: product.alt },
    ...detailImages.map((src, index) => ({
      src,
      alt: `${product.title} 详情图 ${index + 1}`,
    })),
  ];
  activeGalleryIndex = 0;

  if (dialogThumbnails) {
    dialogThumbnails.innerHTML = "";
    activeGallery.forEach((image, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `查看第 ${index + 1} 张图`);
      button.innerHTML = `<img src="${image.src}" alt="">`;
      button.addEventListener("click", () => setDialogImage(index));
      dialogThumbnails.appendChild(button);
    });
  }

  if (dialogGalleryControls) {
    dialogGalleryControls.hidden = activeGallery.length <= 1;
  }

  setDialogImage(0);
};

const openCart = () => {
  cartDrawer?.classList.add("open");
  cartDrawer?.setAttribute("aria-hidden", "false");
};

const closeCart = () => {
  cartDrawer?.classList.remove("open");
  cartDrawer?.setAttribute("aria-hidden", "true");
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    productCards.forEach((card) => {
      const shouldShow = filter === "全部" || card.dataset.category === filter;
      card.hidden = !shouldShow;
    });
  });
});

productCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".add-cart-button")) {
      addToCart(getProductFromCard(card));
      return;
    }

    if (!dialog || !dialogImage || !dialogTitle) return;

    activeProduct = getProductFromCard(card);
    buildDialogGallery(activeProduct);
    dialogTitle.innerHTML = `${activeProduct.title}<span>${activeProduct.price} 元</span>`;
    dialog.showModal();
  });
});

galleryPrev?.addEventListener("click", () => setDialogImage(activeGalleryIndex - 1));
galleryNext?.addEventListener("click", () => setDialogImage(activeGalleryIndex + 1));

dialogAddCart?.addEventListener("click", () => {
  addToCart(activeProduct);
  dialog?.close();
  openCart();
});

dialogClose?.addEventListener("click", () => dialog.close());

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

agentClose?.addEventListener("click", () => {
  agentFloat?.classList.add("collapsed");
  agentToggle?.setAttribute("aria-expanded", "false");
});

agentToggle?.addEventListener("click", () => {
  agentFloat?.classList.remove("collapsed");
  agentToggle.setAttribute("aria-expanded", "true");
});

cartOpenButtons.forEach((button) => {
  button.addEventListener("click", openCart);
});

cartClose?.addEventListener("click", closeCart);

cartDrawer?.addEventListener("click", (event) => {
  if (event.target === cartDrawer) {
    closeCart();
  }
});

cartItems?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = cart.get(button.dataset.id);
  if (!item) return;

  if (button.dataset.action === "increase") {
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

copyCartButton?.addEventListener("click", async () => {
  if (cart.size === 0) {
    openCart();
    return;
  }

  const { total } = getCartTotal();
  const lines = ["你好，我想咨询以下商品："];
  cart.forEach((item) => {
    lines.push(`${item.title} × ${item.qty}，${item.price} 元/件，小计 ${item.price * item.qty} 元`);
  });
  lines.push(`合计：${total} 元`);
  lines.push("请帮我确认库存、付款方式和到手细节。");

  try {
    await copyText(lines.join("\n"));
    copyCartButton.textContent = "已复制，去微信粘贴";
  } catch {
    copyCartButton.textContent = "复制失败，请手动截图清单";
  }
});

renderCart();
