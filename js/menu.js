const menuGrid = document.getElementById('menuGrid');
const resultCount = document.getElementById('resultsCount')

const pageSizeSelect = document.getElementById('pageSizeSelect')
const pageLabel = document.getElementById('pageLabel')


let currentPage = 1
let currentPageProducts = []
let hasMore = false
let request = 0
let filterFix

const prevPageBtn = document.getElementById('prevPageBtn')
const nextPageBtn = document.getElementById('nextPageBtn')




function loadpage() {

    const seq = ++request




    const params = new URLSearchParams()
    params.set('Take', pageSizeSelect.value)
    params.set('Page',currentPage)

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
        params.set('CategoryId', checkedCategory.value)
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
            if(seq !==request){
                return
            }
        currentPageProducts = result.data.products
        hasMore = result.data.hasMore

        renderPage()

        })
}

function renderPage() {


    resultCount.textContent = 'Showing ' + currentPageProducts.length + ' products'
    pageLabel.textContent = 'Page ' + currentPage

    menuGrid.innerHTML = ''

    currentPageProducts.forEach(function (product) {
        menuGrid.innerHTML += `
        <div class="dish-card">
            <a href="./product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
            </a>
            <p class="dish-description">${product.description}</p>
            <p class="rating"><i class="fa-solid fa-star"></i> ${product.rate}</p>
            ${product.spiciness > 0 ? '<p class="spiciness"><i class="fa-solid fa-pepper-hot"></i> ' + product.spiciness + '/5</p>' : ''}
            <p class="price">$${product.price.toFixed(2)}</p>
            <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        </div>
        `
    })

    prevPageBtn.disabled = currentPage === 1
    nextPageBtn.disabled = !hasMore
}

document.getElementById('spicinessRange').value = 0
document.getElementById('ratingRange').value = 0
document.getElementById('minPriceRange').value = 0
document.getElementById('maxPriceRange').value = 500

function loadCategories() {
    fetch(`${API_BASE_URL}/api/categories`, {
        headers: {
            'X-API-KEY': API_KEY
        }
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (result) {
            const categoryList = document.querySelector('.category-list')
            categoryList.innerHTML = result.data.map(function (category) {
                return `<label class="checkbox-row"><input type="checkbox" value="${category.id}"> ${category.name}</label>`
            }).join('')
        })
}

loadCategories()
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
    loadpage()
})


nextPageBtn.addEventListener('click',function(){
    if(!hasMore){
        return
    }
    currentPage = currentPage + 1
    loadpage()
})
pageSizeSelect.addEventListener('change',function(){
    currentPage = 1
    loadpage()
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

    clearTimeout(filterFix)
    filterFix = setTimeout(function(){
        currentPage = 1
        loadpage()

    },300)

})

document.getElementById('filtersSidebar').addEventListener('change', function (event) {
    clearTimeout(filterFix)

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


