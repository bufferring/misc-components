# CarFix Database 3D Visualizer

A modern 3D database visualization tool built with Flask, Three.js, and Tailwind CSS. This application provides an interactive 3D representation of the CarFix automotive parts marketplace database schema, allowing users to explore table relationships, modify structures, and navigate through the database architecture in an immersive environment.

## ⚙️ Features

### 🎯 Core Functionality
- **3D Table Visualization**: Interactive 3D representation of database tables with their fields
- **Relationship Mapping**: Visual connections between related tables with foreign key relationships
- **Interactive Navigation**: Full 3D camera controls with zoom, pan, and rotate capabilities
- **Table Editing**: Double-click tables to modify their structure and fields
- **Real-time Updates**: Dynamic updates to the 3D scene when changes are made

### 🎨 Visual Features
- **Animated Particle Background**: Moving particle system for enhanced visual appeal
- **Color-coded Tables**: Different colors for easy table identification
- **Primary Key Highlighting**: Golden highlighting for primary key fields
- **Hover Effects**: Interactive feedback when hovering over tables
- **Responsive Design**: Optimized for both desktop and mobile devices

### 🛠 Technical Features
- **Flask Backend**: RESTful API for schema management
- **SQL Parser**: Automatic parsing of SQL schema files
- **Modern UI**: Tailwind CSS with custom animations and effects
- **Cross-platform**: Works on Windows, macOS, and Linux

## 📊 Database Schema 
 


The CarFix database includes comprehensive tables for:

- **🧑‍💼 User Management**: Users, businesses, payment methods, and authentication
- **🚗 Product Catalog**: Categories, brands, vehicle models, and spare parts
- **📦 Inventory Management**: Stock tracking, suppliers, and warehouses
- **🛒 Order Processing**: Shopping carts, orders, payments, and shipping
- **📢 Communication**: Messages, notifications, and customer support
- **📊 Analytics**: Reports, promotions, and business intelligence

## 🔧⚙️ Installation 

- **⚠️ Important:** for the 3D viewer to work correctly, the database structure must be in syntax only, without the database selection.

### Prerequisites 📋✅
- 🐍 Python 3.8 or higher
- 📦 pip (Python package installer)
- 🌐 Modern web browser with WebGL support

### Step 1: Clone or Download ⬇️📂
```bash
# If using git
git clone <repository-url>
cd carfix

# Or download and extract the files to the carfix directory
```

### Step 2: Install Dependencies 📜
```bash
# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Verify File Structure 🗂️🔍
Ensure your directory structure looks like this:
```
carfix/
├── app.py
├── requirements.txt
├── README.md
├── carfix.sql
├── carfix.mmd
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── visualizer.js
```

## 📖 Usage 

### 🚀 Starting the Application



1. ** Navigate to the project directory**:
   ```bash
   cd carfix
   ```

2. **Run the Flask application**:
   ```bash
   python app.py
   ```

3. **Open your web browser** and navigate to:
   ```
   http://localhost:5000
   ```
 

### 🎮 Navigation Controls

#### 🖥️ 3D Scene Navigation
- **Mouse Drag**: Rotate the camera around the scene
- **Mouse Wheel**: Zoom in and out
- **Right Click + Drag**: Pan the camera

#### 🛠️ UI Controls
- **Reset View**: Return camera to default position
- **Toggle Relations**: Show/hide relationship lines between tables
- **Toggle Particles**: Enable/disable animated particle background

#### 🏗️ Table Interaction
- **Single Click**: Select a table and view its details in the info panel
- **Double Click**: Open the table editor modal
- **Hover**: Highlight table and show cursor pointer

### 📊 Table Information Panel

The right sidebar displays detailed information about the selected table:
- **Table Name**: The name of the selected table
- **Fields List**: All fields with their data types
- **Primary Keys**: Highlighted in gold with (PK) indicator
- **Relationships**: Shows incoming and outgoing foreign key relationships

### ✏️ Table Editing

1. **Double-click** any table in the 3D scene
2. **Edit table properties** in the modal:
   - Change table name
   - Modify field names and types
   - Set primary key flags
   - Add new fields
3. **Save changes** to update the table structure

## 🌐 API Endpoints

The Flask backend provides the following API endpoints:

### 📜 GET /api/schema
Returns the complete database schema including tables and relationships.

**📦Response Format**:
```json
{
  "tables": {
    "table_name": {
      "fields": [
        {
          "name": "field_name",
          "type": "data_type",
          "is_primary": boolean
        }
      ]
    }
  },
  "relationships": [
    {
      "from_table": "source_table",
      "from_field": "source_field",
      "to_table": "target_table",
      "to_field": "target_field"
    }
  ]
}
```

### ✏️ PUT /api/tables/<table_name>
Updates a specific table's structure.

**📥Request Body**:
```json
{
  "fields": [
    {
      "name": "field_name",
      "type": "data_type",
      "is_primary": boolean
    }
  ]
}
```

## 🎨 Customization

### 🏗️ Adding New Tables

1. **Update the SQL schema** in `carfix.sql`
2. **Restart the application** to reload the schema
3. **New tables** will automatically appear in the 3D visualization

### 🎨 Styling Modifications

- **Colors**: Modify the color array in `visualizer.js` (line ~150)
- **Positioning**: Adjust the `positionTables()` method for different layouts
- **Particles**: Customize particle count and behavior in `createParticleSystem()`
- **UI Styling**: Edit `style.css` and Tailwind classes in `index.html`

### 🚀 Performance Tuning

- **Particle Count**: Reduce particle count for better performance on slower devices
- **Shadow Quality**: Adjust shadow map size in the lighting setup
- **LOD**: Implement level-of-detail for large schemas

## 🌐 Browser Compatibility

### ✅ Supported Browsers
- **🌍Chrome**: 80+ (Recommended)
- **🦊Firefox**: 75+
- **🍏Safari**: 13+
- **🖥️Edge**: 80+

### ⚙️ WebGL Requirements
- WebGL 1.0 support required
- Hardware acceleration recommended
- Minimum 1GB GPU memory for optimal performance

## 🛠️ Troubleshooting

### ❌ Common Issues

#### 🏗️ Application Won't Start
- **Check Python version**: Ensure Python 3.8+
- **Install dependencies**: Run `pip install -r requirements.txt`
- **Port conflicts**: Change port in `app.py` if 5000 is in use

####  🎮 3D Scene Not Loading
- **WebGL support**: Check browser WebGL compatibility
- **Console errors**: Open browser developer tools for error messages
- **File paths**: Ensure all static files are properly served

#### 🚀 Performance Issues
- **Reduce particles**: Lower particle count in `visualizer.js`
- **Disable shadows**: Comment out shadow-related code
- **Close other tabs**: Free up GPU memory

#### 🏗️ Schema Not Loading
- **SQL file format**: Ensure `carfix.sql` is properly formatted
- **File permissions**: Check read permissions on schema files
- **Parsing errors**: Check console for SQL parsing error messages

### 🐞 Debug Mode

The application runs in debug mode by default. To disable:

```python
# In app.py, change:
app.run(debug=False, host='0.0.0.0', port=5000)
```

## 🏗️ Development

### 📂 Project Structure

- **`app.py`**: Flask application and API endpoints
- **`templates/index.html`**: Main HTML template
- **`static/js/visualizer.js`**: Three.js 3D visualization logic
- **`static/css/style.css`**: Custom CSS styles
- **`carfix.sql`**: Database schema definition
- **`carfix.mmd`**: Mermaid diagram representation

### 🚀 Adding Features

1. **Backend changes**: Modify `app.py` for new API endpoints
2. **Frontend changes**: Update `visualizer.js` for new 3D features
3. **Styling**: Add CSS to `style.css` or Tailwind classes
4. **Testing**: Test changes in multiple browsers

### 📝 Code Style

- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ES6+ features and consistent naming
- **CSS**: Use BEM methodology for custom classes
- **HTML**: Semantic markup with accessibility considerations

## 📜 License

This project is open source and available under the MIT License.

## 🛠️ Support

For issues, questions, or contributions:
- **Create an issue** in the repository
- **Check existing issues** for similar problems
- **Provide detailed information** including browser, OS, and error messages

---
