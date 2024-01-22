(function () {
  function handleFile(e) {
    const fileList = this.files; /* now you can work with the file list */
    if (fileList.length > 0) {
      el.querySelector("#status").innerText = "Uploading...";
      const file = fileList[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const lines = e.target.result.split('\r\n');
        let separator = ",";
        let doorprizes = [];
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
            if (cols.length >= 2) {
              const doorprize = { name: cols[0], quantity: cols[1], winners: []};
              doorprizes.push(doorprize);
              await db.put("doorprizes", doorprize);
            }
          }          
        });
        render(el, await db.getAll("doorprizes"));
        el.querySelector("#status").innerText = "";
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  }

  function render(el, doorprizes){
    let tableBody = el.querySelector("table tbody");
    let tableFoot = el.querySelector("table tfoot");
    tableBody.innerHTML = "";
    doorprizes.forEach(doorprize => {
      let row = document.createElement("tr");
      let cols = [];
      cols[0] = document.createElement("td");
      cols[0].innerText = doorprize.id;
      cols[1] = document.createElement("td");
      cols[1].innerText = doorprize.name;
      cols[2] = document.createElement("td");
      cols[2].innerText = doorprize.quantity;
      row.appendChild(cols[0]); 
      row.appendChild(cols[1]); 
      row.appendChild(cols[2]);
      tableBody.appendChild(row);
    });
    tableFoot.innerHTML = '<tr><th colspan="3">' + doorprizes.length + ' doorprizes</th></tr>'
  }

  let template = 
  '<h2>Door Prizes</h2>' +
  '<section>' +
  '<button id="upload">Upload</button>' + 
  '<button id="clear">Clear</button>' + 
  '<input id="file" name="file" type="file" style="display: none" accept=".csv"/>' +
  '<span id="status"></span>' +
  '</section>' +
  '<div>' +
  '<table style="width: 100%">' + 
  '<thead><tr><th>ID</th><th>Door Prize</th><th>Quantity</th></tr></thead>' +
  '<tbody></tbody>' +
  '<tfoot></tfoot>' +
  '<table>' +
  '</div>';
  let el = document.createElement("div");
  el.id ="doorprizes";
  el.classList.add("page");
  el.innerHTML = template;
  let inputFile = el.querySelector("input[type=file]");
  let uploadButton = el.querySelector("#upload");
  let clearButton = el.querySelector("#clear");
  uploadButton.addEventListener("click", () => inputFile.click());
  clearButton.addEventListener("click", async () => {await db.clear("doorprizes"); render(el,[]);});
  inputFile.addEventListener("change", handleFile, false);

  let app = document.querySelector("#app");
  app.parentNode.insertBefore(el, app.nextSibling);
  addToMenu(el, "Doorprizes");
  let db = null;
  document.addEventListener("dbinitialized", async (event) => {
    db = event.detail;
    const data = await db.getAll("doorprizes");
    render(el, data);
  });
})();