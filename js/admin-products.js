const PRODUCTS_PER_PAGE = 10
let currentPage = 1
let currentPageProducts = []
let hasMore = false
let request = 0

const productsTableBody = document.getElementById('productsTableBody')
const prevPageBtn = document.getElementById('prevPageBtn')
const nextPageBtn = document.getElementById('nextPageBtn')
const productPanel = document.getElementById('productPanel')
const productPanelBackdrop = document.getElementById('productPanelBackdrop')
const productForm = document.getElementById('productForm')
const productCategorySelect = document.getElementById('productCategory')

function accessToken() {
    return localStorage.getItem('accessToken')
}

function loadCategories() {
    return fetch(`${API_BASE_URL}/api/categories`, {
        headers: {
            'X-API-KEY': API_KEY
        }
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (result) {
            productCategorySelect.innerHTML = result.data.map(function (category) {
                return `<option value="${category.id}">${category.name}</option>`
            }).join('')
        })
}

function loadProducts() {
    const seq = ++request

    fetch(`${API_BASE_URL}/api/products/filter?Take=${PRODUCTS_PER_PAGE}&Page=${currentPage}`, {
        headers: {
            'X-API-KEY': API_KEY
        }
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (result) {
            if (seq !== request) {
                return
            }

            currentPageProducts = result.data.products
            hasMore = result.data.hasMore

            renderPage()
        })
}

function renderPage() {
    productsTableBody.innerHTML = currentPageProducts.map(function (product) {
        const vegIcon = product.vegeterian ? '<i class="fa-solid fa-check veg-tag"></i>' : ''
        const deleteDisabled = product.canDelete ? '' : 'disabled'

        return `
        <tr>
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td><i class="fa-solid fa-star"></i> ${product.rate}</td>
            <td>${vegIcon}</td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn edit-btn" type="button" data-id="${product.id}" aria-label="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete-btn" type="button" data-id="${product.id}" ${deleteDisabled} aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
        `
    }).join('')

    prevPageBtn.disabled = currentPage === 1
    nextPageBtn.disabled = !hasMore
}

prevPageBtn.addEventListener('click', function () {
    if (currentPage === 1) {
        return
    }
    currentPage = currentPage - 1
    loadProducts()
})

nextPageBtn.addEventListener('click', function () {
    if (!hasMore) {
        return
    }
    currentPage = currentPage + 1
    loadProducts()
})

function setPanelOpen(isOpen) {
    productPanel.classList.add('animating')
    productPanel.classList.toggle('open', isOpen)
    productPanelBackdrop.classList.toggle('open', isOpen)

    setTimeout(function () {
        productPanel.classList.remove('animating')
    }, 300)
}

document.getElementById('addProductBtn').addEventListener('click', function () {
    productForm.reset()
    document.getElementById('productId').value = ''
    document.getElementById('productPanelTitle').textContent = 'Add Product'
    setPanelOpen(true)
})

document.getElementById('productPanelCloseBtn').addEventListener('click', function () {
    setPanelOpen(false)
})
document.getElementById('productPanelCancelBtn').addEventListener('click', function () {
    setPanelOpen(false)
})
productPanelBackdrop.addEventListener('click', function () {
    setPanelOpen(false)
})

productsTableBody.addEventListener('click', function (event) {
    const editBtn = event.target.closest('.edit-btn')
    const deleteBtn = event.target.closest('.delete-btn')

    if (editBtn) {
        const id = editBtn.dataset.id

        fetch(`${API_BASE_URL}/api/products/${id}`, {
            headers: {
                'X-API-KEY': API_KEY
            }
        })
            .then(function (response) {
                return response.json()
            })
            .then(function (result) {
                const product = result.data

                document.getElementById('productId').value = product.id
                document.getElementById('productName').value = product.name
                document.getElementById('productDescription').value = product.description
                document.getElementById('productCategory').value = product.categoryId
                document.getElementById('productPrice').value = product.price
                document.getElementById('productSpiciness').value = product.spiciness
                document.getElementById('productVegetarian').checked = product.vegetarian
                document.getElementById('productImage').value = product.image
                document.getElementById('productMethod').value = product.method
                document.getElementById('productIngredients').value = (product.ingredients || []).join('\n')
                document.getElementById('productPanelTitle').textContent = 'Edit Product'
                setPanelOpen(true)
            })
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id

        if (!confirm('Delete this product?')) {
            return
        }

        fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'X-API-KEY': API_KEY,
                'Authorization': `Bearer ${accessToken()}`
            }
        })
            .then(function (response) {
                return response.json().then(function (result) {
                    return { ok: response.ok, result: result }
                })
            })
            .then(function (outcome) {
                if (outcome.ok) {
                    showToast('Product deleted', 'The product was removed.')
                    loadProducts()
                } else {
                    showToast('Could not delete', outcome.result.detail || 'Something went wrong.')
                }
            })
    }
})

productForm.addEventListener('submit', function (event) {
    event.preventDefault()

    const id = document.getElementById('productId').value

    const ingredients = document.getElementById('productIngredients').value
        .split('\n')
        .map(function (line) { return line.trim() })
        .filter(function (line) { return line.length > 0 })

    const payload = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        vegetarian: document.getElementById('productVegetarian').checked,
        spiciness: Number(document.getElementById('productSpiciness').value),
        price: Number(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value,
        method: document.getElementById('productMethod').value,
        ingredients: ingredients,
        categoryId: Number(document.getElementById('productCategory').value)
    }

    const isEdit = Boolean(id)
    const url = isEdit ? `${API_BASE_URL}/api/products/${id}` : `${API_BASE_URL}/api/products`
    const method = isEdit ? 'PUT' : 'POST'

    fetch(url, {
        method: method,
        headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken()}`
        },
        body: JSON.stringify(payload)
    })
        .then(function (response) {
            return response.json().then(function (result) {
                return { ok: response.ok, result: result }
            })
        })
        .then(function (outcome) {
            if (outcome.ok) {
                showToast(isEdit ? 'Product updated' : 'Product created', 'Saved successfully.')
                setPanelOpen(false)
                loadProducts()
            } else {
                showToast('Could not save', outcome.result.detail || 'Something went wrong.')
            }
        })
})

document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '../../index.html'
})

loadCategories().then(loadProducts)
