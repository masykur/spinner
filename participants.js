(async function () {
  function handleFile(e) {
    const fileList = this.files; /* now you can work with the file list */
    if (fileList.length > 0) {
      document.querySelector("#status").innerText = "Uploading...";
      const file = fileList[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        let participants = parseFile(e.target.result, ["id", "name", "note"]);
        for(let i in participants) {
          await db.put("participants", participants[i]);
        }
        render(participants);
        document.querySelector("#status").innerText = "";
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  }

  function render(participants){
    let tableBody = document.querySelector("table tbody");
    let tableFoot = document.querySelector("table tfoot");
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
  const db = await (() => {
    return new Promise((resolve) => {
      document.addEventListener("dbinitialized", (event) => resolve(event.detail));
    })
  })();
  const data = await db.getAll("participants")
  const inputFile = document.querySelector("input[type=file]");
  const uploadButton = document.querySelector("#upload");
  const clearButton = document.querySelector("#clear");
  uploadButton.addEventListener("click", () => inputFile.click());
  clearButton.addEventListener("click", async () => {await db.clear("participants"); render([]);});
  inputFile.addEventListener("change", handleFile, false);
  render(data);
})();