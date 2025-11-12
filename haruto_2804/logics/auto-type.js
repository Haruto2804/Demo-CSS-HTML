
export function autoType(phrases, textElement, typingSpeed, deletingSpeed, pausedTime) {
  document.addEventListener("DOMContentLoaded", function () {
    let phraseIndex = 0;

    function typeText() {
      const currentPhrase = phrases[phraseIndex];
      let charIndex = textElement.textContent.length;
      if (charIndex < currentPhrase.length) {
        textElement.textContent += currentPhrase.charAt(charIndex);
        setTimeout(typeText, typingSpeed);
      } else {
        setTimeout(deleteText, pausedTime);
      }
    }
    function deleteText() {
      const currentText = textElement.textContent;
      if (currentText.length > 0) {
        textElement.textContent = currentText.substring(0, currentText.length - 1);
        setTimeout(deleteText, deletingSpeed);
      } else {
        phraseIndex = ++phraseIndex % phrases.length;
        setTimeout(typeText, 300);
      }
    }
    typeText();
  })
}


