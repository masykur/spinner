(function () {
  /**
   * Get a template from a string
   * https://stackoverflow.com/a/41015840
   * @param  {String} str    The string to interpolate
   * @param  {Object} params The parameters
   * @return {String}        The interpolated string
   */
  function interpolate (str, params) {
    let names = Object.keys(params);
    let vals = Object.values(params);
    return new Function(...names, `return \`${str}\`;`)(...vals);
  }

  function addToMenu() {
    let firstListItem = document.querySelector("#nav > ul > li:first-child");
    let listItem = document.createElement("li");
    let anchor = document.createElement("a");
    anchor.setAttribute("href", "#");
    anchor.innerText = "Participants";
    listItem.appendChild(anchor);
    firstListItem.parentElement.appendChild(listItem);
    firstListItem.parentNode.insertBefore(listItem, firstListItem.nextSibling);
    anchor.addEventListener("click", () => {
      document.querySelector(".page").classList.remove('page-active');
      el.classList.add("page-active");
      document.getElementById('burger').click();
    });
  };
  function insertParticipant(db, participant) {
    // create a new transaction
    const txn = db.transaction('participants', 'readwrite');

    // get the Contacts object store
    const store = txn.objectStore('participants');
    //
    let query = store.put(participant);

    // handle success case
    query.onsuccess = function (event) {
        //console.log(event);
    };

    // handle the error case
    query.onerror = function (event) {
        console.log(event.target.errorCode);
    }

    // close the database once the 
    // transaction completes
    txn.oncomplete = function () {
        db.close();
    };
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
        render(el, participants);
    };
  }
  function handleFile(e) {
    const fileList = this.files; /* now you can work with the file list */
    if (fileList.length > 0) {
      const file = fileList[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result.split('\r\n');
        let separator = ",";
        let participants = [];
        lines.forEach((line, index) => {
          if (index===0) {
            const match = line.match(/[;,]/i);
            if (match) {
              separator = match[0];
            } else {
              return false;
            }
          } else {
            const cols = line.split(separator);
            if (cols.length >= 3) {
              participants.push({ id: cols[0], name: cols[1], note: cols[2]});
            }
          }          
        });
        const dbrequest = window.indexedDB.open("spinner");
        dbrequest.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore("participants", { keyPath: "id", autoIncrement: false, unique: true });
        }
        dbrequest.onsuccess = (event) => {
          const db = event.target.result;
          participants.forEach(participant => {
            insertParticipant(db, participant);
          })
        }
        render(el, participants);
        e.target.value = "";
      };
      reader.readAsText(file);
    }
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
  function clearData(){
    const dbrequest = window.indexedDB.open("spinner");
    dbrequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("participants", { keyPath: "id", autoIncrement: false, unique: true });
    }
    dbrequest.onerror = (event) => {
      console.error(`Database error: ${event.target.errorCode}`);
    }
    dbrequest.onsuccess = (event) => {
      const db = event.target.result;
      const txn = db.transaction('participants', "readwrite");
      const objectStore = txn.objectStore('participants');
      // Make a request to clear all the data out of the object store
      const objectStoreRequest = objectStore.clear();

      objectStoreRequest.onsuccess = (event) => {
        render(el, []);
      };
      objectStoreRequest.onerror = (event) => {
        console.error(`ObjectStore error: ${event.target.errorCode}`);
      }
      // close the database connection
      txn.oncomplete = function () {
        db.close();
      };
    }
  }

  function render(el, participants){
    let tableBody = el.querySelector("table tbody");
    let tableFoot = el.querySelector("table tfoot");
    tableBody.innerHTML = "";
    participants.forEach(participant => {
      let row = document.createElement("tr");
      let cols = [];
      cols[0] = document.createElement("td");
      cols[0].innerText = participant.id;
      cols[1] = document.createElement("td");
      cols[1].innerText = participant.name;
      cols[2] = document.createElement("td");
      cols[2].innerText = participant.note;
      row.appendChild(cols[0]); 
      row.appendChild(cols[1]); 
      row.appendChild(cols[2]);
      tableBody.appendChild(row);
    });
    tableFoot.innerHTML = '<tr><th colspan="3">' + participants.length + ' participants</th></tr>'
  }

  let template = 
  '<h2>Participants</h2>' +
  '<button id="upload">Upload</button>' + 
  '<button id="clear">Clear</button>' + 
  '<input id="file" name="file" type="file" style="display: none" accept=".csv"/>' +
  '<div>' +
  '<table style="width: 100%">' + 
  '<thead><tr><th>ID</th><th>Name</th><th>Note</th></tr></thead>' +
  '<tbody></tbody>' +
  '<tfoot></tfoot>' +
  '<table>' +
  '</div>';
  let el = document.createElement("div");
  el.id ="participants";
  el.classList.add("page");
  el.innerHTML = template;
  let inputFile = el.querySelector("input[type=file]");
  let uploadButton = el.querySelector("#upload");
  let clearButton = el.querySelector("#clear");
  uploadButton.addEventListener("click", () => inputFile.click());
  clearButton.addEventListener("click", () => clearData());
  inputFile.addEventListener("change", handleFile, false);

  let app = document.querySelector("#app");
  app.parentNode.insertBefore(el, app.nextSibling);
  addToMenu(el);
  loadData();
})();