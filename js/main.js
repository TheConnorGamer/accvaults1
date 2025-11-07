// ===== BANNER FUNCTIONALITY =====
function closeBanner() {
    const banner = document.querySelector('.announcement-banner');
    banner.style.animation = 'slideDown 0.3s ease reverse';
    setTimeout(() => {
        banner.style.display = 'none';
    }, 300);
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Force hide nav on mobile on page load
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.getElementById('navLinks');
    if (window.innerWidth <= 768 && navLinks) {
        navLinks.style.display = 'none';
        navLinks.classList.remove('active');
    }
});

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
    // Check if countdown elements exist before updating
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        return; // Exit if elements don't exist
    }
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const now = new Date();
    const diff = endDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
}

// ===== PRODUCTS DATA =====
// Product groups for Paylix integration
// 
// HOW TO ADD CUSTOM IMAGES:
// 1. Upload your image to imgur.com or any image hosting service
// 2. Copy the direct image URL (should end in .png, .jpg, etc.)
// 3. Replace 'https://i.imgur.com/your-image.png' with your actual image URL
// 4. You can set different images for:
//    - Group header (imageUrl in the main object)
//    - Individual products (imageUrl in each product)
// 5. If you don't set a custom URL, it will try to fetch from Paylix API
// 6. If no Paylix image exists, it will show the default purple shield SVG
//
// Product categories - fetched from Paylix with custom icons
let productCategories = {
    '690ab6ad54eda': {
        name: 'Streaming Services & AI Tools',
        icon: '🛒',
        description: 'Premium streaming and AI subscriptions'
    },
    '690b79e20a222': {
        name: 'PC SOFTWARE / CHEATS',
        icon: '🛒',
        description: 'PC software and gaming cheats'
    }
    // Add more Paylix category IDs here with custom icons
    // Get category IDs from your Paylix dashboard
};

// Fetch categories from Paylix and merge with local config
async function loadPaylixCategories() {
    try {
        const response = await fetch('/api/paylix-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getCategories' })
        });
        
        if (!response.ok) {
            console.warn('⚠️ Failed to load categories from Paylix API');
            return;
        }
        
        const result = await response.json();
        
        if (result.success && result.data?.data?.categories) {
            const paylixCategories = result.data.data.categories;
            
            // Merge Paylix categories with local config
            paylixCategories.forEach(cat => {
                if (!productCategories[cat.uniqid]) {
                    productCategories[cat.uniqid] = {
                        name: cat.title,
                        icon: '📦',
                        description: cat.title
                    };
                } else {
                    // Update name from Paylix but keep local icon/description
                    productCategories[cat.uniqid].name = cat.title;
                }
            });
            
            console.log('✅ Loaded categories from Paylix:', productCategories);
        }
    } catch (error) {
        console.error('Failed to load Paylix categories:', error);
    }
}

let productGroups = [
    {
        id: 1,
        name: '1 Month - Server Boosts',
        description: 'Discord Server Boosts - 1 Month Duration',
        category: '690ab6ad54eda', // Use Paylix category ID from dashboard
        icon: '💎',
        badge: 'Popular',
        paylixGroupId: '69090def71dea', // Group ID for all server boosts
        imageUrl: '/images/server-boost.png',
        products: [
            { name: '8 x Server Boosts 1 Month', price: 2.00, paylixId: '690909b56733b', imageUrl: '/images/server-boost.png' },
            { name: '14 x Server Boosts 1 Month', price: 3.00, paylixId: '690909bb07601', imageUrl: '/images/server-boost.png' },
            { name: '20 x Server Boosts 1 Month', price: 4.50, paylixId: '69090d76c21b6', imageUrl: '/images/server-boost.png' }
        ]
    }
    // Add more product groups here when you create them in Paylix
    // Example for PC SOFTWARE / CHEATS category (ID: 690b79e20a222):
    // {
    //     id: 2,
    //     name: 'Your Product Group Name',
    //     description: 'Your description',
    //     category: '690b79e20a222',
    //     icon: '🎮',
    //     badge: 'New',
    //     paylixGroupId: 'YOUR_GROUP_ID_FROM_PAYLIX',
    //     imageUrl: '/images/your-image.png',
    //     products: [
    //         { name: 'Product Name', price: 10.00, paylixId: 'YOUR_PRODUCT_ID', imageUrl: '/images/your-image.png' }
    //     ]
    // }
];

// ===== FETCH PRODUCT IMAGES FROM PAYLIX =====
async function loadProductImagesFromPaylix() {
    try {
        // Fetch products from Paylix API
        const response = await fetch('https://dev.paylix.gg/v1/merchants/accvaults/products');
        const data = await response.json();
        
        if (data.success && data.data) {
            const paylixProducts = data.data;
            
            // Update product groups with real images (only if custom URL not already set)
            productGroups.forEach(group => {
                group.products.forEach(product => {
                    // Only fetch from Paylix if no custom imageUrl is set
                    if (!product.imageUrl || product.imageUrl.includes('your-image.png')) {
                        const paylixProduct = paylixProducts.find(p => p.id === product.paylixId);
                        if (paylixProduct && paylixProduct.image_url) {
                            product.imageUrl = paylixProduct.image_url;
                        }
                    }
                });
                
                // Set group image from first product if not custom set
                if (!group.imageUrl || group.imageUrl.includes('your-image.png')) {
                    const firstProductWithImage = group.products.find(p => p.imageUrl && !p.imageUrl.includes('your-image.png'));
                    if (firstProductWithImage) {
                        group.imageUrl = firstProductWithImage.imageUrl;
                    }
                }
            });
            
            console.log('✅ Loaded product images from Paylix');
            // Re-render products with new images
            renderProductsByCategory();
        }
    } catch (error) {
        console.error('Failed to load Paylix product images:', error);
        // Continue with custom URLs or default SVG icons
    }
}

// Legacy products array for compatibility (empty now)
const products = [];

// ===== REVIEWS DATA =====
// Empty array - will be populated with real reviews from Paylix API
const reviews = [];

// ===== RENDER PRODUCTS BY CATEGORY =====
function renderProductsByCategory() {
    const productsGrid = document.getElementById('productsGrid');
    
    // Group products by category
    const categorizedProducts = {};
    Object.keys(productCategories).forEach(cat => {
        categorizedProducts[cat] = productGroups.filter(g => g.category === cat);
    });
    
    // Render each category section
    let html = '';
    Object.keys(categorizedProducts).forEach(categoryKey => {
        const category = productCategories[categoryKey];
        const groups = categorizedProducts[categoryKey];
        
        if (groups.length === 0) return;
        
        html += `
            <div class="category-section" style="margin-bottom: 60px; width: 100%;">
                <div class="category-header" style="
                    background: linear-gradient(90deg, rgba(131, 89, 207, 0.4) 0%, rgba(92, 61, 153, 0.4) 100%); 
                    padding: 24px 40px; 
                    border-radius: 12px; 
                    margin-bottom: 35px; 
                    margin-left: 0;
                    margin-right: 0;
                    border: 1px solid rgba(131, 89, 207, 0.6); 
                    text-align: center;
                    width: 100%;
                    box-sizing: border-box;
                    box-shadow: 0 4px 20px rgba(131, 89, 207, 0.15);
                ">
                    <h2 style="font-size: 28px; font-weight: 700; color: #fff; margin: 0; display: inline-flex; align-items: center; gap: 12px; justify-content: center; letter-spacing: 0.5px;">
                        ${category.name} <span style="font-size: 28px;">${category.icon}</span>
                    </h2>
                </div>
                <div class="product-cards-grid">
                    ${groups.map((group, index) => renderGroupCard(group, index)).join('')}
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = html;
}

// ===== RENDER GROUP CARD =====
function renderGroupCard(group, index) {
    const prices = group.products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceDisplay = minPrice === maxPrice 
        ? `£${minPrice.toFixed(2)}`
        : `£${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)}`;
    
    const productCount = group.products.length;
    
    const logoContent = group.imageUrl 
        ? `<img src="${group.imageUrl}" alt="${group.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`
        : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V12C2 17.55 6.84 22.74 12 24C17.16 22.74 22 17.55 22 12V7L12 2Z" fill="url(#boost-gradient-${index})"/>
            <path d="M12 8L8 11L10 13L12 11L14 13L16 11L12 8Z" fill="white" opacity="0.9"/>
            <defs>
                <linearGradient id="boost-gradient-${index}" x1="2" y1="2" x2="22" y2="24">
                    <stop offset="0%" stop-color="#8359cf"/>
                    <stop offset="100%" stop-color="#5c3d99"/>
                </linearGradient>
            </defs>
        </svg>`;
    
    return `
        <div class="compact-group-card" style="animation-delay: ${index * 0.1}s">
            <div class="compact-card-image">
                ${logoContent}
            </div>
            <div class="compact-card-info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="color: #8b5cf6; font-size: 16px; font-weight: 700;">${priceDisplay}</span>
                    <span style="color: #ff6b6b; font-size: 12px; font-weight: 600;">${productCount} Products</span>
                </div>
                <h4 style="font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 8px 0;">${group.name}</h4>
                <button 
                    class="compact-card-btn" 
                    onclick="openProductSelector(${group.id})">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

// ===== RENDER SINGLE PRODUCT CARD =====
function renderProductCard(group, index) {
    // Calculate price range with currency conversion
    const prices = group.products.map(p => p.price);
    const minPriceGBP = Math.min(...prices);
    const maxPriceGBP = Math.max(...prices);
    
    // Display prices in GBP only
    const priceDisplay = minPriceGBP === maxPriceGBP 
        ? `£${minPriceGBP.toFixed(2)}`
        : `£${minPriceGBP.toFixed(2)} - £${maxPriceGBP.toFixed(2)}`;
    
    // Determine what to show in the logo area
    const logoContent = group.imageUrl 
        ? `<img src="${group.imageUrl}" alt="${group.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0;">`
        : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V12C2 17.55 6.84 22.74 12 24C17.16 22.74 22 17.55 22 12V7L12 2Z" fill="url(#boost-gradient-${index})"/>
            <path d="M12 8L8 11L10 13L12 11L14 13L16 11L12 8Z" fill="white" opacity="0.9"/>
            <defs>
                <linearGradient id="boost-gradient-${index}" x1="2" y1="2" x2="22" y2="24">
                    <stop offset="0%" stop-color="#8359cf"/>
                    <stop offset="100%" stop-color="#5c3d99"/>
                </linearGradient>
            </defs>
        </svg>`;
    
    return `
        <div class="product-card" data-category="${group.category}" style="animation-delay: ${index * 0.1}s">
            ${group.badge ? `<span class="product-badge">${group.badge}</span>` : ''}
            <div class="product-card-header">
                <div class="product-logo">
                    ${logoContent}
                </div>
            </div>
            <div class="product-card-body">
                <h3 class="product-title">${group.name}</h3>
                <p class="product-description">${group.description}</p>
                <div class="product-price-tag">${priceDisplay}</div>
            </div>
            <div class="product-card-footer">
                <button 
                    class="product-buy-btn" 
                    onclick="openProductSelector(${group.id})">
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
            </div>
        </div>
    `;
}


// ===== RENDER REVIEWS =====
function renderReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;
    
    // Don't render default reviews - wait for Paylix data
    reviewsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 16px;"></i>
            <p>Loading reviews from Paylix...</p>
        </div>
    `;
}

// ===== LOAD REAL REVIEWS FROM PAYLIX =====
async function loadRealReviews() {
    try {
        console.log('📝 Fetching reviews from Paylix API...');
        
        // Call through Cloudflare function (which has the API key)
        const response = await fetch('/api/paylix-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getReviews' })
        });
        
        if (!response.ok) {
            console.warn('⚠️ Failed to fetch reviews:', response.status);
            throw new Error('Failed to fetch reviews');
        }
        
        const result = await response.json();
        console.log('✅ Reviews API response:', result);
        
        const data = result.data || result;
        
        const reviewsGrid = document.getElementById('reviewsGrid');
        if (!reviewsGrid) return;
        
        // Extract feedback array from response
        let feedback = [];
        
        if (data && data.data && data.data.feedback) {
            feedback = data.data.feedback;
        } else if (data && Array.isArray(data.feedback)) {
            feedback = data.feedback;
        } else if (Array.isArray(data)) {
            feedback = data;
        } else if (data && data.feedback) {
            feedback = [data.feedback];
        }
        
        const validFeedback = feedback || [];
        console.log(`📊 Found ${validFeedback.length} reviews`);
        
        if (validFeedback.length > 0) {
            // Fetch customer info for each review
            const reviewsWithCustomers = await Promise.all(
                validFeedback.slice(0, 6).map(async (feedback) => {
                    let customerEmail = null;
                    
                    // Try to fetch order details to get customer email
                    if (feedback.invoice_id) {
                        try {
                            const orderResponse = await fetch('/api/paylix-api', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'getOrder', orderId: feedback.invoice_id })
                            });
                            const orderResult = await orderResponse.json();
                            
                            if (orderResult.success && orderResult.data?.data?.order?.customer_email) {
                                customerEmail = orderResult.data.data.order.customer_email;
                            }
                        } catch (err) {
                            console.log('Could not fetch order for review:', err);
                        }
                    }
                    
                    return { ...feedback, customerEmail };
                })
            );
            
            // Update reviews display with real feedback and customer names
            reviewsGrid.innerHTML = reviewsWithCustomers.map(feedback => {
                const stars = '⭐'.repeat(feedback.score || 5);
                const productTitle = feedback.product_title || 'Product';
                
                // Generate customer name from email
                let customerName = 'Verified Customer';
                let initials = 'VC';
                
                if (feedback.customerEmail) {
                    // Extract name from email (e.g., "john.doe@gmail.com" -> "John D.")
                    const emailPart = feedback.customerEmail.split('@')[0];
                    const nameParts = emailPart.split(/[._-]/);
                    
                    if (nameParts.length > 0) {
                        const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
                        const lastInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
                        
                        customerName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;
                        initials = firstName.charAt(0) + (lastInitial || firstName.charAt(1)).toUpperCase();
                    }
                }
                
                return `
                    <div class="review-card-new">
                        <div class="review-header-new">
                            <div class="review-avatar-new">${initials}</div>
                            <div class="review-info-new">
                                <h4 class="review-name">${customerName}</h4>
                                <div class="review-stars-new">${stars}</div>
                            </div>
                        </div>
                        <p class="review-text-new">${feedback.message || 'Great service!'}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                            <span class="review-date-new">${formatReviewDate(feedback.created_at)}</span>
                            <span class="verified-badge"><i class="fas fa-check-circle"></i> ${productTitle}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            // No reviews yet - show message
            reviewsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.6);">
                    <i class="fas fa-star" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3 style="font-size: 24px; margin-bottom: 12px; color: rgba(255,255,255,0.8);">No Reviews Yet</h3>
                    <p style="font-size: 16px;">Be the first to leave a review after your purchase!</p>
                </div>
            `;
        }
    } catch (error) {
        console.log('Failed to load reviews from Paylix:', error);
        const reviewsGrid = document.getElementById('reviewsGrid');
        if (reviewsGrid) {
            reviewsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.6);">
                    <i class="fas fa-star" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3 style="font-size: 24px; margin-bottom: 12px; color: rgba(255,255,255,0.8);">No Reviews Yet</h3>
                    <p style="font-size: 16px;">Be the first to leave a review after your purchase!</p>
                </div>
            `;
        }
    }
}

function formatReviewDate(dateInput) {
    if (!dateInput) return 'Recently';
    
    let date;
    
    // Check if it's a Unix timestamp (number or numeric string)
    if (typeof dateInput === 'number' || !isNaN(dateInput)) {
        // Convert Unix timestamp to milliseconds
        const timestamp = Number(dateInput);
        // If timestamp is in seconds (typical Unix timestamp), convert to milliseconds
        date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
    } else {
        // Parse as date string
        date = new Date(dateInput);
    }
    
    // Validate date
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateInput);
        return 'Recently';
    }
    
    const now = new Date();
    const diffMs = now - date;
    
    // Calculate calendar days difference (not just 24-hour periods)
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reviewDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((nowDate - reviewDate) / (1000 * 60 * 60 * 24));
    
    console.log('Date parsing:', { 
        input: dateInput, 
        inputType: typeof dateInput,
        timestamp: Number(dateInput),
        parsed: date.toLocaleString(), 
        parsedISO: date.toISOString(),
        now: now.toLocaleString(),
        nowISO: now.toISOString(),
        diffMs,
        diffDays,
        diffHours: Math.floor(diffMs / (1000 * 60 * 60))
    });
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    // Calculate actual months difference
    const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    
    if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    
    // Calculate years
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

// ===== FETCH PAYLIX STATS =====
async function fetchPaylixStats() {
    try {
        const response = await fetch('/api/paylix-stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        
        console.log('📊 Paylix stats received:', data);
        
        // Update stats on homepage - using correct selectors
        const statNumbers = document.querySelectorAll('.stat-number');
        
        if (statNumbers.length >= 3) {
            statNumbers[0].textContent = data.stats.feedbackRating.toFixed(1);
            statNumbers[1].textContent = data.stats.productsSold;
            statNumbers[2].textContent = data.stats.totalCustomers;
        }
        
        // Update reviews page stats
        const reviewsAvgRating = document.getElementById('reviews-avg-rating');
        const reviewsTotalCount = document.getElementById('reviews-total-count');
        const reviewsSatisfaction = document.getElementById('reviews-satisfaction');
        
        if (reviewsAvgRating) reviewsAvgRating.textContent = data.stats.feedbackRating.toFixed(1);
        if (reviewsTotalCount) {
            const count = data.stats.totalReviews || 0;
            reviewsTotalCount.textContent = count > 0 ? `${count}` : '0';
        }
        if (reviewsSatisfaction) {
            // Calculate satisfaction as percentage of 4+ star reviews
            const satisfaction = data.stats.totalReviews > 0 
                ? Math.round((data.stats.feedbackRating / 5) * 100)
                : 0;
            reviewsSatisfaction.textContent = `${satisfaction}%`;
        }
        
        // Don't update reviews here - let loadRealReviews() handle it for better customer names
        
        console.log('✅ Paylix stats loaded:', data.stats);
    } catch (error) {
        console.error('❌ Error fetching Paylix stats:', error);
        // Keep default values if API fails
    }
}

function updateReviewsFromPaylix(paylixReviews) {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;
    
    // Show message if no reviews yet
    if (!paylixReviews || paylixReviews.length === 0) {
        reviewsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.6);">
                <i class="fas fa-star" style="font-size: 48px; margin-bottom: 20px; color: rgba(139, 92, 246, 0.5);"></i>
                <h3 style="font-size: 24px; margin-bottom: 12px;">No Reviews Yet</h3>
                <p>Be the first to leave a review after your purchase!</p>
            </div>
        `;
        return;
    }
    
    // Generate random colors for avatars
    const avatarColors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    
    reviewsGrid.innerHTML = paylixReviews.map((review, index) => {
        const avatarColor = avatarColors[index % avatarColors.length];
        const initials = review.avatar || 'C';
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        return `
            <div class="review-card-new">
                <div class="review-header-new">
                    <div class="review-avatar-circle" style="background: ${avatarColor};">
                        ${initials}
                    </div>
                    <div class="review-info-new">
                        <h4 class="review-name">${review.name}</h4>
                        <div class="review-stars-new">${stars}</div>
                    </div>
                </div>
                <p class="review-text-new">${review.text || 'Great service!'}</p>
                <span class="review-date-new">${review.date}</span>
            </div>
        `;
    }).join('');
}

// ===== FILTER PRODUCTS =====
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize
    renderReviews();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Load categories first, then render products
    await loadPaylixCategories();
    renderProductsByCategory();
    
    // Load product images from Paylix
    loadProductImagesFromPaylix();
    
    // Fetch Paylix stats
    fetchPaylixStats();
    
    // Refresh stats every 30 seconds
    setInterval(fetchPaylixStats, 30000);
    
    // Update login button status
    updateLoginButton();
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            renderProducts(filter);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const filterProducts = (searchTerm) => {
            // Search through compact cards (product groups)
            const compactCards = document.querySelectorAll('.compact-card');
            const categorySections = document.querySelectorAll('.category-section');
            let totalVisibleCards = 0;
            
            if (searchTerm === '') {
                // Show all if search is empty
                compactCards.forEach(card => card.style.display = 'block');
                categorySections.forEach(section => section.style.display = 'block');
                return compactCards.length;
            }
            
            // Filter through each category section
            categorySections.forEach(section => {
                let hasVisibleCards = false;
                const cardsInSection = section.querySelectorAll('.compact-card');
                
                cardsInSection.forEach(card => {
                    const title = card.querySelector('.compact-card-title')?.textContent.toLowerCase() || '';
                    const description = card.querySelector('.compact-card-description')?.textContent.toLowerCase() || '';
                    
                    if (title.includes(searchTerm) || description.includes(searchTerm)) {
                        card.style.display = 'block';
                        hasVisibleCards = true;
                        totalVisibleCards++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Show/hide category section based on if it has visible cards
                section.style.display = hasVisibleCards ? 'block' : 'none';
            });
            
            return totalVisibleCards;
        };
        
        const scrollToResults = () => {
            const productsSection = document.querySelector('.products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        
        // Search as you type (filter only, no scroll)
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterProducts(searchTerm);
        });
        
        // Search on Enter key (filter + scroll)
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = searchInput.value.toLowerCase().trim();
                const visibleCount = filterProducts(searchTerm);
                
                // Only scroll if there are results
                if (searchTerm !== '' && visibleCount > 0) {
                    scrollToResults();
                }
                searchInput.blur(); // Remove focus from input
            }
        });
    }
});


function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let purchaseItem = {
        productId: product.id,
        name: product.name,
        icon: product.icon,
        description: product.description,
        price: product.basePrice
    };
    
    if (product.hasVariants) {
        const select = document.getElementById(`variant-${productId}`);
        const selectedOption = select.options[select.selectedIndex];
        const variantId = selectedOption.value;
        const variant = product.variants.find(v => v.id === variantId);
        
        purchaseItem.variantId = variantId;
        purchaseItem.variantName = variant.name;
        purchaseItem.price = variant.price;
    }
    
    openPaylixEmbed(purchaseItem);
}

// ===== PAYLIX.GG INTEGRATION =====
// Open individual Paylix product using embed system
function openPaylixProduct(productId) {
    console.log('🛒 Opening Paylix product:', productId);
    
    // Remove modal-open class to allow Paylix to work
    document.body.classList.remove('modal-open');
    
    // Log available Paylix methods for debugging
    if (window.Paylix) {
        console.log('Available Paylix methods:', Object.keys(window.Paylix));
        console.log('Paylix object:', window.Paylix);
    }
    
    // Try all possible Paylix API methods
    const methods = [
        () => window.Paylix?.open?.({ product: productId }),
        () => window.Paylix?.openProduct?.(productId),
        () => window.Paylix?.showProduct?.(productId),
        () => window.paylixecommerce?.open?.(productId),
        () => window.paylixecommerce?.openProduct?.(productId)
    ];
    
    for (let i = 0; i < methods.length; i++) {
        try {
            const result = methods[i]();
            if (result !== undefined) {
                console.log(`✅ Method ${i + 1} worked!`);
                return;
            }
        } catch (e) {
            console.log(`Method ${i + 1} failed:`, e.message);
        }
    }
    
    // If no API methods work, create a button and trigger Paylix manually
    console.log('📦 Creating Paylix button and triggering manually');
    
    // Remove any existing buttons
    document.querySelectorAll('.paylix-dynamic-btn').forEach(btn => btn.remove());
    
    const button = document.createElement('button');
    button.setAttribute('data-paylixecommerce-product', productId);
    button.setAttribute('type', 'submit');
    button.textContent = 'Purchase';
    button.className = 'paylix-dynamic-btn';
    button.id = `paylix-btn-${Date.now()}`;
    
    // Hide the button
    button.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        opacity: 0;
        pointer-events: auto;
    `;
    
    document.body.appendChild(button);
    console.log('✅ Button created with ID:', button.id);
    
    // Try to force Paylix to scan for new buttons
    if (window.Paylix) {
        // Try various scan methods
        if (typeof window.Paylix.init === 'function') {
            console.log('Calling Paylix.init()');
            window.Paylix.init();
        }
        if (typeof window.Paylix.scan === 'function') {
            console.log('Calling Paylix.scan()');
            window.Paylix.scan();
        }
        if (typeof window.Paylix.refresh === 'function') {
            console.log('Calling Paylix.refresh()');
            window.Paylix.refresh();
        }
    }
    
    // Wait longer for Paylix to attach, then click
    setTimeout(() => {
        console.log('🖱️ Clicking button after Paylix scan...');
        
        // Try multiple click methods
        button.click();
        button.dispatchEvent(new Event('click', { bubbles: true }));
        button.dispatchEvent(new MouseEvent('click', { 
            view: window, 
            bubbles: true, 
            cancelable: true 
        }));
        
        console.log('✅ Click events dispatched');
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (button.parentNode) {
                button.remove();
            }
        }, 3000);
    }, 1000); // Increased to 1 second to give Paylix time to attach
}

// Open Paylix group modal to show all products in the group
function openPaylixGroup(groupId) {
    console.log('Opening Paylix group:', groupId);
    
    // Check if Paylix embed is loaded
    if (typeof window.Paylix === 'undefined') {
        console.error('Paylix embed script not loaded');
        alert('Payment system is loading. Please try again in a moment.');
        return;
    }
    
    // Create a temporary button with Paylix attributes
    const button = document.createElement('button');
    button.setAttribute('data-paylixecommerce-group', groupId);
    button.className = 'paylix-temp-button';
    button.style.position = 'fixed';
    button.style.top = '-9999px';
    button.style.left = '-9999px';
    
    document.body.appendChild(button);
    
    // Wait a moment for Paylix to attach event listeners
    setTimeout(() => {
        button.click();
        
        // Clean up after a delay
        setTimeout(() => {
            if (button.parentNode) {
                document.body.removeChild(button);
            }
        }, 500);
    }, 100);
}

// ===== PAYLIX EMBED MODAL =====
function openPaylixEmbed(item) {
    const modal = document.createElement('div');
    modal.className = 'paylix-modal';
    modal.innerHTML = `
        <div class="paylix-modal-content">
            <button class="paylix-close" onclick="closePaylixModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="paylix-header">
                <div class="product-icon">${item.icon}</div>
                <h2>${item.name}</h2>
                <p class="product-description">${item.description}</p>
                ${item.variantName ? `<p class="variant-badge"><i class="fas fa-clock"></i> ${item.variantName}</p>` : ''}
            </div>
            <div class="paylix-embed-container" id="paylixEmbedContainer">
                <div class="paylix-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading secure checkout...</p>
                </div>
            </div>
            <div class="paylix-footer">
                <p class="paylix-note">
                    <i class="fas fa-lock"></i> Secure checkout powered by Paylix.gg
                </p>
                <p class="paylix-features">
                    <span><i class="fas fa-check-circle"></i> Instant Delivery</span>
                    <span><i class="fas fa-check-circle"></i> 24/7 Support</span>
                    <span><i class="fas fa-check-circle"></i> Money-back Guarantee</span>
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modal.classList.add('active');
        initializePaylixEmbed(item);
    }, 10);
}

function initializePaylixEmbed(item) {
    const container = document.getElementById('paylixEmbedContainer');
    
    // Determine which Paylix product ID to use
    let paylixProductId;
    if (item.variantId) {
        paylixProductId = paylixProductMap[item.variantId] || paylixProductMap[item.productId];
    } else {
        paylixProductId = paylixProductMap[item.productId];
    }
    
    if (!paylixProductId || paylixProductId.startsWith('YOUR_')) {
        container.innerHTML = `
            <div class="paylix-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Product Not Configured</h3>
                <p>This product variant needs to be set up in Paylix.</p>
                <p class="error-help">
                    <strong>Setup Instructions:</strong><br>
                    1. Go to your Paylix Dashboard<br>
                    2. Create a product for: ${item.name}${item.variantName ? ' - ' + item.variantName : ''}<br>
                    3. Copy the Product ID<br>
                    4. Add it to paylixProductMap in main.js<br>
                    ${item.variantId ? `5. Map key: '${item.variantId}' to your Paylix Product ID` : ''}
                </p>
                <button class="error-close-btn" onclick="closePaylixModal()">
                    Close
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="paylix-embed-wrapper">
            <div class="product-summary">
                <div class="summary-row">
                    <span>Product:</span>
                    <strong>${item.name}</strong>
                </div>
                ${item.variantName ? `
                <div class="summary-row">
                    <span>Duration:</span>
                    <strong>${item.variantName}</strong>
                </div>
                ` : ''}
                <div class="summary-row">
                    <span>Price:</span>
                    <strong class="price">${currencies[currentCurrency].symbol}${item.price.toFixed(2)}</strong>
                </div>
            </div>
            
            <div id="paylix-button-container"></div>
            
            <div class="payment-methods">
                <p>We accept:</p>
                <div class="payment-icons">
                    <i class="fab fa-cc-visa"></i>
                    <i class="fab fa-cc-mastercard"></i>
                    <i class="fab fa-cc-paypal"></i>
                    <i class="fab fa-bitcoin"></i>
                    <span class="payment-text">+ more</span>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        initializePaylixButton(paylixProductId);
    }, 100);
}

function initializePaylixButton(productId) {
    const buttonContainer = document.getElementById('paylix-button-container');
    if (!buttonContainer) return;
    
    buttonContainer.innerHTML = `
        <button 
            class="paylix-embed-button"
            data-paylixecommerce-product="${productId}"
            data-paylixecommerce-gateway="USDT"
            data-paylixecommerce-blockchain="ERC20"
            data-paylixecommerce-step="CHECKOUT"
            data-paylixecommerce-email=""
            data-paylixecommerce-coupon=""
            data-paylixecommerce-quantity="1"
            data-paylixecommerce-variant=""
            data-paylixecommerce-css="https://cdn.paylix.gg/static/css/custom-embed-styles.css"
            type="submit"
            alt="Buy Now with paylix.gg">
            <i class="fas fa-lock"></i> Proceed to Secure Checkout
        </button>
    `;
}

function closePaylixModal() {
    const modal = document.querySelector('.paylix-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}




// ===== NOTIFICATION SYSTEM =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== CHAT WIDGET =====
function openChat() {
    showNotification('Chat feature coming soon! Join our Discord for support.');
}

// ===== LOGIN/REGISTER MODAL =====
function openLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <button class="auth-close" onclick="closeAuthModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="auth-tabs">
                <button class="auth-tab active" onclick="switchAuthTab('login')">Login</button>
                <button class="auth-tab" onclick="switchAuthTab('register')">Register</button>
            </div>
            
            <div id="loginForm" class="auth-form active">
                <h2>Welcome Back!</h2>
                <p class="auth-subtitle">Login to access your account</p>
                <form onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input type="email" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Password</label>
                        <input type="password" placeholder="••••••••" required>
                    </div>
                    <div class="form-options">
                        <label class="checkbox">
                            <input type="checkbox"> Remember me
                        </label>
                        <a href="#" class="forgot-link">Forgot password?</a>
                    </div>
                    <button type="submit" class="auth-submit-btn">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </form>
                <div class="auth-divider">
                    <span>OR</span>
                </div>
                <button class="social-login discord">
                    <i class="fab fa-discord"></i> Login with Discord
                </button>
            </div>
            
            <div id="registerForm" class="auth-form">
                <h2>Create Account</h2>
                <p class="auth-subtitle">Join AccVaults today</p>
                <form onsubmit="handleRegister(event)">
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Username</label>
                        <input type="text" placeholder="Choose a username" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input type="email" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Password</label>
                        <input type="password" placeholder="••••••••" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Confirm Password</label>
                        <input type="password" placeholder="••••••••" required>
                    </div>
                    <label class="checkbox">
                        <input type="checkbox" required> I agree to the Terms of Service
                    </label>
                    <button type="submit" class="auth-submit-btn">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </form>
                <div class="auth-divider">
                    <span>OR</span>
                </div>
                <button class="social-login discord">
                    <i class="fab fa-discord"></i> Sign up with Discord
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeAuthModal() {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    // Show loading
    const submitBtn = form.querySelector('.auth-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    try {
        // Call auth API
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (result.success && result.user) {
            // Store user session
            localStorage.setItem('accvaults_user', JSON.stringify({
                email: result.user.email,
                username: result.user.username,
                loggedIn: true,
                isStaff: result.user.isStaff,
                role: result.user.role,
                customerId: result.user.customerId,
                loginTime: new Date().toISOString()
            }));
            localStorage.setItem('userEmail', result.user.email);
            
            if (result.user.isStaff) {
                showNotification('✅ Welcome back, Admin!');
                closeAuthModal();
                updateLoginButton();
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showNotification('✅ Welcome back!');
                closeAuthModal();
                updateLoginButton();
            }
        } else {
            showNotification(`❌ ${result.error || 'Login failed'}`);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('❌ Login failed. Please try again.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('❌ Passwords do not match!');
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        showNotification('❌ Password must be at least 6 characters long');
        return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('.auth-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    try {
        // Call auth API
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'register',
                email: email,
                password: password,
                username: username
            })
        });

        const result = await response.json();

        if (result.success && result.user) {
            // Store user session
            localStorage.setItem('accvaults_user', JSON.stringify({
                email: result.user.email,
                username: result.user.username,
                loggedIn: true,
                isStaff: false,
                role: 'customer',
                customerId: result.user.customerId,
                loginTime: new Date().toISOString()
            }));
            localStorage.setItem('userEmail', result.user.email);
            
            showNotification('✅ Account created successfully!');
            closeAuthModal();
            updateLoginButton();
        } else {
            showNotification(`❌ ${result.error || 'Registration failed'}`);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('❌ Registration failed. Please try again.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Update login button to show user status
function updateLoginButton() {
    const user = JSON.parse(localStorage.getItem('accvaults_user') || 'null');
    const loginBtns = document.querySelectorAll('.login-btn');
    
    loginBtns.forEach(btn => {
        if (user && user.loggedIn) {
            btn.innerHTML = '<i class="fas fa-user-circle"></i>';
            btn.title = `Logged in as ${user.email}`;
            btn.onclick = () => openUserMenu();
        } else {
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i>';
            btn.title = 'Login / Register';
            btn.onclick = () => openLoginModal();
        }
    });
}

// User menu for logged in users
function openUserMenu() {
    const user = JSON.parse(localStorage.getItem('accvaults_user'));
    
    // If not logged in, show login modal instead
    if (!user || !user.loggedIn) {
        openLoginModal();
        return;
    }
    
    const isStaff = user && user.isStaff;
    
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    
    // Different menu for staff vs customers
    const menuButtons = isStaff ? `
        <a href="dashboard.html" class="auth-submit-btn" style="display: block; margin-bottom: 12px; text-decoration: none;">
            <i class="fas fa-chart-line"></i> Dashboard
        </a>
        
        <a href="orders.html" class="auth-submit-btn" style="display: block; margin-bottom: 12px; text-decoration: none; background: linear-gradient(135deg, #5c3d99, #8359cf);">
            <i class="fas fa-box"></i> All Orders
        </a>
        
        <a href="products.html" class="auth-submit-btn" style="display: block; margin-bottom: 12px; text-decoration: none; background: linear-gradient(135deg, #f59e0b, #d97706);">
            <i class="fas fa-shopping-bag"></i> Manage Products
        </a>
    ` : `
        <a href="customer-dashboard.html" class="auth-submit-btn" style="display: block; margin-bottom: 12px; text-decoration: none;">
            <i class="fas fa-chart-line"></i> Dashboard
        </a>
        
        <a href="orders.html" class="auth-submit-btn" style="display: block; margin-bottom: 12px; text-decoration: none; background: linear-gradient(135deg, #5c3d99, #8359cf);">
            <i class="fas fa-box"></i> My Orders
        </a>
        
        <a href="downloads.html" class="auth-submit-btn" style="display: block; margin-bottom: 12px; text-decoration: none; background: linear-gradient(135deg, #3b82f6, #2563eb);">
            <i class="fas fa-download"></i> My Downloads
        </a>
    `;
    
    modal.innerHTML = `
        <div class="auth-modal-content" style="max-width: 400px;">
            <button class="auth-close" onclick="closeAuthModal()">
                <i class="fas fa-times"></i>
            </button>
            <div style="text-align: center; padding: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${isStaff ? '#f59e0b, #d97706' : '#8359cf, #5c3d99'}); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px; color: white;">
                    <i class="fas fa-${isStaff ? 'crown' : 'user'}"></i>
                </div>
                <h2 style="margin-bottom: 8px;">${user.username || (isStaff ? 'Admin' : 'User')}</h2>
                <p style="color: rgba(255,255,255,0.6); margin-bottom: 8px;">${user.email}</p>
                ${isStaff ? '<span style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">STAFF</span>' : ''}
                <div style="margin-top: 20px;">
                    ${menuButtons}
                    
                    <button onclick="handleLogout()" class="auth-submit-btn" style="background: linear-gradient(135deg, #dc2626, #991b1b); width: 100%;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);
}

function handleLogout() {
    localStorage.removeItem('accvaults_user');
    showNotification('👋 You have been logged out.');
    // Redirect to home page
    window.location.href = '/index.html';
}

// ===== CURRENCY (GBP ONLY) =====
// All prices are in GBP


// ===== CUSTOM PRODUCT SELECTOR MODAL =====
let selectedProducts = [];

function openProductSelector(groupId) {
    const group = productGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const modal = document.createElement('div');
    modal.className = 'product-selector-modal';
    
    // Get background image
    const backgroundImage = group.imageUrl ? `url(${group.imageUrl})` : 'none';
    
    modal.innerHTML = `
        <div class="product-selector-content">
            <button class="selector-close" onclick="closeProductSelector()">
                <i class="fas fa-times"></i>
            </button>
            <div class="selector-header" style="background-image: ${backgroundImage}; background-size: cover; background-position: center; background-repeat: no-repeat;">
                <div style="background: rgba(0, 0, 0, 0.6); padding: 40px; border-radius: 12px;">
                    <h2 style="margin: 0;">${group.name}</h2>
                </div>
            </div>
            <div class="selector-products-grid">
                ${group.products.map((product, idx) => {
                    const logoContent = product.imageUrl 
                        ? `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0;">`
                        : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7V12C2 17.55 6.84 22.74 12 24C17.16 22.74 22 17.55 22 12V7L12 2Z" fill="url(#modal-gradient-${idx})"/>
                            <path d="M12 8L8 11L10 13L12 11L14 13L16 11L12 8Z" fill="white" opacity="0.9"/>
                            <defs>
                                <linearGradient id="modal-gradient-${idx}" x1="2" y1="2" x2="22" y2="24">
                                    <stop offset="0%" stop-color="#8359cf"/>
                                    <stop offset="100%" stop-color="#5c3d99"/>
                                </linearGradient>
                            </defs>
                        </svg>`;
                    
                    // HORIZONTAL LAYOUT for ALL devices (same as mobile)
                    return `
                        <div class="modal-product-card" style="display: flex !important; flex-direction: row !important; align-items: center; padding: 20px; gap: 20px; min-height: 110px;">
                            <div class="modal-product-logo" style="width: 90px; height: 90px; flex-shrink: 0; display: flex !important; align-items: center; justify-content: center;">
                                ${logoContent}
                            </div>
                            <div style="flex: 1; display: flex !important; flex-direction: column; gap: 8px;">
                                <span class="modal-product-price" style="font-size: 20px !important; font-weight: 700 !important; color: #a78bfa !important; display: block !important; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">£${product.price.toFixed(2)}</span>
                                <h4 class="modal-product-title" style="font-size: 15px !important; font-weight: 600 !important; color: #ffffff !important; margin: 0 !important; line-height: 1.5 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">${product.name}</h4>
                                <span class="modal-product-stock" style="font-size: 11px !important; color: #10b981 !important; font-weight: 700 !important; text-transform: uppercase; display: inline-block !important;">✓ IN STOCK</span>
                            </div>
                            <button 
                                class="modal-buy-btn" 
                                data-paylixecommerce-product="${product.paylixId}"
                                type="submit"
                                style="width: 60px; height: 60px; flex-shrink: 0; padding: 0; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border: none; border-radius: 14px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Trigger Paylix to scan for new buttons
    setTimeout(() => {
        modal.classList.add('active');
        
        // Force Paylix to re-scan the page for new buttons
        if (window.Paylix) {
            console.log('🔄 Triggering Paylix to scan modal buttons');
            if (typeof window.Paylix.init === 'function') window.Paylix.init();
            if (typeof window.Paylix.scan === 'function') window.Paylix.scan();
            if (typeof window.Paylix.refresh === 'function') window.Paylix.refresh();
        }
    }, 10);
}

function buyProductFromModal(productId) {
    // Close our modal first to prevent conflicts
    closeProductSelector();
    // Wait for modal to close, then open Paylix
    setTimeout(() => {
        openPaylixProduct(productId);
    }, 350);
}

function closeProductSelector() {
    const modal = document.querySelector('.product-selector-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.classList.remove('modal-open');
        }, 300);
    }
}

function increaseQuantity(groupId, productIdx) {
    const input = document.getElementById(`qty-${groupId}-${productIdx}`);
    input.value = parseInt(input.value) + 1;
}

function decreaseQuantity(groupId, productIdx) {
    const input = document.getElementById(`qty-${groupId}-${productIdx}`);
    const currentValue = parseInt(input.value);
    if (currentValue > 0) {
        input.value = currentValue - 1;
    }
}

function proceedToCustomCheckout(groupId) {
    const group = productGroups.find(g => g.id === groupId);
    if (!group) return;
    
    // Collect selected products with quantities
    selectedProducts = [];
    group.products.forEach((product, idx) => {
        const qty = parseInt(document.getElementById(`qty-${groupId}-${idx}`).value);
        if (qty > 0) {
            selectedProducts.push({
                ...product,
                quantity: qty,
                groupName: group.name,
                groupIcon: group.icon
            });
        }
    });
    
    if (selectedProducts.length === 0) {
        showNotification('❌ Please select at least one product');
        return;
    }
    
    closeProductSelector();
    openCustomCheckout();
}

// ===== CUSTOM CHECKOUT PAGE =====
function openCustomCheckout() {
    const total = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="checkout-content">
            <button class="checkout-close" onclick="closeCustomCheckout()">
                <i class="fas fa-times"></i>
            </button>
            <h2><i class="fas fa-shopping-cart"></i> Checkout</h2>
            
            <div class="checkout-items">
                <h3>Order Summary</h3>
                ${selectedProducts.map(product => `
                    <div class="checkout-item">
                        <div class="checkout-item-info">
                            <span>${product.groupIcon} ${product.name}</span>
                            <span class="checkout-item-qty">x${product.quantity}</span>
                        </div>
                        <span class="checkout-item-price">£${(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="checkout-total">
                    <span>Total:</span>
                    <span class="checkout-total-price">£${total.toFixed(2)}</span>
                </div>
            </div>
            
            <form class="checkout-form" onsubmit="submitCheckout(event)">
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email Address</label>
                    <input type="email" id="checkout-email" required placeholder="your@email.com">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-tag"></i> Coupon Code (Optional)</label>
                    <input type="text" id="checkout-coupon" placeholder="Enter coupon code">
                </div>
                
                <button type="submit" class="checkout-submit-btn">
                    <i class="fas fa-lock"></i> Complete Payment with Paylix
                </button>
            </form>
            
            <div class="checkout-security">
                <i class="fas fa-shield-alt"></i>
                <span>Secure payment powered by Paylix</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeCustomCheckout() {
    const modal = document.querySelector('.checkout-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Wait for Paylix to be ready
function waitForPaylix(timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (window.Paylix && typeof window.Paylix.open === 'function') {
            resolve(true);
            return;
        }
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window.Paylix && typeof window.Paylix.open === 'function') {
                clearInterval(checkInterval);
                resolve(true);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('Paylix failed to load'));
            }
        }, 100);
    });
}

async function submitCheckout(event) {
    event.preventDefault();
    
    const email = document.getElementById('checkout-email').value;
    const couponCode = document.getElementById('checkout-coupon').value;
    
    // Validate email format
    if (!email || !email.includes('@')) {
        showNotification('❌ Please enter a valid email address');
        return;
    }
    
    showNotification('🔄 Opening Paylix checkout...');
    
    try {
        // Get first product for checkout
        const firstProduct = selectedProducts[0];
        
        if (!firstProduct || !firstProduct.paylixId) {
            showNotification('❌ No product selected');
            return;
        }
        
        console.log('Opening Paylix for product:', firstProduct.paylixId);
        
        closeCustomCheckout();
        
        // Wait for modal to close
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Create a visible Paylix button and let user click it
        console.log('⚠️ Creating visible Paylix button for user to click');
        
        // Create a modal with Paylix button
        const buttonModal = document.createElement('div');
        buttonModal.className = 'paylix-button-modal';
        buttonModal.innerHTML = `
            <div class="paylix-button-content">
                <h3>Complete Your Purchase</h3>
                <p>Click the button below to proceed to Paylix checkout:</p>
                <button 
                    data-paylixecommerce-product="${firstProduct.paylixId}" 
                    type="submit"
                    class="paylix-checkout-button">
                    🔒 Proceed to Paylix Checkout
                </button>
                <p class="paylix-note">Secure payment powered by Paylix</p>
                <button onclick="this.closest('.paylix-button-modal').remove()" class="cancel-btn">
                    Cancel
                </button>
            </div>
        `;
        
        document.body.appendChild(buttonModal);
        setTimeout(() => buttonModal.classList.add('active'), 10);
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('❌ Failed to open checkout. Please try again.');
    }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .feature-card, .review-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});

// ===== PARTICLE EFFECTS =====
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles on load
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});

// ===== CURSOR GLOW EFFECT =====
let cursorGlow = null;

function createCursorGlow() {
    cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);
}

document.addEventListener('DOMContentLoaded', () => {
    createCursorGlow();
    
    document.addEventListener('mousemove', (e) => {
        if (cursorGlow) {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        }
    });
});

// ===== ADDITIONAL STYLES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    /* Paylix Modal Styles */
    .paylix-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
    }
    
    .paylix-modal.active {
        opacity: 1;
    }
    
    .paylix-modal-content {
        background: rgba(20, 20, 20, 0.95);
        border: 1px solid rgba(131, 89, 207, 0.3);
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(131, 89, 207, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .paylix-modal.active .paylix-modal-content {
        transform: scale(1);
    }
    
    .paylix-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .paylix-close:hover {
        background: rgba(131, 89, 207, 0.3);
        transform: rotate(90deg);
    }
    
    .paylix-header {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .paylix-header .product-icon {
        margin: 0 auto 20px;
    }
    
    .paylix-header h2 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 10px;
    }
    
    .paylix-header .product-description {
        font-size: 14px;
        color: #b4b4b4;
        margin-top: 8px;
    }
    
    .variant-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: rgba(131, 89, 207, 0.2);
        border: 1px solid rgba(131, 89, 207, 0.4);
        border-radius: 20px;
        color: #8359cf;
        font-size: 14px;
        font-weight: 600;
        margin-top: 12px;
    }
    
    .variant-badge i {
        font-size: 12px;
    }
    
    .paylix-embed-container {
        margin: 24px 0;
        min-height: 300px;
    }
    
    .paylix-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #8359cf;
    }
    
    .paylix-loading i {
        font-size: 48px;
        margin-bottom: 16px;
    }
    
    .paylix-loading p {
        color: #b4b4b4;
        font-size: 16px;
    }
    
    .paylix-embed-wrapper {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .product-summary {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .summary-row:last-child {
        border-bottom: none;
    }
    
    .summary-row span {
        color: #b4b4b4;
        font-size: 14px;
    }
    
    .summary-row strong {
        font-size: 16px;
        color: white;
    }
    
    .summary-row .price {
        font-size: 24px;
        color: #8359cf;
        font-weight: 800;
    }
    
    .paylix-embed-button {
        width: 100%;
        padding: 18px 24px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border: none;
        border-radius: 12px;
        color: white;
        font-weight: 700;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
    }
    
    .paylix-embed-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(131, 89, 207, 0.6);
    }
    
    .paylix-embed-button i {
        font-size: 20px;
    }
    
    .payment-methods {
        text-align: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
    }
    
    .payment-methods p {
        color: #b4b4b4;
        font-size: 13px;
        margin-bottom: 12px;
    }
    
    .payment-icons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
    }
    
    .payment-icons i {
        font-size: 32px;
        color: rgba(255, 255, 255, 0.6);
        transition: color 0.3s ease;
    }
    
    .payment-icons i:hover {
        color: #8359cf;
    }
    
    .payment-text {
        color: #b4b4b4;
        font-size: 14px;
        font-weight: 600;
    }
    
    .paylix-footer {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 20px;
        margin-top: 20px;
    }
    
    .paylix-note {
        text-align: center;
        color: #b4b4b4;
        font-size: 14px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .paylix-note i {
        color: #8359cf;
    }
    
    .paylix-features {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
        margin-top: 12px;
    }
    
    .paylix-features span {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #b4b4b4;
        font-size: 13px;
    }
    
    .paylix-features i {
        color: #4ade80;
        font-size: 14px;
    }
    
    .paylix-error {
        text-align: center;
        padding: 40px 20px;
    }
    
    .paylix-error i {
        font-size: 64px;
        color: #f59e0b;
        margin-bottom: 20px;
    }
    
    .paylix-error h3 {
        font-size: 24px;
        margin-bottom: 12px;
        color: white;
    }
    
    .paylix-error p {
        color: #b4b4b4;
        margin-bottom: 16px;
        line-height: 1.6;
    }
    
    .error-help {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 12px;
        padding: 20px;
        text-align: left;
        margin: 20px 0;
    }
    
    .error-help strong {
        color: #f59e0b;
        display: block;
        margin-bottom: 12px;
    }
    
    .error-close-btn {
        padding: 12px 32px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border: none;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 20px;
    }
    
    .error-close-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(131, 89, 207, 0.5);
    }
    
    /* Particle Effects */
    .particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    }
    
    .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(131, 89, 207, 0.3);
        border-radius: 50%;
        animation: float linear infinite;
        box-shadow: 0 0 10px rgba(131, 89, 207, 0.5);
    }
    
    @keyframes float {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
        }
    }
    
    /* Cursor Glow */
    .cursor-glow {
        position: fixed;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(131, 89, 207, 0.15) 0%, transparent 70%);
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 0;
        transition: opacity 0.3s ease;
    }
    
    /* Product Actions */
    .product-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    
    .product-btn-secondary {
        background: rgba(131, 89, 207, 0.2);
        border: 1px solid rgba(131, 89, 207, 0.4);
        color: white;
        padding: 10px 14px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 16px;
    }
    
    .product-btn-secondary:hover {
        background: rgba(131, 89, 207, 0.3);
        border-color: #8359cf;
        transform: scale(1.05);
    }
    
    .product-footer {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    /* Auth Modal */
    .auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
    }
    
    .auth-modal.active {
        opacity: 1;
    }
    
    .auth-modal-content {
        background: rgba(20, 20, 20, 0.95);
        border: 1px solid rgba(131, 89, 207, 0.3);
        border-radius: 20px;
        padding: 40px;
        max-width: 450px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(131, 89, 207, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .auth-modal.active .auth-modal-content {
        transform: scale(1);
    }
    
    .auth-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .auth-close:hover {
        background: rgba(131, 89, 207, 0.3);
        transform: rotate(90deg);
    }
    
    .auth-tabs {
        display: flex;
        gap: 12px;
        margin-bottom: 30px;
    }
    
    .auth-tab {
        flex: 1;
        padding: 12px 24px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #b4b4b4;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .auth-tab.active {
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border-color: transparent;
        color: white;
    }
    
    .auth-form {
        display: none;
    }
    
    .auth-form.active {
        display: block;
        animation: fadeInUp 0.4s ease;
    }
    
    .auth-form h2 {
        font-size: 28px;
        margin-bottom: 8px;
    }
    
    .auth-subtitle {
        color: #b4b4b4;
        margin-bottom: 24px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        color: #b4b4b4;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
    }
    
    .form-group input {
        width: 100%;
        padding: 14px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: white;
        font-size: 15px;
        transition: all 0.3s ease;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: #8359cf;
        box-shadow: 0 0 20px rgba(131, 89, 207, 0.3);
    }
    
    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #b4b4b4;
        font-size: 14px;
        cursor: pointer;
    }
    
    .checkbox input {
        width: auto;
    }
    
    .forgot-link {
        color: #8359cf;
        text-decoration: none;
        font-size: 14px;
        transition: color 0.3s ease;
    }
    
    .forgot-link:hover {
        color: #667eea;
    }
    
    .auth-submit-btn {
        width: 100%;
        padding: 14px 24px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border: none;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;
    }
    
    .auth-submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(131, 89, 207, 0.5);
    }
    
    .auth-divider {
        text-align: center;
        margin: 20px 0;
        position: relative;
    }
    
    .auth-divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
    }
    
    .auth-divider span {
        background: rgba(20, 20, 20, 0.95);
        padding: 0 16px;
        color: #b4b4b4;
        font-size: 14px;
        position: relative;
    }
    
    .social-login {
        width: 100%;
        padding: 14px 24px;
        background: #5865F2;
        border: none;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .social-login:hover {
        background: #4752C4;
        transform: translateY(-2px);
    }
    
    /* Currency Modal */
    .currency-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
    }
    
    .currency-modal.active {
        opacity: 1;
    }
    
    .currency-modal-content {
        background: rgba(20, 20, 20, 0.95);
        border: 1px solid rgba(131, 89, 207, 0.3);
        border-radius: 20px;
        padding: 40px;
        max-width: 400px;
        width: 100%;
        position: relative;
        box-shadow: 0 20px 60px rgba(131, 89, 207, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .currency-modal.active .currency-modal-content {
        transform: scale(1);
    }
    
    .currency-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .currency-close:hover {
        background: rgba(131, 89, 207, 0.3);
        transform: rotate(90deg);
    }
    
    .currency-modal-content h2 {
        font-size: 24px;
        margin-bottom: 8px;
    }
    
    .currency-subtitle {
        color: #b4b4b4;
        margin-bottom: 24px;
    }
    
    .currency-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .currency-option {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        font-size: 18px;
    }
    
    .currency-option:hover {
        background: rgba(131, 89, 207, 0.2);
        border-color: #8359cf;
        transform: translateX(5px);
    }
    
    .currency-option.active {
        background: rgba(131, 89, 207, 0.3);
        border-color: #8359cf;
    }
    
    .currency-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .currency-code {
        font-weight: 700;
        font-size: 16px;
    }
    
    .currency-name {
        font-size: 13px;
        color: #b4b4b4;
    }
    
    /* Product Variants Styles */
    .product-variants {
        margin: 16px 0;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .variant-label {
        display: block;
        color: #b4b4b4;
        font-size: 13px;
        margin-bottom: 8px;
        font-weight: 500;
    }
    
    .variant-select {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .variant-select:hover {
        border-color: rgba(131, 89, 207, 0.5);
        background: rgba(255, 255, 255, 0.08);
    }
    
    .variant-select:focus {
        outline: none;
        border-color: #8359cf;
        box-shadow: 0 0 15px rgba(131, 89, 207, 0.3);
    }
    
    .variant-select option {
        background: #1a1a1a;
        color: white;
        padding: 10px;
    }
    
    .variant-tag {
        display: inline-block;
        padding: 4px 10px;
        background: rgba(131, 89, 207, 0.2);
        border: 1px solid rgba(131, 89, 207, 0.4);
        border-radius: 6px;
        color: #8359cf;
        font-size: 12px;
        font-weight: 600;
        margin: 4px 0;
    }
    
    .item-desc {
        font-size: 13px;
        color: #888;
        margin-top: 4px;
    }
    
    /* Checkout Modal Styles */
    .checkout-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
        overflow-y: auto;
    }
    
    .checkout-modal.active {
        opacity: 1;
    }
    
    .checkout-modal-content {
        background: rgba(20, 20, 20, 0.98);
        border: 1px solid rgba(131, 89, 207, 0.3);
        border-radius: 20px;
        padding: 40px;
        max-width: 900px;
        width: 100%;
        max-height: 95vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(131, 89, 207, 0.4);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .checkout-modal.active .checkout-modal-content {
        transform: scale(1);
    }
    
    .checkout-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    
    .checkout-close:hover {
        background: rgba(131, 89, 207, 0.3);
        transform: rotate(90deg);
    }
    
    .checkout-header {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .checkout-header h2 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
    }
    
    .checkout-subtitle {
        color: #b4b4b4;
        font-size: 14px;
    }
    
    .checkout-body {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .order-summary {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
    }
    
    .order-summary h3 {
        font-size: 18px;
        margin-bottom: 16px;
        color: white;
    }
    
    .order-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
    }
    
    .order-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 8px;
    }
    
    .order-item-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
    }
    
    .order-item-info {
        flex: 1;
    }
    
    .order-item-info h4 {
        font-size: 15px;
        margin-bottom: 2px;
    }
    
    .variant-info {
        font-size: 12px;
        color: #8359cf;
        font-weight: 600;
    }
    
    .order-item-price {
        font-size: 16px;
        font-weight: 700;
        color: #8359cf;
    }
    
    .order-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 20px;
        font-weight: 700;
    }
    
    .total-price {
        color: #8359cf;
        font-size: 24px;
    }
    
    .payment-selection h3 {
        font-size: 18px;
        margin-bottom: 16px;
        color: white;
    }
    
    .payment-methods-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 12px;
    }
    
    .payment-method-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .payment-method-card:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(131, 89, 207, 0.5);
        transform: translateY(-2px);
    }
    
    .payment-method-card.active {
        background: rgba(131, 89, 207, 0.15);
        border-color: #8359cf;
    }
    
    .payment-method-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
    }
    
    .payment-method-icon.crypto {
        background: linear-gradient(135deg, #f7931a 0%, #ff9500 100%);
    }
    
    .payment-method-info {
        flex: 1;
    }
    
    .payment-method-info h4 {
        font-size: 15px;
        margin-bottom: 4px;
    }
    
    .payment-method-info p {
        font-size: 12px;
        color: #b4b4b4;
    }
    
    .payment-method-check {
        font-size: 20px;
        color: #8359cf;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .payment-method-card.active .payment-method-check {
        opacity: 1;
    }
    
    .payment-form-container {
        margin-top: 8px;
    }
    
    .payment-form {
        display: none;
        animation: fadeInUp 0.4s ease;
    }
    
    .payment-form.active {
        display: block;
    }
    
    .payment-form h3 {
        font-size: 18px;
        margin-bottom: 20px;
        color: white;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    
    .checkout-btn {
        width: 100%;
        padding: 16px 24px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border: none;
        border-radius: 12px;
        color: white;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 16px;
    }
    
    .checkout-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(131, 89, 207, 0.6);
    }
    
    .crypto-instructions {
        background: rgba(131, 89, 207, 0.1);
        border: 1px solid rgba(131, 89, 207, 0.3);
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 16px;
    }
    
    .crypto-instructions p {
        color: #b4b4b4;
        font-size: 14px;
        line-height: 1.6;
    }
    
    .crypto-instructions strong {
        color: #8359cf;
        font-weight: 700;
    }
    
    .crypto-address-box {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
    }
    
    .crypto-address {
        flex: 1;
        padding: 14px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: white;
        font-family: monospace;
        font-size: 13px;
        word-break: break-all;
    }
    
    .copy-btn {
        padding: 14px 20px;
        background: rgba(131, 89, 207, 0.2);
        border: 1px solid rgba(131, 89, 207, 0.4);
        border-radius: 10px;
        color: #8359cf;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
    }
    
    .copy-btn:hover {
        background: rgba(131, 89, 207, 0.3);
        transform: scale(1.05);
    }
    
    .crypto-qr {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
    }
    
    .qr-placeholder {
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .qr-placeholder i {
        font-size: 48px;
        color: rgba(255, 255, 255, 0.3);
    }
    
    .qr-placeholder p {
        color: #b4b4b4;
        font-size: 14px;
    }
    
    .crypto-note {
        text-align: center;
        color: #f59e0b;
        font-size: 13px;
        margin-top: 12px;
        padding: 10px;
        background: rgba(245, 158, 11, 0.1);
        border-radius: 8px;
    }
    
    .checkout-footer {
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .security-badges {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
    }
    
    .security-badges span {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #b4b4b4;
        font-size: 13px;
    }
    
    .security-badges i {
        color: #4ade80;
    }
    
    /* Product Selector Modal */
    .product-selector-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .product-selector-modal.active {
        opacity: 1;
    }
    
    .product-selector-content {
        background: linear-gradient(145deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
        border-radius: 24px;
        padding: 0;
        max-width: 650px;
        width: 90%;
        max-height: 85vh;
        overflow: hidden;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(131, 89, 207, 0.3);
        border: 1px solid rgba(131, 89, 207, 0.3);
        position: relative;
    }
    
    .selector-close {
        position: absolute;
        top: 24px;
        right: 24px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        z-index: 10;
    }
    
    .selector-close:hover {
        background: rgba(255, 59, 48, 0.3);
        transform: rotate(90deg) scale(1.1);
        border-color: rgba(255, 59, 48, 0.5);
    }
    
    .selector-header {
        text-align: center;
        padding: 50px 32px 40px;
        background: linear-gradient(135deg, rgba(131, 89, 207, 0.15) 0%, rgba(92, 61, 153, 0.15) 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        min-height: 240px;
    }
    
    .selector-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 0%, rgba(131, 89, 207, 0.2) 0%, transparent 70%);
        pointer-events: none;
    }
    
    .selector-logo {
        margin: 0 auto 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
    }
    
    .selector-logo svg {
        width: 140px;
        height: 140px;
        filter: drop-shadow(0 8px 20px rgba(131, 89, 207, 0.5));
    }
    
    .selector-logo img {
        display: block;
    }
    
    .selector-header h2 {
        font-size: 28px;
        font-weight: 800;
        margin-bottom: 8px;
        position: relative;
        z-index: 1;
    }
    
    .selector-subtitle {
        color: rgba(255, 255, 255, 0.7);
        font-size: 15px;
        position: relative;
        z-index: 1;
    }
    
    .selector-products {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 24px 32px;
        max-height: 400px;
        overflow-y: auto;
    }
    
    .selector-product-item {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .selector-product-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--gradient-1);
        transform: scaleY(0);
        transition: transform 0.3s ease;
    }
    
    .selector-product-item:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(131, 89, 207, 0.4);
        transform: translateX(4px);
    }
    
    .selector-product-item:hover::before {
        transform: scaleY(1);
    }
    
    .selector-product-left {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
    }
    
    .selector-product-icon {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 4px 15px rgba(131, 89, 207, 0.4);
    }
    
    .selector-product-icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
    }
    
    .selector-product-info {
        flex: 1;
    }
    
    .selector-product-info h4 {
        font-size: 17px;
        font-weight: 700;
        margin-bottom: 6px;
        color: white;
    }
    
    .selector-product-price {
        color: #8359cf;
        font-weight: 800;
        font-size: 20px;
        background: linear-gradient(135deg, #8359cf 0%, #667eea 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .quantity-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .qty-btn {
        background: linear-gradient(135deg, rgba(131, 89, 207, 0.3) 0%, rgba(92, 61, 153, 0.3) 100%);
        border: 1px solid rgba(131, 89, 207, 0.4);
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }
    
    .qty-btn:hover {
        background: linear-gradient(135deg, rgba(131, 89, 207, 0.5) 0%, rgba(92, 61, 153, 0.5) 100%);
        border-color: #8359cf;
        transform: scale(1.1);
    }
    
    .qty-btn:active {
        transform: scale(0.95);
    }
    
    .quantity-selector input {
        width: 50px;
        text-align: center;
        background: transparent;
        border: none;
        color: white;
        font-size: 18px;
        font-weight: 700;
    }
    
    .selector-footer {
        display: flex;
        gap: 16px;
        padding: 24px 32px;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .selector-cancel-btn {
        flex: 1;
        padding: 16px 24px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 12px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .selector-cancel-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.3);
    }
    
    .selector-checkout-btn {
        flex: 2;
        padding: 16px 24px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border: none;
        color: white;
        border-radius: 12px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        position: relative;
        overflow: hidden;
    }
    
    .selector-checkout-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }
    
    .selector-checkout-btn:hover::before {
        width: 400px;
        height: 400px;
    }
    
    .selector-checkout-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(131, 89, 207, 0.6);
    }
    
    /* Checkout Modal */
    .checkout-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .checkout-modal.active {
        opacity: 1;
    }
    
    .checkout-content {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
    }
    
    .checkout-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .checkout-close:hover {
        background: rgba(255, 59, 48, 0.3);
        transform: rotate(90deg);
    }
    
    .checkout-content h2 {
        font-size: 24px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .checkout-items {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
    }
    
    .checkout-items h3 {
        font-size: 16px;
        margin-bottom: 16px;
        color: #b4b4b4;
    }
    
    .checkout-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .checkout-item:last-child {
        border-bottom: none;
    }
    
    .checkout-item-info {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .checkout-item-qty {
        color: #8359cf;
        font-weight: 600;
    }
    
    .checkout-item-price {
        font-weight: 700;
        color: white;
    }
    
    .checkout-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        margin-top: 16px;
        border-top: 2px solid rgba(131, 89, 207, 0.3);
        font-size: 20px;
        font-weight: 700;
    }
    
    .checkout-total-price {
        color: #8359cf;
        font-size: 24px;
    }
    
    .checkout-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .form-group label {
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .form-group input {
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        transition: all 0.3s ease;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: #8359cf;
        background: rgba(255, 255, 255, 0.08);
    }
    
    .checkout-submit-btn {
        padding: 16px 24px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border: none;
        color: white;
        border-radius: 12px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 8px;
    }
    
    .checkout-submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(131, 89, 207, 0.5);
    }
    
    .checkout-security {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #b4b4b4;
        font-size: 13px;
    }
    
    .checkout-security i {
        color: #4ade80;
    }
    
    /* Paylix Button Modal */
    .paylix-button-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .paylix-button-modal.active {
        opacity: 1;
    }
    
    .paylix-button-content {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .paylix-button-content h3 {
        font-size: 24px;
        margin-bottom: 16px;
    }
    
    .paylix-button-content p {
        color: #b4b4b4;
        margin-bottom: 24px;
    }
    
    .paylix-checkout-button {
        width: 100%;
        padding: 16px 24px;
        background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
        border: none;
        color: white;
        border-radius: 12px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 16px;
    }
    
    .paylix-checkout-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(131, 89, 207, 0.5);
    }
    
    .paylix-note {
        font-size: 13px;
        color: #4ade80;
        margin-bottom: 16px;
    }
    
    .cancel-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .cancel-btn:hover {
        background: rgba(255, 255, 255, 0.15);
    }
    
    @media (max-width: 768px) {
        .checkout-modal-content {
            padding: 24px;
        }
        
        .payment-methods-grid {
            grid-template-columns: 1fr;
        }
        
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .product-selector-content,
        .checkout-content {
            width: 95%;
            padding: 24px;
        }
    }
`;
document.head.appendChild(style);
