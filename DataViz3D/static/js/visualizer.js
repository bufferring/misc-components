class DatabaseVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.tables = {};
        this.relationships = [];
        this.tableObjects = {};
        this.relationshipLines = [];
        this.particles = null;
        this.particleSystem = null;
        this.showRelations = true;
        this.showParticles = true;
        this.selectedTable = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
    }

    async init() {
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();
        this.createParticleSystem();
        
        try {
            await this.loadSchema();
            this.createTables();
            this.createRelationships();
            this.positionTables();
            document.getElementById('loading').style.display = 'none';
        } catch (error) {
            console.error('Error loading schema:', error);
            document.getElementById('loading').innerHTML = '<div class="text-center"><p class="text-red-400">Error loading database schema</p></div>';
        }
        
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 30);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point lights for ambiance
        const pointLight1 = new THREE.PointLight(0x3b82f6, 0.5, 100);
        pointLight1.position.set(-30, 20, 30);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x10b981, 0.5, 100);
        pointLight2.position.set(30, 20, -30);
        this.scene.add(pointLight2);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 100;
        this.controls.minDistance = 5;
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('dblclick', (event) => this.onMouseDoubleClick(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // UI buttons
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());
        document.getElementById('toggle-relations').addEventListener('click', () => this.toggleRelations());
        document.getElementById('toggle-particles').addEventListener('click', () => this.toggleParticles());
        document.getElementById('cancel-edit').addEventListener('click', () => this.closeEditModal());
        document.getElementById('save-edit').addEventListener('click', () => this.saveTableEdit());
    }

    createParticleSystem() {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;
            
            // Random colors (blue-ish theme)
            colors[i3] = 0.2 + Math.random() * 0.3;
            colors[i3 + 1] = 0.4 + Math.random() * 0.4;
            colors[i3 + 2] = 0.8 + Math.random() * 0.2;
            
            // Random sizes
            sizes[i] = Math.random() * 2 + 0.5;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 1,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(particles, particleMaterial);
        this.particles = particles;
        this.scene.add(this.particleSystem);
    }

    async loadSchema() {
        const response = await fetch('/api/schema');
        const data = await response.json();
        this.tables = data.tables;
        this.relationships = data.relationships;
    }

    createTextTexture(text, fontSize = 64, color = '#ffffff', backgroundColor = 'transparent') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 512;
        canvas.height = 128;
        
        // Set font and measure text
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Clear canvas
        if (backgroundColor !== 'transparent') {
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Draw text
        context.fillStyle = color;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }

    createTables() {
        const tableNames = Object.keys(this.tables);
        const colors = [
            0x3b82f6, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6,
            0x06b6d4, 0x84cc16, 0xf97316, 0xec4899, 0x6366f1
        ];

        tableNames.forEach((tableName, index) => {
            const table = this.tables[tableName];
            const color = colors[index % colors.length];
            
            // Create table group
            const tableGroup = new THREE.Group();
            tableGroup.userData = { type: 'table', tableName: tableName };
            
            // Table header
            const headerGeometry = new THREE.BoxGeometry(8, 1.5, 0.2);
            const headerMaterial = new THREE.MeshLambertMaterial({ color: color });
            const header = new THREE.Mesh(headerGeometry, headerMaterial);
            header.position.y = table.fields.length * 0.4;
            header.castShadow = true;
            header.receiveShadow = true;
            tableGroup.add(header);
            
            // Table name text
            const tableNameTexture = this.createTextTexture(tableName, 48, '#ffffff');
            const tableNameGeometry = new THREE.PlaneGeometry(7, 1);
            const tableNameMaterial = new THREE.MeshBasicMaterial({ 
                map: tableNameTexture,
                transparent: true,
                alphaTest: 0.1
            });
            const tableNamePlane = new THREE.Mesh(tableNameGeometry, tableNameMaterial);
            tableNamePlane.position.set(0, table.fields.length * 0.4, 0.11);
            tableNamePlane.userData = { type: 'table', tableName: tableName };
            tableGroup.add(tableNamePlane);
            
            // Create fields
            table.fields.forEach((field, fieldIndex) => {
                const fieldGeometry = new THREE.BoxGeometry(8, 0.6, 0.15);
                const fieldColor = field.is_primary ? 0xffd700 : 0xe5e7eb;
                const fieldMaterial = new THREE.MeshLambertMaterial({ color: fieldColor });
                const fieldMesh = new THREE.Mesh(fieldGeometry, fieldMaterial);
                
                const yPosition = (table.fields.length - fieldIndex - 1) * 0.4 - 0.5;
                fieldMesh.position.y = yPosition;
                fieldMesh.castShadow = true;
                fieldMesh.receiveShadow = true;
                fieldMesh.userData = { type: 'field', fieldName: field.name, tableName: tableName };
                
                tableGroup.add(fieldMesh);
                
                // Field name text
                const fieldTextColor = field.is_primary ? '#000000' : '#333333';
                const fieldNameTexture = this.createTextTexture(field.name, 32, fieldTextColor);
                const fieldNameGeometry = new THREE.PlaneGeometry(7, 0.5);
                const fieldNameMaterial = new THREE.MeshBasicMaterial({ 
                    map: fieldNameTexture,
                    transparent: true,
                    alphaTest: 0.1
                });
                const fieldNamePlane = new THREE.Mesh(fieldNameGeometry, fieldNameMaterial);
                fieldNamePlane.position.set(0, yPosition, 0.08);
                fieldNamePlane.userData = { type: 'field', fieldName: field.name, tableName: tableName };
                tableGroup.add(fieldNamePlane);
                
                // Field type text (smaller)
                const fieldTypeTexture = this.createTextTexture(field.type, 24, '#666666');
                const fieldTypeGeometry = new THREE.PlaneGeometry(6, 0.3);
                const fieldTypeMaterial = new THREE.MeshBasicMaterial({ 
                    map: fieldTypeTexture,
                    transparent: true,
                    alphaTest: 0.1
                });
                const fieldTypePlane = new THREE.Mesh(fieldTypeGeometry, fieldTypeMaterial);
                fieldTypePlane.position.set(0, yPosition - 0.15, 0.08);
                fieldTypePlane.userData = { type: 'field', fieldName: field.name, tableName: tableName };
                tableGroup.add(fieldTypePlane);
            });
            
            this.tableObjects[tableName] = tableGroup;
            this.scene.add(tableGroup);
        });
    }

    createRelationships() {
        this.relationships.forEach(relationship => {
            const fromTable = this.tableObjects[relationship.from_table];
            const toTable = this.tableObjects[relationship.to_table];
            
            if (fromTable && toTable) {
                const points = [
                    fromTable.position.clone(),
                    toTable.position.clone()
                ];
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ 
                    color: 0x64748b, 
                    transparent: true, 
                    opacity: 0.6 
                });
                const line = new THREE.Line(geometry, material);
                line.userData = { type: 'relationship', relationship: relationship };
                
                this.relationshipLines.push(line);
                this.scene.add(line);
            }
        });
    }

    positionTables() {
        const tableNames = Object.keys(this.tableObjects);
        const radius = 25;
        const angleStep = (Math.PI * 2) / tableNames.length;
        
        tableNames.forEach((tableName, index) => {
            const angle = index * angleStep;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 10;
            
            this.tableObjects[tableName].position.set(x, y, z);
        });
        
        // Update relationship lines
        this.updateRelationshipLines();
    }

    updateRelationshipLines() {
        this.relationshipLines.forEach(line => {
            const relationship = line.userData.relationship;
            const fromTable = this.tableObjects[relationship.from_table];
            const toTable = this.tableObjects[relationship.to_table];
            
            if (fromTable && toTable) {
                const points = [
                    fromTable.position.clone(),
                    toTable.position.clone()
                ];
                line.geometry.setFromPoints(points);
            }
        });
    }

    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const allObjects = [];
        Object.values(this.tableObjects).forEach(table => {
            table.traverse(child => {
                if (child.isMesh) allObjects.push(child);
            });
        });
        
        const intersects = this.raycaster.intersectObjects(allObjects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const tableName = clickedObject.userData.tableName;
            
            if (tableName) {
                this.selectTable(tableName);
            }
        }
    }

    onMouseDoubleClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const allObjects = [];
        Object.values(this.tableObjects).forEach(table => {
            table.traverse(child => {
                if (child.isMesh) allObjects.push(child);
            });
        });
        
        const intersects = this.raycaster.intersectObjects(allObjects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const tableName = clickedObject.userData.tableName;
            
            if (tableName) {
                this.openEditModal(tableName);
            }
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const allObjects = [];
        Object.values(this.tableObjects).forEach(table => {
            table.traverse(child => {
                if (child.isMesh) allObjects.push(child);
            });
        });
        
        const intersects = this.raycaster.intersectObjects(allObjects);
        
        // Change cursor on hover
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    selectTable(tableName) {
        // Reset previous selection
        if (this.selectedTable) {
            this.tableObjects[this.selectedTable].traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.emissive.setHex(0x000000);
                }
            });
        }
        
        // Highlight new selection
        this.selectedTable = tableName;
        this.tableObjects[tableName].traverse(child => {
            if (child.isMesh && child.material) {
                child.material.emissive.setHex(0x444444);
            }
        });
        
        // Update info panel
        this.updateTableInfo(tableName);
    }

    updateTableInfo(tableName) {
        const table = this.tables[tableName];
        const infoDiv = document.getElementById('table-info');
        
        let html = `
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-blue-300 mb-2">${tableName}</h3>
                <div class="space-y-1">
        `;
        
        table.fields.forEach(field => {
            const isPrimary = field.is_primary ? ' (PK)' : '';
            const textColor = field.is_primary ? 'text-yellow-300' : 'text-gray-300';
            html += `
                <div class="field-item p-2 rounded ${textColor}">
                    <span class="font-medium">${field.name}</span>${isPrimary}
                    <div class="text-xs text-gray-400">${field.type}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        // Show relationships
        const relatedTables = this.relationships.filter(rel => 
            rel.from_table === tableName || rel.to_table === tableName
        );
        
        if (relatedTables.length > 0) {
            html += `
                <div class="mt-4">
                    <h4 class="text-md font-semibold text-green-300 mb-2">Relationships</h4>
                    <div class="space-y-1 text-sm">
            `;
            
            relatedTables.forEach(rel => {
                if (rel.from_table === tableName) {
                    html += `<div class="text-gray-300">→ ${rel.to_table}.${rel.to_field}</div>`;
                } else {
                    html += `<div class="text-gray-300">← ${rel.from_table}.${rel.from_field}</div>`;
                }
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        infoDiv.innerHTML = html;
    }

    openEditModal(tableName) {
        const table = this.tables[tableName];
        const modal = document.getElementById('edit-modal');
        const content = document.getElementById('edit-content');
        
        let html = `
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-300 mb-2">Table Name</label>
                <input type="text" id="edit-table-name" value="${tableName}" 
                       class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-300 mb-2">Fields</label>
                <div id="edit-fields" class="space-y-2 max-h-48 overflow-y-auto">
        `;
        
        table.fields.forEach((field, index) => {
            html += `
                <div class="flex space-x-2 items-center">
                    <input type="text" value="${field.name}" 
                           class="flex-1 p-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                           data-field-index="${index}" data-field-prop="name">
                    <input type="text" value="${field.type}" 
                           class="flex-1 p-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                           data-field-index="${index}" data-field-prop="type">
                    <label class="flex items-center">
                        <input type="checkbox" ${field.is_primary ? 'checked' : ''} 
                               class="mr-1" data-field-index="${index}" data-field-prop="is_primary">
                        <span class="text-xs text-gray-400">PK</span>
                    </label>
                </div>
            `;
        });
        
        html += `
                </div>
                <button id="add-field" class="mt-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">
                    Add Field
                </button>
            </div>
        `;
        
        content.innerHTML = html;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Add field button functionality
        document.getElementById('add-field').addEventListener('click', () => {
            const fieldsDiv = document.getElementById('edit-fields');
            const newIndex = table.fields.length;
            const newFieldHtml = `
                <div class="flex space-x-2 items-center">
                    <input type="text" value="new_field" 
                           class="flex-1 p-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                           data-field-index="${newIndex}" data-field-prop="name">
                    <input type="text" value="VARCHAR(255)" 
                           class="flex-1 p-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                           data-field-index="${newIndex}" data-field-prop="type">
                    <label class="flex items-center">
                        <input type="checkbox" class="mr-1" data-field-index="${newIndex}" data-field-prop="is_primary">
                        <span class="text-xs text-gray-400">PK</span>
                    </label>
                </div>
            `;
            fieldsDiv.insertAdjacentHTML('beforeend', newFieldHtml);
        });
    }

    closeEditModal() {
        const modal = document.getElementById('edit-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    async saveTableEdit() {
        // In a real implementation, this would save to the database
        // For now, we'll just close the modal
        console.log('Saving table edits...');
        this.closeEditModal();
    }

    resetView() {
        this.camera.position.set(0, 20, 30);
        this.controls.reset();
    }

    toggleRelations() {
        this.showRelations = !this.showRelations;
        this.relationshipLines.forEach(line => {
            line.visible = this.showRelations;
        });
    }

    toggleParticles() {
        this.showParticles = !this.showParticles;
        this.particleSystem.visible = this.showParticles;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Animate particles
        if (this.particles && this.showParticles) {
            const positions = this.particles.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
                positions[i] += Math.cos(Date.now() * 0.0005 + i) * 0.005;
            }
            this.particles.attributes.position.needsUpdate = true;
        }
        
        // Rotate particle system
        if (this.particleSystem && this.showParticles) {
            this.particleSystem.rotation.y += 0.001;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DatabaseVisualizer();
});