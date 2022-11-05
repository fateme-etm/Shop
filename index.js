const productsSection = document.querySelector(".products");
const navbarCart = document.querySelector(".navbar__cart");
const backdrop = document.querySelector(".back-drop");
const modal = document.querySelector(".modal");
const clearModalBtn = document.querySelector(".clear-modal");
const confirmModalBtn = document.querySelector(".confirm-modal");
const cartNumber = document.querySelector(".cart__count");
const totalPrice = document.querySelector(".total-price");
const modalMain = document.querySelector(".modal__main");
const mainSearch = document.querySelector(".main__search");
const categories = document.querySelectorAll(".cat");


let products = [];
let cart = [];
let buttons;

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((p) => {
      result += `<div class="product">
            <img class="product__image" src=${p.image} alt="product image">
            <div class="product__price">
                <span class="price">${p.price} $</span>
                <span class="name">${p.title}</span>
            </div>
            <button class="btn product__add-btn" data-id=${p.id}>add to cart</button>
        </div>`;
    });

    productsSection.innerHTML = result;
  }

  getAddBtn() {
    const addToCartBtns = [...document.querySelectorAll(".product__add-btn")];
    buttons = addToCartBtns;

    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      const isInCart = cart.find((c) => c.id == id);

      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", (event) => {
        btn.innerText = "In Cart";
        btn.disabled = true;

        const addedProduct = {
          ...Storage.getProduct(event.target.dataset.id),
          quantity: 1,
        };
        this.addItemCart(addedProduct);

        cart = [...cart, addedProduct];
        Storage.saveCart(cart);

        this.setCartValue(cart);
      });
    });
  }

  setCartValue(cart) {
    let totalNumber = 0;
    const total = cart.reduce((acc, curr) => {
      totalNumber += curr.quantity;
      return (acc += curr.quantity * curr.price);
    }, 0);

    cartNumber.innerText = totalNumber;
    totalPrice.innerText = `total price: ${total.toFixed(2)}$`;
  }

  addItemCart(product) {
    const div = document.createElement("div");
    div.classList.add("modal__item");
    div.innerHTML = `<img class="modal__item__img" src=${product.image} alt="product image">
  <div class="modal__item__detail">
      <h3 class="item__name">${product.title}</h3>
      <p class="item__price">${product.price} $</p>
  </div>
  <div class="modal__item__count">
      <i class="increament fa-solid fa-chevron-up" data-id=${product.id}></i>
      <p class="count">${product.quantity}</p>
      <i class="decreament fa-solid fa-chevron-down" data-id=${product.id}></i>
  </div>
  <i class="far fa-trash-alt" data-id=${product.id}></i>`;

    modalMain.appendChild(div);
  }

  setupApp() {
    cart = Storage.getCart() || [];
    cart.forEach((item) => this.addItemCart(item));
    this.setCartValue(cart);
  }

  cartLogic() {
    clearModalBtn.addEventListener("click", () => this.clearCart());

    modalMain.addEventListener("click", (event) => {
      const targetItem = event.target;
      if (targetItem.classList.contains("increament")) {
        const increamentItem = cart.find((c) => c.id == targetItem.dataset.id);
        increamentItem.quantity++;
        Storage.saveCart(cart);
        this.setCartValue(cart);
        targetItem.nextElementSibling.innerText = increamentItem.quantity;
      } else if (targetItem.classList.contains("decreament")) {
        const decreamentItem = cart.find((c) => c.id == targetItem.dataset.id);
        decreamentItem.quantity--;
        if (decreamentItem.quantity == 0) {
          this.removeItem(decreamentItem.id);
          modalMain.removeChild(targetItem.parentElement.parentElement);
        } else {
          Storage.saveCart(cart);
          this.setCartValue(cart);
          targetItem.previousElementSibling.innerText = decreamentItem.quantity;
        }
      } else if (targetItem.classList.contains("fa-trash-alt")) {
        const removedItem = cart.find((c) => c.id == targetItem.dataset.id);
        this.removeItem(removedItem.id);
        modalMain.removeChild(targetItem.parentElement);
      }
    });

    navbarCart.addEventListener("click", () => {
      backdrop.style.display = "flex";
      backdrop.style.opacity = "60%";
      modal.style.transform = "translate(50% ,-50%)";
      modal.style.opacity = "100%";
    });

    confirmModalBtn.addEventListener("click", this.confirmModalFunc);
    backdrop.addEventListener("click", this.confirmModalFunc);
  }

  filter() {
    mainSearch.addEventListener("input", (e) => {
      this.filterProducts(products, e.target.value);
      this.getAddBtn();
    });
    
    categories.forEach(c=>{

      c.addEventListener("click",e=>{
        this.filterProducts(products, e.target.dataset.filter);
        this.getAddBtn();

      });
    });


  }

  confirmModalFunc() {
    backdrop.style.display = "none";
    modal.style.opacity = "0";
    modal.style.transform = "translate(50%,-300%)";
  }
  clearCart() {
    cart.forEach((item) => this.removeItem(item.id));
    while (modalMain.children.length) {
      modalMain.removeChild(modalMain.children[0]);
    }
    this.confirmModalFunc();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    Storage.saveCart(cart);
    this.setCartValue(cart);
    try{
      this.updateSingleBtn(id);
    }catch{
      console.log("error finding btn");
    }
    if (modalMain.children.length == 1) {
      this.confirmModalFunc();
    }
  }

  updateSingleBtn(id) {
    const button = buttons.find((btn) => btn.dataset.id == id);
    button.innerText = "add to cart";
    button.disabled = false;
  }

  filterProducts(_products, _search) {
    let filtered = _products.filter((p) =>
      p.title.toLowerCase().includes(_search.toLowerCase())
    );
    let result = "";
    filtered.forEach((p) => {
      result += `<div class="product">
            <img class="product__image" src=${p.image} alt="product image">
            <div class="product__price">
                <span class="price">${p.price} $</span>
                <span class="name">${p.title}</span>
            </div>
            <button class="btn product__add-btn" data-id=${p.id}>add to cart</button>
        </div>`;
    });

    productsSection.innerHTML = result;
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id == id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  axios
    .get("http://localhost:3000/items")
    .then((res) => {
      products = res.data;

      const uiObj = new UI();
      uiObj.displayProducts(products);
      uiObj.setupApp();
      uiObj.getAddBtn();
      uiObj.cartLogic();
      uiObj.filter();
      Storage.saveProducts(products);
    })
    .catch((err) => console.log(err.message));
});
