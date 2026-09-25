if(!accessToken){
    window.location.href = './login.html'
}

const cartItemsList = document.getElementById('cartItemsList')
const cartItemCount = document.getElementById('cartItemCount')
const subtotalValue = document.getElementById('subtotalValue')
const taxValue = document.getElementById('taxValue')
const totalValue  = document.getElementById('totalValue')
const checkoutBtn = document.getElementById('checkoutBtn')
const removeModalBackdrop = document.getElementById('removeModalBackdrop')
const removeCancelBtn = document.getElementById('removeCancelBtn')
const removeConfirmBtn = document.getElementById('removeConfirmBtn')


let itemIdToRemove = null

function loadCart(){
    fetch(`${API_BASE_URL}/api/cart`,{
        headers:{
            'X-API-KEY':API_KEY,
            'Authorization': `Bearer ${accessToken}`
        }

    })
    .then(function(response){
        return response.json()
    })
    .then(function(result){
        renderCart(result.data)
    })
}


function renderCart(cart){
    cartItemCount.textContent = cart.totalItems + ' Items'
    subtotalValue.textContent = '$' + cart.totalPrice.toFixed(2)

    const tax = cart.totalPrice * 0.1
    taxValue.textContent = '$' + tax.toFixed(2)
    totalValue.textContent = '$' + (cart.totalPrice + tax).toFixed(2)

    cartItemsList.innerHTML = ''

    cart.items.forEach(function(item){
        cartItemsList.innerHTML += `
         <div class="cart-item">
            <img src="${item.product.image}" alt="${item.product.name}">

            <div class="cart-item-info">
                <h3>${item.product.name}</h3>
                <p>${item.product.description}</p>

                <div class="cart-item-qty">
                    <button type="button" class="qty-decrease" data-item-id="${item.id}" data-quantity="${item.quantity}">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="qty-increase" data-item-id="${item.id}" data-quantity="${item.quantity}">+</button>
                </div>
            </div>

            <div class="cart-item-price">
                <p class="price-each">$${item.product.price.toFixed(2)} each</p>
                <p class="price-total">$${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>

            <button type="button" class="cart-item-remove" data-item-id="${item.id}">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>

        `
    })
}

function editQuantity(itemId,quantity){
    fetch(`${API_BASE_URL}/api/cart/edit-quantity`,{
        method: 'PUT',
        headers:{
        'X-API-KEY': API_KEY,
        'Authorization':`Bearer ${accessToken}`,
        'Content-Type':'application/json'

        },
        body: JSON.stringify({itemId:itemId,quantity:quantity})

    })
    .then(loadCart)


}


cartItemsList.addEventListener('click',function(event){
    const decrease = event.target.closest('.qty-decrease')
    const increase = event.target.closest('.qty-increase')
    const remove = event.target.closest('.cart-item-remove')


if(decrease){
    const current = Number(decrease.dataset.quantity)

    if(current>1){
        editQuantity(decrease.dataset.itemId, current-1)
    }

}

if(increase){
    const current = Number(increase.dataset.quantity)
    editQuantity(increase.dataset.itemId,current+1)

}

if(remove){
    itemIdToRemove = remove.dataset.itemId
    removeModalBackdrop.hidden = false
}
})

removeCancelBtn.addEventListener('click',function () {
    itemIdToRemove = null
    removeModalBackdrop.hidden = true

})

removeConfirmBtn.addEventListener('click', function () {
    fetch(`${API_BASE_URL}/api/cart/remove-from-cart/${itemIdToRemove}`, {
        method: 'DELETE',
        headers: {
            'X-API-KEY': API_KEY,
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(function () {
        removeModalBackdrop.hidden = true
        loadCart()
    })
})


checkoutBtn.addEventListener('click',function(){
    fetch(`${API_BASE_URL}/api/cart/checkout`, {
        method:'POST',
        headers:{
            'X-API-KEY': API_KEY,
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(function(response){
        return response.json()
    })
    .then(function(result){
        const checkoutResult = result.data ? result.data : result

        if(checkoutResult && checkoutResult.isSuccess){
            showToast('Thank you for your purchase!', 'Your order has been placed and is being processed.')
            loadCart()
        } else {
            showToast('Checkout failed', (checkoutResult && checkoutResult.error && checkoutResult.error.message) || 'Something went wrong, please try again.')
        }
    })

})
loadCart()







