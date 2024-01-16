(function () {
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

    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const app = document.getElementById('app');
    
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        app.classList.toggle('overlay');
    });

    document.querySelector(".info").textContent = items.join(" ");
  
    const doors = document.querySelectorAll(".door");
    document.querySelector("#spinner").addEventListener("click", spin);
    document.querySelector("#reseter").addEventListener("click", init);
  
    async function spin() {
      const idx = Math.floor(Math.random() * (employees.length));
      console.info(employees[idx]);
      init(false, 1, 3, employees[idx]);
      for (const door of doors) {
        const boxes = door.querySelector(".boxes");
        const duration = parseInt(boxes.style.transitionDuration);
        boxes.style.transform = "translateY(0)";
        await new Promise((resolve) => setTimeout(resolve, duration * 800));
      }
      const nameBox = document.querySelector("#name");
      nameBox.textContent = employees[idx].name;
      nameBox.style.transform = "translateX(10)";
    }
  
    const employees = [
        {id: "11100518", name:"AM"},
        {id: "09999564", name:"AGUS HERMANA"},
        {id: "20020002", name:"ALIF RONI PRIAMBUDI"},
        {id: "22090009", name:"FILDZAH FESTY SHARFINA ADANI"},
        {id: "17070014", name:"DWI JAYANTI PURWANTINI"},
        {id: "19120005", name:"RIZKI MAIDA OCTAVIANI SIMARMATA"},
        {id: "23100006", name:"SULTAN DAFFA NUSANTARA"},
        {id: "22120006", name:"MUHAMMAD RIDHWAN HABIB ABDILLAH"},
        {id: "23100003", name:"MUHAMMAD ARDHANA GUSTI SYAHPUTRA"},
        {id: "09696105", name:"CEPI SOPIAN NURJAMAN"},
        {id: "16100016", name:"FAJRUL GHALEB"},
        {id: "09898027", name:"HERMAWATI HADIWARDANI"},
        {id: "21090013", name:"SHIRASAWA NOBUYASU"},
        {id: "10704882", name:"THEODOR TIRTOHADI ROOSNO"},
        {id: "10000159", name:"SAWITRI KUMALA DEWI	"},
        {id: "09595442", name:"SETIO KOESOEMO"},
        ];
    function init(firstInit = true, groups = 1, duration = 1, selected) {
      document.querySelector("#name").textContent = "";
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
        // console.log(pool);

  
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
        // console.log(door);
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
  
    init();
  })();
  