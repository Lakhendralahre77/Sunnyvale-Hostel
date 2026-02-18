const form = document.getElementById("noticeForm");
const board = document.getElementById("noticeBoard");

let notices = JSON.parse(localStorage.getItem("notices")) || [];

function renderNotices() {
    board.innerHTML = "";

    notices.forEach(n => {
        const card = document.createElement("div");
        card.className = "notice";

        card.innerHTML = `
          <h3>${n.title}</h3>
          <p>${n.desc}</p>
          <small>${n.date}</small>
        `;

        board.prepend(card);
    });

    localStorage.setItem("notices", JSON.stringify(notices));
}

form.addEventListener("submit", e => {
    e.preventDefault();

    const title = form.children[0].value;
    const desc = form.children[1].value;

    notices.push({
        title,
        desc,
        date: new Date().toLocaleString()
    });

    form.reset();
    renderNotices();
});

renderNotices();
