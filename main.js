(async function() {
  const db = await idb.openDB("spinner", undefined, {
    upgrade(db, oldVersion, newVersion, transaction, event) {
      db.createObjectStore("participants", { keyPath: "id", autoIncrement: false, unique: true });
      db.createObjectStore("doorprizes", { keyPath: "id", autoIncrement: true, unique: true });
      db.createObjectStore("winners", { keyPath: "id", autoIncrement: false, unique: true });
    },
    blocked(currentVersion, blockedVersion, event) {
      // …
    },
    blocking(currentVersion, blockedVersion, event) {
      // …
    },
    terminated() {
      // …
    },
  });
  document.dispatchEvent(new CustomEvent("dbinitialized", {detail: db}));
})();

function parseFile(text, columns) {
  const lines = text.split('\r\n');
  let separator = ",";
  let result = [];
  lines.forEach(async (line, index) => {
    if (index===0) {
      const match = line.match(/[;,]/i);
      if (match) {
        separator = match[0];
      } else {
        return result;
      }
    } else {
      const cols = line.split(separator);
      if (cols.length >= columns.length) {
        const obj = {};
        columns.forEach((column, i) => obj[column] = cols[i]);
        result.push(obj);
      }
    }          
  });
  return result;
}