const menuGrid = document.getElementById('menuGrid');
const resultCount = document.getElementById('resultsCount')

const PRODUCTS_PER_PAGE = 10
let currentPage = 1
let allProducts = []

const CATEGORY_IDS = {
    'Appetizers': 1,
    'First Courses': 2,
    'Main Courses': 3,
    'Pizzas': 4,
    'Side Dishes': 5,
    'Desserts': 6
}

const prevPageBtn = document.getElementById('prevPageBtn')
const nextPageBtn = document.getElementById('nextPageBtn')




function loadpage() {
    const params = new URLSearchParams()
    params.set('Take','100')
    params.set('Page','1')

    const searchInput = document.getElementById('searchInput').value
    if(searchInput){
        params.set('Query',searchInput)
    }
    if(document.getElementById('vegOnly').checked){
        params.set('Vegetarian','true')
    }
    const spiciness = document.getElementById('spicinessRange').value
    if(spiciness>0){
        params.set('Spiciness',spiciness)
    }
    const rating = document.getElementById('ratingRange').value
    if(rating>0){
        params.set('Rate',rating)
    }

    const MinPrice = document.getElementById('minPriceRange').value
    if(MinPrice>0){
        params.set('MinPrice',MinPrice)
    }

    const MaxPrice = document.getElementById('maxPriceRange').value
    if(MaxPrice<500){
        params.set('MaxPrice',MaxPrice)
    }

    const checkedCategory = document.querySelector('.category-list input:checked')
    if(checkedCategory){
        params.set('CategoryId',CATEGORY_IDS[checkedCategory.value])
    }


    fetch(`${API_BASE_URL}/api/products/filter?${params.toString()}`, {
        headers: {
            'X-API-KEY': API_KEY
        }
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (result) {
            allProducts = result.data.products

            allProducts.sort(function (a, b) {
                return b.rate - a.rate;
              });

            renderPage()
        })
}

function renderPage() {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE
    const pageProducts = allProducts.slice(start, start + PRODUCTS_PER_PAGE)

    resultCount.textContent = 'Showing ' + pageProducts.length + ' products'

    menuGrid.innerHTML = ''

    pageProducts.forEach(function (product) {
        menuGrid.innerHTML += `
        <div class="dish-card">
            <a href="./product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
            </a>
            <p class="dish-description">${product.description}</p>
            <p class="rating"><i class="fa-solid fa-star"></i> ${product.rate}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        </div>
        `
    })

    prevPageBtn.disabled = currentPage === 1
    nextPageBtn.disabled = start + PRODUCTS_PER_PAGE >= allProducts.length
}

document.getElementById('spicinessRange').value = 0
document.getElementById('ratingRange').value = 0
document.getElementById('minPriceRange').value = 0
document.getElementById('maxPriceRange').value = 500

loadpage()

const filterToggleBtn = document.getElementById('filterToggleBtn')
const filtersSidebar = document.getElementById('filtersSidebar')
const filtersCloseBtn = document.getElementById('filtersCloseBtn')
const filtersBackdrop = document.getElementById('filtersBackdrop')

function closeFilters() {
    filtersSidebar.classList.remove('open')
    filtersBackdrop.classList.remove('open')
}

filterToggleBtn.addEventListener('click', function () {
    filtersSidebar.classList.add('open')
    filtersBackdrop.classList.add('open')
})

filtersCloseBtn.addEventListener('click', closeFilters)
filtersBackdrop.addEventListener('click', closeFilters)




document.getElementById('menuGrid').addEventListener('click',function(event){
    const btn = event.target.closest('.add-to-cart-btn')
    if(!btn){
        return
    }

    const accessToken = localStorage.getItem('accessToken')

    if(!accessToken){
        window.location.href = './login.html'
        return
    }

    fetch(`${API_BASE_URL}/api/cart/add-to-cart`,{
        method:'POST',
        headers:{
            'X-API-KEY':API_KEY,
            'Authorization':`Bearer ${accessToken}`,
            'Content-type':'application/json'

        },
        body:JSON.stringify({productId:Number(btn.dataset.productId),quantity:1})

    })
    .then(function(response){
        return response.json().then(function(result){
            return { ok: response.ok, result: result }
        })
    })
    .then(function(outcome){
        if(outcome.ok){
            showToast('Added to cart', 'Item added successfully.')
            updateCart()
        } else {
            showToast('Could not add to cart', outcome.result.detail || 'Something went wrong, please try again.')
        }
    })
})


prevPageBtn.addEventListener('click' ,function(){
    if(currentPage===1){
        return
    }
    currentPage = currentPage - 1
    renderPage()
})


nextPageBtn.addEventListener('click',function(){
    const start = currentPage * PRODUCTS_PER_PAGE
    if(start >= allProducts.length){
        return
    }
    currentPage = currentPage + 1
    renderPage()
})


document.getElementById('filtersSidebar').addEventListener('input', function (event) {
    if (event.target.id === 'spicinessRange') {
        document.getElementById('spicinessValue').textContent = 'Level: ' + event.target.value
    }

    if (event.target.id === 'ratingRange') {
        document.getElementById('ratingValue').innerHTML = '<i class="fa-solid fa-star"></i> ' + event.target.value + '+'
    }

    if (event.target.id === 'minPriceRange') {
        document.getElementById('minPriceValue').textContent = '$' + event.target.value + '+'
    }

    if (event.target.id === 'maxPriceRange') {
        document.getElementById('maxPriceValue').textContent = '$' + event.target.value + (event.target.value == 500 ? '+' : '')
    }

    currentPage = 1
    loadpage()
})

document.getElementById('filtersSidebar').addEventListener('change', function (event) {
    if (event.target.closest('.category-list')) {
        document.querySelectorAll('.category-list input').forEach(function (checkbox) {
            if (checkbox !== event.target) {
                checkbox.checked = false
            }
        })
    }

    currentPage = 1
    loadpage()
})

document.getElementById('clearFiltersBtn').addEventListener('click', function () {
    document.getElementById('searchInput').value = ''
    document.getElementById('vegOnly').checked = false
    document.getElementById('spicinessRange').value = 0
    document.getElementById('ratingRange').value = 0
    document.getElementById('minPriceRange').value = 0
    document.getElementById('maxPriceRange').value = 500
    document.getElementById('spicinessValue').textContent = 'Level: not selected'
    document.getElementById('ratingValue').innerHTML = '<i class="fa-solid fa-star"></i> 0.0+'
    document.getElementById('minPriceValue').textContent = '$0+'
    document.getElementById('maxPriceValue').textContent = '$ 500+'
    document.querySelectorAll('.category-list input').forEach(function (checkbox) {
        checkbox.checked = false
    })

    currentPage = 1
    loadpage()
})


