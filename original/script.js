document.getElementById('dataLink').addEventListener('click', function() {
    // Show data grid
    showGrid('.row');
    // showGrid('.data-grid');
    
    // Hide dance grid
    hideGrid('.dance-grid');
    // hideGrid('.data-grid');
});

document.getElementById('danceLink').addEventListener('click', function() {
    // Show dance grid
    showGrid('.dance-grid');
    
    // Hide data grid
    hideGrid('.row');
});

document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.querySelector('.cursor');
    const cursorTrail = document.querySelector('.cursor-trail');

    document.addEventListener('mousemove', function(e) {
        const { clientX, clientY } = e;

        cursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
        cursorTrail.style.transform = `translate(${clientX}px, ${clientY}px)`;
        cursorTrail.style.opacity = '1';

        // Hide the trail after a short delay
        setTimeout(() => {
            cursorTrail.style.opacity = '0';
        }, 200);
    });
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
