(function () {
  function handleFile(e) {
    const fileList = this.files; /* now you can work with the file list */
    if (fileList.length > 0) {
      el.querySelector("#status").innerText = "Uploading...";
      const file = fileList[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result.split('\r\n');
        let separator = ",";
        let participants = [];
        lines.forEach(async (line, index) => {
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
              const participant = { id: cols[0], name: cols[1], note: cols[2]};
              participants.push(participant);
              await db.put("participants", participant);
            }
          }          
        });
        render(el, participants);
        el.querySelector("#status").innerText = "";
      };
      reader.readAsText(file);
    }
    e.target.value = "";
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
  '<section>' +
  '<button id="upload">Upload</button>' + 
  '<button id="clear">Clear</button>' + 
  '<input id="file" name="file" type="file" style="display: none" accept=".csv"/>' +
  '<span id="status"></span>' +
  '</section>' +
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
  clearButton.addEventListener("click", async () => {await db.clear("participants"); render(el, []);});
  inputFile.addEventListener("change", handleFile, false);

  let app = document.querySelector("#app");
  app.parentNode.insertBefore(el, app.nextSibling);
  addToMenu(el, "Participants");
  let db = null;
  document.addEventListener("dbinitialized", async (event) => {
    db = event.detail;
    const data = await db.getAll("participants")
    render(el, data);
  });
})();