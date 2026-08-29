import './TreeEditor.css'
/**
 * TreeEditor
 * Zeigt einen Baum aus Knoten { id, name, children, ...beliebigeZusatzfelder }
 * an, erlaubt Bearbeiten, Hinzufügen, Löschen und Umsortieren per Drag & Drop.
 *
 * Zusatzfelder wie "description" bleiben beim Laden/Speichern erhalten.
 * Aktuell wird "description" zusätzlich zum Namen direkt angezeigt/editierbar
 * gemacht; alle anderen unbekannten Felder werden nur mitgeschleift (JSON-Export).
 */
class TreeEditor {
  /**
   * @param {HTMLElement} container - Element, in das der Baum gerendert wird
   * @param {Array} data - Anfangsdaten (Array von Knoten)
   * @param {Function} onRender - call at each change of tree, that implies that it render to update server tree data
   * @param {Function} onSelect - call at select of treenode
   */
  constructor(container, data = [], onRender, onSelect) {
    this.container = container;
    this.data = [];
    this.idCounter = 1;
    this.draggedId = null;
    this.setDataDone = false

    // Bleiben über setData() hinweg erhalten (z.B. bei erneutem JSON-Import),
    // da sie unabhängig vom Datenmodell auf der Instanz gehalten werden.
    // expandedIds statt collapsedIds: Standardzustand ist zugeklappt,
    // nur explizit aufgeklappte Knoten (per id) merken sich das über setData hinweg.
    this.selectedId = null;
    this.expandedIds = new Set();

    if (data && data.length) this.setData(data);

    this.onRender = onRender // set it after setData to prohibit data update at onRender
    this.onSelect = onSelect
  }

  // ---- Datenverwaltung ----

  /**
   * Ersetzt den kompletten Baum, z.B. nach JSON-Import.
   * Selektion bleibt erhalten (anhand der id), sofern sie im neuen Baum
   * noch existiert. Neue/erstmals geladene Knoten starten zugeklappt;
   * zuvor aufgeklappte Knoten bleiben aufgeklappt, sofern ihre id noch existiert.
   * 
   * later call render()
   */
  setData(nodes) {
    this.setDataDone = true
    this.data = this._normalize(nodes);

    if (this.selectedId !== null && !this._findParentArray(this.data, this.selectedId)) {
      this.selectedId = null;
    }
    for (const id of this.expandedIds) {
      if (!this._findParentArray(this.data, id)) this.expandedIds.delete(id);
    }
  }

  /** Gibt den Baum als reines JSON-taugliches Array zurück. */
  toJSON() {
    return this.data;
  }

  makeNode(name = "new node", extra = {}) {
    return { id: this.idCounter++, name, children: [], ...extra };
  }

  /** Stellt sicher, dass alle Knoten eine id und ein children-Array haben. */
  _normalize(nodes) {
    return nodes.map(raw => {
      const node = { ...raw };
      if (node.id === undefined || node.id === null) {
        node.id = this.idCounter++;
      } else {
        this.idCounter = Math.max(this.idCounter, node.id + 1);
      }
      node.children = this._normalize(node.children || []);
      return node;
    });
  }

  _findParentArray(nodes, id) {
    for (const n of nodes) {
      if (n.id === id) return { arr: nodes, node: n };
      const found = this._findParentArray(n.children, id);
      if (found) return found;
    }
    return null;
  }

  findNodes(nodes, arr=undefined, key, val) {
    if (!nodes) nodes = this.data
    if (!arr) arr = []
    for (const n of nodes) {
      if (n[key] === val) arr.push( { arr: nodes, node: n })
      this.findNodes(n.children, arr, key, val)
    }
    return arr;
  }

  _removeNode(id) {
    const res = this._findParentArray(this.data, id);
    if (!res) return null;
    const idx = res.arr.indexOf(res.node);
    res.arr.splice(idx, 1);
    return res.node;
  }

  _containsId(node, id) {
    if (node.id === id) return true;
    return node.children.some(c => this._containsId(c, id));
  }

  /** Liefert die id-Kette der Vorfahren von id (ohne id selbst), oder null wenn nicht gefunden. */
  _findAncestorIds(nodes, id, path = []) {
    for (const n of nodes) {
      if (n.id === id) return path;
      const found = this._findAncestorIds(n.children, id, [...path, n.id]);
      if (found) return found;
    }
    return null;
  }

  // ---- Öffentliche Aktionen ----

  addRootNode(nodeName) {
    const newNode = this.makeNode(nodeName)
    this.data.splice(0,0,newNode);
    this.render();
    return newNode.id
  }

  addRootNodeIfNotExist(nodeName) {
    const dataExisting = this.data.find(n => n.name === nodeName)
    if (!dataExisting) {
      const newNode = this.makeNode(nodeName)
      this.data.splice(0,0,newNode);
      this.render();
      return newNode.id
    }
    return dataExisting.id
  }
  addChildNode(parentId, nodeData) {
    const res = this._findParentArray(this.data, parentId);
    const parent = res ? res.node : null;
    const target = parent || this.data.find(n => n.id === parentId);
    if (target) {
      if (nodeData) {
        target.children.splice(0,0,this.makeNode(nodeData.name,nodeData));
      } else {
        target.children.splice(0,0,this.makeNode());
      }
      this.render();
    }
  }

  // appendNode(parentId, nodeData) {
  //   const res = this._findParentArray(this.data, parentId);
  //   const parent = res ? res.node : null;
  //   const target = parent || this.data.find(n => n.id === parentId);
  //   if (target) {
  //     if (nodeData) {
  //       target.push(this.makeNode(nodeData.name,nodeData));
  //     } else {
  //       target.push(this.makeNode());
  //     }
  //     this.render();
  //   }
  // }

  deleteNode(id) {
    this._removeNode(id);
    this.render();
  }

  renameNode(id, newName) {
    const res = this._findParentArray(this.data, id);
    if (res) res.node.name = newName;
  }
  renameNodeFinish(id, newName) {
    if (this.onRender) this.onRender() // when description changes call onRender, even when render is unnecessary
  }
  

  setDescription(id, text) {
    const res = this._findParentArray(this.data, id);
    if (res) res.node.description = text;
  }
  setDescriptionFinish(id, text) {
    if (this.onRender) this.onRender() // when description changes call onRender, even when render is unnecessary
  }

  /**
   * Klappt bei Bedarf alle Elternknoten von id auf, damit der Knoten sichtbar
   * wird, wählt ihn aus und scrollt ihn in den sichtbaren Bereich.
   * Nützlich z.B. nach Suche oder externem Verweis auf eine bestimmte id.
   */
  revealAndSelect(id) {
    const ancestorIds = this._findAncestorIds(this.data, id);
    if (ancestorIds === null) return false; // id existiert nicht im aktuellen Baum

    ancestorIds.forEach(ancestorId => this.expandedIds.add(ancestorId));
    this.selectedId = id;
    this.render();

    const rowEl = this.container.querySelector(`.node[data-id="${id}"]`);
    if (rowEl) rowEl.scrollIntoView({ block: "nearest", behavior: "smooth" });

    return true;
  }

  /** Wählt einen Knoten aus (oder hebt die Auswahl mit null auf). */
  selectNode(id) {
    this.selectedId = id;
    this._refreshSelectionClasses();
  }

  getSelectedId() {
    return this.selectedId;
  }

  getSelectedNode() {
    if (this.selectedId === null) return null;
    const res = this._findParentArray(this.data, this.selectedId);
    return res ? res.node : null;
  }

  _refreshSelectionClasses() {
    this.container.querySelectorAll(".node").forEach(el => {
      el.classList.toggle("selected", el.dataset.id === String(this.selectedId));
    });
  }

  moveNode(draggedId, targetId, mode) {
    if (draggedId === targetId) return;
    const draggedRes = this._findParentArray(this.data, draggedId);
    if (!draggedRes) return;
    if (this._containsId(draggedRes.node, targetId)) return;

    const moved = this._removeNode(draggedId);
    if (!moved) return;

    if (mode === "inside") {
      const targetRes = this._findParentArray(this.data, targetId);
      const target = targetRes ? targetRes.node : this.data.find(n => n.id === targetId);
      target.children.push(moved);
    } else {
      const targetRes = this._findParentArray(this.data, targetId);
      if (!targetRes) { this.data.push(moved); return; }
      const idx = targetRes.arr.indexOf(targetRes.node);
      targetRes.arr.splice(mode === "above" ? idx : idx + 1, 0, moved);
    }
    this.render();
  }

  // ---- Rendering ----
/**
 * 
 * @param {boolean} setData at this flag no onRender, only at internal changes on nodes 
 */
  render(setData=false) {
    this.container.innerHTML = "";
    this.container.appendChild(this._renderList(this.data));
    this._refreshSelectionClasses();
    if (!setData && this.onRender) this.onRender()
  }

  _renderList(nodes) {
    const ul = document.createElement("ul");
    nodes.forEach(n => ul.appendChild(this._renderNode(n)));
    return ul;
  }

  _renderNode(node) {
    const li = document.createElement("li");

    const row = document.createElement("div");
    row.className = "node";
    row.dataset.id = node.id;

    const handle = document.createElement("span");
    handle.className = "drag-handle";
    handle.draggable = true;
    handle.title = "Ziehen zum Umsortieren";
    handle.textContent = "⠿";

    const isCollapsed = node.children.length > 0 && !this.expandedIds.has(node.id);
    if (isCollapsed) li.classList.add("collapsed");

    const toggle = document.createElement("span");
    toggle.className = "toggle" + (node.children.length ? "" : " empty");
    toggle.textContent = node.children.length ? (isCollapsed ? "▸" : "▾") : "•";
    toggle.onclick = e => {
      e.stopPropagation();
      if (this.expandedIds.has(node.id)) {
        this.expandedIds.delete(node.id);
      } else {
        this.expandedIds.add(node.id);
      }
      li.classList.toggle("collapsed");
      toggle.textContent = li.classList.contains("collapsed") ? "▸" : "▾";
    };

    const labelWrap = document.createElement("div");
    labelWrap.className = "label-wrap";

    const label = document.createElement("div");
    label.className = "label";
    label.contentEditable = "true";
    label.textContent = node.name;
    label.oninput = () => this.renameNode(node.id, label.textContent);
    label.onblur = () => this.renameNodeFinish(node.id, label.textContent);
    label.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); label.blur(); } };
    labelWrap.appendChild(label);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn";
    addBtn.textContent = "+";
    addBtn.title = "Kind-Knoten hinzufügen";
    addBtn.onclick = () => {
      li.classList.remove("collapsed");
      this.expandedIds.add(node.id);
      this.addChildNode(node.id);
    };

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn del";
    delBtn.textContent = "✕";
    delBtn.title = "Knoten löschen";
    delBtn.onclick = () => this.deleteNode(node.id);

    row.append(handle, toggle, labelWrap, addBtn, delBtn);
    row.addEventListener("click", e => {
      console.log('row:click')
      if (e.target.closest("button")) return;
      this.selectNode(node.id);
    });
    row.addEventListener("dblclick", e => {
      console.log('row:dblclick')
      if (e.target.closest("button")) return;
      // this.selectNode(node.id);
      if (this.onSelect) this.onSelect(node.id)
    });
    li.appendChild(row);

    const desc = document.createElement("div");
    desc.className = "description";
    desc.contentEditable = "true";
    desc.textContent = node.description || "";
    desc.oninput = () => this.setDescription(node.id, desc.textContent);
    desc.onblur = () => this.setDescriptionFinish(node.id, desc.textContent); 
    li.appendChild(desc);

    if (node.children.length) {
      li.appendChild(this._renderList(node.children));
    }

    this._attachDragHandlers(row, handle, node);

    return li;
  }

  _attachDragHandlers(row, handle, node) {
    handle.addEventListener("dragstart", e => {
      this.draggedId = node.id;
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    handle.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      this.container.querySelectorAll(".node").forEach(el =>
        el.classList.remove("drag-over-inside", "drag-over-above", "drag-over-below")
      );
    });

    row.addEventListener("dragover", e => {
      e.preventDefault();
      const rect = row.getBoundingClientRect();
      const offset = e.clientY - rect.top;
      row.classList.remove("drag-over-inside", "drag-over-above", "drag-over-below");
      if (offset < rect.height * 0.25) row.classList.add("drag-over-above");
      else if (offset > rect.height * 0.75) row.classList.add("drag-over-below");
      else row.classList.add("drag-over-inside");
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over-inside", "drag-over-above", "drag-over-below");
    });

    row.addEventListener("drop", e => {
      e.preventDefault();
      const mode = row.classList.contains("drag-over-inside") ? "inside"
        : row.classList.contains("drag-over-above") ? "above" : "below";
      row.classList.remove("drag-over-inside", "drag-over-above", "drag-over-below");

      if (this.draggedId !== null) {
        this.moveNode(this.draggedId, node.id, mode);
        this.draggedId = null;
      }
    });
  }
}

export default TreeEditor
