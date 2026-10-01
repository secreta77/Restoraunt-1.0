const categoriesTableBody = document.getElementById('categoriesTableBody')
const categoryPanel = document.getElementById('categoryPanel')
const categoryPanelBackdrop = document.getElementById('categoryPanelBackdrop')
const categoryForm = document.getElementById('categoryForm')

function accessToken() {
    return localStorage.getItem('accessToken')
}

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
            renderCategories(result.data)
        })
}

function renderCategories(categories) {
    categoriesTableBody.innerHTML = categories.map(function (category) {
        const deleteDisabled = category.canDelete ? '' : 'disabled'

        return `
        <tr>
            <td>${category.name}</td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn edit-btn" type="button" data-id="${category.id}" data-name="${category.name}" aria-label="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete-btn" type="button" data-id="${category.id}" ${deleteDisabled} aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
        `
    }).join('')
}

function setPanelOpen(isOpen) {
    categoryPanel.classList.add('animating')
    categoryPanel.classList.toggle('open', isOpen)
    categoryPanelBackdrop.classList.toggle('open', isOpen)

    setTimeout(function () {
        categoryPanel.classList.remove('animating')
    }, 300)
}

document.getElementById('addCategoryBtn').addEventListener('click', function () {
    categoryForm.reset()
    document.getElementById('categoryId').value = ''
    document.getElementById('categoryPanelTitle').textContent = 'Add Category'
    setPanelOpen(true)
})

document.getElementById('categoryPanelCloseBtn').addEventListener('click', function () {
    setPanelOpen(false)
})

document.getElementById('categoryPanelCancelBtn').addEventListener('click', function () {
    setPanelOpen(false)
})

categoryPanelBackdrop.addEventListener('click', function () {
    setPanelOpen(false)
})

categoriesTableBody.addEventListener('click', function (event) {
    const editBtn = event.target.closest('.edit-btn')
    const deleteBtn = event.target.closest('.delete-btn')

    if (editBtn) {
        document.getElementById('categoryId').value = editBtn.dataset.id
        document.getElementById('categoryName').value = editBtn.dataset.name
        document.getElementById('categoryPanelTitle').textContent = 'Edit Category'
        setPanelOpen(true)
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id

        if (!confirm('Delete this category?')) {
            return
        }

        fetch(`${API_BASE_URL}/api/categories/${id}`, {
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
                    showToast('Category deleted', 'The category was removed.')
                    loadCategories()
                } else {
                    showToast('Could not delete', outcome.result.detail || 'Something went wrong.')
                }
            })
    }
})

categoryForm.addEventListener('submit', function (event) {
    event.preventDefault()

    const id = document.getElementById('categoryId').value
    const payload = { name: document.getElementById('categoryName').value }

    const isEdit = Boolean(id)
    const url = isEdit ? `${API_BASE_URL}/api/categories/${id}` : `${API_BASE_URL}/api/categories`
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
                showToast(isEdit ? 'Category updated' : 'Category created', 'Saved successfully.')
                setPanelOpen(false)
                loadCategories()
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

loadCategories()
