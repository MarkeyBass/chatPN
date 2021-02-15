// Make connection
const socket = io.connect('https://45.9.190.107:8003');

// DOM Manipulations
const header = document.querySelector('header');
    submitUsername = document.querySelector('#submit-username'),
    userName = document.querySelector('#user-name'),
    userNameGroup = document.querySelector('username-group'),
    output = document.querySelector('#output'),
    message = document.querySelector('#message'),
    send = document.querySelector('#send'),
    typing = document.querySelector('#typing');


submitUsername.addEventListener('click', () => {
  if(userName.value === '') return alert('Please enter a username before submitting.');
  userName.setAttribute('style', 'display:none;');
  submitUsername.setAttribute('style', 'display:none;');
  header.innerHTML = `<h1>Hello ${userName.value}</h1><p>You can start chatting</p>`;
  message.disabled = false;
});

// Emitting socket event
send.addEventListener('click', () => {
  // Socket Data - Send to the server
  if(userName.value === '') return alert('You must submit username to start chatting');
  if(message.value === '') return alert(`Can't send an empty message`);
  
  socket.emit('chat', {
    message: message.value,
    userName: userName.value
  });

  message.value = ''
});

// keypress event - typing event
message.addEventListener('keypress', () => {
  socket.emit('typing', userName.value)
});

// Listent for socket events
socket.on('chat', (data) => {
  console.log(data);
  if(data.userName === userName.value) {
    output.innerHTML += `<p style="background: rgb(179, 245, 179);"><strong>${data.userName}: </strong>${data.message}</p>`
  } else {
    output.innerHTML += `<p><strong>${data.userName}: </strong>${data.message}</p>`
  }
  typing.innerHTML = '';  
  message.value = ''
}); 

socket.on('typing', (data) => {
  console.log(`${data} is typing...`);
  typing.innerHTML = `<p><em>${data} is typing...</em></p>`
  setTimeout(() => {
    typing.innerHTML = "";
  }, 10000)
});





