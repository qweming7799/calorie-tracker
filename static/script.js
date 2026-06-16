// 全局变量
let dailyChart = null;
let mealChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // 加载数据
    loadStats();
    loadRecentRecords();
    
    // 表单提交事件
    document.getElementById('calorieForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addRecord();
    });
    
    // 导航菜单点击事件
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // 汉堡菜单
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    // 点击导航链接后关闭菜单
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
});

// 页面导航函数
function navigateTo(page) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // 显示目标页面
    document.getElementById(`page-${page}`).classList.add('active');
    
    // 更新导航栏激活状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 如果切换到统计页面，加载图表
    if (page === 'stats') {
        setTimeout(() => {
            loadCharts();
        }, 100);
    }
    
    // 如果切换到历史页面，加载记录
    if (page === 'history') {
        loadRecords();
    }
}

// 添加记录
async function addRecord() {
    const date = document.getElementById('date').value;
    const meal = document.getElementById('meal').value;
    const calories = document.getElementById('calories').value;
    
    if (!date || !meal || !calories) {
        showMessage('请填写完整信息', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, meal, calories })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('✅ 记录添加成功！', 'success');
            document.getElementById('calories').value = '';
            
            // 延迟跳转，让用户看到成功消息
            setTimeout(() => {
                navigateTo('home');
                loadStats();
                loadRecentRecords();
            }, 1500);
        } else {
            showMessage('❌ ' + result.message, 'error');
        }
    } catch (error) {
        showMessage('❌ 添加失败：' + error.message, 'error');
    }
}

// 加载最近记录（首页）
async function loadRecentRecords() {
    try {
        const response = await fetch('/api/records?limit=3');
        const data = await response.json();
        
        if (data.success) {
            displayRecentRecords(data.summary.slice(0, 3));
        }
    } catch (error) {
        console.error('加载最近记录失败：', error);
    }
}

// 显示最近记录
function displayRecentRecords(summary) {
    const container = document.getElementById('recentRecordsList');
    
    if (!summary || summary.length === 0) {
        container.innerHTML = '<div class="no-records">暂无记录，快去添加第一条记录吧！</div>';
        return;
    }
    
    let html = '';
    summary.forEach(day => {
        html += `
            <div class="day-summary">
                <div class="day-header">
                    <span class="day-date"><i class="fas fa-calendar"></i> ${day.date}</span>
                    <span class="day-total">${day.total_calories.toFixed(0)} kcal</span>
                </div>
        `;
        
        day.meals.slice(0, 2).forEach(meal => {
            html += `
                <div class="meal-item">
                    <div class="meal-info">
                        <span class="meal-type">${meal.meal}</span>
                        <span class="meal-calories">${meal.calories.toFixed(0)} kcal</span>
                    </div>
                </div>
            `;
        });
        
        if (day.meals.length > 2) {
            html += `<p style="text-align: center; color: var(--text-secondary); margin-top: 0.5rem;">还有 ${day.meals.length - 2} 条记录...</p>`;
        }
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// 加载历史记录
async function loadRecords() {
    const filterDate = document.getElementById('filterDate').value;
    let url = '/api/records';
    if (filterDate) {
        url += '?date=' + filterDate;
    }
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayRecords(data.summary);
        } else {
            showMessage('❌ 加载失败：' + data.message, 'error');
        }
    } catch (error) {
        showMessage('❌ 加载失败：' + error.message, 'error');
    }
}

// 显示历史记录
function displayRecords(summary) {
    const container = document.getElementById('recordsList');
    
    if (!summary || summary.length === 0) {
        container.innerHTML = '<div class="no-records"><i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i><br>暂无记录，请添加第一条记录吧！</div>';
        return;
    }
    
    let html = '';
    summary.forEach(day => {
        html += `
            <div class="day-summary">
                <div class="day-header">
                    <span class="day-date"><i class="fas fa-calendar-day"></i> ${day.date}</span>
                    <span class="day-total"><i class="fas fa-fire"></i> ${day.total_calories.toFixed(0)} kcal</span>
                </div>
        `;
        
        day.meals.forEach(meal => {
            html += `
                <div class="meal-item">
                    <div class="meal-info">
                        <span class="meal-type">${meal.meal}</span>
                        <span class="meal-calories">${meal.calories.toFixed(0)} kcal</span>
                    </div>
                    <button class="btn btn-danger" onclick="deleteRecord(${meal.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// 删除记录
async function deleteRecord(recordId) {
    if (!confirm('确定要删除这条记录吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/delete/${recordId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('✅ 删除成功', 'success');
            loadRecords();
            loadStats();
            loadRecentRecords();
        } else {
            showMessage('❌ ' + result.message, 'error');
        }
    } catch (error) {
        showMessage('❌ 删除失败：' + error.message, 'error');
    }
}

// 加载统计数据
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            document.getElementById('totalRecords').textContent = stats.total_records;
            document.getElementById('avgCalories').textContent = stats.avg_daily_calories.toFixed(0);
            document.getElementById('maxCalories').textContent = stats.max_daily_calories.toFixed(0);
            document.getElementById('totalDays').textContent = stats.total_days;
            
            // 更新统计页面的数据
            document.getElementById('statTotalRecords').textContent = stats.total_records;
            document.getElementById('statTotalDays').textContent = stats.total_days;
            document.getElementById('statAvgCalories').textContent = stats.avg_daily_calories.toFixed(0);
            document.getElementById('statMaxCalories').textContent = stats.max_daily_calories.toFixed(0);
            document.getElementById('statMinCalories').textContent = stats.min_daily_calories ? stats.min_daily_calories.toFixed(0) : '0';
        }
    } catch (error) {
        console.error('加载统计失败：', error);
    }
}

// 加载图表
async function loadCharts() {
    try {
        const response = await fetch('/api/records');
        const data = await response.json();
        
        if (data.success) {
            createDailyChart(data.summary);
            createMealChart(data.records);
        }
    } catch (error) {
        console.error('加载图表数据失败：', error);
    }
}

// 创建每日趋势图
function createDailyChart(summary) {
    const ctx = document.getElementById('dailyChart');
    
    if (!ctx) return;
    
    // 销毁旧图表
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    // 取最近7天的数据
    const recentData = summary.slice(0, 7).reverse();
    const labels = recentData.map(item => item.date.substring(5)); // 只显示月-日
    const calories = recentData.map(item => item.total_calories);
    
    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '每日卡路里摄入',
                data: calories,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 创建餐次分布图
function createMealChart(records) {
    const ctx = document.getElementById('mealChart');
    
    if (!ctx) return;
    
    // 销毁旧图表
    if (mealChart) {
        mealChart.destroy();
    }
    
    // 统计各餐次的总卡路里
    const mealStats = {};
    records.forEach(record => {
        if (!mealStats[record.meal]) {
            mealStats[record.meal] = 0;
        }
        mealStats[record.meal] += record.calories;
    });
    
    const labels = Object.keys(mealStats);
    const data = Object.values(mealStats);
    const colors = [
        '#667eea',
        '#f093fb',
        '#4ade80',
        '#fbbf24',
        '#f87171'
    ];
    
    mealChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// 清除筛选
function clearFilter() {
    document.getElementById('filterDate').value = '';
    loadRecords();
}

// 显示消息
function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = message;
    
    container.appendChild(msgDiv);
    
    setTimeout(() => {
        msgDiv.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            msgDiv.remove();
        }, 300);
    }, 3000);
}
