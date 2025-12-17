<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TVS LP46 Neo - 50x30mm (2 UPS) Label Print</title>
    <script src="https://cdn.jsdelivr.net/npm/bwip-js@4.3.0/dist/bwip-js.min.js"></script>

<style>
/* ================= PRINT SETTINGS ================= */
@media print {
    @page {
        size: 100mm 30mm landscape;
        margin: 0;
    }

    body {
        margin: 0;
        padding: 0;
        width: 100mm;
        height: 30mm;
    }

    .label-container {
        page-break-after: always;
    }
}

/* ================= BODY ================= */
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background: #f0f0f0;
}

/* ================= ROW CONTAINER (2 labels side by side) ================= */
.label-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3mm;
    width: 100mm;
    height: 30mm;
    margin: 0 auto 3mm auto;
    padding: 0;
    box-sizing: border-box;
    background: white;
}

/* ================= SINGLE LABEL ================= */
.label {
    width: 48.5mm;
    height: 28mm;
    padding: 1mm;
    box-sizing: border-box;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    border: 0.5px solid #ccc;
    background: white;
}

/* ================= TEXT SIZES ================= */
.company-name { 
    font: bold 8pt Arial; 
    margin: 0;
    line-height: 1.1;
    max-height: 6mm;
    overflow: hidden;
}

.item-name { 
    font: normal 6.5pt Arial; 
    margin: 0.3mm 0;
    line-height: 1.1;
    max-height: 5mm;
    overflow: hidden;
}

.price { 
    font: bold 9pt Arial; 
    margin: 0.3mm 0;
    color: #000;
}

.barcode-container {
    margin: 0.5mm 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

canvas { 
    max-width: 42mm;
    height: auto;
}

.barcode-number { 
    font: bold 6pt Arial; 
    margin: 0.3mm 0;
    letter-spacing: 0.3mm;
}

.dates-container { 
    font: normal 5pt Arial; 
    margin: 0;
    display: flex; 
    justify-content: space-between;
    width: 100%;
    padding: 0 1mm;
}

.date-field { 
    font: bold 5pt Arial; 
}
</style>
</head>
<body>

<div id="labels-container"></div>

<script>
let labelData = [];
let barcodeType = 'code128';
const COLS = 2;

function formatMonthYear(date) {
    if (!date) return 'N/A';

    // Works for "YYYY-MM-DD" and "YYYY-MM"
    const d = new Date(date);
    if (isNaN(d)) return date;

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${month}/${year}`; // MM/YYYY
}


function renderLabels() {
    const container = document.getElementById('labels-container');
    container.innerHTML = '';

    let currentRow = null;
    let countInRow = 0;

    labelData.forEach((item, itemIndex) => {
        for (let i = 0; i < item.quantity; i++) {

            if (countInRow % COLS === 0) {
                currentRow = document.createElement('div');
                currentRow.className = 'label-container';
                container.appendChild(currentRow);
                countInRow = 0;
            }

            const label = document.createElement('div');
            label.className = 'label';
            label.innerHTML = `
                <div class="company-name">${item.companyName}</div>
                <div class="item-name">${item.itemName}</div>
                <div class="price">₹${item.price}</div>
                <div class="barcode-container">
                    <canvas id="bc-${itemIndex}-${i}"></canvas>
                </div>
                <div class="barcode-number">${item.barcode}</div>
                <div class="dates-container">
                    <span class="date-field">PKD: ${formatMonthYear(item.pkdDate)}</span>
<span class="date-field">EXP: ${formatMonthYear(item.expDate)}</span>
                </div>
            `;

            currentRow.appendChild(label);

            setTimeout(() => {
                try {
                    bwipjs.toCanvas(`bc-${itemIndex}-${i}`, {
                        bcid: barcodeType,
                        text: item.barcode,
                        scale: 2,
                        height: 6,
                        includetext: false,
                        textxalign: 'center'
                    });
                } catch (e) {
                    console.error('Barcode generation error:', e);
                }
            }, 10);

            countInRow++;
        }
    });
}

window.addEventListener('message', function(e) {
    if (e.data === 'print') {
        window.print();
        return;
    }

    barcodeType = e.data.barcode_type || 'code128';
    labelData = JSON.parse(e.data.itemData);
    renderLabels();
});

// Test data for preview
labelData = [
    {
        companyName: "Rajarani Supermarket",
        itemName: "Thuvaram Paruppu 1 kg",
        price: "110.00",
        barcode: "7731982400",
        quantity: 2,
        pkdDate: "12/2024",
        expDate: "12/2025"
    }
];
barcodeType = 'code128';
renderLabels();
</script>

</body>
</html>