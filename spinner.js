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
    document.querySelector("#spinner").addEventListener("click", () => {init(); spin();});
    document.querySelector("#reseter").addEventListener("click", init);
  
    document.querySelector("#nav > ul > li > a:first-child").addEventListener("click", () => {
      document.querySelector(".page").classList.remove('page-active');
    });
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
      nameBox.textContent = employees[idx].name + ", " + employees[idx].note;
      nameBox.style.transform = "translateX(10)";
    }
  
    let employees = [];
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
  
    function getAllParticipants(db) {
      const txn = db.transaction('participants', "readonly");
      const objectStore = txn.objectStore('participants');
      let participants = [];
      objectStore.openCursor().onsuccess = (event) => {
        let cursor = event.target.result;
          if (cursor) {
              let participant = cursor.value;
              participants.push(participant);
              // continue next record
              cursor.continue();
          }
      };
      // close the database connection
      txn.oncomplete = function () {
          db.close();
          employees = participants;
      };
    }

    function loadData(){
      const dbrequest = window.indexedDB.open("spinner");
      dbrequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("participants", { keyPath: "id", autoIncrement: false, unique: true });
      }
      dbrequest.onsuccess = (event) => {
        const db = event.target.result;
        getAllParticipants(db);
      }
    }
    loadData();
    init();
  })();
  