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
          <button class="btn-primary">Add to Cart</button>
        </div>
      `;

        
    });

  })



