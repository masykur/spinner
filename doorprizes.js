(async function () {
  function handleFile(e) {
    const fileList = this.files; /* now you can work with the file list */
    if (fileList.length > 0) {
      document.querySelector("#status").innerText = "Uploading...";
      const file = fileList[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        let doorprizes = parseFile(e.target.result, ["name", "quantity"]);
        for(let i in doorprizes) {
          await db.put("doorprizes", doorprizes[i]);
        }
        doorprizes = await db.getAll("doorprizes")
        render(doorprizes);
        document.querySelector("#status").innerText = "";
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  }

  function render(doorprizes){
    let tableBody = document.querySelector("table tbody");
    let tableFoot = document.querySelector("table tfoot");
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

  const db = await (() => {
    return new Promise((resolve) => {
      document.addEventListener("dbinitialized", (event) => resolve(event.detail));
    })
  })();
  const data = await db.getAll("doorprizes")
  const inputFile = document.querySelector("input[type=file]");
  const uploadButton = document.querySelector("#upload");
  const clearButton = document.querySelector("#clear");
  uploadButton.addEventListener("click", () => inputFile.click());
  clearButton.addEventListener("click", async () => {await db.clear("doorprizes"); render([]);});
  inputFile.addEventListener("change", handleFile, false);
  render(data);
})();