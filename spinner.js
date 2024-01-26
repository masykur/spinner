(async function () {
  "use strict";

  const items = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];

  let winner = null;
  let selectedDoorprize = null;
  document.querySelector(".info").textContent = items.join(" ");
  const doors = document.querySelectorAll(".door");
  document.querySelector("#spinner").addEventListener("click", () => {
    init(); 
    spin();
  });
  document.querySelector("#reseter").addEventListener("click", () => {
    document.getElementById("spinner").classList.remove("hidden");
    init();
  });
  document.querySelector("#accepter").addEventListener("click", async () => {
    if (!selectedDoorprize.winners) {
      selectedDoorprize.winners = [] 
    }
    selectedDoorprize.winners.push(winner);
    await db.put("doorprizes", selectedDoorprize);
    document.dispatchEvent(new CustomEvent("doorprizesUpdated", {detail: selectedDoorprize}));
    document.getElementById("spinner").classList.remove("hidden");
    document.getElementById("reseter").classList.add("hidden");
    document.getElementById("accepter").classList.add("hidden");
  });

  async function spin() {
    document.getElementById("spinner").classList.add("hidden");
    const idx = Math.floor(Math.random() * (participants.length));
    winner = participants[idx];
    await db.delete("participants", winner.id);
    
    init(false, 1, 3, participants[idx]);
    for (const door of doors) {
      const boxes = door.querySelector(".boxes");
      const duration = parseInt(boxes.style.transitionDuration);
      boxes.style.transform = "translateY(0)";
      await new Promise((resolve) => setTimeout(resolve, duration * 800));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const nameBox = document.querySelector("#name");
    nameBox.textContent = participants[idx].name + ", " + participants[idx].note;
    nameBox.style.transform = "translateX(10)";
    document.getElementById("reseter").classList.remove("hidden");
    document.getElementById("accepter").classList.remove("hidden");
  }

  // let participants = [];
  function init(firstInit = true, groups = 1, duration = 1, selected) {
    document.querySelector("#name").textContent = "";
    document.getElementById("reseter").classList.add("hidden");
    document.getElementById("accepter").classList.add("hidden");
    let ptr = 0;
    for (const door of doors) {
      if (firstInit) {
        door.dataset.spinned = "0";
      } else if (door.dataset.spinned === "1") {
        return;
      }

      const boxes = door.querySelector(".boxes");
      const boxesClone = boxes.cloneNode(false);

      const pool = ["❓"];
      if (!firstInit) {
        const arr = [];
        for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
          arr.push(...items);
        }
        pool.push(...[...shuffle(arr), ...[selected.id[ptr++]]]);

        boxesClone.addEventListener(
          "transitionstart",
          function () {
            door.dataset.spinned = "1";
            this.querySelectorAll(".box").forEach((box) => {
              box.style.filter = "blur(1px)";
            });
          },
          { once: true }
        );

        boxesClone.addEventListener(
          "transitionend",
          function () {
            this.querySelectorAll(".box").forEach((box, index) => {
              box.style.filter = "blur(0)";
              if (index > 0) this.removeChild(box);
            });
          },
          { once: true }
        );
      }

      for (let i = pool.length - 1; i >= 0; i--) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.style.width = door.clientWidth + "px";
        box.style.height = door.clientHeight + "px";
        box.textContent = pool[i];
        boxesClone.appendChild(box);
      }
      boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;
      boxesClone.style.transform = `translateY(-${
        door.clientHeight * (pool.length - 1)
      }px)`;
      door.replaceChild(boxesClone, boxes);
    }
  }

  function shuffle([...arr]) {
    let m = arr.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
  }
  
  async function initWinners(){
    const container = document.querySelector(".slideshow-container");
    const doorprizes = await db.getAll("doorprizes");
    doorprizes.forEach(doorprize => {
      const slide = document.createElement("div");
      slide.classList.add("slide");
      slide.innerText = `${doorprize.name} (${doorprize.winners && doorprize.winners.length ? doorprize.winners.length : 0}/${doorprize.quantity})`;
      slide.setAttribute("data-key", doorprize.id);
      container.appendChild(slide);
    });
    const prev = document.createElement("a");
    prev.classList.add("prev");
    prev.innerText = "\u276e";
    const next = document.createElement("a");
    next.classList.add("next");
    next.innerText = "\u276f";
    container.appendChild(prev);
    container.appendChild(next);
    prev.addEventListener("click", () => plusSlides(-1))
    next.addEventListener("click", () => plusSlides(1))
    var slideIndex = 1;
    showSlides(slideIndex);
    
    function plusSlides(n) {
      showSlides(slideIndex += n);
    }
    
    function currentSlide(n) {
      showSlides(slideIndex = n);
    }
    
    async function showSlides(n) {
      var i;
      var slides = document.getElementsByClassName("slide");
      if (n > slides.length) {slideIndex = 1}
      if (n < 1) {slideIndex = slides.length}
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      const slide = slides[slideIndex-1];
      slide.style.display = "block";
      const key = slide.getAttribute("data-key");
      selectedDoorprize = await db.get("doorprizes", parseInt(key));
    }
  }

  const db = await (() => {
    return new Promise((resolve) => {
      document.addEventListener("dbinitialized", (event) => resolve(event.detail));
    })
  })();
  const participants = await db.getAll("participants")

  init();
  initWinners();
})();