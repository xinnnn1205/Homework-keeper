import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDffdQRRDT5rc50sPcAehalSQ4_KNvwJgA",
  authDomain: "homework-keeper-d9f98.firebaseapp.com",
  projectId: "homework-keeper-d9f98",
  storageBucket: "homework-keeper-d9f98.appspot.com",
  messagingSenderId: "893711614965",
  appId: "1:893711614965:web:448bd8a7d2a72fcd1396bc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("addTask").addEventListener("click", async () => {
  const content = document.getElementById("taskInput").value.trim();
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;

  if (!content || !date || !time) {
    alert("請填寫所有欄位");
    return;
  }

  const dueDate = new Date(`${date}T${time}:00`);

  try {
    await addDoc(collection(db, "tasks"), {
      content,
      dueDate,
      done: false,
      createdAt: new Date()
    });

    document.getElementById("taskInput").value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskTime").value = "";
  } catch (error) {
    alert("新增失敗");
    console.error(error);
  }
});

onSnapshot(collection(db, "tasks"), (snapshot) => {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const tasks = [];
  snapshot.forEach(docSnap => {
    tasks.push({ id: docSnap.id, ...docSnap.data() });
  });

  tasks.sort((a, b) => {
    const dateA = new Date(a.dueDate.seconds ? a.dueDate.seconds * 1000 : a.dueDate);
    const dateB = new Date(b.dueDate.seconds ? b.dueDate.seconds * 1000 : b.dueDate);
    return dateA - dateB;
  });

  const now = new Date();
  const soonTasks = [];

  tasks.forEach(task => {
    const li = document.createElement("li");
    const dueDate = new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate);
    const dueStr = formatDateTime(dueDate);

    li.textContent = `${task.content} （截止：${dueStr}）`;
    if (task.done) li.classList.add("done");

    const btn = document.createElement("button");
    btn.textContent = task.done ? "取消完成" : "完成";
    btn.className = "complete-btn";
    btn.onclick = async () => {
      const ref = doc(db, "tasks", task.id);
      await updateDoc(ref, { done: !task.done });
    };
    li.appendChild(btn);
    list.appendChild(li);

    const isSoon = !task.done && (dueDate - now <= 24 * 60 * 60 * 1000) && (dueDate > now);
    if (isSoon) {
      soonTasks.push(`${task.content}（${dueStr}）`);
    }
  });

  if (soonTasks.length > 0) {
    document.getElementById("reminderBox").textContent =
      "⏰ 以下作業即將到期：\n" + soonTasks.join("\n");
  } else {
    document.getElementById("reminderBox").textContent = "";
  }
});

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  const h = String(date.getHours()).padStart(2,"0");
  const mi = String(date.getMinutes()).padStart(2,"0");
  return `${y}-${m}-${d} ${h}:${mi}`;
}