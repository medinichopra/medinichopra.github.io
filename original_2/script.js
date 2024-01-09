document.getElementById('dataLink').addEventListener('click', function() {
    // Show data grid
    showGrid('.data-grid');
    
    // Hide dance grid
    hideGrid('.dance-grid');
});

document.getElementById('danceLink').addEventListener('click', function() {
    // Show dance grid
    showGrid('.dance-grid');
    
    // Hide data grid
    hideGrid('.data-grid');
});

// Function to show a grid
function showGrid(selector) {
    var element = document.querySelector(selector);
    element.classList.add('show');
}

// Function to hide a grid
function hideGrid(selector) {
    var element = document.querySelector(selector);
    element.classList.remove('show');
}
