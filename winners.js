(function () {
  function render(el, doorprizes){
    let tableBody = el.querySelector("table tbody");
    let tableFoot = el.querySelector("table tfoot");
    tableBody.innerHTML = "";
    doorprizes.forEach(doorprize => {
      if (doorprize.winners && doorprize.winners.forEach) {
        const row = document.createElement("tr");
        const col = document.createElement("td");
        col.setAttribute("colspan", 3);
        col.innerText = doorprize.name;
        col.style.backgroundColor = "#0022ffc2";
        col.style.padding = "8px";
        col.style.color = "#ffffff";
        row.appendChild(col); 
        tableBody.appendChild(row);
        doorprize.winners.forEach(winner => {
          let row = document.createElement("tr");
          let cols = [];
          cols[0] = document.createElement("td");
          cols[0].innerText = winner.id;
          cols[1] = document.createElement("td");
          cols[1].innerText = winner.name;
          cols[2] = document.createElement("td");
          cols[2].innerText = winner.note;
          row.appendChild(cols[0]); 
          row.appendChild(cols[1]); 
          row.appendChild(cols[2]);
          tableBody.appendChild(row);
        });
      }
    });
  }
  let template = 
  '<h2>Winners</h2>' +
  '<div>' +
  '<table style="width: 100%">' + 
  '<thead><tr><th>ID</th><th>Name</th><th>Note</th></tr></thead>' +
  '<tbody></tbody>' +
  '<tfoot></tfoot>' +
  '<table>' +
  '</div>';
  let el = document.createElement("div");
  el.id ="winners";
  el.classList.add("page");
  el.innerHTML = template;
  let app = document.querySelector("#app");
  app.parentNode.insertBefore(el, app.nextSibling);
  addToMenu(el, "Winners");
  let db = null;
  document.addEventListener("dbinitialized", async (event) => {
    db = event.detail;
    const data = await db.getAll("doorprizes")
    render(el, data);
  });
  document.addEventListener("doorprizesUpdated", async (event) => {
    const data = await db.getAll("doorprizes")
    render(el, data);
  });
})();