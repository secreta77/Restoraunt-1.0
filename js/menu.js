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
                    <button class="btn-primary">Add to Cart</button>
                </div>
                
                `
            })

        })



    
}

loadpage()


