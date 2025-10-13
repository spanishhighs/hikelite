// HikeLite - Ultralight Gear Management System
class HikeLite {
    constructor() {
        this.inventory = [];
        this.packingList = [];
        this.categories = []; // Store available categories separately
        this.currentTab = 'inventory';
        this.weightUnit = 'g'; // Default to grams
        this.darkMode = false;
        this.mobileMenuOpen = false;
        this.packingMenuOpen = false;
        
        // Weight conversion factors (to grams)
        this.weightConversions = {
            'g': 1,
            'oz': 28.3495,
            'lb': 453.592
        };
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.renderInventory();
        this.renderPackingList();
        this.renderStatistics();
        this.populateCategoryFilters();
        this.updateWeightDisplay();
        // Initialize dark mode after DOM is ready
        setTimeout(() => {
            this.initializeDarkMode();
        }, 100);
        // Check if PDF library is loaded
        setTimeout(() => {
            this.checkPdfLibrary();
        }, 1000);
    }

    async loadData() {
        try {
            // Try to load from existing JSON files first
            const inventoryResponse = await fetch('inventory.json');
            if (inventoryResponse.ok) {
                this.inventory = await inventoryResponse.json();
            }
            
            const packingResponse = await fetch('packing-list.json');
            if (packingResponse.ok) {
                this.packingList = await packingResponse.json();
            }
            
            console.log('Data loaded successfully:', {
                inventory: this.inventory.length,
                packingList: this.packingList.length
            });
        } catch (error) {
            console.log('No existing JSON files found, starting with empty data');
            this.inventory = [];
            this.packingList = [];
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                
                // Special handling for packing list button
                if (tab === 'packing') {
                    // If already on packing tab, toggle the menu instead of switching tabs
                    if (this.currentTab === 'packing') {
                        e.preventDefault();
                        this.togglePackingMenu();
                        return;
                    }
                }
                
                this.switchTab(tab);
            });
        });

        // Weight unit selector
        const weightUnitSelect = document.getElementById('weightUnit');
        if (weightUnitSelect) {
            weightUnitSelect.addEventListener('change', (e) => {
                this.weightUnit = e.target.value;
                this.updateWeightDisplay();
                this.renderInventory();
                this.renderPackingList();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterInventory(e.target.value);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }

        // Import/Export buttons
        this.setupImportExportListeners();

        // Add item modal
        this.setupModalListeners();

        // Inventory controls
        this.setupInventoryListeners();

        // Packing list controls
        this.setupPackingListListeners();

        // Category management
        this.setupCategoryManagementListeners();

        // Mobile menu and dark mode
        this.setupMobileAndThemeListeners();

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
    }

    setupImportExportListeners() {
        // Inventory import/export
        const importInventoryBtn = document.getElementById('importInventoryBtn');
        const exportInventoryBtn = document.getElementById('exportInventoryBtn');
        const importCsvBtn = document.getElementById('importCsvBtn');
        const importInventoryInput = document.getElementById('importInventoryInput');
        const importCsvInput = document.getElementById('importCsvInput');

        if (importInventoryBtn) {
            importInventoryBtn.addEventListener('click', () => {
                importInventoryInput.click();
            });
        }

        if (exportInventoryBtn) {
            exportInventoryBtn.addEventListener('click', () => {
                this.exportInventory();
            });
        }

        if (importCsvBtn) {
            importCsvBtn.addEventListener('click', () => {
                importCsvInput.click();
            });
        }

        if (importInventoryInput) {
            importInventoryInput.addEventListener('change', (e) => {
                this.importInventory(e.target.files[0]);
            });
        }

        if (importCsvInput) {
            importCsvInput.addEventListener('change', (e) => {
                this.importCsv(e.target.files[0]);
            });
        }

        // Packing list import/export
        const importPackingBtn = document.getElementById('importPackingBtn');
        const exportPackingBtn = document.getElementById('exportPackingBtn');
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        const importPackingInput = document.getElementById('importPackingInput');

        if (importPackingBtn) {
            importPackingBtn.addEventListener('click', () => {
                importPackingInput.click();
            });
        }

        if (exportPackingBtn) {
            exportPackingBtn.addEventListener('click', () => {
                this.exportPackingList();
            });
        }

        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.exportPdfWithRetry();
            });
        }

        if (importPackingInput) {
            importPackingInput.addEventListener('change', (e) => {
                this.importPackingList(e.target.files[0]);
            });
        }
    }

    setupModalListeners() {
        const addItemBtn = document.getElementById('addItemBtn');
        const closeModal = document.getElementById('closeModal');
        const cancelAdd = document.getElementById('cancelAdd');
        const addItemForm = document.getElementById('addItemForm');

        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.showModal('addItemModal');
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal('addItemModal');
            });
        }

        if (cancelAdd) {
            cancelAdd.addEventListener('click', () => {
                this.hideModal('addItemModal');
            });
        }

        if (addItemForm) {
            addItemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewItem();
            });
        }

        // New category functionality in add item modal
        const addNewCategoryBtn = document.getElementById('addNewCategoryBtn');
        const confirmNewCategoryBtn = document.getElementById('confirmNewCategoryBtn');
        const cancelNewCategoryBtn = document.getElementById('cancelNewCategoryBtn');
        const newCategoryInput = document.getElementById('newCategoryInput');
        const newCategoryNameInput = document.getElementById('newCategoryNameInput');

        if (addNewCategoryBtn) {
            addNewCategoryBtn.addEventListener('click', () => {
                newCategoryInput.style.display = 'flex';
                newCategoryNameInput.focus();
            });
        }

        if (confirmNewCategoryBtn) {
            confirmNewCategoryBtn.addEventListener('click', () => {
                this.addNewCategoryFromItemModal();
            });
        }

        if (cancelNewCategoryBtn) {
            cancelNewCategoryBtn.addEventListener('click', () => {
                this.cancelNewCategoryInput();
            });
        }

        if (newCategoryNameInput) {
            newCategoryNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addNewCategoryFromItemModal();
                }
            });
        }
    }

    setupInventoryListeners() {
        const clearInventoryBtn = document.getElementById('clearInventoryBtn');

        if (clearInventoryBtn) {
            clearInventoryBtn.addEventListener('click', () => {
                this.clearInventory();
            });
        }
    }

    setupPackingListListeners() {
        const clearPackingBtn = document.getElementById('clearPackingBtn');
        const savePackingBtn = document.getElementById('savePackingBtn');
        const packingMenuToggle = document.getElementById('packingMenuToggle');

        if (clearPackingBtn) {
            clearPackingBtn.addEventListener('click', () => {
                this.clearPackingList();
            });
        }

        if (savePackingBtn) {
            savePackingBtn.addEventListener('click', () => {
                this.savePackingList();
            });
        }

        // Packing menu toggle is now integrated into the nav button
        // This will be handled in the main navigation listeners
    }

    setupCategoryManagementListeners() {
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        const closeCategoryModal = document.getElementById('closeCategoryModal');
        const cancelCategory = document.getElementById('cancelCategory');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const newCategoryName = document.getElementById('newCategoryName');

        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => {
                this.showCategoryModal();
            });
        }

        if (closeCategoryModal) {
            closeCategoryModal.addEventListener('click', () => {
                this.hideModal('categoryModal');
            });
        }

        if (cancelCategory) {
            cancelCategory.addEventListener('click', () => {
                this.hideModal('categoryModal');
            });
        }

        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.addNewCategory();
            });
        }

        if (newCategoryName) {
            newCategoryName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addNewCategory();
                }
            });
        }
    }

    setupMobileAndThemeListeners() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const darkModeToggle = document.getElementById('darkModeToggle');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDarkMode();
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && !e.target.closest('.nav') && !e.target.closest('.mobile-menu-toggle')) {
                this.closeMobileMenu();
            }
        });
    }

    // Local Storage Methods
    saveToLocalStorage() {
        try {
            localStorage.setItem('hikelite_inventory', JSON.stringify(this.inventory));
            localStorage.setItem('hikelite_packing_list', JSON.stringify(this.packingList));
            localStorage.setItem('hikelite_categories', JSON.stringify(this.categories));
            localStorage.setItem('hikelite_weight_unit', this.weightUnit);
            localStorage.setItem('hikelite_dark_mode', this.darkMode);
            console.log('Data saved to local storage');
        } catch (error) {
            console.error('Error saving to local storage:', error);
            this.showNotification('Error saving data to local storage', 'error');
        }
    }

    loadFromLocalStorage() {
        try {
            const savedInventory = localStorage.getItem('hikelite_inventory');
            const savedPackingList = localStorage.getItem('hikelite_packing_list');
            const savedCategories = localStorage.getItem('hikelite_categories');
            const savedWeightUnit = localStorage.getItem('hikelite_weight_unit');
            const savedDarkMode = localStorage.getItem('hikelite_dark_mode');

            if (savedInventory) {
                this.inventory = JSON.parse(savedInventory);
            }
            if (savedPackingList) {
                this.packingList = JSON.parse(savedPackingList);
            }
            if (savedCategories) {
                this.categories = JSON.parse(savedCategories);
            }
            if (savedWeightUnit) {
                this.weightUnit = savedWeightUnit;
                const weightUnitSelect = document.getElementById('weightUnit');
                if (weightUnitSelect) {
                    weightUnitSelect.value = this.weightUnit;
                }
            }
            if (savedDarkMode) {
                this.darkMode = savedDarkMode === 'true';
            }

            console.log('Data loaded from local storage');
        } catch (error) {
            console.error('Error loading from local storage:', error);
        }
    }

    // Import/Export Methods
    async importInventory(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (Array.isArray(data)) {
                this.inventory = data;
                this.saveToLocalStorage();
                this.renderInventory();
                this.renderStatistics();
                this.populateCategoryFilters();
                this.showNotification('Inventory imported successfully!', 'success');
            } else {
                throw new Error('Invalid JSON format');
            }
        } catch (error) {
            console.error('Error importing inventory:', error);
            this.showNotification('Error importing inventory. Please check the file format.', 'error');
        }
    }

    async importCsv(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            const newItems = [];
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = line.split(',').map(v => v.trim());
                if (values.length < headers.length) continue;
                
                const item = {
                    id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: values[headers.indexOf('name')] || 'Unknown Item',
                    category: values[headers.indexOf('category')] || 'Miscellaneous',
                    manufacturer: values[headers.indexOf('manufacturer')] || '',
                    product: values[headers.indexOf('product')] || '',
                    weight: parseFloat(values[headers.indexOf('weight')]) || 0,
                    quantity: parseInt(values[headers.indexOf('quantity')]) || 1,
                    consumable: values[headers.indexOf('consumable')]?.toLowerCase() === 'true',
                    selected: false,
                    worn: false,
                    shared: false
                };
                
                newItems.push(item);
            }
            
            this.inventory = [...this.inventory, ...newItems];
            this.saveToLocalStorage();
            this.renderInventory();
            this.renderStatistics();
            this.populateCategoryFilters();
            this.showNotification(`${newItems.length} items imported from CSV!`, 'success');
            
        } catch (error) {
            console.error('Error importing CSV:', error);
            this.showNotification('Error importing CSV. Please check the file format.', 'error');
        }
    }

    async importPackingList(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (Array.isArray(data)) {
                this.packingList = data;
                this.saveToLocalStorage();
                this.renderInventory();
                this.renderPackingList();
                this.showNotification('Packing list imported successfully!', 'success');
            } else {
                throw new Error('Invalid JSON format');
            }
        } catch (error) {
            console.error('Error importing packing list:', error);
            this.showNotification('Error importing packing list. Please check the file format.', 'error');
        }
    }

    exportInventory() {
        const dataStr = JSON.stringify(this.inventory, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `hikelite-inventory-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Inventory exported successfully!', 'success');
    }

    exportPackingList() {
        const dataStr = JSON.stringify(this.packingList, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `hikelite-packing-list-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Packing list exported successfully!', 'success');
    }

    exportPdf() {
        console.log('Starting PDF export...');
        console.log('window.jsPDF:', window.jsPDF);
        console.log('window.jspdf:', window.jspdf);
        
        // Check if jsPDF is available (try both cases)
        let jsPDF;
        if (typeof window.jsPDF !== 'undefined') {
            jsPDF = window.jsPDF;
            console.log('Using window.jsPDF');
        } else if (typeof window.jspdf !== 'undefined') {
            jsPDF = window.jspdf;
            console.log('Using window.jspdf');
        } else {
            this.showNotification('PDF library not loaded. Please refresh the page and try again.', 'error');
            console.error('jsPDF library not found on window object');
            return;
        }

        try {
            // Try different access methods for the library
            let jsPDFConstructor;
            if (jsPDF.jsPDF) {
                jsPDFConstructor = jsPDF.jsPDF;
                console.log('Using jsPDF.jsPDF');
            } else if (jsPDF.default) {
                jsPDFConstructor = jsPDF.default;
                console.log('Using jsPDF.default');
            } else {
                jsPDFConstructor = jsPDF;
                console.log('Using jsPDF directly');
            }
        const doc = new jsPDFConstructor();
        
        // Title
        doc.setFontSize(20);
        doc.text('HikeLite Packing List', 20, 20);
        
        // Date
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        
        // Weight summary
        const weights = this.calculateDetailedWeights();
        doc.setFontSize(14);
        doc.text('Weight Summary', 20, 45);
        
        doc.setFontSize(10);
        let yPos = 55;
        doc.text(`Own Weight Carried: ${this.formatWeight(weights.ownWeight)}`, 20, yPos);
        yPos += 8;
        doc.text(`Shared Weight Carried: ${this.formatWeight(weights.sharedWeight)}`, 20, yPos);
        yPos += 8;
        doc.text(`Backpack Base Weight: ${this.formatWeight(weights.baseWeight)}`, 20, yPos);
        yPos += 8;
        doc.text(`Weight of Consumables: ${this.formatWeight(weights.consumableWeight)}`, 20, yPos);
        yPos += 8;
        doc.text(`Total Backpack Weight: ${this.formatWeight(weights.totalBackpackWeight)}`, 20, yPos);
        yPos += 8;
        doc.text(`Weight Worn: ${this.formatWeight(weights.wornWeight)}`, 20, yPos);
        yPos += 8;
        doc.text(`Total Weight: ${this.formatWeight(weights.totalWeight)}`, 20, yPos);
        
        yPos += 15;
        
        // Packing list items
        doc.setFontSize(14);
        doc.text('Packing List', 20, yPos);
        yPos += 10;
        
        const categories = {};
        this.packingList.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        
        Object.entries(categories).forEach(([category, items]) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(12);
            doc.text(category, 20, yPos);
            yPos += 8;
            
            items.forEach(item => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(10);
                const itemText = `• ${item.name} (${item.quantity || 1}x) - ${this.formatWeight(item.weight * (item.quantity || 1))}`;
                if (item.worn) {
                    doc.text(itemText + ' [WORN]', 25, yPos);
                } else if (item.shared) {
                    doc.text(itemText + ' [SHARED]', 25, yPos);
                } else {
                    doc.text(itemText, 25, yPos);
                }
                yPos += 6;
            });
            
            yPos += 5;
        });
        
            doc.save(`hikelite-packing-list-${new Date().toISOString().split('T')[0]}.pdf`);
            this.showNotification('PDF exported successfully!', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            this.showNotification('Error generating PDF. Please try again.', 'error');
        }
    }

    exportPdfWithRetry() {
        // Try to export PDF, with retry if library not loaded
        if (typeof window.jsPDF === 'undefined' && typeof window.jspdf === 'undefined') {
            this.showNotification('PDF library loading... Please wait a moment and try again.', 'info');
            // Try to load the library dynamically
            this.loadPdfLibraryDynamically().then(() => {
                this.exportPdf();
            }).catch(() => {
                this.showNotification('PDF library failed to load. Please refresh the page.', 'error');
            });
        } else {
            this.exportPdf();
        }
    }

    async loadPdfLibraryDynamically() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof window.jsPDF !== 'undefined' || typeof window.jspdf !== 'undefined') {
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
            script.onload = () => {
                console.log('jsPDF loaded dynamically');
                setTimeout(() => {
                    if (typeof window.jsPDF !== 'undefined' || typeof window.jspdf !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('jsPDF not available after loading'));
                    }
                }, 100);
            };
            script.onerror = () => {
                reject(new Error('Failed to load jsPDF script'));
            };
            
            document.head.appendChild(script);
        });
    }

    checkPdfLibrary() {
        console.log('Checking PDF library availability...');
        console.log('window.jsPDF:', window.jsPDF);
        console.log('window.jspdf:', window.jspdf);
        console.log('window object keys:', Object.keys(window).filter(key => key.toLowerCase().includes('pdf')));
        console.log('window object keys:', Object.keys(window).filter(key => key.toLowerCase().includes('jspdf')));
        
        if (typeof window.jsPDF !== 'undefined' || typeof window.jspdf !== 'undefined') {
            console.log('PDF library is loaded successfully');
        } else {
            console.warn('PDF library is not loaded');
            console.log('Available window properties:', Object.keys(window).slice(0, 20));
        }
    }

    // Weight conversion and formatting
    convertWeight(weightInGrams, targetUnit) {
        return weightInGrams / this.weightConversions[targetUnit];
    }

    formatWeight(weightInGrams) {
        const converted = this.convertWeight(weightInGrams, this.weightUnit);
        const decimals = this.weightUnit === 'g' ? 0 : 2;
        return `${converted.toFixed(decimals)}${this.weightUnit}`;
    }

    updateWeightDisplay() {
        // Update all weight displays throughout the app
        this.renderPackingList();
    }

    // Enhanced weight calculations
    calculateDetailedWeights() {
        let ownWeight = 0;
        let sharedWeight = 0;
        let wornWeight = 0;
        let consumableWeight = 0;
        
        this.packingList.forEach(item => {
            const totalQuantity = item.quantity || 1;
            const itemWeight = item.weight;
            
            if (item.worn) {
                // If item is worn, 1 unit goes to worn weight, rest goes to carried weight
                wornWeight += itemWeight * 1; // Always 1 unit worn
                
                const carriedQuantity = totalQuantity - 1; // Remaining quantity is carried
                if (carriedQuantity > 0) {
                    if (item.shared) {
                        sharedWeight += itemWeight * carriedQuantity;
                    } else {
                        ownWeight += itemWeight * carriedQuantity;
                    }
                }
            } else {
                // If not worn, all quantity goes to carried weight
                if (item.shared) {
                    sharedWeight += itemWeight * totalQuantity;
                } else {
                    ownWeight += itemWeight * totalQuantity;
                }
            }
            
            // Calculate consumable weight (only for carried items, not worn)
            if (item.consumable) {
                const carriedQuantity = item.worn ? Math.max(0, totalQuantity - 1) : totalQuantity;
                consumableWeight += itemWeight * carriedQuantity;
            }
        });
        
        const baseWeight = ownWeight + sharedWeight;
        const totalBackpackWeight = baseWeight + consumableWeight;
        const totalWeight = totalBackpackWeight + wornWeight;
        
        return {
            ownWeight,
            sharedWeight,
            baseWeight,
            consumableWeight,
            totalBackpackWeight,
            wornWeight,
            totalWeight
        };
    }

    switchTab(tabName) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Re-render content if needed
        if (tabName === 'stats') {
            this.renderStatistics();
        }
    }

    populateCategoryFilters() {
        // Combine categories from inventory and the separate categories list
        const inventoryCategories = [...new Set(this.inventory.map(item => item.category))];
        const allCategories = [...new Set([...inventoryCategories, ...this.categories])].sort();
        const categoryFilter = document.getElementById('categoryFilter');
        const itemCategory = document.getElementById('itemCategory');

        // Clear existing options (except first one)
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
        }
        if (itemCategory) {
            itemCategory.innerHTML = '<option value="">Select Category</option>';
        }

        allCategories.forEach(category => {
            if (categoryFilter) {
                const option1 = document.createElement('option');
                option1.value = category;
                option1.textContent = category;
                categoryFilter.appendChild(option1);
            }

            if (itemCategory) {
                const option2 = document.createElement('option');
                option2.value = category;
                option2.textContent = category;
                itemCategory.appendChild(option2);
            }
        });
    }

    renderInventory() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;

        if (this.inventory.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-boxes"></i>
                    <h3>No gear in inventory</h3>
                    <p>Import a file or add your first item to get started</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.inventory.map(item => this.createItemCard(item)).join('');
    }

    createItemCard(item) {
        const isSelected = this.packingList.some(packedItem => packedItem.id === item.id);
        const selectedClass = isSelected ? 'selected' : '';
        
        // Combine manufacturer and product on same line
        const manufacturerProduct = [];
        if (item.manufacturer) manufacturerProduct.push(item.manufacturer);
        if (item.product) manufacturerProduct.push(item.product);
        const manufacturerProductText = manufacturerProduct.join(' | ');
        
        return `
            <div class="item-card ${selectedClass}" data-id="${item.id}">
                <div class="item-header">
                    <div>
                        <div class="item-name">${item.name}</div>
                        <div class="item-category">${item.category}</div>
                    </div>
                    <div class="item-weight">${this.formatWeight(item.weight)}</div>
                </div>
                <div class="item-details">
                    ${manufacturerProductText ? `<div class="item-manufacturer-product">${manufacturerProductText}</div>` : ''}
                    ${item.consumable ? '<div class="item-consumable">Consumable</div>' : ''}
                </div>
                <div class="item-actions">
                    ${!isSelected ? 
                        `<button class="btn btn-small btn-select" onclick="hikeLite.addToPackingList('${item.id}')">
                            <i class="fas fa-plus"></i> Add to Pack
                        </button>` :
                        `<button class="btn btn-small btn-remove" onclick="hikeLite.removeFromPackingList('${item.id}')">
                            <i class="fas fa-minus"></i> Remove
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    filterInventory(searchTerm) {
        const filtered = this.inventory.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            
            // Helper function to safely convert to string and search
            const safeSearch = (value) => {
                if (value == null) return false;
                return String(value).toLowerCase().includes(searchLower);
            };
            
            return safeSearch(item.name) ||
                   safeSearch(item.manufacturer) ||
                   safeSearch(item.product) ||
                   safeSearch(item.category);
        });
        
        this.renderFilteredInventory(filtered);
    }

    filterByCategory(category) {
        if (!category) {
            this.renderInventory();
            return;
        }
        
        const filtered = this.inventory.filter(item => item.category === category);
        this.renderFilteredInventory(filtered);
    }

    renderFilteredInventory(items) {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No items found</h3>
                    <p>Try adjusting your search or filter</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(item => this.createItemCard(item)).join('');
    }

    addToPackingList(itemId) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;

        const packingItem = {
            ...item,
            selected: true,
            worn: false,
            shared: false
        };

        this.packingList.push(packingItem);
        this.saveToLocalStorage();
        this.renderInventory();
        this.renderPackingList();
    }

    removeFromPackingList(itemId) {
        this.packingList = this.packingList.filter(item => item.id !== itemId);
        this.saveToLocalStorage();
        this.renderInventory();
        this.renderPackingList();
    }

    renderPackingList() {
        const container = document.getElementById('packingCategories');
        if (!container) return;

        if (this.packingList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-backpack"></i>
                    <h3>No items in packing list</h3>
                    <p>Add items from your inventory to build your pack</p>
                </div>
            `;
            this.updateWeightSummary();
            return;
        }

        // Group items by category
        const categories = {};
        this.packingList.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        container.innerHTML = Object.entries(categories).map(([category, items]) => {
            const categoryWeight = items.reduce((sum, item) => sum + (item.weight * (item.quantity || 1)), 0);
            
            return `
                <div class="packing-category">
                    <h3>
                        ${category}
                        <span class="category-weight">${this.formatWeight(categoryWeight)}</span>
                    </h3>
                    <div class="packing-items">
                        ${items.map(item => this.createPackingItem(item)).join('')}
                    </div>
                </div>
            `;
        }).join('');

        this.updateWeightSummary();
    }

    createPackingItem(item) {
        const wornClass = item.worn ? 'worn' : '';
        const sharedClass = item.shared ? 'shared' : '';
        
        const totalQuantity = item.quantity || 1;
        const itemWeight = item.weight;
        
        // Calculate weight breakdown for display
        let carriedWeight = 0;
        let wornWeight = 0;
        
        if (item.worn) {
            wornWeight = itemWeight * 1; // Always 1 unit worn
            carriedWeight = itemWeight * Math.max(0, totalQuantity - 1); // Remaining carried
        } else {
            carriedWeight = itemWeight * totalQuantity; // All carried
        }
        
        const totalWeight = carriedWeight + wornWeight;
        
        return `
            <div class="packing-item ${wornClass} ${sharedClass}">
                <div class="item-info">
                    <div class="name">${item.name}</div>
                    <div class="details">
                        ${item.manufacturer ? `${item.manufacturer}` : ''}
                        ${item.product ? ` - ${item.product}` : ''}
                        ${item.consumable ? ' (Consumable)' : ''}
                        <span class="item-weight-display"> - ${this.formatWeight(totalWeight)} total</span>
                        ${item.worn && carriedWeight > 0 ? `<span class="weight-breakdown"> (${this.formatWeight(carriedWeight)} carried, ${this.formatWeight(wornWeight)} worn)</span>` : ''}
                    </div>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="hikeLite.updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-display">${totalQuantity}</span>
                        <button class="quantity-btn" onclick="hikeLite.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <div class="worn-toggle">
                        <input type="checkbox" ${item.worn ? 'checked' : ''} 
                               onchange="hikeLite.toggleWorn('${item.id}')">
                        <span>Worn</span>
                    </div>
                    <div class="shared-toggle">
                        <input type="checkbox" ${item.shared ? 'checked' : ''} 
                               onchange="hikeLite.toggleShared('${item.id}')">
                        <span>Shared</span>
                    </div>
                    <button class="btn btn-small btn-remove" onclick="hikeLite.removeFromPackingList('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateQuantity(itemId, change) {
        const item = this.packingList.find(i => i.id === itemId);
        if (!item) return;

        const newQuantity = Math.max(1, (item.quantity || 1) + change);
        item.quantity = newQuantity;
        
        this.saveToLocalStorage();
        this.renderPackingList();
    }

    toggleWorn(itemId) {
        const item = this.packingList.find(i => i.id === itemId);
        if (!item) return;

        item.worn = !item.worn;
        
        this.saveToLocalStorage();
        this.renderPackingList();
    }

    toggleShared(itemId) {
        const item = this.packingList.find(i => i.id === itemId);
        if (!item) return;

        item.shared = !item.shared;
        this.saveToLocalStorage();
        this.renderPackingList();
    }

    updateWeightSummary() {
        const weights = this.calculateDetailedWeights();

        const ownWeightEl = document.getElementById('ownWeight');
        const sharedWeightEl = document.getElementById('sharedWeight');
        const baseWeightEl = document.getElementById('baseWeight');
        const consumableWeightEl = document.getElementById('consumableWeight');
        const totalBackpackWeightEl = document.getElementById('totalBackpackWeight');
        const wornWeightEl = document.getElementById('wornWeight');
        const totalWeightEl = document.getElementById('totalWeight');

        if (ownWeightEl) ownWeightEl.textContent = this.formatWeight(weights.ownWeight);
        if (sharedWeightEl) sharedWeightEl.textContent = this.formatWeight(weights.sharedWeight);
        if (baseWeightEl) baseWeightEl.textContent = this.formatWeight(weights.baseWeight);
        if (consumableWeightEl) consumableWeightEl.textContent = this.formatWeight(weights.consumableWeight);
        if (totalBackpackWeightEl) totalBackpackWeightEl.textContent = this.formatWeight(weights.totalBackpackWeight);
        if (wornWeightEl) wornWeightEl.textContent = this.formatWeight(weights.wornWeight);
        if (totalWeightEl) totalWeightEl.textContent = this.formatWeight(weights.totalWeight);
    }

    renderStatistics() {
        this.updateStatCards();
        this.renderItemsByWeight();
    }

    updateStatCards() {
        // Show packing list statistics instead of inventory statistics
        const totalItems = this.packingList.length;
        const categories = [...new Set(this.packingList.map(item => item.category))].length;
        
        if (this.packingList.length === 0) {
            document.getElementById('totalItems').textContent = '0';
            document.getElementById('totalCategories').textContent = '0';
            document.getElementById('lightestItem').textContent = '-';
            document.getElementById('heaviestItem').textContent = '-';
            return;
        }
        
        // Calculate individual item weights (considering quantities)
        const itemWeights = this.packingList.map(item => {
            const totalQuantity = item.quantity || 1;
            return {
                name: item.name,
                weight: item.weight * totalQuantity
            };
        });
        
        const weights = itemWeights.map(item => item.weight);
        const lightestItem = Math.min(...weights);
        const heaviestItem = Math.max(...weights);
        
        const lightestItemName = itemWeights.find(item => item.weight === lightestItem)?.name || '-';
        const heaviestItemName = itemWeights.find(item => item.weight === heaviestItem)?.name || '-';

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalCategories').textContent = categories;
        document.getElementById('lightestItem').textContent = `${lightestItemName} (${this.formatWeight(lightestItem)})`;
        document.getElementById('heaviestItem').textContent = `${heaviestItemName} (${this.formatWeight(heaviestItem)})`;
    }

    renderItemsByWeight() {
        const container = document.getElementById('categoryChart');
        if (!container) return;

        if (this.packingList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-backpack"></i>
                    <h3>No items in packing list</h3>
                    <p>Add items to see weight-sorted list</p>
                </div>
            `;
            return;
        }

        // Calculate individual item weights and sort by weight (heaviest first)
        const itemWeights = this.packingList.map(item => {
            const totalQuantity = item.quantity || 1;
            const itemWeight = item.weight;
            
            // Calculate carried vs worn weight for this item
            let carriedWeight = 0;
            let wornWeight = 0;
            
            if (item.worn) {
                wornWeight = itemWeight * 1; // Always 1 unit worn
                carriedWeight = itemWeight * Math.max(0, totalQuantity - 1); // Remaining carried
            } else {
                carriedWeight = itemWeight * totalQuantity; // All carried
            }
            
            const totalWeight = carriedWeight + wornWeight;
            
            return {
                ...item,
                totalWeight,
                carriedWeight,
                wornWeight,
                totalQuantity
            };
        });

        // Sort by total weight (heaviest first)
        const sortedItems = itemWeights.sort((a, b) => b.totalWeight - a.totalWeight);
        

        container.innerHTML = `
            <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #28a745;">
                <strong>📊 Items sorted by weight (heaviest to lightest)</strong>
            </div>
        ` + sortedItems.map(item => {
            const statusBadges = [];
            if (item.worn) statusBadges.push('<span class="status-badge worn">WORN</span>');
            if (item.shared) statusBadges.push('<span class="status-badge shared">SHARED</span>');
            if (item.consumable) statusBadges.push('<span class="status-badge consumable">CONSUMABLE</span>');
            
            return `
                <div class="item-row">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-details">
                            ${item.manufacturer ? `${item.manufacturer}` : ''}
                            ${item.product ? ` • ${item.product}` : ''}
                            ${statusBadges.length > 0 ? ` • ${statusBadges.join(' ')}` : ''}
                        </div>
                    </div>
                    <div class="item-stats">
                        <span class="quantity">${item.totalQuantity}x</span>
                        <span class="total-weight">${this.formatWeight(item.totalWeight)}</span>
                        <span class="carried-weight">${this.formatWeight(item.carriedWeight)} carried</span>
                        ${item.wornWeight > 0 ? `<span class="worn-weight">${this.formatWeight(item.wornWeight)} worn</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            // Reset form if it's the add item modal
            if (modalId === 'addItemModal') {
                document.getElementById('addItemForm').reset();
                this.cancelNewCategoryInput();
            }
        }
    }

    addNewItem() {
        const newItem = {
            id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            manufacturer: document.getElementById('itemManufacturer').value,
            product: document.getElementById('itemProduct').value,
            weight: parseFloat(document.getElementById('itemWeight').value),
            quantity: parseInt(document.getElementById('itemQuantity').value) || 1,
            consumable: document.getElementById('itemConsumable').checked,
            selected: false,
            worn: false,
            shared: false
        };

        this.inventory.push(newItem);
        this.saveToLocalStorage();
        this.renderInventory();
        this.renderStatistics();
        this.populateCategoryFilters();
        this.hideModal('addItemModal');
        
        this.showNotification('Item added successfully!', 'success');
    }

    clearInventory() {
        if (confirm('Are you sure you want to clear the entire inventory? This will also clear your packing list.')) {
            this.inventory = [];
            this.packingList = [];
            this.saveToLocalStorage();
            this.renderInventory();
            this.renderPackingList();
            this.renderStatistics();
            this.populateCategoryFilters();
            this.showNotification('Inventory cleared', 'info');
        }
    }

    clearPackingList() {
        if (confirm('Are you sure you want to clear the entire packing list?')) {
            this.packingList = [];
            this.saveToLocalStorage();
            this.renderInventory();
            this.renderPackingList();
            this.showNotification('Packing list cleared', 'info');
        }
    }

    savePackingList() {
        this.saveToLocalStorage();
        this.showNotification('Packing list saved to local storage!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Dark Mode Methods
    initializeDarkMode() {
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        this.updateDarkModeIcon();
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('dark-mode', this.darkMode);
        this.updateDarkModeIcon();
        this.saveToLocalStorage();
    }

    updateDarkModeIcon() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.className = this.darkMode ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // Mobile Menu Methods
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const nav = document.getElementById('mainNav');
        if (nav) {
            nav.classList.toggle('active', this.mobileMenuOpen);
        }
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
        const nav = document.getElementById('mainNav');
        if (nav) {
            nav.classList.remove('active');
        }
    }

    // Packing Menu Methods
    togglePackingMenu() {
        this.packingMenuOpen = !this.packingMenuOpen;
        const controls = document.getElementById('packingControls');
        if (controls) {
            controls.style.display = this.packingMenuOpen ? 'flex' : 'none';
        }
    }

    // Category Management Methods
    showCategoryModal() {
        this.renderCategoryList();
        this.showModal('categoryModal');
    }

    renderCategoryList() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;

        // Combine categories from inventory and the separate categories list
        const inventoryCategories = [...new Set(this.inventory.map(item => item.category))];
        const allCategories = [...new Set([...inventoryCategories, ...this.categories])].sort();
        
        if (allCategories.length === 0) {
            categoryList.innerHTML = '<p class="text-muted">No categories found. Add some items to create categories.</p>';
            return;
        }

        categoryList.innerHTML = allCategories.map(category => {
            const itemCount = this.inventory.filter(item => item.category === category).length;
            const canDelete = itemCount === 0; // Only allow deletion if no items use this category
            
            return `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-stats">${itemCount} item${itemCount !== 1 ? 's' : ''}</div>
                    <div class="category-actions">
                        ${canDelete ? 
                            `<button class="btn-delete-category" onclick="hikeLite.deleteCategory('${category}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>` : 
                            '<span class="text-muted">In use</span>'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    addNewCategory() {
        const newCategoryName = document.getElementById('newCategoryName');
        if (!newCategoryName) return;

        const categoryName = newCategoryName.value.trim();
        if (!categoryName) {
            this.showNotification('Please enter a category name', 'error');
            return;
        }

        // Check if category already exists
        const inventoryCategories = [...new Set(this.inventory.map(item => item.category))];
        const allExistingCategories = [...new Set([...inventoryCategories, ...this.categories])];
        if (allExistingCategories.includes(categoryName)) {
            this.showNotification('Category already exists', 'error');
            return;
        }

        // Add the new category to the categories list
        this.categories.push(categoryName);
        this.saveToLocalStorage();
        
        // Add the new category to the dropdowns
        this.populateCategoryFilters();
        
        // Clear the input
        newCategoryName.value = '';
        
        // Refresh the category list
        this.renderCategoryList();
        
        this.showNotification(`Category "${categoryName}" added successfully!`, 'success');
    }

    deleteCategory(categoryName) {
        if (confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
            // Remove all items with this category
            this.inventory = this.inventory.filter(item => item.category !== categoryName);
            this.packingList = this.packingList.filter(item => item.category !== categoryName);
            
            // Remove from categories list if it exists there
            this.categories = this.categories.filter(cat => cat !== categoryName);
            
            this.saveToLocalStorage();
            this.renderInventory();
            this.renderPackingList();
            this.renderStatistics();
            this.populateCategoryFilters();
            this.renderCategoryList();
            
            this.showNotification(`Category "${categoryName}" deleted successfully!`, 'success');
        }
    }

    // New category functionality for add item modal
    addNewCategoryFromItemModal() {
        const newCategoryNameInput = document.getElementById('newCategoryNameInput');
        if (!newCategoryNameInput) return;

        const categoryName = newCategoryNameInput.value.trim();
        if (!categoryName) {
            this.showNotification('Please enter a category name', 'error');
            return;
        }

        // Check if category already exists
        const inventoryCategories = [...new Set(this.inventory.map(item => item.category))];
        const allExistingCategories = [...new Set([...inventoryCategories, ...this.categories])];
        if (allExistingCategories.includes(categoryName)) {
            this.showNotification('Category already exists', 'error');
            return;
        }

        // Add the new category to the categories list
        this.categories.push(categoryName);
        this.saveToLocalStorage();
        
        // Add the new category to the dropdowns
        this.populateCategoryFilters();
        
        // Select the new category in the dropdown
        const itemCategory = document.getElementById('itemCategory');
        if (itemCategory) {
            itemCategory.value = categoryName;
        }
        
        // Clear the input and hide the new category input
        this.cancelNewCategoryInput();
        
        this.showNotification(`Category "${categoryName}" added successfully!`, 'success');
    }

    cancelNewCategoryInput() {
        const newCategoryInput = document.getElementById('newCategoryInput');
        const newCategoryNameInput = document.getElementById('newCategoryNameInput');
        
        if (newCategoryInput) {
            newCategoryInput.style.display = 'none';
        }
        if (newCategoryNameInput) {
            newCategoryNameInput.value = '';
        }
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
let hikeLite;
document.addEventListener('DOMContentLoaded', () => {
    hikeLite = new HikeLite();
});