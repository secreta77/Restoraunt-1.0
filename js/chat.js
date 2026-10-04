(function(){
    const CHAT_API_URL = '/api/chat'



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

            <!-- აქ ჩაემატება ყოველი შეტყობინების ბუშტი (user + assistant) -->
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


document.body.insertAdjacentElement('beforeend',widgetHtml)


const toggleBtn = document.getElementById('chatToggleBtn')
const closeBtn = document.getElementById('chatCloseBtn')
const panel = document.getElementById('chatPanel')
const messagesEl = document.getElementById('chatMessages')
const form = document.getElementById('chatForm')
const input = document.getElementById('chatInput')


let conversation = []

let isSending = false

toggleBtn.addEventListener('click',function(){
    panel.hidden = !panel.hidden


})


closeBtn.addEventListener('click',function(){
    panel.hidden = true
})

function addMessage(role,text){
    const buble = document.createElement('div')


    bubble.className = 'chat-bubble ' + (role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant')

    bubble.textContent = text
    messagesEl.appendChild(bubble)
    messagesEl.scrollTop = messagesEl.scrollHeight
}

form.addEventListener('submit',function(event){
    event.preventDefault()


const text = input.value.trim()

if(!text || isSending){
    return

}

addMessage('user', text)
conversation.push({ role: 'user', content: text })
input.value = ''
isSending = true



const accessToken = localStorage.getItem('accessToken')
fetch(CHAT_API_URL,{
    method:'POST',
    headers:{
        'Content-type':'application/json'
    },
    body:JSON.stringify({
        messages: conversation,
        accessToken: accessToken
    })

})
.then(function(response){
    return response.json()
})
.then(function(result){
    if(result.reply){
        addMessage('assistent',result.reply)
        conversation.push({ role: 'assistant', content: result.reply })
    }else{
        addMessageToUI('assistant', 'Sorry, something went wrong.')
    }
})
.catch(function(){
    addMessageToUI('assistant', 'Sorry, something went wrong.')
})
.finally(function () {
    isSending = false
})

})


})()
