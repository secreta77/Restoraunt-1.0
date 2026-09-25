const menuGrid = document.getElementById('menuGrid');
const resultCount = document.getElementById('resultsCount')

function loadpage() {
    fetch(`${API_BASE_URL}/api/products/filter?Take=10&Page=1`, {
        headers: {
            'X-API-KEY': API_KEY
        }
        
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (result) {
            const products = result.data.products

            products.sort(function (a, b) {
                return b.rate - a.rate;
              });

            resultCount.textContent = 'Showing ' + products.length + ' products'

            menuGrid.innerHTML = ''
        
            products.forEach(function (product) {
                menuGrid.innerHTML += `
                <div class="dish-card">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="dish-description">${product.description}</p>
                    <p class="rating"><i class="fa-solid fa-star"></i> ${product.rate}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>

                </div>
                
                `
            })

        })



    
}

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
    .then(function(){
        showToast('Added to cart', 'Item added successfully.')
    })
})