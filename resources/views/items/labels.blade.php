<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TVS LP46 Lite - Label Print</title>
    <script src="https://cdn.jsdelivr.net/npm/bwip-js@4.3.0/dist/bwip-js.min.js"></script>
    <style>
        @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
            }
            .no-print { display: none; }
        }
        body { margin: 0; padding: 5mm 0 0 0; background: #fff; }
        .label-container {
            display: flex;
            justify-content: center;
            page-break-after: always;
            margin-bottom: 2mm;
        }
        .label {
            box-sizing: border-box;
            padding: 2mm 1mm;
            text-align: center;
            border: 0.5px dotted #ccc; /* remove if not needed */
        }
        .company-name { font-weight: bold 11pt Arial; margin: 0 0 1mm; }
        .item-name   { font: normal 9pt Arial; margin: 0 0 1mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .price       { font: bold 13pt Arial; margin: 1mm 0; }
        .barcode-number { font: bold 8pt Arial; margin-top: 1mm; }
    </style>
</head>
<body>

<div id="labels-container"></div>

<script>
    let labelData = [];
    let barcodeType = 'code128';

    const sizes = {
        '100x50': { w: 100, h: 50, cols: 1, company: '14pt', item: '12pt', price: '18pt', bcWidth: '85mm', bcHeight: '18mm', num: '10pt' },
        '50x25' : { w: 50,  h: 25, cols: 2, company: '12pt', item: '8pt',  price: '8pt', bcWidth: '42mm', bcHeight: '5mm',  num: '7pt' },
        '50x30' : { w: 50,  h: 30, cols: 2, company: '11pt', item: '9pt',  price: '15pt', bcWidth: '42mm', bcHeight: '11mm', num: '8pt' }
    };

    function renderLabels() {
        const container = document.getElementById('labels-container');
        container.innerHTML = '';

        const [cols, dim] = document.getElementById('size')?.value?.split('_') || ['2', '50x25'];
        const [width, height] = dim.split('x');
        const config = sizes[`${width}x${height}`];

        // Dynamic page size
        const style = document.createElement('style');
        style.textContent = `
            .label-container { width: ${config.w * config.cols}mm; height: ${config.h}mm; }
            .label { width: ${config.w}mm; height: ${config.h}mm; }
            .company-name { font-size: ${config.company}; }
            .item-name   { font-size: ${config.item}; }
            .price       { font-size: ${config.price}; }
        `;
        document.head.appendChild(style);

        let currentRow = null;
        let countInRow = 0;

        labelData.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                if (countInRow % config.cols === 0) {
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
                    <div style="margin-top:2mm">
                        <canvas id="bc-${labelData.indexOf(item)}-${i}"></canvas>
                    </div>
                `;
                currentRow.appendChild(label);

                // Generate barcode
                bwipjs.toCanvas(`bc-${labelData.indexOf(item)}-${i}`, {
                    bcid:        barcodeType,
                    text:        item.barcode,
                    scale:       2,
                    height:      parseInt(config.bcHeight),
                    includetext: false,
                    textxalign:  'center',
                });

                countInRow++;
            }
        });
    }

    window.addEventListener('message', function(e) {
        if (e.data === 'print') { window.print(); return; }

        const data = e.data;
        barcodeType = data.barcode_type || 'code128';
        labelData = JSON.parse(data.itemData);

        renderLabels();
    });

    // Auto print if opened directly with data (optional)
    if (window.location.search.includes('auto=1')) window.print();
</script>
</body>
</html>