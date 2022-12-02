window.addEventListener("DOMContentLoaded", () => {
  pullData();
  document
    .querySelector("#sidebar-button")
    .addEventListener("click", onSidebarButtonClick);

  document.querySelector("#memo").addEventListener("input", onChangeMemo);
  document
    .querySelector("#moveup-button")
    .addEventListener("click", moveupMemo);
  document
    .querySelector("#movedown-button")
    .addEventListener("click", movedownMemo);

  // Delete button needs long click
  let deleteButton = document.querySelector("#delete-button");
  let deleteButtonMouseDownAt = null;
  if (isSmartPhone()) {
    deleteButton.addEventListener("click", () => {
      const confirmResult = window.confirm("Delete a memo ?");
      if (confirmResult) {
        deleteMemo();
      }
    });
  } else {
    deleteButton.addEventListener(
      "mousedown",
      () => (deleteButtonMouseDownAt = Date.now())
    );
    deleteButton.addEventListener("mouseup", () => {
      if (
        !deleteButtonMouseDownAt ||
        Date.now() - deleteButtonMouseDownAt < 2000
      ) {
        window.alert("Press and hold for 2 seconds to delete");
        return;
      }
      deleteMemo();
    });
  }
});

let memoList = [];
let currentMemoIdx = null;

function pullData() {
  let strData = window.localStorage.getItem("memo");
  if (!strData) strData = "{}";
  data = JSON.parse(strData);

  if (data && data.memoList) {
    memoList = data.memoList;
    currentMemoIdx = data.currentMemoIdx;
  }
  updateMemo();
}

function save() {
  window.localStorage.setItem(
    "memo",
    JSON.stringify({
      memoList: memoList,
      currentMemoIdx: currentMemoIdx,
    })
  );
}

function setMemo(memoIdx, text) {
  if (memoIdx == null) {
    currentMemoIdx = memoList.length;
    memoList.push({ text: text, lastModified: Date.now() });
  } else {
    memoList[memoIdx] = { text: text, lastModified: Date.now() };
  }
}

function onSidebarButtonClick() {
  let container = document.querySelector("#container");
  if (isTabOpened()) {
    container.className = "tab-closed";
  } else {
    container.className = "tab-opened";
  }
}

function isTabOpened() {
  return document.querySelector("#container").className === "tab-opened";
}

let saving = false;

function onChangeMemo() {
  let memo = document.querySelector("#memo");
  if (saving || memo.value.length < 1) return;
  saving = true;
  setTimeout(() => {
    setMemo(currentMemoIdx, memo.value);
    updateMemoListHTML(memoList);
    save();
    saving = false;
  }, 500);
}

function updateMemoListHTML(memoList) {
  document.querySelector("#memo-list").remove();
  document
    .querySelector("#left-side-bar")
    .appendChild(generateMemoListHTML(memoList));
}

function generateMemoListHTML(memoList) {
  let result = document.createElement("div");
  result.id = "memo-list";

  let newMemoListItem = genelateMemoListItem("+ New Memo", "now");
  result.appendChild(newMemoListItem);

  for (let i = 0; i < memoList.length; i++) {
    let text = memoList[i].text.split("\n")[0];
    let date = new Date(memoList[i].lastModified);
    let time =
      date.toLocaleDateString("ja-JP") + " " + date.toLocaleTimeString("ja-JP");
    let elem = genelateMemoListItem(text, time, i);
    result.appendChild(elem);
  }
  return result;
}

function genelateMemoListItem(text, timeText, idx) {
  let elem = document.createElement("div");
  let p = document.createElement("p");
  let time = document.createElement("time");

  p.textContent = text;
  time.textContent = timeText;
  elem.appendChild(p);
  elem.appendChild(time);
  elem.addEventListener("click", () => {
    currentMemoIdx = idx;
    updateMemo();
    if (isSmartPhone() && isTabOpened()) {
      onSidebarButtonClick();
    }
  });
  if (idx === currentMemoIdx) {
    elem.className = "selected";
  }
  return elem;
}

function updateMemo() {
  saving = true;
  let text = currentMemoIdx == null ? "" : memoList[currentMemoIdx].text;
  document.querySelector("#memo").value = text;
  saving = false;
  updateMemoListHTML(memoList);
}

function moveupMemo() {
  if (currentMemoIdx == null || currentMemoIdx === 0) return;
  let tmp = memoList[currentMemoIdx];
  memoList[currentMemoIdx] = memoList[currentMemoIdx - 1];
  memoList[currentMemoIdx - 1] = tmp;
  currentMemoIdx--;
  updateMemo();
  save();
}

function movedownMemo() {
  if (currentMemoIdx == null || currentMemoIdx === memoList.length - 1) return;
  let tmp = memoList[currentMemoIdx];
  memoList[currentMemoIdx] = memoList[currentMemoIdx + 1];
  memoList[currentMemoIdx + 1] = tmp;
  currentMemoIdx++;
  updateMemo();
  save();
}

function deleteMemo() {
  if (currentMemoIdx == null) return;
  memoList.splice(currentMemoIdx, 1);
  currentMemoIdx = null;
  updateMemo();
  save();
}

function isSmartPhone() {
  if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
    return true;
  } else {
    return false;
  }
}
