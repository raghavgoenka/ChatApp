const socket= io()

const $messageForm=document.querySelector("#message-form")
const $messageFormInput=document.querySelector("input")
const $messageFormButton=document.querySelector("button")
const $location=document.querySelector("#send-location")
const $messages=document.querySelector("#messages")
const $sidebar=document.querySelector("#sidebar")
//template
const locationtemplate=document.querySelector("#location-message-template").innerHTML

const messagetemplate=document.querySelector("#message-template").innerHTML
const sidebartemplate=document.querySelector("#sidebar-template").innerHTML
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll=()=>{

   const $newMessage=$messages.lastElementChild
   
   const neWMessageStyles=getComputedStyle($newMessage)
   const newMessageMargin=parseInt(neWMessageStyles.marginBottom)
   const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

   //visible height
   const visibleheight=$messages.offsetHeight

   const containerheight=$messages.scrollHeight
   const scrollOffset=$messages.scrollTop+visibleheight
    if(containerheight-newMessageHeight<=scrollOffset)
    {
        $messages.scrollTop=$messages.scrollHeight
    }

}
socket.on('message',(message)=>{

    console.log(message)
    const html=Mustache.render(messagetemplate,{
        username:message.username,
       message: message.text,
       createdAt: moment(message.createdAt).format('h'+':m'+' a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('locationmessage',(msg)=>{

    console.log(msg)
    const html=Mustache.render(locationtemplate,{
        username:msg.username,
       url:msg.url,
       createdAt:moment(msg.createdAt).format('h'+':m'+' a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll( )
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebartemplate,{
        room,
        users
        
    })
    $sidebar.innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
   e.preventDefault()
   $messageFormButton.setAttribute('disabled','disabled')
   const message=e.target.elements.message.value
   
    socket.emit('sendMessage',message,(error)=>{
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value=""
    $messageFormInput.focus()

        if(error)
        {
            return console.log(error)
        }
        console.log("Message was delievered!")
    })

})

document.querySelector('#send-location').addEventListener('click',()=>{

    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported bu your brower!')

    }
    $location.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {

       $location.removeAttribute('disabled')
        socket.emit('send',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude

        },(mm)=>{
            console.log(mm)
        })
    })

})


socket.emit("join",{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})