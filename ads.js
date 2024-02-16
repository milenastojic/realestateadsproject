const search = window.location.search
const params = search.split('=')
const userId = Number(params[1]) 
console.log(userId)

let categories
let ads
let users
let user
function calculateAverageRating(ad) {
    let sum = 0;
    if (ad.rating && ad.rating.length > 0) {
        sum = ad.rating.reduce((acc, curr) => acc + curr, 0)
        return (sum / ad.rating.length)
    }
    return 0
}
async function loadData() {

    const adsResponse = await fetch(`https://test2-oiln.onrender.com/ads`, { method: 'GET' })
    ads = await adsResponse.json()

    const userResponse = await fetch('https://test2-oiln.onrender.com/users', { method: 'GET' })
    users = await userResponse.json()

    const categoryResponse = await fetch('https://test2-oiln.onrender.com/category', { method: 'GET' })
    categories = await categoryResponse.json()

    user = users.find(u => u.id === userId)
    console.log(user)
    const linkProfil = document.getElementById('link-profile')
    if (user.admin === true) { 
        linkProfil.href = `admin.html?id=${userId}`;
    } else {
        linkProfil.href = `user.html?id=${userId}`;
    }
    
    showCategories(categories)
    showAds(ads)
}
loadData()

async function showAds(ads) {

    const allAdsTitle = document.getElementById('allAdsTitle')
    allAdsTitle.innerHTML = 'Ads by all users'
    
    const divCategory = document.querySelector('.divCategory')
    divCategory.innerHTML = ''

    function findUserName(userId) {
        user = users.find(user => user.id === userId)
        if (user) {
            return `${user.firstName} ${user.lastName}`
        }
        return "Unknown"
    }
    
    function findCategoryName(categoryId) {
        const category = categories.find(category => category.id === categoryId)
        if (category) {
            return category.name
        }
        return "Unknown Category"
    }

    ads.forEach(ad => {
        const divParent = document.createElement('div')
        divParent.classList.add('divParent')
        divCategory.appendChild(divParent)

        const adsName = document.createElement('h2')
        adsName.innerHTML = ad.title
        adsName.classList.add('nameCategoryAdmin')
        divParent.appendChild(adsName)

        const divImage = document.createElement('div')
        divImage.classList.add('divImage')
        divParent.appendChild(divImage)

        const image = document.createElement('img')
        image.src = ad.images[0]
        image.classList.add('imageCategoryAdmin')
        divImage.appendChild(image)

        const divText = document.createElement('div')
        divText.classList.add('divText')
        divParent.appendChild(divText)

        const description = document.createElement('p')
        description.innerHTML = ad.description
        divText.appendChild(description)

        const price = document.createElement('p')
        price.innerHTML = 'Price: ' + ad.price + 'e'
        divText.appendChild(price)

        const likes = document.createElement('p')
        likes.innerHTML = '<i class="fa-regular fa-heart"></i> ' + ad.likes
        divText.appendChild(likes)

        const reviews = document.createElement('p')
        reviews.classList.add('reviews')
        reviews.innerHTML = '<i class="fa-regular fa-eye"></i> ' + ad.reviews
        divText.appendChild(reviews)

        const rating = document.createElement('p')
       
        const averageRating = calculateAverageRating(ad)
        rating.innerHTML = '<i class="fa-solid fa-star" style="color: #d4aa57;"></i> ' + averageRating.toFixed(1)
        divText.appendChild(rating)

        const categoryName = document.createElement('p')
        categoryName.innerHTML = 'Category name: ' + findCategoryName(ad.category_id)
        divText.appendChild(categoryName)

        const userName = document.createElement('p')
        userName.innerHTML = 'User name: ' + findUserName(ad.user_id)
        divText.appendChild(userName)
        
        const btnInfo = document.createElement('button')
        btnInfo.innerHTML = 'Info'
        btnInfo.classList.add('btnInfo')
        divText.appendChild(btnInfo)

        btnInfo.addEventListener('click', async function() {
            const adId = ad.id
        
            const updatedReviews = ad.reviews + 1
        
            await fetch(`https://test2-oiln.onrender.com/ads/${adId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reviews: updatedReviews
                })
            })
            window.open(`./ad_info.html?user_id=${userId}&ad_id=${adId}`, '_blank')
        })
    })
    
}
function showCategories(categories) {
    const selectAds = document.getElementById('select-ads')
    categories.forEach(category => {
        if (category.id !== 'all') {
            const option = document.createElement('option')
            option.textContent = category.name
            option.value = category.id
            selectAds.appendChild(option)
        }
    })
}

const btnSelectAds = document.getElementById('btnAdsSelect')
btnSelectAds.addEventListener('click', filterAds)

let filteredAds = []

function filterAds() {
    const selectInput = document.getElementById('select-ads').value

    if (selectInput === 'all') {
        filteredAds = ads
    } else {
        filteredAds = ads.filter(ad => ad.category_id == selectInput)
    }

    const inputMin = document.getElementById('priceMin').value
    const inputMax = document.getElementById('priceMax').value

    if (inputMin !== '' && !isNaN(inputMin)) {
        const min = Number(inputMin)
        filteredAds = filteredAds.filter(ad => ad.price >= min)
    }

    if (inputMax !== '' && !isNaN(inputMax)) {
        const max = Number(inputMax)
        filteredAds = filteredAds.filter(ad => ad.price <= max)
    }

    const selectAttribute = document.getElementById('select-attribute').value
    const selectSort = document.getElementById('select-sort').value

    if (selectAttribute == 'price') {
        if (selectSort == 'asc') {
            filteredAds = filteredAds.sort((a, b) => a.price - b.price)
        } else if (selectSort == 'desc') {
            filteredAds = filteredAds.sort((a, b) => b.price - a.price)
        }
    }
    if (selectAttribute == 'likes') {
        if (selectSort == 'asc') {
            filteredAds = filteredAds.sort((a, b) => a.likes - b.likes)
        } else if (selectSort == 'desc') {
            filteredAds = filteredAds.sort((a, b) => b.likes - a.likes)
        }
    }
    if (selectAttribute == 'reviews') {
        if (selectSort == 'asc') {
            filteredAds = filteredAds.sort((a, b) => a.reviews - b.reviews)
        } else if (selectSort == 'desc') {
            filteredAds = filteredAds.sort((a, b) => b.reviews - a.reviews)
        }
    }
    if (selectAttribute == 'rating') {
        filteredAds = filteredAds.sort((a, b) => {
            const ratingA = calculateAverageRating(a)
            console.log(calculateAverageRating(a))
            const ratingB = calculateAverageRating(b)
            console.log(calculateAverageRating(b))

            if (selectSort == 'asc') {
                return ratingA - ratingB
            } else if (selectSort == 'desc') {
                return ratingB - ratingA
            }
        })
    }

    showAds(filteredAds)
}
