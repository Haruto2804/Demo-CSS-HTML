const flipCardInnerElement = document.querySelectorAll('.flip-card-inner');

flipCardInnerElement.forEach((cardInner) => {
  cardInner.addEventListener('click', (e) => {
    cardInner.classList.toggle('active');
  })
})