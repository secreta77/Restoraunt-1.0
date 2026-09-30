const urlParams  = new URLSearchParams(window.location.search)
const productId = urlParams.get('id')
const productDetail = document.getElementById('productDetail')
let quantity = 1

fetch(`${API_BASE_URL}/api/products/${productId}`,{
    headers:{
        'X-API-KEY':API_KEY
    }
})
.then(function(response){
    return response.json()
})
.then(function(result){
    const product = result.data
    const vegetarianBadge = product.vegetarian ? '<div class="veg-badge"><i class="fa-solid fa-leaf"></i> Vegetarian</div>' : ''
    const spicinessBadge = product.spiciness > 0 ? '<p class="spiciness"><i class="fa-solid fa-pepper-hot"></i> Spiciness: ' + product.spiciness + '/5</p>' : ''
    const ingredientsList = product.ingredients.map(function(ingredient){
        return '<li>' + ingredient + "</li>"
    }).join('')
    productDetail.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image">

    <div class="product-info">
        <h1>${product.name}</h1>

        <p class="rating"><i class="fa-solid fa-star"></i> ${product.rate}</p>

        <p class="price">$${product.price.toFixed(2)}</p>

        ${spicinessBadge}

        ${vegetarianBadge}

        <p class="description">${product.description}</p>

        <h2>Ingredients</h2>
        <ul class="ingredients-list">
            ${ingredientsList}
        </ul>

        <h2>Preparation Method</h2>
        <p class="method">${product.method}</p>

        <div class="qty-row">
            <button type="button" id="qtyDecrease">-</button>
            <span id="qtyValue">1</span>
            <button type="button" id="qtyIncrease">+</button>
        </div>

        <button type="button" class="btn-primary" id="addToCartBtn">Add to Cart</button>
    </div>
`

document.getElementById('qtyDecrease').addEventListener('click',function(){
    if(quantity>1){
        quantity = quantity - 1
        document.getElementById('qtyValue').textContent = quantity

    }


})

document.getElementById('qtyIncrease').addEventListener('click',function(){
    quantity = quantity + 1
    document.getElementById('qtyValue').textContent = quantity
})

document.getElementById('addToCartBtn').addEventListener('click',function(){
    const accessToken = localStorage.getItem('accessToken')

    if(!accessToken){
        window.location.href = './login.html'
        return
    }

fetch(`${API_BASE_URL}/api/cart/add-to-cart`,{
    method:"POST",
    headers:{
        'X-API-KEY':API_KEY,
        'Content-type':'application/json',
        'Authorization':`Bearer ${accessToken}`
    },
    body:JSON.stringify({productId:Number(productId),quantity:quantity})



})
.then(function(response){
    return response.json().then(function(result){
        return {ok:response.ok,result:result}
    })


})
.then(function(outcome){
    if (outcome.ok) {
        showToast('Added to cart', 'Item added successfully.')
        updateCart()
    } else {
        showToast('Could not add to cart', outcome.result.detail || 'Something went wrong, please try again.')
    }
})


})


})


fetch(`${API_BASE_URL}/api/products?Take=50&Page=1`,{
    headers:{
        'X-API-KEY':API_KEY
    }
})
    .then(function(response){
        return response.json()
    })
    .then(function(result){
        const relatedGrid = document.getElementById('relatedGrid')
        const otherProducts = result.data.products.filter(function(item){
            return item.id !== Number(productId)
        })

        const related = otherProducts.slice(0,3)

        related.forEach(function(item){
            relatedGrid.innerHTML +=`
            <div class="dish-card">
                <a href="./product.html?id=${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                </a>
                <p class="dish-description">${item.description}</p>
                <p class="rating"><i class="fa-solid fa-star"></i> ${item.rate}</p>
                ${item.spiciness > 0 ? '<p class="spiciness"><i class="fa-solid fa-pepper-hot"></i> ' + item.spiciness + '/5</p>' : ''}
                <p class="price">$${item.price.toFixed(2)}</p>
                <button class="btn-primary add-to-cart-btn" data-product-id="${item.id}">Add to Cart</button>
            </div>

            `
        })
    })

document.getElementById('relatedGrid').addEventListener('click', function(event){
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
            return {ok:response.ok,result:result}
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