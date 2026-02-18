const form = document.getElementById("feesForm");
const tableBody = document.querySelector("tbody");

form.addEventListener("submit", e => {
    e.preventDefault();

    const name = form.children[0].value;
    const total = Number(form.children[1].value);
    const paid = Number(form.children[2].value);

    const remaining = total - paid;

    const status = remaining === 0 
        ? `<span class="paid">Paid</span>` 
        : `<span class="pending">Pending</span>`;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${name}</td>
        <td>${total}</td>
        <td>${paid}</td>
        <td>${remaining}</td>
        <td>${status}</td>
    `;

    tableBody.appendChild(row);

    form.reset();
});
