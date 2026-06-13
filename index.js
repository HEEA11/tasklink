const links = document.querySelectorAll("#wrap a");

function createGoldSparkles(rect) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const sparkleCount = 54;
  document.body.dataset.sparklesCreated = "0";

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const startRadius = Math.random() * Math.min(rect.width, rect.height) * 0.32;
    const travel = 80 + Math.random() * 190;
    const size = 4 + Math.random() * 9;

    sparkle.classList.add("gold-sparkle");
    sparkle.style.setProperty("--start-x", centerX + Math.cos(angle) * startRadius + "px");
    sparkle.style.setProperty("--start-y", centerY + Math.sin(angle) * startRadius + "px");
    sparkle.style.setProperty("--move-x", Math.cos(angle) * travel + "px");
    sparkle.style.setProperty("--move-y", Math.sin(angle) * travel + "px");
    sparkle.style.setProperty("--size", size + "px");
    sparkle.style.setProperty("--end-scale", 0.45 + Math.random() * 1.4);
    sparkle.style.setProperty("--rotate", 180 + Math.random() * 540 + "deg");
    sparkle.style.animationDelay = Math.random() * 0.22 + "s";

    document.body.appendChild(sparkle);
    document.body.dataset.sparklesCreated = String(i + 1);

    setTimeout(() => {
      sparkle.remove();
    }, 2200);
  }
}

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const targetPage = this.getAttribute("href");
    const clickedImg = this.querySelector("img");

    const bg = document.createElement("div");
    bg.classList.add("transition-bg");
    document.body.appendChild(bg);

const rect = clickedImg.getBoundingClientRect();
createGoldSparkles(rect);

const flower = clickedImg.cloneNode(true);
flower.classList.add("transition-flower");

flower.style.left = rect.left + "px";
flower.style.top = rect.top + "px";
flower.style.width = rect.width + "px";
flower.style.height = rect.height + "px";

document.body.appendChild(flower);

    setTimeout(() => {
      window.location.href = targetPage;
    }, 1800);
  });
});



//꽃잎 낙하 애니매이션//
const petalCount = 17;

for (let i = 0; i < petalCount; i++) {
  const petal = document.createElement("div");
  petal.classList.add("petal");

  petal.style.left = Math.random() * 100 + "vw";
  petal.style.animationDuration = 5 + Math.random() * 6 + "s";
  petal.style.animationDelay = Math.random() * 5 + "s";

  const size = 18 + Math.random() * 24;
  petal.style.width = size + "px";
  petal.style.height = size + "px";

  document.body.appendChild(petal);
}
