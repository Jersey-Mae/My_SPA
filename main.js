let salesData = [];

// Fetch initial sales records from database
async function fetchSalesRecords() {
    try {
        const response = await fetch('/api/sales');
        const result = await response.json();
        if (result.success) {
            salesData = result.data;
            renderTable();
        } else {
            console.error('Failed to load data:', result.error);
        }
    } catch (error) {
        console.error('Error connecting to backend:', error);
    }
}

function renderTable() {
    const tbody = document.getElementById('sales-tbody');
    tbody.innerHTML = '';

    let grandTotalSales = 0;
    let grandTotalComm = 0;

    salesData.forEach((item) => {
        const totalNum = Number(item.total) || 0;
        const commNum = Number(item.comm) || 0;

        grandTotalSales += totalNum;
        grandTotalComm += commNum;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td>${item.service || 'N/A'}</td>
            <td>Room ${item.room || '--'}</td>
            <td><span style="font-size: 12px; background: #eef2e6; padding: 3px 8px; border-radius: 4px;">${item.time || '--'}</span></td>
            <td>₱${totalNum.toFixed(2)}</td>
            <td>₱${commNum.toFixed(2)}</td>
            <td>
                <button class="btn-danger" onclick="deleteRow(${item.id})" title="Delete">&times;</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const netRevenue = grandTotalSales - grandTotalComm;

    document.getElementById('foot-total-sales').innerText = `₱${grandTotalSales.toFixed(2)}`;
    document.getElementById('foot-total-comm').innerText = `₱${grandTotalComm.toFixed(2)}`;

    document.getElementById('total-sales-card').innerText = `₱${grandTotalSales.toFixed(2)}`;
    document.getElementById('total-comm-card').innerText = `₱${grandTotalComm.toFixed(2)}`;
    document.getElementById('net-revenue-card').innerText = `₱${netRevenue.toFixed(2)}`;
    document.getElementById('total-count-card').innerText = salesData.length;
}

// Add new entry to database
async function addEntry() {
    const name = document.getElementById('new-name').value.trim();
    const service = document.getElementById('new-service').value.trim();
    const room = document.getElementById('new-room').value;
    const time = document.getElementById('new-time').value.trim() || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const total = parseFloat(document.getElementById('new-total').value) || 0;
    const comm = parseFloat(document.getElementById('new-comm').value) || 0;
    const report_date = document.getElementById('report-date').value;

    if (!name) {
        alert('Please enter a staff/therapist name.');
        return;
    }

    const payload = { name, service, room, time, total, comm, report_date };

    try {
        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
            salesData.unshift(result.data);
            renderTable();

            // Clear input form
            document.getElementById('new-name').value = '';
            document.getElementById('new-service').value = '';
            document.getElementById('new-room').value = '';
            document.getElementById('new-time').value = '';
            document.getElementById('new-total').value = '';
            document.getElementById('new-comm').value = '';
        } else {
            alert('Error adding record: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding record:', error);
    }
}

// Delete entry from database
async function deleteRow(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
        const response = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            salesData = salesData.filter(item => item.id != id);
            renderTable();
        } else {
            alert('Error deleting record: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting record:', error);
    }
}

function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Name,Service,Room,Time,Total Sales,Commission\n";
    salesData.forEach(row => {
        csvContent += `"${row.name}","${row.service}","Room ${row.room}","${row.time}",${row.total},${row.comm}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Sales_Report_${document.getElementById('report-date').value}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', fetchSalesRecords);