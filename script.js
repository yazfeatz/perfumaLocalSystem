//Initialize all the DOM elements
const productContainer = document.querySelector(".main-container");
const searchInput = document.getElementById("search");
const dateTime = document.querySelector(".last-sync");
const openFiltersBtn = document.querySelector(".open-filters-btn");
const filterPopupContainer = document.querySelector(".filter-popup-container");
const closeFilterFormBtn = document.querySelector(".close-form-btn");
const formElements = document.querySelectorAll("form");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const setFiltersButton = document.querySelector(".btn-primary");

// Global variables
let products = [];
let loadedProducts = 0;
const productsPerPage = 50;
const defaultImageLink = "assets/default-image.svg";

//Function to format price
let Rupee = new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
});

const imageCache = new Map(); // cached images map

// Define the filters object
let filters = {
    minPrice: 0,
    maxPrice: Infinity,
};

// Function to handle form submission and prevent page refresh
function handleFormSubmit(event) {
    event.preventDefault();
}

// Event listener for the filter form submission
const filterForm = document.querySelector(".filter-popup");
filterForm.addEventListener("submit", handleFormSubmit);

// Function to open the filters form
function openFilters() {
    filterPopupContainer.classList.remove("hidden");
}

// Event listener for opening the filter popup
openFiltersBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default behavior of the button (page refresh)
    openFilters();
});

// Disable the default behaviour of forms
formElements.forEach((form) => {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
    });
});

// preloadImages
function preloadImages() {
    products.forEach((product) => {
        const productImage = defaultImageLink;
        // const productImage = product.Image || defaultImageLink;
        const img = new Image();
        img.src = productImage;
        imageCache.set(productImage, img);
    });
}

function filterProducts(searchTerm) {
    return products.filter((product) =>
        product.Title.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

function displayProducts(productsToShow) {
    productContainer.innerHTML = "";

    productsToShow.forEach((product) => {
        const productImage = defaultImageLink;
        // const productImage = product.Image || defaultImageLink;
        const cachedImage = imageCache.get(productImage) || new Image();
        cachedImage.src = productImage;

        productContainer.innerHTML += `
      <div class="product">
          <img
              class="product-image"
              width="100%"
              src="${cachedImage.src}"
              alt="product-image"
              onerror="this.src='${defaultImageLink}'"
          />
          <h2>${product.Title}</h2>
          <p class="price">${Rupee.format(product.Price)}</p>
          <button class="secondary-btn">
              <img
                  height="15px"
                  src="assets/link-icon.png"
                  alt="link-icon"
              />
              <a class="product-link" href="${
                  product.Link
              }" target="_blank">View Product</a>
          </button>
      </div>
  `;
    });
}

function loadNextProducts() {
    const productsToShow = products.slice(
        loadedProducts,
        loadedProducts + productsPerPage
    );

    displayProducts(productsToShow);

    loadedProducts += productsToShow.length;

    if (loadedProducts < products.length) {
        window.addEventListener("scroll", handleScroll);
    }
}

function handleScroll() {
    const scrollOffset = window.scrollY + window.innerHeight;
    const pageHeight = document.body.offsetHeight;

    if (scrollOffset >= pageHeight - 1000) {
        loadNextProducts();
        window.removeEventListener("scroll", handleScroll);
    }
}

function handleSearch() {
    const searchTerm = searchInput.value.trim();

    const filteredProducts = filterProducts(searchTerm);

    loadedProducts = 0;
    displayProducts(filteredProducts);
}

function applyFilters() {
    const filteredProducts = products.filter((product) => {
        const priceCondition =
            parseInt(product.Price) >= filters.minPrice &&
            parseInt(product.Price) <= filters.maxPrice;
        return priceCondition;
    });

    loadedProducts = 0;
    displayProducts(filteredProducts);
}

minPriceInput.addEventListener("input", function () {
    filters.minPrice = parseInt(this.value) || 0;
    applyFilters();
});

maxPriceInput.addEventListener("input", function () {
    filters.maxPrice = parseInt(this.value) || Infinity;
    applyFilters();
});

setFiltersButton.addEventListener("click", function (e) {
    e.preventDefault();
    applyFilters();
});

openFiltersBtn.addEventListener("click", function () {
    filterPopupContainer.classList.remove("hidden");
});

closeFilterFormBtn.addEventListener("click", function () {
    filterPopupContainer.classList.add("hidden");
});

searchInput.addEventListener("input", handleSearch);

// Fetch products and start the page
fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
        products = data;
        preloadImages(); // Preload and cache the product images
        loadNextProducts();
    })
    .catch((error) => {
        console.error("Error fetching products:", error);
    });
