document.addEventListener('DOMContentLoaded', function () {
  const sideItems = document.querySelectorAll('#detail3_section .side_item');
  const backgroundWords = document.querySelectorAll('#detail3_section .background_word');

  const sideItemObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('show');
      }
    });
  }, {
    threshold: 0.1
  });

  sideItems.forEach(function (item) {
    sideItemObserver.observe(item);
  });

  backgroundWords.forEach(function (word, index) {
    setTimeout(function () {
      word.classList.add('show');
    }, 250 + index * 450);
  });
});
