import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, updateDoc, doc 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDffdQRRDT5rc50sPcAehalSQ4_KNvwJgA",
  authDomain: "homework-keeper-d9f98.firebaseapp.com",
  projectId: "homework-keeper-d9f98",
  storageBucket: "homework-keeper-d9f98.appspot.com",
  messagingSenderId: "893711614965",
  appId: "1:893711614965:web:448bd8a7d2a72fcd1396bc"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 新增任務
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

// 顯示清單
onSnapshot(collection(db, "tasks"), (snapshot) => {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const tasks = [];
  snapshot.forEach(docSnap => {
    tasks.push({ id: docSnap.id, ...docSnap.data() });
  });
  tasks.sort((a,b) => a.dueDate.toDate() - b.dueDate.toDate());

  tasks.forEach(task => {
    const li = document.createElement("li");
    const dueStr = formatDateTime(task.dueDate.toDate());
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
  });
});

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  const h = String(date.getHours()).padStart(2,"0");
  const mi = String(date.getMinutes()).padStart(2,"0");
  return `${y}-${m}-${d} ${h}:${mi}`;
}