// ==================== DATA MANAGEMENT ====================
// This app stores all data in the browser's localStorage for offline persistence.

// Initialize localStorage with default structure if empty
function initializeApp() {
    if (!localStorage.getItem('teamMembers')) {
        localStorage.setItem('teamMembers', JSON.stringify([]));
    }
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
    if (!localStorage.getItem('sales')) {
        localStorage.setItem('sales', JSON.stringify([]));
    }
    if (!localStorage.getItem('costs')) {
        localStorage.setItem('costs', JSON.stringify({
            stallFee: 175,
            insurance: 50,
            squareReader: 50
        }));
    }
    if (!localStorage.getItem('reportMeta')) {
        localStorage.setItem('reportMeta', JSON.stringify({
            eventName: 'Glenferrie Festival',
            eventDate: new Date().toISOString().split('T')[0],
            notes: ''
        }));
    }
    if (!localStorage.getItem('confettiTriggered')) {
        localStorage.setItem('confettiTriggered', 'false');
    }
}

// Get data from localStorage
function getTeamMembers() {
    return JSON.parse(localStorage.getItem('teamMembers') || '[]');
}

function getProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
}

function getSales() {
    return JSON.parse(localStorage.getItem('sales') || '[]');
}

function getCosts() {
    return JSON.parse(localStorage.getItem('costs') || '{}');
}

function getReportMeta() {
    return JSON.parse(localStorage.getItem('reportMeta') || '{}');
}

// Save data to localStorage
function saveTeamMembers(members) {
    localStorage.setItem('teamMembers', JSON.stringify(members));
    updateUI();
}

function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
    updateUI();
}

function saveSales(sales) {
    localStorage.setItem('sales', JSON.stringify(sales));
    updateUI();
}

function saveCosts(costs) {
    localStorage.setItem('costs', JSON.stringify(costs));
    updateUI();
}

function saveReportMeta(meta) {
    localStorage.setItem('reportMeta', JSON.stringify(meta));
}

// ==================== CALCULATIONS ====================

// Calculate total revenue from all sales
function calculateTotalRevenue() {
    const sales = getSales();
    return sales.reduce((sum, sale) => sum + (sale.qty * sale.unitPrice), 0);
}

// Calculate total shared costs
function calculateTotalCosts() {
    const costs = getCosts();
    let total = costs.stallFee + costs.insurance + costs.squareReader;
    return total;
}

// Calculate net profit
function calculateNetProfit() {
    return calculateTotalRevenue() - calculateTotalCosts();
}

// Calculate per-kid payout
function calculatePerKidPayout() {
    const teamMembers = getTeamMembers();
    if (teamMembers.length === 0) return 0;
    return calculateNetProfit() / teamMembers.length;
}

// Calculate break-even progress percentage
function calculateBreakEvenPercent() {
    const costs = calculateTotalCosts();
    const revenue = calculateTotalRevenue();
    if (costs === 0) return 100;
    return Math.min(100, (revenue / costs) * 100);
}

// Calculate revenue needed to break even
function calculateBreakEvenNeeded() {
    const costs = calculateTotalCosts();
    const revenue = calculateTotalRevenue();
    return Math.max(0, costs - revenue);
}

// Get sales by product with counts
function getSalesByProduct() {
    const sales = getSales();
    const products = getProducts();
    const productMap = {};

    products.forEach(product => {
        productMap[product.id] = { name: product.name, qty: 0 };
    });

    sales.forEach(sale => {
        if (productMap[sale.productId]) {
            productMap[sale.productId].qty += sale.qty;
        }
    });

    return productMap;
}

// Get top selling product
function getTopSellerProduct() {
    const salesByProduct = getSalesByProduct();
    let topProduct = null;
    let maxQty = 0;

    Object.values(salesByProduct).forEach(product => {
        if (product.qty > maxQty) {
            maxQty = product.qty;
            topProduct = product;
        }
    });

    return topProduct;
}

// ==================== TEAM MEMBER MANAGEMENT ====================

function addTeamMember() {
    const input = document.getElementById('newTeamMember');
    const name = input.value.trim();

    if (!name) {
        alert('Please enter a team member name.');
        return;
    }

    const members = getTeamMembers();
    members.push(name);
    input.value = '';
    saveTeamMembers(members);
}

function deleteTeamMember(index) {
    if (!confirm('Remove this team member?')) return;
    const members = getTeamMembers();
    members.splice(index, 1);
    saveTeamMembers(members);
}

function renderTeamList() {
    const members = getTeamMembers();
    const container = document.getElementById('teamList');
    container.innerHTML = '';

    members.forEach((member, index) => {
        const item = document.createElement('div');
        item.className = 'team-item';
        item.innerHTML = `
            <span class="name">${member}</span>
            <div class="actions">
                <button class="btn btn-delete btn-small" onclick="deleteTeamMember(${index})">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// ==================== COSTS MANAGEMENT ====================

function updateCosts() {
    const stallFee = parseFloat(document.getElementById('stallFee').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const squareReader = parseFloat(document.getElementById('squareReader').value) || 0;

    const costs = {
        stallFee,
        insurance,
        squareReader
    };

    saveCosts(costs);
}

function renderCostsDisplay() {
    const costs = getCosts();
    document.getElementById('stallFee').value = costs.stallFee;
    document.getElementById('insurance').value = costs.insurance;
    document.getElementById('squareReader').value = costs.squareReader;
    updateTotalCostsDisplay();
}

function updateTotalCostsDisplay() {
    const total = calculateTotalCosts();
    document.getElementById('totalCosts').textContent = total.toFixed(2);
    document.getElementById('dashCosts').textContent = total.toFixed(2);
}

// ==================== PRODUCT MANAGEMENT ====================

function addProduct() {
    const nameInput = document.getElementById('productName');
    const priceInput = document.getElementById('productPrice');
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;

    if (!name) {
        alert('Please enter a product name.');
        return;
    }

    const products = getProducts();
    const id = Date.now().toString();
    products.push({ id, name, defaultPrice: price });

    nameInput.value = '';
    priceInput.value = '';
    saveProducts(products);
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
}

function renderProductList() {
    const products = getProducts();
    const container = document.getElementById('productList');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No products yet. Add one to get started!</p>';
        return;
    }

    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-item';
        item.innerHTML = `
            <span class="name">${product.name}</span>
            ${product.defaultPrice > 0 ? `<span class="price">$${product.defaultPrice.toFixed(2)}</span>` : ''}
            <div class="actions">
                <button class="btn btn-delete btn-small" onclick="deleteProduct('${product.id}')">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function updateProductsInSalesDropdown() {
    const products = getProducts();
    const select = document.getElementById('saleProductSelect');
    select.innerHTML = '<option value="">-- Select a Product --</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} ${product.defaultPrice > 0 ? '($' + product.defaultPrice.toFixed(2) + ')' : ''}`;
        select.appendChild(option);
    });
}

// ==================== SALES MODE MANAGEMENT ====================

function switchSalesMode(mode) {
    // Hide all modes
    document.getElementById('quickSaleMode').classList.remove('active');
    document.getElementById('detailedSalesMode').classList.remove('active');

    // Show selected mode
    if (mode === 'quick') {
        document.getElementById('quickSaleMode').classList.add('active');
    } else {
        document.getElementById('detailedSalesMode').classList.add('active');
    }

    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ==================== QUICK SALE MODE ====================

// Store pending sale info for payment method selection
let pendingSale = null;

function renderQuickSaleButtons() {
    const products = getProducts();
    const container = document.getElementById('quickSaleButtons');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; grid-column: 1/-1;">Add products first!</p>';
        return;
    }

    products.forEach(product => {
        const btn = document.createElement('button');
        btn.className = 'quick-sale-btn';
        btn.innerHTML = `
            <span class="product-name">${product.name}</span>
            ${product.defaultPrice > 0 ? `<span class="product-price">$${product.defaultPrice.toFixed(2)}</span>` : '<span class="product-price">Custom Price</span>'}
        `;
        btn.onclick = () => showPaymentModal(product);
        container.appendChild(btn);
    });
}

function showPaymentModal(product) {
    pendingSale = { productId: product.id, unitPrice: product.defaultPrice || 0, qty: 1 };
    document.getElementById('paymentProductName').textContent = product.name;
    document.getElementById('paymentModal').classList.remove('hidden');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    pendingSale = null;
}

function recordSale(paymentMethod) {
    if (!pendingSale) return;

    const sale = {
        id: Date.now().toString(),
        productId: pendingSale.productId,
        qty: pendingSale.qty,
        unitPrice: pendingSale.unitPrice,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString()
    };

    const sales = getSales();
    sales.push(sale);
    saveSales(sales);
    closePaymentModal();
}

function adjustLastSaleQty(delta) {
    const sales = getSales();
    if (sales.length === 0) return;

    const lastSale = sales[sales.length - 1];
    lastSale.qty += delta;
    if (lastSale.qty < 1) lastSale.qty = 1;

    saveSales(sales);
}

function undoLastSale() {
    if (!confirm('Undo the last sale?')) return;
    const sales = getSales();
    if (sales.length > 0) {
        sales.pop();
        saveSales(sales);
    }
}

function updateQuickSaleTotals() {
    const sales = getSales();
    let totalRevenue = 0;
    let cashTotal = 0;
    let cardTotal = 0;

    sales.forEach(sale => {
        const amount = sale.qty * sale.unitPrice;
        totalRevenue += amount;
        if (sale.paymentMethod === 'Cash') {
            cashTotal += amount;
        } else if (sale.paymentMethod === 'Card') {
            cardTotal += amount;
        }
    });

    document.getElementById('quickTotalRevenue').textContent = totalRevenue.toFixed(2);
    document.getElementById('quickCashTotal').textContent = cashTotal.toFixed(2);
    document.getElementById('quickCardTotal').textContent = cardTotal.toFixed(2);
}

// ==================== DETAILED SALES MODE ====================

function addSaleDetailed() {
    const productId = document.getElementById('saleProductSelect').value;
    const qty = parseInt(document.getElementById('saleQuantity').value) || 1;
    const unitPrice = parseFloat(document.getElementById('saleUnitPrice').value) || 0;
    const paymentMethod = document.getElementById('salePaymentMethod').value;

    if (!productId) {
        alert('Please select a product.');
        return;
    }
    if (!paymentMethod) {
        alert('Please select a payment method.');
        return;
    }
    if (unitPrice <= 0) {
        alert('Please enter a valid price.');
        return;
    }

    const sale = {
        id: Date.now().toString(),
        productId: productId,
        qty: qty,
        unitPrice: unitPrice,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString()
    };

    const sales = getSales();
    sales.push(sale);
    saveSales(sales);

    // Reset form
    document.getElementById('saleProductSelect').value = '';
    document.getElementById('saleQuantity').value = '1';
    document.getElementById('saleUnitPrice').value = '';
    document.getElementById('salePaymentMethod').value = '';
}

function deleteSale(id) {
    if (!confirm('Delete this sale?')) return;
    const sales = getSales();
    const filtered = sales.filter(s => s.id !== id);
    saveSales(filtered);
}

function renderSalesList() {
    const sales = getSales();
    const products = getProducts();
    const container = document.getElementById('salesList');
    container.innerHTML = '';

    if (sales.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No sales yet.</p>';
        return;
    }

    sales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        const productName = product ? product.name : 'Unknown Product';
        const total = (sale.qty * sale.unitPrice).toFixed(2);
        const timestamp = new Date(sale.timestamp).toLocaleString();

        const item = document.createElement('div');
        item.className = 'sales-item';
        item.innerHTML = `
            <div class="info">
                <strong>${productName}</strong>
                <div class="details">Qty: ${sale.qty} × $${sale.unitPrice.toFixed(2)} = $${total} (${sale.paymentMethod})</div>
                <div class="details" style="font-size: 0.8em; color: #999;">${timestamp}</div>
            </div>
            <div class="actions">
                <button class="btn btn-delete btn-small" onclick="deleteSale('${sale.id}')">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// ==================== DASHBOARD ====================

function updateDashboard() {
    // Update metrics
    const revenue = calculateTotalRevenue();
    const costs = calculateTotalCosts();
    const profit = calculateNetProfit();
    const perKidProfit = calculatePerKidPayout();

    document.getElementById('dashRevenue').textContent = revenue.toFixed(2);
    document.getElementById('dashCosts').textContent = costs.toFixed(2);
    document.getElementById('dashProfit').textContent = Math.abs(profit).toFixed(2);

    // Update profit display color
    const profitDisplay = document.getElementById('dashProfitDisplay');
    if (profit >= 0) {
        profitDisplay.innerHTML = '$<span id="dashProfit">' + profit.toFixed(2) + '</span>';
        profitDisplay.style.color = '#667eea';
    } else {
        profitDisplay.innerHTML = '-$<span id="dashProfit">' + Math.abs(profit).toFixed(2) + '</span>';
        profitDisplay.style.color = '#ff6b6b';
    }

    // Update break-even meter
    const breakEvenPercent = calculateBreakEvenPercent();
    const breakEvenNeeded = calculateBreakEvenNeeded();
    document.getElementById('breakEvenFill').style.width = breakEvenPercent + '%';
    document.getElementById('breakEvenText').textContent = 
        `Need $${breakEvenNeeded.toFixed(2)} more to break even`;
    document.getElementById('breakEvenPercent').textContent = `${Math.round(breakEvenPercent)}% of target reached`;

    // Update profit pot
    const teamMembers = getTeamMembers();
    const profitAmountEl = document.getElementById('profitAmount');
    const perKidEl = document.getElementById('perKidAmount');

    if (profit >= 0) {
        profitAmountEl.innerHTML = '$' + profit.toFixed(2);
        profitAmountEl.style.color = '#667eea';
    } else {
        profitAmountEl.innerHTML = '-$' + Math.abs(profit).toFixed(2);
        profitAmountEl.style.color = '#ff6b6b';
    }

    if (teamMembers.length === 0) {
        perKidEl.innerHTML = 'Add team members to calculate';
        perKidEl.style.color = '#666';
    } else if (perKidProfit >= 0) {
        perKidEl.innerHTML = '$' + perKidProfit.toFixed(2);
        perKidEl.style.color = '#667eea';
    } else {
        perKidEl.innerHTML = '-$' + Math.abs(perKidProfit).toFixed(2);
        perKidEl.style.color = '#ff6b6b';
    }

    // Trigger confetti if profit just became positive
    if (profit > 0 && localStorage.getItem('confettiTriggered') === 'false') {
        triggerConfetti();
        localStorage.setItem('confettiTriggered', 'true');
    }

    // Update product chart
    updateProductChart();

    // Update top seller
    updateTopSeller();
}

function updateProductChart() {
    const salesByProduct = getSalesByProduct();
    const container = document.getElementById('productChart');
    container.innerHTML = '';

    const entries = Object.entries(salesByProduct).filter(([_, data]) => data.qty > 0);

    if (entries.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No sales data yet.</p>';
        return;
    }

    // Find max for scaling
    const maxQty = Math.max(...entries.map(([_, data]) => data.qty));
    const scale = maxQty > 0 ? 300 / maxQty : 1;

    entries.forEach(([_, product]) => {
        const row = document.createElement('div');
        row.className = 'chart-row';
        const barWidth = product.qty * scale;
        row.innerHTML = `
            <div class="chart-label">${product.name}</div>
            <div class="chart-bar-container">
                <div class="chart-bar" style="width: ${barWidth}px;"></div>
            </div>
            <div class="chart-value">${product.qty}</div>
        `;
        container.appendChild(row);
    });
}

function updateTopSeller() {
    const topSeller = getTopSellerProduct();
    const badge = document.getElementById('topSellerBadge');

    if (topSeller && topSeller.qty > 0) {
        document.getElementById('topSellerName').textContent = `🏆 Top Seller: ${topSeller.name} (${topSeller.qty} sold)`;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ==================== CONFETTI ANIMATION ====================

function triggerConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';

    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#ffd700', '#667eea'][Math.floor(Math.random() * 6)];
        confetti.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(confetti);
    }

    // Clean up confetti after animation
    setTimeout(() => {
        container.innerHTML = '';
    }, 3500);
}

// ==================== REPORTS ====================

function generateTeamReport() {
    const costs = getCosts();
    const teamMembers = getTeamMembers();
    const products = getProducts();
    const sales = getSales();
    const meta = getReportMeta();

    const revenue = calculateTotalRevenue();
    const totalCosts = calculateTotalCosts();
    const profit = calculateNetProfit();
    const topSeller = getTopSellerProduct();
    const salesByProduct = getSalesByProduct();

    let html = '<div class="report-section">';
    html += '<h1 style="color: #667eea; font-size: 2em; margin-bottom: 20px;">Team Summary Report</h1>';

    html += '<h3 class="report-title">Event Details</h3>';
    html += `<p><strong>Event:</strong> ${meta.eventName}</p>`;
    html += `<p><strong>Date:</strong> ${meta.eventDate}</p>`;
    html += `<p><strong>Team Members:</strong> ${teamMembers.join(', ') || 'None added'}</p>`;

    html += '<h3 class="report-title">Financial Summary</h3>';
    html += `<p><strong>Total Revenue:</strong> $${revenue.toFixed(2)}</p>`;
    html += `<p><strong>Total Shared Costs:</strong> $${totalCosts.toFixed(2)}</p>`;
    html += '<ul style="margin-left: 20px;">';
    html += `<li>Stall Fee: $${costs.stallFee.toFixed(2)}</li>`;
    html += `<li>Insurance: $${costs.insurance.toFixed(2)}</li>`;
    html += `<li>Square Reader: $${costs.squareReader.toFixed(2)}</li>`;
    html += '</ul>';
    html += `<p><strong>Net Profit:</strong> <span style="color: ${profit >= 0 ? '#667eea' : '#ff6b6b'};">$${Math.abs(profit).toFixed(2)}</span></p>`;

    html += '<h3 class="report-title">Product Performance</h3>';
    html += '<table class="report-table"><thead><tr><th>Product</th><th>Units Sold</th></tr></thead><tbody>';
    Object.entries(salesByProduct).forEach(([_, product]) => {
        if (product.qty > 0) {
            html += `<tr><td>${product.name}</td><td>${product.qty}</td></tr>`;
        }
    });
    html += '</tbody></table>';

    if (topSeller && topSeller.qty > 0) {
        html += `<p><strong>🏆 Top Seller:</strong> ${topSeller.name} (${topSeller.qty} units)</p>`;
    }

    if (meta.notes) {
        html += '<h3 class="report-title">Notes</h3>';
        html += `<p>${meta.notes}</p>`;
    }

    html += '</div>';

    return html;
}

function generateKidReport(kidName) {
    const teamMembers = getTeamMembers();
    const profit = calculateNetProfit();
    const perKidProfit = calculatePerKidPayout();

    let html = '<div class="page-break"></div>';
    html += '<div class="report-section">';
    html += `<h2 style="color: #667eea; font-size: 1.8em; margin-bottom: 20px;">${kidName}'s Earnings Report</h2>`;

    html += '<h3 class="report-title">Team Summary</h3>';
    html += `<p><strong>Total Team Revenue:</strong> $${calculateTotalRevenue().toFixed(2)}</p>`;
    html += `<p><strong>Shared Costs:</strong> $${calculateTotalCosts().toFixed(2)}</p>`;
    html += `<p><strong>Total Team Profit:</strong> $${Math.abs(profit).toFixed(2)} ${profit < 0 ? '(loss)' : ''}</p>`;

    html += '<h3 class="report-title">Your Earnings</h3>';
    if (profit >= 0) {
        html += `<p style="font-size: 1.3em; color: #667eea;"><strong>You earned: $${perKidProfit.toFixed(2)}</strong></p>`;
        html += '<p style="font-size: 1.1em;">Great work at the market! You helped make it a success! 🎉</p>';
    } else {
        html += `<p style="font-size: 1.3em; color: #ff6b6b;"><strong>Team loss: $${Math.abs(perKidProfit).toFixed(2)} per person</strong></p>`;
        html += '<p style="font-size: 1.1em;">Thanks for trying! Better luck next time! 💪</p>';
    }

    html += '</div>';

    return html;
}

function printTeamReport() {
    const printArea = document.getElementById('printReports');
    printArea.innerHTML = generateTeamReport();
    window.print();
}

function printAllKidReports() {
    const teamMembers = getTeamMembers();
    if (teamMembers.length === 0) {
        alert('Add team members first!');
        return;
    }

    const printArea = document.getElementById('printReports');
    let html = '<div style="page-break-after: avoid;">';
    html += generateTeamReport();
    html += '</div>';

    teamMembers.forEach(kid => {
        html += generateKidReport(kid);
    });

    printArea.innerHTML = html;
    window.print();
}

// ==================== UTILITY FUNCTIONS ====================

function loadDemoData() {
    if (!confirm('Load demo data? This will replace current data.')) return;

    const demoTeamMembers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const demoProducts = [
        { id: '1', name: 'Miniature Dragon', defaultPrice: 15 },
        { id: '2', name: 'Fidget Spinner', defaultPrice: 8 },
        { id: '3', name: 'Phone Stand', defaultPrice: 12 },
        { id: '4', name: 'Puzzle Box', defaultPrice: 20 },
        { id: '5', name: 'Tiny Plant Pot', defaultPrice: 10 }
    ];

    const demoSales = [
        { id: '1', productId: '1', qty: 8, unitPrice: 15, paymentMethod: 'Cash', timestamp: new Date().toISOString() },
        { id: '2', productId: '2', qty: 15, unitPrice: 8, paymentMethod: 'Card', timestamp: new Date().toISOString() },
        { id: '3', productId: '3', qty: 6, unitPrice: 12, paymentMethod: 'Cash', timestamp: new Date().toISOString() },
        { id: '4', productId: '4', qty: 4, unitPrice: 20, paymentMethod: 'Card', timestamp: new Date().toISOString() },
        { id: '5', productId: '5', qty: 10, unitPrice: 10, paymentMethod: 'Cash', timestamp: new Date().toISOString() },
        { id: '6', productId: '1', qty: 3, unitPrice: 15, paymentMethod: 'Card', timestamp: new Date().toISOString() },
        { id: '7', productId: '2', qty: 7, unitPrice: 8, paymentMethod: 'Cash', timestamp: new Date().toISOString() }
    ];

    localStorage.setItem('teamMembers', JSON.stringify(demoTeamMembers));
    localStorage.setItem('products', JSON.stringify(demoProducts));
    localStorage.setItem('sales', JSON.stringify(demoSales));
    localStorage.setItem('confettiTriggered', 'false');

    updateUI();
    alert('Demo data loaded! Check the dashboard to see results.');
}

function confirmReset() {
    if (!confirm('Reset ALL data? This cannot be undone!')) return;
    localStorage.clear();
    initializeApp();
    updateUI();
    alert('All data has been reset.');
}

// ==================== UI UPDATES ====================

function updateUI() {
    // Update all UI elements
    renderTeamList();
    renderProductList();
    renderCostsDisplay();
    updateProductsInSalesDropdown();
    renderQuickSaleButtons();
    updateQuickSaleTotals();
    renderSalesList();
    updateDashboard();
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    updateUI();

    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            e.target.classList.add('active');
        });
    });

    // Sales mode toggle
    document.querySelectorAll('.mode-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const mode = e.target.getAttribute('data-mode');
            switchSalesMode(mode);
        });
    });

    // Enter key listeners for form inputs
    document.getElementById('newTeamMember').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTeamMember();
    });

    document.getElementById('productName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addProduct();
    });

    // Close modal when clicking outside
    document.getElementById('paymentModal').addEventListener('click', (e) => {
        if (e.target.id === 'paymentModal') closePaymentModal();
    });

    // Auto-update when sales change
    setInterval(() => {
        updateQuickSaleTotals();
    }, 1000);
});

// For debugging (optional): window.debugData = () => console.log({ team: getTeamMembers(), products: getProducts(), sales: getSales(), costs: getCosts() });
