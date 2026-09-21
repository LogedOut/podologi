// Image modal functionality
const modal = document.createElement('div');
modal.id = 'imageModal';
modal.className = 'modal';
modal.innerHTML = `
    <span class="close-modal">&times;</span>
    <img class="modal-content" id="modalImage">
`;
document.body.appendChild(modal);

const modalImg = document.getElementById('modalImage');
const closeBtn = document.getElementsByClassName('close-modal')[0];

// Get all portfolio images
const portfolioImages = document.getElementsByClassName('portfolio-image');

// Add click event to all portfolio images
Array.from(portfolioImages).forEach(img => {
    img.onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src;
    }
});

// Close modal when clicking the × button
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// Close modal when clicking outside the image
modal.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

// Add styles
const styles = document.createElement('style');
styles.textContent = `
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    padding-top: 50px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
}
.modal-content {
    margin: auto;
    display: block;
    max-width: 90%;
    max-height: 90vh;
}
.close-modal {
    position: absolute;
    right: 35px;
    top: 15px;
    color: #f1f1f1;
    font-size: 40px;
    font-weight: bold;
    cursor: pointer;
}
.portfolio-image {
    cursor: pointer;
    transition: opacity 0.3s;
}
.portfolio-image:hover {
    opacity: 0.8;
}
`;
document.head.appendChild(styles);
