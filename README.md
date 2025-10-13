# HikeLite - Ultralight Gear Management System

A comprehensive web application for managing hiking gear inventory and creating optimized packing lists for ultralight backpacking.

## Features

### 🎒 Inventory Management
- **Import/Export**: JSON and CSV import/export functionality
- **Local Storage**: All data saved locally in your browser (no account required)
- **Search & Filter**: Find gear by name, manufacturer, product, or category
- **Add Items**: Expand your gear database with detailed item information
- **Weight Tracking**: Precise weight management in grams, ounces, or pounds

### 🎯 Packing List Builder
- **Smart Selection**: Add items from inventory to build custom packing lists
- **Weight Calculations**: Detailed breakdown of all weight categories
- **Quantity Management**: Adjust quantities for shared items
- **Worn Weight Toggle**: Mark items as worn (excluded from base weight)
- **Shared Items**: Track items shared between hiking partners
- **Category Organization**: Items grouped by category for easy packing

### 📊 Advanced Weight Tracking
- **Own Weight Carried**: Items you carry personally
- **Shared Weight Carried**: Items shared with others
- **Backpack Base Weight**: Own + Shared weight
- **Weight of Consumables**: Food and consumable items
- **Total Backpack Weight**: Base weight + consumables
- **Weight Worn**: Items worn on your body
- **Total Weight**: Complete pack weight including worn items

### 📱 Export Options
- **JSON Export**: Save inventory and packing lists as JSON files
- **PDF Export**: Generate printable packing lists with weight summaries
- **CSV Import**: Import gear from spreadsheet applications

### 🌍 Unit Support
- **Metric**: Grams (g)
- **Imperial**: Ounces (oz) and Pounds (lb)
- **Automatic Conversion**: Switch between units seamlessly

## Usage

### Getting Started
1. Open `index.html` in your web browser
2. Import your existing inventory (JSON or CSV) or start adding items manually
3. Build packing lists by selecting items from your inventory
4. Track weights and optimize your pack for ultralight hiking

### Importing Data
- **JSON Import**: Use the "Import" button to load existing inventory or packing lists
- **CSV Import**: Use the "CSV" button to import gear from spreadsheets
- **Sample CSV**: Use `sample-inventory.csv` as a template for your data

### CSV Format
Your CSV file should include these columns:
- `name`: Item name
- `category`: Item category (e.g., "Big 3", "Clothing", "Cookware")
- `manufacturer`: Manufacturer name
- `product`: Product model/description
- `weight`: Weight in grams
- `quantity`: Quantity (default: 1)
- `consumable`: true/false for consumable items

### Workflow
1. **Import existing Inventory** (if exists - JSON/CSV)
2. **Add extra items** to Inventory
3. **Export Inventory** (JSON)
4. **Import prior saved Packing List** if desired
5. **Tick or edit** the Inventory items
6. **Create new Packing List** and save locally

## Technical Details

### Data Storage
- All data is stored in your browser's local storage
- No server required - works completely offline
- Data persists between browser sessions
- Export/import functionality for backup and sharing

### Weight Calculations
- **Backpack Base Weight** = Own weight carried + Shared weight carried
- **Total Backpack Weight** = Backpack Base Weight + Weight of Consumables
- **Total Weight** = Total Backpack Weight + Weight Worn
- **Worn items** default to quantity of 1 when marked as worn

### Browser Compatibility
- Modern browsers with ES6+ support
- Local storage support required
- File API support for import/export functionality

## File Structure
```
hikelite/
├── index.html          # Main application
├── styles.css          # Styling and responsive design
├── script.js           # Application logic
├── inventory.json      # Sample inventory data
├── packing-list.json   # Sample packing list data
├── sample-inventory.csv # CSV import template
└── README.md           # This file
```

## Contributing
This is a personal project, but suggestions and improvements are welcome!

## License
Open source - feel free to use and modify for your own hiking adventures.

