const accessToken = localStorage.getItem('accessToken')

if(!accessToken){
    window.location.href = '.login.html'
}

const cartItemList = document.getElementById('cartItemsList')
const cartItemCount = document.getElementById('cartItemCount')
const subtotalValue = document.getElementById('subtotalValue')
const taxValue = document.getElementById('taxValue')
const totalValue  = document.getElementById('totalValue')
const checkoutBtn = document.getElementById('checkoutBtn')
const removeModalBackdrop = document.getElementById('removeModalBackdrop')
const removeCancelBtn = document.getElementById('removeCancelBtn')
const removeConfirmBtn = document.getElementById('removeConfirmBtn')


let itemRemove = null

function cart(){
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


function renderCart(){
    cartItemCount.textContent = cart.totalItems + ' Items'
    subtotalValue.textContent = '$' + cart.totalPrice

    const tax = cart.totalPrice * 0.1
    taxValue.textContent = '$' + tax
    totalValue.textContent = '$' + (cart.totalPrice + tax)

    cartItemsList.innerHTML = ''
    
    cart.items.forEach(function(item){
        cartItemsList.innerHTML = `
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
        method:`PUT`,
        headers:{
        'Authorization':`Bearer ${accessToken}`,
        'Content-Type':'application/json'

        },
        body: JSON.stringify({itemId:itemId,quantity:quantity})

    })
    .then(Cart())


}