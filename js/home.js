const dishGrid = document.getElementById('dishGrid')

fetch(`https://restaurantapi.stepacademy.ge/api/products?Take=50&Page=1
`,{
    headers: { 'X-API-KEY': API_KEY },
     'Content-Type': 'application/json'

})
.then(function (response) {
    return response.json();
  })
  .then(function (result) {
    const products = result.data.products;

    products.sort(function (a, b) {
      return b.rate - a.rate;
    });

    products.slice(0, 6).forEach(product => {
      
        dishGrid.innerHTML += `
        <div class="dish-card">
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p class="rating"><i class="fa-solid fa-star"></i> ${product.rate}</p>
          <p class="price">$${product.price.toFixed(2)}</p>
          <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        </div>
      `;

        
    });

  })


dishGrid.addEventListener('click',function(event){
  const btn = event.target.closest('.add-to-cart-btn')

  if(!btn){
    return
  }

  const accessToken = localStorage.getItem('accessToken')

  if(!accessToken){
    window.location.href = './html/login.html'
    return
  }

  fetch(`${API_BASE_URL}/api/cart/add-to-cart`,{
    method:'POST',
    headers:{
      'X-API-KEY':API_KEY,
      'Content-type':'application/json',
      'Authorization':`Bearer ${accessToken}`
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
    }else{
      showToast('Could not add to cart', outcome.result.detail || 'Something went wrong, please try again.')
    }
  })
})




