

const PRODUCTS_PER_PAGE = 10
let currentPage = 1
let allProducts = []


const productsTableBody = document.getElementById('productsTableBody')
const prevPageBtn = document.getElementById('prevPageBtn')
const nextPageBtn = document.getElementById('nextPageBtn')
const productPanel = document.getElementById('productPanel')     
const productPanelBackdrop = document.getElementById('productPanelBackdrop') 
const productForm = document.getElementById('productForm')
const productCategorySelect = document.getElementById('productCategory')


function accessToken(){
    return localStorage.getItem('accessToken')

}

function loadCategories(){
    return fetch(`${API_BASE_URL}/api/categories`,{
        headers:{
            'X-API-KEY':API_KEY
        }
    })
    .then(function(response){
        return response.json()
    })
    .then(function(result){
        productCategorySelect.innerHTML += result.data.map(function(category){
            return `<option value="${category.id}">${category.name}</option>`
        }).join('')
    })
}





