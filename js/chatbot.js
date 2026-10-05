(function () {

    const ANTHROPIC_API_KEY = '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'


    const CLAUDE_MODEL = 'claude-haiku-4-5'

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })


    const SYSTEM_PROMPT = `You are "Foodie Assistant", the chat helper on the Foodie restaurant website.
Today's date is ${today}.
- Help customers search the menu, see dish details, manage their cart, and place orders.
- Prices are in USD. Be concise, warm, and to the point.
- If a tool result says the customer is not logged in, tell them to log in first (do not retry the tool).
- Before calling the checkout tool, you MUST first summarize the cart (items, quantities, total price) in your reply and ask the customer to confirm. Only call checkout after they clearly confirm in a later message. Never call it on the first mention of ordering/checkout.
- Never ask the customer for their password, email verification code, or any account credentials in chat — direct them to the login/register/reset-password pages for that.`


    const tools = [
        {
            name: 'search_products',
            description: 'Search/filter the restaurant menu. Use for any question about dishes, the menu, or recommendations.',
            input_schema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Free-text search matched against dish name/description' },
                    categoryId: { type: 'integer', description: 'Appetizers=1, First Courses=2, Main Courses=3, Pizzas=4, Side Dishes=5, Desserts=6' },
                    vegetarian: { type: 'boolean' },
                    spiciness: { type: 'integer', description: '0-5' },
                    minRate: { type: 'number', description: 'Minimum rating 0-5' },
                    minPrice: { type: 'number' },
                    maxPrice: { type: 'number' },
                    take: { type: 'integer', description: 'Page size, default 10' },
                    page: { type: 'integer', description: 'default 1' }
                },
                required: []
            }
        },
        {
            name: 'get_product_details',
            description: 'Get full details for one dish (description, ingredients, method, price, rating) by product id.',
            input_schema: {
                type: 'object',
                properties: { productId: { type: 'integer' } },
                required: ['productId']
            }
        },
        {
            name: 'list_categories',
            description: 'List all menu categories.',
            input_schema: { type: 'object', properties: {}, required: [] }
        },
        {
            name: 'get_cart',
            description: "Get the logged-in customer's current cart and total price.",
            input_schema: { type: 'object', properties: {}, required: [] }
        },
        {
            name: 'add_to_cart',
            description: "Add a product to the logged-in customer's cart.",
            input_schema: {
                type: 'object',
                properties: {
                    productId: { type: 'integer' },
                    quantity: { type: 'integer', description: 'defaults to 1' }
                },
                required: ['productId']
            }
        },
        {
            name: 'update_cart_quantity',
            description: 'Change the quantity of an item already in the cart. Use the itemId from get_cart (not productId).',
            input_schema: {
                type: 'object',
                properties: {
                    itemId: { type: 'integer' },
                    quantity: { type: 'integer' }
                },
                required: ['itemId', 'quantity']
            }
        },
        {
            name: 'remove_from_cart',
            description: 'Remove one item from the cart. Use the itemId from get_cart (not productId).',
            input_schema: {
                type: 'object',
                properties: { itemId: { type: 'integer' } },
                required: ['itemId']
            }
        },
        {
            name: 'checkout',
            description: 'Place the order using everything in the cart. Only call after the customer has explicitly confirmed a cart summary you already showed them.',
            input_schema: { type: 'object', properties: {}, required: [] }
        },
        {
            name: 'get_my_profile',
            description: "Get the logged-in customer's profile (name, email, phone, address).",
            input_schema: { type: 'object', properties: {}, required: [] }
        }
    ]

    const AUTH_REQUIRED_TOOLS = ['get_cart', 'add_to_cart', 'update_cart_quantity', 'remove_from_cart', 'checkout', 'get_my_profile']

    const CART_CHANGING_TOOLS = ['add_to_cart', 'update_cart_quantity', 'remove_from_cart', 'checkout']

    const CHAT_STORAGE_KEY = 'foodieChatHistory'

    function saveConversation() {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversation))
    }

    let refreshPromise = null

    function refreshAccessTokenSilently() {
        if (!refreshPromise) {
            refreshPromise = (async function () {
                const refreshToken = localStorage.getItem('refreshToken')
                if (!refreshToken) {
                    return null
                }

                const response = await fetch(`${API_BASE_URL}/api/auth/refresh-access-token/${refreshToken}`, {
                    method: 'POST',
                    headers: { 'X-API-KEY': API_KEY }
                })
                if (!response.ok) {
                    return null
                }

                const result = await response.json().catch(function () { return {} })
                if (!result.data) {
                    return null
                }

                localStorage.setItem('accessToken', result.data.accessToken)
                localStorage.setItem('refreshToken', result.data.refreshToken)
                return result.data.accessToken
            })()
        }
        return refreshPromise
    }

    async function callRestaurantApi(path, { method = 'GET', accessToken, body } = {}) {
        const headers = { 'X-API-KEY': API_KEY }
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
        }
        if (body) {
            headers['Content-Type'] = 'application/json'
        }

        const response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        })

        if (response.status === 401 && accessToken) {
            const newAccessToken = await refreshAccessTokenSilently()
            if (newAccessToken) {
                headers['Authorization'] = `Bearer ${newAccessToken}`
                const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
                    method,
                    headers,
                    body: body ? JSON.stringify(body) : undefined
                })
                const retryResult = await retryResponse.json().catch(function () { return {} })
                return { ok: retryResponse.ok, result: retryResult }
            }
        }

        const result = await response.json().catch(function () { return {} })
        return { ok: response.ok, result }
    }

    async function executeTool(name, input, accessToken) {
        if (AUTH_REQUIRED_TOOLS.includes(name) && !accessToken) {
            return { ok: false, error: 'Customer is not logged in. Tell them to log in first.' }
        }

        try {
            if (name === 'search_products') {
                const params = new URLSearchParams()
                if (input.query) params.set('Query', input.query)
                if (input.categoryId) params.set('CategoryId', input.categoryId)
                if (input.vegetarian) params.set('Vegetarian', 'true')
                if (input.spiciness != null) params.set('Spiciness', input.spiciness)
                if (input.minRate != null) params.set('Rate', input.minRate)
                if (input.minPrice != null) params.set('MinPrice', input.minPrice)
                if (input.maxPrice != null) params.set('MaxPrice', input.maxPrice)
                params.set('Take', input.take || 5)
                params.set('Page', input.page || 1)

                const { result } = await callRestaurantApi(`/api/products/filter?${params.toString()}`)

                const trimmed = (result.data.products || []).map(function (p) {
                    return {
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        rate: p.rate,
                        spiciness: p.spiciness,
                        vegeterian: p.vegeterian,
                        description: p.description
                    }
                })

                return { ok: true, data: { products: trimmed, hasMore: result.data.hasMore } }
            }

            if (name === 'get_product_details') {
                const { result } = await callRestaurantApi(`/api/products/${input.productId}`)
                return { ok: true, data: result.data }
            }

            if (name === 'list_categories') {
                const { result } = await callRestaurantApi('/api/categories')
                return { ok: true, data: result.data }
            }

            if (name === 'get_cart') {
                const { result } = await callRestaurantApi('/api/cart', { accessToken })
                return { ok: true, data: result.data }
            }

            if (name === 'add_to_cart') {
                const { ok, result } = await callRestaurantApi('/api/cart/add-to-cart', {
                    method: 'POST',
                    accessToken,
                    body: { productId: input.productId, quantity: input.quantity || 1 }
                })
                return ok
                    ? { ok: true, data: { success: true } }
                    : { ok: false, error: result.detail || 'Could not add to cart' }
            }

            if (name === 'update_cart_quantity') {
                const { ok, result } = await callRestaurantApi('/api/cart/edit-quantity', {
                    method: 'PUT',
                    accessToken,
                    body: { itemId: input.itemId, quantity: input.quantity }
                })
                return ok
                    ? { ok: true, data: { success: true } }
                    : { ok: false, error: result.detail || 'Could not update quantity' }
            }

            if (name === 'remove_from_cart') {
                const { ok, result } = await callRestaurantApi(`/api/cart/remove-from-cart/${input.itemId}`, {
                    method: 'DELETE',
                    accessToken
                })
                return ok
                    ? { ok: true, data: { success: true } }
                    : { ok: false, error: result.detail || 'Could not remove item' }
            }

            if (name === 'checkout') {
                const { result } = await callRestaurantApi('/api/cart/checkout', { method: 'POST', accessToken })
                if (result.detail) {
                    return { ok: false, error: result.detail }
                }
                if (result.isSuccess === false) {
                    return { ok: false, error: result.error || 'Checkout failed' }
                }
                return { ok: true, data: { success: true } }
            }

            if (name === 'get_my_profile') {
                const { result } = await callRestaurantApi('/api/users/profile', { accessToken })
                return { ok: true, data: result.data }
            }

            return { ok: false, error: `Unknown tool: ${name}` }
        } catch (err) {
            return { ok: false, error: 'Request to the restaurant API failed.' }
        }
    }

    const widgetHtml = `
    <div id="chatWidget" class="chat-widget">
        <button id="chatToggleBtn" class="chat-toggle-btn" type="button" aria-label="Open chat">
            <i class="fa-solid fa-comment"></i>
        </button>

        <div id="chatPanel" class="chat-panel" hidden>
            <div class="chat-panel-header">
                <span>Foodie Assistant</span>
                <button id="chatCloseBtn" type="button" aria-label="Close chat">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div id="chatMessages" class="chat-messages"></div>

            <form id="chatForm" class="chat-form">
                <input id="chatInput" type="text" placeholder="Ask about the menu, your cart..." autocomplete="off">
                <button type="submit" aria-label="Send">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </div>
    </div>
    `

    document.body.insertAdjacentHTML('beforeend', widgetHtml)

    const toggleBtn = document.getElementById('chatToggleBtn')
    const closeBtn = document.getElementById('chatCloseBtn')
    const panel = document.getElementById('chatPanel')
    const messagesEl = document.getElementById('chatMessages')
    const form = document.getElementById('chatForm')
    const input = document.getElementById('chatInput')

    let conversation = []
    let isSending = false

    toggleBtn.addEventListener('click', function () {
        panel.hidden = !panel.hidden
    })

    closeBtn.addEventListener('click', function () {
        panel.hidden = true
    })

    function addMessageToUI(role, text) {
        const bubble = document.createElement('div')
        bubble.className = 'chat-bubble ' + (role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant')
        bubble.textContent = text
        messagesEl.appendChild(bubble)
        messagesEl.scrollTop = messagesEl.scrollHeight
    }

    try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY)
        if (saved) {
            conversation = JSON.parse(saved)
            conversation.forEach(function (message) {
                if (typeof message.content === 'string') {
                    addMessageToUI(message.role, message.content)
                }
            })
        }
    } catch (err) {
        conversation = []
    }

    async function askClaude(messages) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'anthropic-dangerous-direct-browser-access': 'true',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 400,
                system: SYSTEM_PROMPT,
                tools: tools,
                messages: messages
            })
        })

        return response.json()
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault()

        const text = input.value.trim()
        if (!text || isSending) {
            return
        }

        addMessageToUI('user', text)
        conversation.push({ role: 'user', content: text })
        saveConversation()
        input.value = ''
        isSending = true

        const accessToken = localStorage.getItem('accessToken')
        let cartChanged = false

        try {
            let finalText = ''

            for (let i = 0; i < 6; i++) {
                const data = await askClaude(conversation)

                finalText = data.content
                    .filter(function (block) { return block.type === 'text' })
                    .map(function (block) { return block.text })
                    .join('\n')

                if (data.stop_reason !== 'tool_use') {
                    break
                }

                conversation.push({ role: 'assistant', content: data.content })

                const toolUseBlocks = data.content.filter(function (block) { return block.type === 'tool_use' })

                const toolResults = await Promise.all(toolUseBlocks.map(async function (block) {
                    const outcome = await executeTool(block.name, block.input, accessToken)

                    if (outcome.ok && CART_CHANGING_TOOLS.includes(block.name)) {
                        cartChanged = true
                    }

                    return {
                        type: 'tool_result',
                        tool_use_id: block.id,
                        content: JSON.stringify(outcome.ok ? outcome.data : { error: outcome.error }),
                        is_error: !outcome.ok
                    }
                }))

                conversation.push({ role: 'user', content: toolResults })
            }

            addMessageToUI('assistant', finalText)
            conversation.push({ role: 'assistant', content: finalText })
            saveConversation()

            if (cartChanged) {
                setTimeout(function () {
                    window.location.reload()
                }, 1200)
            }
        } catch (err) {
            console.error(err)
            addMessageToUI('assistant', 'Sorry, something went wrong.')
        } finally {
            isSending = false
        }
    })
})()
