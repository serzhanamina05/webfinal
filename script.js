
window.onload = function () {
   
    const stockData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: 'Stock Price',
        data: [120, 130, 125, 140, 150, 160, 155],
        fill: false,
        borderColor: '#4CAF50',
        tension: 0.1
      }]
    };
  
    const ctx = document.getElementById('stock-chart').getContext('2d');
    const stockChart = new Chart(ctx, {
      type: 'line',
      data: stockData,
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  
   
    const balance = 30000;  
    document.getElementById('balance').innerText = `$${balance.toLocaleString()}`;
  };