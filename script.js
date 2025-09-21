// Existing Purchase modal code
const purchaseBtn = document.getElementById('purchase-btn');
const paymentModal = document.getElementById('payment-modal');
const closeBtn = document.getElementById('close-btn');

// Function to show modal
function showModal() {
    paymentModal.style.display = "flex";
}

// Function to hide modal
function hideModal() {
    paymentModal.style.display = "none";
}

// Button click opens modal
purchaseBtn.addEventListener('click', showModal);

// Close button click hides modal
closeBtn.addEventListener('click', hideModal);

// Click outside modal hides modal
window.addEventListener('click', function(event) {
    if (event.target === paymentModal) {
        hideModal();
    }
});

// Auto-show modal from URL ?showModal=1
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('showModal') === '1') {
    showModal(); // Open modal automatically
}


// Tools toggle button
const toggleToolsBtn = document.getElementById('toggle-tools-btn');
const toolListGrid = document.querySelector('.tool-list-grid');

toggleToolsBtn.addEventListener('click', () => {
  if (toolListGrid.style.display === 'none') {
    toolListGrid.style.display = 'grid';
    toggleToolsBtn.textContent = '🛠️ Hide Tools';
    toggleToolsBtn.classList.add('active');
  } else {
    toolListGrid.style.display = 'none';
    toggleToolsBtn.textContent = '🛠️ Show Tools';
    toggleToolsBtn.classList.remove('active');
  }
});

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en', // Default page language
    includedLanguages: 'en,id', // Languages to show
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
}

