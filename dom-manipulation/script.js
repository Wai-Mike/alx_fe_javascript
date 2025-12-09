// Quote Generator Application
// Managing quotes array with text and category
let quotes = [];
let filteredQuotes = [];
let currentFilter = 'all';
let autoSyncInterval = null;
let isAutoSyncEnabled = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadQuotesFromStorage();
    populateCategories();
    restoreLastFilter();
    showRandomQuote();
    createAddQuoteForm(); // Ensure form is created
});

// Load quotes from local storage
function loadQuotesFromStorage() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Initialize with some default quotes
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Motivation" },
            { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
            { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" },
            { text: "It is during our darkest moments that we must focus to see the light.", category: "Motivation" }
        ];
        saveQuotes();
    }
    
    // Load last viewed quote from session storage
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastQuote) {
        const quote = JSON.parse(lastQuote);
        displayQuote(quote);
    }
    
    filteredQuotes = [...quotes];
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('lastFilter', currentFilter);
    localStorage.setItem('selectedCategory', currentFilter);
}

// Restore last selected filter
function restoreLastFilter() {
    const selectedCategory = localStorage.getItem('selectedCategory') || localStorage.getItem('lastFilter');
    if (selectedCategory) {
        currentFilter = selectedCategory;
        const filterSelect = document.getElementById('categoryFilter');
        if (filterSelect) {
            filterSelect.value = selectedCategory;
        }
        filterQuotes();
    }
}

// Display a quote in the DOM
function displayQuote(quote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (!quoteDisplay) return;
    
    const quoteText = quoteDisplay.querySelector('.quote-text') || document.createElement('p');
    const quoteCategory = quoteDisplay.querySelector('.quote-category') || document.createElement('p');
    
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${quote.text}"`;
    
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = `— ${quote.category}`;
    
    if (!quoteDisplay.querySelector('.quote-text')) {
        quoteDisplay.appendChild(quoteText);
        quoteDisplay.appendChild(quoteCategory);
    }
    
    // Save to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Show a random quote
function showRandomQuote() {
    if (filteredQuotes.length === 0) {
        const quoteDisplay = document.getElementById('quoteDisplay');
        if (quoteDisplay) {
            quoteDisplay.innerHTML = '<p class="quote-text">No quotes available in this category. Add some quotes!</p>';
        }
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    displayQuote(randomQuote);
}

// Create and manage the add quote form
function createAddQuoteForm() {
    // Form is already in HTML, but we can enhance it if needed
    const form = document.getElementById('addQuoteForm');
    if (form) {
        // Form is already created in HTML
        console.log('Add quote form is ready');
    }
}

// Add a new quote
function addQuote() {
    const quoteTextInput = document.getElementById('newQuoteText');
    const quoteCategoryInput = document.getElementById('newQuoteCategory');
    
    if (!quoteTextInput || !quoteCategoryInput) return;
    
    const quoteText = quoteTextInput.value.trim();
    const quoteCategory = quoteCategoryInput.value.trim();
    
    if (quoteText === '' || quoteCategory === '') {
        showNotification('Please fill in both quote text and category!', 'error');
        return;
    }
    
    const newQuote = {
        text: quoteText,
        category: quoteCategory
    };
    
    quotes.push(newQuote);
    saveQuotes();
    
    // Update filtered quotes if needed
    if (currentFilter === 'all' || currentFilter === quoteCategory) {
        filteredQuotes = currentFilter === 'all' ? [...quotes] : quotes.filter(q => q.category === currentFilter);
    }
    
    // Update categories dropdown
    populateCategories();
    
    // Clear form
    quoteTextInput.value = '';
    quoteCategoryInput.value = '';
    
    showNotification('Quote added successfully!', 'success');
    
    // If current filter matches, show the new quote
    if (currentFilter === 'all' || currentFilter === quoteCategory) {
        displayQuote(newQuote);
    }
}

// Populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Store current selection
    const currentValue = categoryFilter.value;
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selection
    if (currentValue) {
        categoryFilter.value = currentValue;
    }
}

// Filter quotes based on selected category
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    const selectedCategory = categoryFilter.value;
    currentFilter = selectedCategory;
    
    if (selectedCategory === 'all') {
        filteredQuotes = [...quotes];
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // Save the selected category to local storage
    localStorage.setItem('selectedCategory', selectedCategory);
    saveQuotes();
    
    // Show a random quote from filtered results
    if (filteredQuotes.length > 0) {
        showRandomQuote();
    } else {
        const quoteDisplay = document.getElementById('quoteDisplay');
        if (quoteDisplay) {
            quoteDisplay.innerHTML = '<p class="quote-text">No quotes found in this category.</p>';
        }
    }
}

// Export quotes to JSON file
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Quotes exported successfully!', 'success');
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid JSON format. Expected an array of quotes.');
            }
            
            // Validate imported quotes structure
            const validQuotes = importedQuotes.filter(quote => 
                quote && typeof quote.text === 'string' && typeof quote.category === 'string'
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file.');
            }
            
            // Add imported quotes
            quotes.push(...validQuotes);
            saveQuotes();
            
            // Update UI
            populateCategories();
            filterQuotes();
            
            showNotification(`${validQuotes.length} quote(s) imported successfully!`, 'success');
        } catch (error) {
            showNotification(`Import failed: ${error.message}`, 'error');
            console.error('Import error:', error);
        }
    };
    
    fileReader.onerror = function() {
        showNotification('Error reading file!', 'error');
    };
    
    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0]);
    }
}

// Simulate server interaction
async function fetchQuotesFromServer() {
    try {
        // Using JSONPlaceholder as a mock API
        // In a real scenario, this would be your actual API endpoint
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        const posts = await response.json();
        
        // Convert posts to quote format (simulation)
        const serverQuotes = posts.map(post => ({
            text: post.title,
            category: 'Server'
        }));
        
        return serverQuotes;
    } catch (error) {
        console.error('Error fetching from server:', error);
        // Return mock data if fetch fails
        return [
            { text: "Server quote 1: Persistence is key to success.", category: "Server" },
            { text: "Server quote 2: Adaptability leads to growth.", category: "Server" }
        ];
    }
}

// Sync with server
async function syncWithServer() {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        syncStatus.textContent = 'Syncing...';
        syncStatus.className = 'sync-status syncing';
    }
    
    try {
        const serverQuotes = await fetchQuotesFromServer();
        
        // Conflict resolution: Server data takes precedence for matching quotes
        // For new quotes from server, add them if they don't exist
        let conflictsResolved = 0;
        let newQuotesAdded = 0;
        
        serverQuotes.forEach(serverQuote => {
            const existingIndex = quotes.findIndex(q => 
                q.text === serverQuote.text && q.category === serverQuote.category
            );
            
            if (existingIndex !== -1) {
                // Conflict: Server version takes precedence
                quotes[existingIndex] = { ...serverQuote };
                conflictsResolved++;
            } else {
                // New quote from server
                quotes.push(serverQuote);
                newQuotesAdded++;
            }
        });
        
        saveQuotes();
        populateCategories();
        filterQuotes();
        
        if (syncStatus) {
            syncStatus.textContent = `Sync complete! ${newQuotesAdded} new, ${conflictsResolved} updated.`;
            syncStatus.className = 'sync-status success';
        }
        
        showNotification(
            `Sync completed: ${newQuotesAdded} new quote(s) added, ${conflictsResolved} conflict(s) resolved.`,
            'success'
        );
        
        // Reset status after 3 seconds
        setTimeout(() => {
            if (syncStatus) {
                syncStatus.textContent = '';
                syncStatus.className = 'sync-status';
            }
        }, 3000);
    } catch (error) {
        if (syncStatus) {
            syncStatus.textContent = 'Sync failed!';
            syncStatus.className = 'sync-status error';
        }
        showNotification('Sync failed. Please try again.', 'error');
        
        setTimeout(() => {
            if (syncStatus) {
                syncStatus.textContent = '';
                syncStatus.className = 'sync-status';
            }
        }, 3000);
    }
}

// Toggle auto-sync
function toggleAutoSync() {
    const autoSyncBtn = document.getElementById('autoSyncBtn');
    
    if (isAutoSyncEnabled) {
        clearInterval(autoSyncInterval);
        isAutoSyncEnabled = false;
        if (autoSyncBtn) {
            autoSyncBtn.textContent = 'Enable Auto Sync';
        }
        showNotification('Auto sync disabled', 'info');
    } else {
        // Sync every 30 seconds
        autoSyncInterval = setInterval(syncWithServer, 30000);
        isAutoSyncEnabled = true;
        if (autoSyncBtn) {
            autoSyncBtn.textContent = 'Disable Auto Sync';
        }
        showNotification('Auto sync enabled (every 30 seconds)', 'info');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    if (!notificationArea) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationArea.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

