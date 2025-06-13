from flask import Flask, render_template, jsonify, request
import re
import json
import os

app = Flask(__name__)
print(f"Existe archivo: {os.path.exists('carfix.sql')}")
print(f"Permisos: {os.access('carfix.sql', os.R_OK)}")

def parse_sql_schema(sql_file_path):
    """Parse SQL file to extract table structure and relationships"""
    with open(sql_file_path, 'r', encoding='utf-8') as file:
        sql_content = file.read()
    
    tables = {}
    relationships = []
    
    # Improved regex pattern that handles your SQL format
    table_pattern = r'CREATE TABLE (\w+)\s*\((.*?)\)\s*(ENGINE=\w+)?\s*;'
    table_matches = re.findall(table_pattern, sql_content, re.DOTALL | re.IGNORECASE)
    
    for table_name, table_content, _ in table_matches:
        fields = []
        foreign_keys = []
        
        # Split table content into lines, handling complex constraints
        lines = [line.strip() for line in table_content.split('\n') if line.strip()]
        
        for line in lines:
            # Clean up line by removing trailing commas
            line = line.strip().rstrip(',')
            
            # Field definition pattern
            field_pattern = r'^(\w+)\s+([\w\(\)\s,]+)\s*(.*?)$'
            field_match = re.match(field_pattern, line, re.IGNORECASE)
            
            if field_match and 'FOREIGN KEY' not in line.upper():
                field_name = field_match.group(1)
                field_type = field_match.group(2).strip()
                constraints = field_match.group(3).strip()
                
                is_primary = 'PRIMARY KEY' in constraints.upper()
                
                fields.append({
                    'name': field_name,
                    'type': field_type,
                    'is_primary': is_primary,
                    'constraints': constraints
                })
            
            elif 'FOREIGN KEY' in line.upper():
                # Improved foreign key pattern
                fk_pattern = r'FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s*(\w+)\s*\((\w+)\)\s*(ON DELETE \w+)?'
                fk_match = re.search(fk_pattern, line, re.IGNORECASE)
                
                if fk_match:
                    fk_data = {
                        'field': fk_match.group(1),
                        'references_table': fk_match.group(2),
                        'references_field': fk_match.group(3),
                        'on_delete': fk_match.group(4) if fk_match.group(4) else None
                    }
                    
                    foreign_keys.append(fk_data)
                    relationships.append({
                        'from_table': table_name,
                        'from_field': fk_match.group(1),
                        'to_table': fk_match.group(2),
                        'to_field': fk_match.group(3),
                        'on_delete': fk_match.group(4) if fk_match.group(4) else None
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
    try:
        print(f"Intentando leer archivo en: {os.path.abspath('carfix.sql')}")
        with open('carfix.sql', 'r', encoding='utf-8') as f:
            print(f"Primeras líneas del archivo:\n{f.read(200)}...")
            
        tables, relationships = parse_sql_schema('carfix.sql')
        print(f"Tablas encontradas: {list(tables.keys())}")
        return jsonify({
            'tables': tables,
            'relationships': relationships
        })
    except Exception as e:
        print(f"Error al procesar SQL: {str(e)}")
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
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True, port=5000)
