// ===== FIREBASE CONFIGURATION =====
// Your Firebase project config - configured for live sync!
const firebaseConfig = {
    apiKey: "AIzaSyBfUIQlBxfWq-YhvQJt6YIwKEyXG20K8Pg",
    authDomain: "d-printing-8c673.firebaseapp.com",
    databaseURL: "https://d-printing-8c673-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "d-printing-8c673",
    storageBucket: "d-printing-8c673.firebasestorage.app",
    messagingSenderId: "831638904366",
    appId: "1:831638904366:web:a8ecd84d6f9ad7bd7a09bf",
    measurementId: "G-5R6FPS4D9S"
};

// Try to initialize Firebase
let firebaseReady = false;
let realtimeDB = null;
let isOnline = false;

try {
    firebase.initializeApp(firebaseConfig);
    realtimeDB = firebase.database();
    firebaseReady = true;
    console.log('✅ Firebase initialized successfully - Live sync enabled!');
} catch (error) {
    console.log('Firebase initialization error (this is OK if using offline mode)');
}

// ===== STATE MANAGEMENT =====
const appState = {
    teamMembers: [],
    products: [],
    sales: [],
    costs: {
        stallFee: 175,
        insurance: 50,
        squareReader: 50
    },
    reportMeta: {
        eventName: "Glenferrie Festival",
        eventDate: new Date().toISOString().split('T')[0],
        notes: ""
    },
    currentSalesMode: 'quick',
    pendingProductId: null
};

// ===== INITIALIZATION =====
// Main initialization will happen at bottom of file

// ===== FIREBASE SETUP =====
function setupFirebaseListeners() {
    const db = realtimeDB;
    db.ref('teamMembers').on('value', (snapshot) => {
        appState.teamMembers = snapshot.val() || [];
        renderAll();
    });
    db.ref('products').on('value', (snapshot) => {
        appState.products = snapshot.val() || [];
        renderAll();
    });
    db.ref('sales').on('value', (snapshot) => {
        appState.sales = snapshot.val() || [];
        renderAll();
    });
    db.ref('costs').on('value', (snapshot) => {
        appState.costs = snapshot.val() || appState.costs;
        renderAll();
    });
    db.ref('reportMeta').on('value', (snapshot) => {
        appState.reportMeta = snapshot.val() || appState.reportMeta;
        renderAll();
    });
}

function checkOnlineStatus() {
    const isOnlineNow = navigator.onLine;
    updateSyncStatus(isOnlineNow && firebaseReady);
    
    if (!firebaseReady) return;
    const connectedRef = realtimeDB.ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
        isOnline = snapshot.val() === true;
        updateSyncStatus(isOnline);
    });
}

function updateSyncStatus(online) {
    const indicator = document.getElementById('syncStatus');
    const text = document.getElementById('syncText');
    if (indicator && text) {
        if (online) {
            indicator.classList.remove('offline');
            indicator.style.background = '#4caf50';
            text.textContent = 'Live Sync ✓';
        } else {
            indicator.classList.add('offline');
            indicator.style.background = '#ff9800';
            text.textContent = 'Offline Mode';
        }
    }
}

// ===== DATA PERSISTENCE =====
function saveToStorage() {
    localStorage.setItem('stallAppState', JSON.stringify(appState));
}

function loadFromStorage() {
    const stored = localStorage.getItem('stallAppState');
    if (stored) {
        const loaded = JSON.parse(stored);
        appState.teamMembers = loaded.teamMembers || [];
        appState.products = loaded.products || [];
        appState.sales = loaded.sales || [];
        appState.costs = loaded.costs || appState.costs;
        appState.reportMeta = loaded.reportMeta || appState.reportMeta;
    }
}

function saveToFirebase() {
    if (!firebaseReady) {
        saveToStorage();
        return;
    }
    const db = realtimeDB;
    db.ref('teamMembers').set(appState.teamMembers).catch(err => {
        console.error('Error saving:', err);
        saveToStorage();
    });
    db.ref('products').set(appState.products).catch(err => saveToStorage());
    db.ref('sales').set(appState.sales).catch(err => saveToStorage());
    db.ref('costs').set(appState.costs).catch(err => saveToStorage());
    db.ref('reportMeta').set(appState.reportMeta).catch(err => saveToStorage());
}

// ===== UI SETUP =====

// ===== TEAM MANAGEMENT =====
function addTeamMember() {
    const input = document.getElementById('newMemberName');
    const name = input.value.trim();
    if (!name) {
        alert('Please enter a team member name');
        return;
    }
    if (appState.teamMembers.includes(name)) {
        alert('This member already exists');
        return;
    }
    appState.teamMembers.push(name);
    input.value = '';
    saveToFirebase();
    renderTeamList();
}

function removeTeamMember(name) {
    appState.teamMembers = appState.teamMembers.filter(m => m !== name);
    saveToFirebase();
    renderTeamList();
}

function renderTeamList() {
    const list = document.getElementById('teamList');
    const count = document.getElementById('teamCount');
    list.innerHTML = '';
    appState.teamMembers.forEach(member => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${member}</span>
            <div class="item-actions">
                <button class="btn-delete" onclick="removeTeamMember('${member}')">Remove</button>
            </div>
        `;
        list.appendChild(li);
    });
    count.textContent = `Total: ${appState.teamMembers.length} kids`;
}

// ===== COSTS MANAGEMENT =====
function saveCosts() {
    appState.costs.stallFee = parseFloat(document.getElementById('stallFee').value) || 0;
    appState.costs.insurance = parseFloat(document.getElementById('insurance').value) || 0;
    appState.costs.squareReader = parseFloat(document.getElementById('squareReader').value) || 0;
    saveToFirebase();
    renderTotalCosts();
    renderAll();
}

function renderTotalCosts() {
    const total = appState.costs.stallFee + appState.costs.insurance + appState.costs.squareReader;
    document.getElementById('totalCosts').textContent = `Total Shared Costs: $${total.toFixed(2)}`;
}

function renderCostInputs() {
    document.getElementById('stallFee').value = appState.costs.stallFee;
    document.getElementById('insurance').value = appState.costs.insurance;
    document.getElementById('squareReader').value = appState.costs.squareReader;
    renderTotalCosts();
}

// ===== PRODUCTS MANAGEMENT =====
function addProduct() {
    const nameInput = document.getElementById('newProductName');
    const priceInput = document.getElementById('newProductPrice');
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    if (!name) {
        alert('Please enter a product name');
        return;
    }
    if (appState.products.some(p => p.name === name)) {
        alert('This product already exists');
        return;
    }
    const product = {
        id: Date.now().toString(),
        name: name,
        defaultPrice: price
    };
    appState.products.push(product);
    nameInput.value = '';
    priceInput.value = '';
    saveToFirebase();
    renderProductList();
    renderProductButtons();
    renderSaleProductDropdown();
}

function deleteProduct(productId) {
    appState.products = appState.products.filter(p => p.id !== productId);
    saveToFirebase();
    renderProductList();
    renderProductButtons();
    renderSaleProductDropdown();
}

function renderProductList() {
    const list = document.getElementById('productList');
    list.innerHTML = '';
    if (appState.products.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #999;">No products added yet</li>';
        return;
    }
    appState.products.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>
                <strong>${product.name}</strong>
                <br>
                <small>Default price: $${product.defaultPrice.toFixed(2)}</small>
            </span>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function renderProductButtons() {
    const grid = document.getElementById('productButtons');
    grid.innerHTML = '';
    if (appState.products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No products yet. Add some in the Products tab!</p>';
        return;
    }
    appState.products.forEach(product => {
        const btn = document.createElement('button');
        btn.className = 'product-btn';
        btn.innerHTML = `
            <span class="product-btn-name">${product.name}</span>
            <span class="product-btn-price">$${product.defaultPrice.toFixed(2)}</span>
        `;
        btn.onclick = () => selectProductForQuickSale(product.id);
        grid.appendChild(btn);
    });
}

function renderSaleProductDropdown() {
    const select = document.getElementById('saleProduct');
    select.innerHTML = '';
    appState.products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        select.appendChild(option);
    });
    updateProductPrice();
}

function updateProductPrice() {
    const productId = document.getElementById('saleProduct').value;
    const product = appState.products.find(p => p.id === productId);
    if (product) {
        document.getElementById('salePrice').value = product.defaultPrice.toFixed(2);
    }
}

// ===== SALES MANAGEMENT =====
function setSalesMode(mode) {
    appState.currentSalesMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.getElementById('quickSaleMode').style.display = mode === 'quick' ? 'block' : 'none';
    document.getElementById('detailedMode').style.display = mode === 'detailed' ? 'block' : 'none';
}

function selectProductForQuickSale(productId) {
    appState.pendingProductId = productId;
    document.getElementById('paymentModal').style.display = 'flex';
}

function recordQuickSale(paymentMethod) {
    const productId = appState.pendingProductId;
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    addSale(productId, 1, product.defaultPrice, paymentMethod);
    closePaymentModal();
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    appState.pendingProductId = null;
}

function addDetailedSale() {
    const productId = document.getElementById('saleProduct').value;
    const qty = parseInt(document.getElementById('saleQty').value) || 1;
    const price = parseFloat(document.getElementById('salePrice').value) || 0;
    const paymentMethod = document.getElementById('salePayment').value;
    if (qty < 1) {
        alert('Quantity must be at least 1');
        return;
    }
    addSale(productId, qty, price, paymentMethod);
    document.getElementById('saleQty').value = '1';
    updateProductPrice();
}

function addSale(productId, qty, unitPrice, paymentMethod) {
    const sale = {
        id: Date.now().toString(),
        productId: productId,
        qty: qty,
        unitPrice: unitPrice,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString()
    };
    appState.sales.push(sale);
    saveToFirebase();
    renderSales();
    checkBreakEven();
}

function deleteSale(saleId) {
    appState.sales = appState.sales.filter(s => s.id !== saleId);
    saveToFirebase();
    renderSales();
}

function undoLastSale() {
    if (appState.sales.length === 0) {
        alert('No sales to undo');
        return;
    }
    appState.sales.pop();
    saveToFirebase();
    renderSales();
}

function adjustQuantity(amount) {
    if (appState.sales.length === 0) {
        alert('No sales to adjust');
        return;
    }
    const lastSale = appState.sales[appState.sales.length - 1];
    lastSale.qty += amount;
    if (lastSale.qty < 1) {
        appState.sales.pop();
    }
    saveToFirebase();
    renderSales();
}

function renderSales() {
    const list = document.getElementById('salesList');
    list.innerHTML = '';
    if (appState.sales.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #999;">No sales yet</li>';
    } else {
        appState.sales.forEach(sale => {
            const product = appState.products.find(p => p.id === sale.productId);
            const productName = product ? product.name : 'Unknown';
            const total = sale.qty * sale.unitPrice;
            const li = document.createElement('li');
            li.className = 'sale-item';
            li.innerHTML = `
                <div class="sale-info">
                    <span class="sale-product">${productName}</span>
                    <span class="sale-details">${sale.qty} × $${sale.unitPrice.toFixed(2)} = $${total.toFixed(2)}</span>
                    <span class="sale-details">${sale.paymentMethod === 'cash' ? '💵 Cash' : '💳 Card'}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-delete" onclick="deleteSale('${sale.id}')">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });
    }
    updateSalesSummary();
}

function updateSalesSummary() {
    const totalRevenue = appState.sales.reduce((sum, sale) => sum + (sale.qty * sale.unitPrice), 0);
    const cashTotal = appState.sales
        .filter(sale => sale.paymentMethod === 'cash')
        .reduce((sum, sale) => sum + (sale.qty * sale.unitPrice), 0);
    const cardTotal = appState.sales
        .filter(sale => sale.paymentMethod === 'card')
        .reduce((sum, sale) => sum + (sale.qty * sale.unitPrice), 0);
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('cashTotal').textContent = `$${cashTotal.toFixed(2)}`;
    document.getElementById('cardTotal').textContent = `$${cardTotal.toFixed(2)}`;
}

// ===== CALCULATIONS =====
function calculateTotalRevenue() {
    return appState.sales.reduce((sum, sale) => sum + (sale.qty * sale.unitPrice), 0);
}

function calculateTotalCosts() {
    return appState.costs.stallFee + appState.costs.insurance + appState.costs.squareReader;
}

function calculateNetProfit() {
    return calculateTotalRevenue() - calculateTotalCosts();
}

function calculatePerKidPayout() {
    if (appState.teamMembers.length === 0) return 0;
    return calculateNetProfit() / appState.teamMembers.length;
}

// ===== DASHBOARD =====
function renderDashboard() {
    const revenue = calculateTotalRevenue();
    const costs = calculateTotalCosts();
    const profit = calculateNetProfit();
    const perKidPayout = calculatePerKidPayout();

    document.getElementById('dashRevenue').textContent = `$${revenue.toFixed(2)}`;
    document.getElementById('dashCosts').textContent = `$${costs.toFixed(2)}`;
    document.getElementById('dashProfit').textContent = `$${profit.toFixed(2)}`;

    const breakevenPercent = costs > 0 ? (revenue / costs) * 100 : 0;
    document.getElementById('breakevenFill').style.width = Math.min(breakevenPercent, 100) + '%';
    document.getElementById('breakevenText').textContent = `$${revenue.toFixed(2)} / $${costs.toFixed(2)} (${Math.min(Math.round(breakevenPercent), 100)}%)`;

    document.getElementById('profitPotAmount').textContent = `$${profit.toFixed(2)}`;
    const perKidText = profit < 0 ? `Loss per kid: $${Math.abs(perKidPayout).toFixed(2)}` : `Each kid gets: $${perKidPayout.toFixed(2)}`;
    document.getElementById('perKidAmount').innerHTML = perKidText;

    renderProductChart();
    checkBreakEven();
}

function checkBreakEven() {
    const profit = calculateNetProfit();
    const hadShown = sessionStorage.getItem('confettiShown');
    if (profit > 0 && !hadShown) {
        triggerConfetti();
        sessionStorage.setItem('confettiShown', 'true');
    }
}

function renderProductChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const chartHeight = canvas.height;
    const chartWidth = canvas.width;

    const productSales = appState.products.map(product => {
        const units = appState.sales
            .filter(sale => sale.productId === product.id)
            .reduce((sum, sale) => sum + sale.qty, 0);
        return { product, units };
    });

    const maxUnits = Math.max(...productSales.map(ps => ps.units), 1);
    ctx.clearRect(0, 0, chartWidth, chartHeight);

    const barWidth = chartWidth / (productSales.length * 1.5);
    const padding = 40;

    productSales.forEach((ps, index) => {
        const x = padding + index * (barWidth * 1.5);
        const barHeight = (ps.units / maxUnits) * (chartHeight - 80);
        const y = chartHeight - 40 - barHeight;
        ctx.fillStyle = `hsl(${index * 60}, 70%, 60%)`;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(ps.product.name, x + barWidth / 2, chartHeight - 10);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(ps.units, x + barWidth / 2, y - 10);
    });

    const topSeller = productSales.reduce((max, ps) => ps.units > max.units ? ps : max, { units: 0 });
    const badge = document.getElementById('topSellerBadge');
    if (topSeller.units > 0) {
        badge.textContent = `⭐ Top Seller: ${topSeller.product.name} (${topSeller.units} units)`;
    } else {
        badge.textContent = '';
    }
}

// ===== CONFETTI =====
function triggerConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    for (let i = 0; i < 50; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 4 + 2,
            life: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = pieces.length - 1; i >= 0; i--) {
            const p = pieces[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.01;
            p.vy += 0.1;
            if (p.life <= 0) {
                pieces.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = p.life;
            ctx.fillStyle = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#95e1d3'][i % 5];
            ctx.fillRect(p.x, p.y, 10, 10);
        }
        ctx.globalAlpha = 1;
        if (pieces.length > 0) {
            requestAnimationFrame(animate);
        }
    }
    animate();
}

// ===== REPORTS =====
function printTeamReport() {
    renderReportContent();
    window.print();
}

function printAllKidReports() {
    renderReportContent();
    window.print();
}

function renderReportContent() {
    const revenue = calculateTotalRevenue();
    const costs = calculateTotalCosts();
    const profit = calculateNetProfit();

    document.getElementById('reportEventDate').value = appState.reportMeta.eventDate;
    document.getElementById('reportRevenue').textContent = `$${revenue.toFixed(2)}`;
    document.getElementById('reportStallFee').textContent = `$${appState.costs.stallFee.toFixed(2)}`;
    document.getElementById('reportInsurance').textContent = `$${appState.costs.insurance.toFixed(2)}`;
    document.getElementById('reportSquareReader').textContent = `$${appState.costs.squareReader.toFixed(2)}`;
    document.getElementById('reportTotalCosts').textContent = `$${costs.toFixed(2)}`;
    document.getElementById('reportNetProfit').textContent = `$${profit.toFixed(2)}`;
    document.getElementById('reportNotes').value = appState.reportMeta.notes;

    const teamList = document.getElementById('reportTeamList');
    teamList.innerHTML = '';
    appState.teamMembers.forEach(member => {
        const li = document.createElement('li');
        li.textContent = member;
        teamList.appendChild(li);
    });

    const productTable = document.getElementById('reportProductTable');
    productTable.innerHTML = '';
    appState.products.forEach(product => {
        const sales = appState.sales.filter(s => s.productId === product.id);
        const units = sales.reduce((sum, s) => sum + s.qty, 0);
        const prodRevenue = sales.reduce((sum, s) => sum + (s.qty * s.unitPrice), 0);
        const avgPrice = units > 0 ? prodRevenue / units : 0;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${units}</td>
            <td>$${avgPrice.toFixed(2)}</td>
            <td>$${prodRevenue.toFixed(2)}</td>
        `;
        productTable.appendChild(row);
    });

    const productSales = appState.products.map(product => {
        const units = appState.sales
            .filter(sale => sale.productId === product.id)
            .reduce((sum, sale) => sum + sale.qty, 0);
        return { product, units };
    });
    const topSeller = productSales.reduce((max, ps) => ps.units > max.units ? ps : max, { units: 0 });
    const topSellerText = topSeller.units > 0 ? `⭐ Best Seller: ${topSeller.product.name} with ${topSeller.units} units sold` : '';
    document.getElementById('reportTopSeller').textContent = topSellerText;

    const kidContainer = document.getElementById('kidReportsContainer');
    kidContainer.innerHTML = '';
    appState.teamMembers.forEach(memberName => {
        const perKidPayout = calculatePerKidPayout();
        const div = document.createElement('div');
        div.className = 'kid-report-page';
        div.innerHTML = `
            <h1>${memberName}'s Earnings Report</h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">Glenferrie Festival</p>
            <h2>Financials</h2>
            <table class="report-table" style="margin-bottom: 2rem;">
                <tr>
                    <td>Team Total Revenue</td>
                    <td>$${revenue.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Shared Costs</td>
                    <td>$${costs.toFixed(2)}</td>
                </tr>
                <tr style="background: #e8f5e9; font-weight: bold;">
                    <td>Net Profit / Loss</td>
                    <td>$${profit.toFixed(2)}</td>
                </tr>
            </table>
            <div class="kid-report-message" style="font-size: 1.8rem; padding: 2rem; background: #fff3e0; border-radius: 10px; margin-bottom: 2rem;">
                ${profit < 0 ? `Loss per kid: $${Math.abs(perKidPayout).toFixed(2)}` : `You earned: $${perKidPayout.toFixed(2)}`}
            </div>
            <p style="font-size: 1.2rem; text-align: center; margin-top: 2rem; color: #4caf50; font-weight: bold;">
                🎉 Great work at the market! 🎉
            </p>
        `;
        kidContainer.appendChild(div);
    });
    document.getElementById('printContent').style.display = 'block';
}

// ===== UTILITIES =====
function loadDemoData() {
    if (!confirm('Load demo data? This will replace current data.')) return;

    appState.teamMembers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    appState.products = [
        { id: 'prod1', name: 'Miniature Dragon', defaultPrice: 15 },
        { id: 'prod2', name: 'Fidget Spinner', defaultPrice: 8 },
        { id: 'prod3', name: 'Phone Stand', defaultPrice: 12 },
        { id: 'prod4', name: 'Puzzle Box', defaultPrice: 20 },
        { id: 'prod5', name: 'Tiny Plant Pot', defaultPrice: 10 }
    ];
    appState.sales = [
        { id: 's1', productId: 'prod1', qty: 8, unitPrice: 15, paymentMethod: 'Cash', timestamp: new Date().toISOString() },
        { id: 's2', productId: 'prod2', qty: 15, unitPrice: 8, paymentMethod: 'Card', timestamp: new Date().toISOString() },
        { id: 's3', productId: 'prod3', qty: 6, unitPrice: 12, paymentMethod: 'Cash', timestamp: new Date().toISOString() },
        { id: 's4', productId: 'prod4', qty: 4, unitPrice: 20, paymentMethod: 'Card', timestamp: new Date().toISOString() },
        { id: 's5', productId: 'prod5', qty: 10, unitPrice: 10, paymentMethod: 'Cash', timestamp: new Date().toISOString() },
        { id: 's6', productId: 'prod1', qty: 3, unitPrice: 15, paymentMethod: 'Card', timestamp: new Date().toISOString() },
        { id: 's7', productId: 'prod2', qty: 7, unitPrice: 8, paymentMethod: 'Cash', timestamp: new Date().toISOString() }
    ];
    appState.costs = { stallFee: 50, insurance: 25, squareReader: 10 };
    appState.reportMeta = { eventDate: new Date().toISOString().split('T')[0], notes: '' };

    saveToFirebase();
    renderAll();
    alert('Demo data loaded! Check the dashboard to see results.');
}

function resetAllData() {
    if (!confirm('Delete ALL data? This cannot be undone!')) return;
    if (!confirm('Are you absolutely sure? This will permanently erase everything!')) return;

    appState.teamMembers = [];
    appState.products = [];
    appState.sales = [];
    appState.costs = { stallFee: 0, insurance: 0, squareReader: 0 };
    appState.reportMeta = { eventDate: '', notes: '' };

    saveToFirebase();
    localStorage.clear();
    renderAll();
    alert('All data has been reset.');
}

function renderAll() {
    renderTeamList();
    renderProductList();
    renderProductButtons();
    renderCostInputs();
    renderTotalCosts();
    renderSaleProductDropdown();
    renderSales();
    renderDashboard();
}

// ===== UI LISTENERS & INITIALIZATION =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    if (tabName === 'dashboard') {
        setTimeout(renderDashboard, 100);
    }
}

function setupUIListeners() {
    // Team section
    const addTeamBtn = document.getElementById('addTeamBtn');
    if (addTeamBtn) {
        addTeamBtn.addEventListener('click', addTeamMember);
        document.getElementById('newMemberName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTeamMember();
        });
    }

    // Products section
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addProduct);
        document.getElementById('productName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addProduct();
        });
        document.getElementById('productPrice').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addProduct();
        });
    }

    // Costs section
    const updateCostsBtn = document.getElementById('updateCostsBtn');
    if (updateCostsBtn) {
        updateCostsBtn.addEventListener('click', saveCosts);
    }

    // Sales mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.getAttribute('data-mode');
            setSalesMode(mode);
        });
    });

    // Sales detailed section
    const addDetailedSaleBtn = document.getElementById('addDetailedSaleBtn');
    if (addDetailedSaleBtn) {
        addDetailedSaleBtn.addEventListener('click', addDetailedSale);
    }

    // Quick sale buttons - re-attach on render
    attachProductButtonListeners();

    // Payment modal
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target.id === 'paymentModal') closePaymentModal();
        });
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const method = e.target.getAttribute('data-method');
                recordQuickSale(method);
            });
        });
    }

    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Reports
    const printTeamReportBtn = document.getElementById('printTeamReportBtn');
    if (printTeamReportBtn) {
        printTeamReportBtn.addEventListener('click', printTeamReport);
    }

    const printAllKidReportsBtn = document.getElementById('printAllKidReportsBtn');
    if (printAllKidReportsBtn) {
        printAllKidReportsBtn.addEventListener('click', printAllKidReports);
    }

    // Utilities
    const loadDemoBtn = document.getElementById('loadDemoBtn');
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', loadDemoData);
    }

    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', resetAllData);
    }
}

function attachProductButtonListeners() {
    document.querySelectorAll('.product-btn').forEach(btn => {
        btn.removeEventListener('click', handleProductBtnClick);
        btn.addEventListener('click', handleProductBtnClick);
    });
}

function handleProductBtnClick(e) {
    const productId = e.target.getAttribute('data-product-id');
    selectProductForQuickSale(productId);
}

// Reinitialize the main DOMContentLoaded is already set up above, so we just need to complete it
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    loadFromStorage();
    setupFirebaseListeners();
    setupUIListeners();
    checkOnlineStatus();
    
    window.addEventListener('online', () => {
        updateSyncStatus();
        saveToFirebase();
    });
    
    window.addEventListener('offline', updateSyncStatus);
    
    renderAll();
}
