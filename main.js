const queryButton = document.getElementById("queryButton");
const queryResult = document.getElementById("queryResult");

queryButton.addEventListener("click", async () => {
  queryResult.innerHTML = "<tr><th>ID</th><th>Names</th><th>Age</th></tr>";
  const response = await fetch("/users");
  const data = await response.json();
  data.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index + 1}</td><td>${user.name}</td><td>${
      user.age
    }</td>
                     <td><button class="editButton" data-id="${
                       user._id
                     }">编辑</button></td>
                     <td><button class="deleteButton" data-id="${
                       user._id
                     }">删除</button></td>`;
    queryResult.appendChild(row);
  });
});

// 插入数据的表单提交事件
const insertForm = document.getElementById("insertForm");
insertForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  //校验输入框是否为空,已放在后端node,app.js post里验证
 // if (!name || !age ||isNaN(age)) {
   // alert("请填写完整的姓名和年龄信息！");
  // return;
 // }

  const response = await fetch("/newuser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, age }),
  });

  if (response.status === 200) {
    // 插入成功
    alert("Add success!");
  } else if (response.status === 400) {
    // 用户已存在
    const result = await response.json();
    alert(result.message);
  } else {
    // 其他错误
    alert("An error occurred.");
  }
});

// 使用事件委托来处理动态添加的按钮点击事件
queryResult.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("editButton")) {
    const userId = target.getAttribute("data-id");
    const newName = prompt("请输入新的名字：");
    const newAge = prompt("请输入新的年龄：");

    if (newName && newAge) {
      const response = await fetch(`/updateuser/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName, age: newAge }),
      });

      if (response.status === 200) {
        alert("更新成功！");
        location.reload(); // 刷新页面以显示更新后的数据
      } else {
        alert("更新失败，请重试。");
      }
    }
  } else if (target.classList.contains("deleteButton")) {
    const userId = target.getAttribute("data-id");
    const rowToRemove=target.closest("tr");//找到包含删除按钮的行元素
    //`Element.closest()` 是一个 DOM 方法，用于在DOM树中沿着祖先元素向上查找，以查找最接近给定选择器或
    //元素的祖先元素。它会返回满足条件的最近的祖先元素，如果找不到满足条件的祖先元素，则返回 `null`。
//在你的情况下，`target.closest("tr")` 表示查找最近的包含点击的目标元素（即按钮）的 `<tr>` 元素，即所在的行元素。
//这个方法非常有用，因为它可以帮助你在表格中找到与某个按钮相关联的整行，从而可以执行相应的操作，比如删除整行。
    const response = await fetch(`/deleteuser/${userId}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      alert("删除成功！");
      rowToRemove.remove();
      queryButton.click(); // 触发查询按钮的点击事件，重新获取数据并渲染表格
     // location.reload(); // 刷新页面以显示更新后的数据
      console.log( await response.text()); // 在页面的F12输出后端返回的文本响应-{"message":"删除成功"}
      console.log(response.statusText); //OK
  
    }else{
      alert("删除失败，请重试！");
    }
  }
});
