const fileInput = document.getElementById('fileInput');
const viewBtn = document.getElementById('viewBtn');
const hexTable = document.getElementById('hexTable');

viewBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) return alert('Please select a file first!');

    const reader = new FileReader();
    reader.onload = function (e) {
        const bytes = new Uint8Array(e.target.result);
        renderHexTable(bytes);
    };
    reader.readAsArrayBuffer(file);
});

function renderHexTable(bytes) {
    hexTable.innerHTML = '';
    const chunkSize = 16;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);

        let hexCells = '';
        let asciiCells = '';

        chunk.forEach((b, idx) => {
            const hex = b.toString(16).padStart(2, '0').toUpperCase();
            const ascii = b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';

            const id = `${i + idx}`;

            hexCells += `<span class="hex-cell" data-id="${id}">${hex}</span> `;
            asciiCells += `<span class="ascii-cell" data-id="${id}">${ascii}</span>`;
        });

        const row = `
          <tr>
            <td class="px-2 py-1 text-gray-500">${i.toString(16).padStart(8, '0').toUpperCase()}</td>
            <td class="px-2 py-1">${hexCells}</td>
            <td class="px-2 py-1">${asciiCells}</td>
          </tr>
        `;
        hexTable.insertAdjacentHTML('beforeend', row);
    }

    addHighlightEvents();
}

function addHighlightEvents() {
    const hexCells = document.querySelectorAll('.hex-cell');
    const asciiCells = document.querySelectorAll('.ascii-cell');

    function clearHighlights() {
        document.querySelectorAll('.highlight').forEach((el) => el.classList.remove('highlight'));
    }

    [...hexCells, ...asciiCells].forEach((cell) => {
        cell.addEventListener('mouseenter', () => {
            clearHighlights();
            const id = cell.dataset.id;
            document.querySelectorAll(`[data-id="${id}"]`).forEach((el) => el.classList.add('highlight'));
        });
        cell.addEventListener('mouseleave', clearHighlights);
    });
}
