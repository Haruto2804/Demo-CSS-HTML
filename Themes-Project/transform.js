const body = document.body;
const sendBtn = document.querySelector('.send-btn');
const theme = localStorage.getItem('website-theme');
const inputElement = document.querySelector('.review-input');
body.classList = theme;

sendBtn.addEventListener('click',(e)=> {
  const clickedButton = e.currentTarget;
  clickedButton.classList.add('active');
  alert('Cảm ơn bạn đã góp ý!');
  inputElement.value = '';
})






const btnElement = document.querySelectorAll('.Themebtn');
btnElement.forEach((btn)=> {
  btn.addEventListener('click',(e)=> {
    const clickedButton = e.currentTarget;
    
    btnElement.forEach((btnCollapsed)=> {
      btnCollapsed.classList.remove('active');
    })
    clickedButton.classList.add('active');

    const theme = clickedButton.dataset.theme;
    body.className = theme;
    localStorage.setItem('website-theme',theme);
  })
})