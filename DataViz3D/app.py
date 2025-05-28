from flask import Flask, render_template, jsonify, request
import re
import json

app = Flask(__name__)

def parse_sql_schema(sql_file_path):
    """Parse SQL file to extract table structure and relationships"""
    with open(sql_file_path, 'r', encoding='utf-8') as file:
        sql_content = file.read()
    
    tables = {}
    relationships = []
    
    # Extract CREATE TABLE statements
    table_pattern = r'CREATE TABLE IF NOT EXISTS `([^`]+)`\s*\((.*?)\);'
    table_matches = re.findall(table_pattern, sql_content, re.DOTALL | re.IGNORECASE)
    
    for table_name, table_content in table_matches:
        fields = []
        foreign_keys = []
        
        # Split table content into lines
        lines = [line.strip() for line in table_content.split(',') if line.strip()]
        
        for line in lines:
            line = line.strip()
            if line.startswith('`') and not line.upper().startswith('FOREIGN KEY'):
                # Extract field information
                field_match = re.match(r'`([^`]+)`\s+([^,]+)', line)
                if field_match:
                    field_name = field_match.group(1)
                    field_type = field_match.group(2).strip()
                    
                    # Check if it's a primary key
                    is_primary = 'PRIMARY KEY' in field_type or 'AUTO_INCREMENT' in field_type
                    
                    fields.append({
                        'name': field_name,
                        'type': field_type,
                        'is_primary': is_primary
                    })
            
            elif line.upper().startswith('FOREIGN KEY'):
                # Extract foreign key relationships
                fk_match = re.search(r'FOREIGN KEY \(`([^`]+)`\) REFERENCES `([^`]+)`\(`([^`]+)`\)', line)
                if fk_match:
                    foreign_keys.append({
                        'field': fk_match.group(1),
                        'references_table': fk_match.group(2),
                        'references_field': fk_match.group(3)
                    })
                    
                    relationships.append({
                        'from_table': table_name,
                        'from_field': fk_match.group(1),
                        'to_table': fk_match.group(2),
                        'to_field': fk_match.group(3)
                    })
        
        tables[table_name] = {
            'name': table_name,
            'fields': fields,
            'foreign_keys': foreign_keys
        }
    
    return tables, relationships

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/schema')
def get_schema():
    """API endpoint to get database schema"""
    try:
        tables, relationships = parse_sql_schema('carfix.sql')
        return jsonify({
            'tables': tables,
            'relationships': relationships
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/table/<table_name>', methods=['GET', 'PUT'])
def handle_table(table_name):
    """API endpoint to get or update table structure"""
    if request.method == 'GET':
        tables, _ = parse_sql_schema('carfix.sql')
        if table_name in tables:
            return jsonify(tables[table_name])
        else:
            return jsonify({'error': 'Table not found'}), 404
    
    elif request.method == 'PUT':
        # Handle table updates (for editing functionality)
        data = request.get_json()
        # In a real implementation, you would update the database schema
        # For now, we'll just return the updated data
        return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)