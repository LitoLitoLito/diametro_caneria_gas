// Variables globales para materiales
let materiales = [];
let editIndex = null;
let accesoriosData = [];
let sugerenciasActivas = [];

function inicializarMateriales(container) {
    console.log('🚀 Inicializando aplicación de Materiales');
    
    container.innerHTML = `
        <div class="materiales-app">
            <div class="materiales-header">
                <h1>Listado de Materiales y Presupuesto</h1>
                <p>Gestión completa de materiales y cálculo de presupuesto</p>
            </div>

            <!-- Formulario para agregar/editar materiales -->
            <div class="form-section-materiales">
                <h2>${editIndex === null ? 'Agregar Material' : 'Editar Material'}</h2>
                <div class="form-grid">
                    <div class="form-group-materiales">
                        <label for="material-descripcion">Descripción</label>
                        <input type="text" id="material-descripcion" placeholder="Escriba para buscar accesorios o ingrese uno personalizado">
                        <div class="autocomplete-materiales">
                            <div class="autocomplete-items-materiales" id="sugerencias-descripcion"></div>
                        </div>
                    </div>
                    <div class="form-group-materiales">
                        <label for="material-cantidad">Cantidad</label>
                        <input type="number" id="material-cantidad" min="1" value="1" placeholder="0">
                    </div>
                    <div class="form-group-materiales">
                        <label for="material-precio">Precio Unitario ($)</label>
                        <input type="number" id="material-precio" min="0" step="0.01" placeholder="0.00">
                    </div>
                </div>
                <div class="btn-group-materiales">
                    <button id="btn-agregar-material" class="btn-materiales btn-primary-materiales">
                        ${editIndex === null ? 'Agregar Material' : 'Actualizar Material'}
                    </button>
                    ${editIndex !== null ? `
                        <button id="btn-cancelar-edicion" class="btn-materiales btn-danger-materiales">
                            Cancelar Edición
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Lista de materiales -->
            <div class="table-container">
                <h2>Listado de Materiales</h2>
                <div id="lista-materiales-container">
                    ${materiales.length === 0 ? `
                        <div class="empty-state">
                            <p>No hay materiales agregados. Comienza agregando el primer material.</p>
                        </div>
                    ` : `
                        <table class="materiales-table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Importe</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-materiales-body">
                                <!-- Los materiales se cargarán aquí dinámicamente -->
                            </tbody>
                        </table>
                    `}
                </div>

                <!-- Total -->
                <div class="total-section">
                    <h3>TOTAL PRESUPUESTO</h3>
                    <p class="total-amount" id="total-presupuesto">$0.00</p>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="print-section">
                <button id="btn-imprimir-pdf" class="btn-print">Imprimir PDF</button>
                <button id="btn-limpiar-lista" class="btn-materiales btn-danger-materiales" style="margin-left: 15px;">
                    Limpiar Lista
                </button>
            </div>
        </div>
    `;

    // Inicializar la aplicación
    inicializarMaterialesApp();
}

function inicializarMaterialesApp() {
    // Elementos DOM
    const descripcionInput = document.getElementById('material-descripcion');
    const cantidadInput = document.getElementById('material-cantidad');
    const precioInput = document.getElementById('material-precio');
    const btnAgregar = document.getElementById('btn-agregar-material');
    const btnCancelar = document.getElementById('btn-cancelar-edicion');
    const btnImprimir = document.getElementById('btn-imprimir-pdf');
    const btnLimpiar = document.getElementById('btn-limpiar-lista');
    const sugerenciasDiv = document.getElementById('sugerencias-descripcion');

    // Cargar materiales desde localStorage si existen
    cargarMaterialesDesdeStorage();

    // Cargar datos de accesorios
    cargarDatosAccesorios().then(() => {
        console.log('✅ Datos de accesorios cargados:', accesoriosData.length);
    });

    // Actualizar la tabla inicialmente
    actualizarTablaMateriales();

    // Event Listeners
    btnAgregar.addEventListener('click', agregarOActualizarMaterial);
    
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarEdicion);
    }

    btnImprimir.addEventListener('click', generarPDF);
    btnLimpiar.addEventListener('click', limpiarLista);

    // Autocompletado para descripción
    descripcionInput.addEventListener('input', () => {
        buscarSugerencias(descripcionInput.value);
    });

    // Manejar selección con teclado
    descripcionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (sugerenciasActivas.length > 0) {
                // Seleccionar la primera sugerencia
                seleccionarSugerencia(sugerenciasActivas[0]);
                e.preventDefault();
            } else {
                agregarOActualizarMaterial();
            }
        } else if (e.key === 'Escape') {
            ocultarSugerencias();
        }
    });

    // Permitir agregar con Enter en otros campos
    cantidadInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') agregarOActualizarMaterial();
    });
    precioInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') agregarOActualizarMaterial();
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!descripcionInput.contains(e.target) && !sugerenciasDiv.contains(e.target)) {
            ocultarSugerencias();
        }
    });

    console.log('✅ Aplicación de Materiales inicializada');
}

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

// Cargar datos de accesorios desde el JSON
async function cargarDatosAccesorios() {
    try {
        const response = await fetch('data/accesorios.json');
        if (!response.ok) throw new Error('No se pudo cargar accesorios.json');
        const data = await response.json();
        accesoriosData = data.accesorios || [];
        console.log('📦 Accesorios cargados:', accesoriosData.length);
    } catch (error) {
        console.error('❌ Error cargando accesorios:', error);
        // Si hay error, usar lista básica de accesorios comunes
        accesoriosData = [
            { tipo: "Codo 45°", diametro: "20 mm" },
            { tipo: "Codo 90°", diametro: "20 mm" },
            { tipo: "Codo 90°", diametro: "25 mm" },
            { tipo: "Curva", diametro: "20 mm" },
            { tipo: "Te flujo a través", diametro: "20 mm" },
            { tipo: "Te flujo a 90°", diametro: "20 mm" },
            { tipo: "Válvula globo", diametro: "20 mm" },
            { tipo: "Válvula esclusa", diametro: "20 mm" },
            { tipo: "Válvula Macho", diametro: "20 mm" },
            { tipo: "Reducción", diametro: "20 mm" },
            { tipo: "Tubo Polietileno", diametro: "20 mm" },
            { tipo: "Tubo Polietileno", diametro: "25 mm" },
            { tipo: "Tubo Polietileno", diametro: "32 mm" },
            { tipo: "Tubo Hierro", diametro: "1/2\"" },
            { tipo: "Tubo Hierro", diametro: "3/4\"" },
            { tipo: "Tubo Hierro", diametro: "1\"" }
        ];
    }
}

// Buscar sugerencias de accesorios
function buscarSugerencias(termino) {
    const sugerenciasDiv = document.getElementById('sugerencias-descripcion');
    
    if (!termino || termino.length < 2) {
        ocultarSugerencias();
        return;
    }

    const terminoNormalizado = normalizarTexto(termino);
    
    // Buscar en accesorios
    const resultados = accesoriosData.filter(accesorio => {
        const tipoNormalizado = normalizarTexto(accesorio.tipo);
        const diametroNormalizado = normalizarTexto(accesorio.diametro);
        const descripcionCompleta = `${accesorio.tipo} ${accesorio.diametro}`;
        const descripcionNormalizada = normalizarTexto(descripcionCompleta);
        
        return tipoNormalizado.includes(terminoNormalizado) || 
               diametroNormalizado.includes(terminoNormalizado) ||
               descripcionNormalizada.includes(terminoNormalizado);
    });

    // Limitar resultados a 8 sugerencias
    const resultadosLimitados = resultados.slice(0, 8);
    sugerenciasActivas = resultadosLimitados;

    mostrarSugerencias(resultadosLimitados, termino);
}

// Mostrar sugerencias en el dropdown
function mostrarSugerencias(resultados, terminoBusqueda) {
    const sugerenciasDiv = document.getElementById('sugerencias-descripcion');
    
    if (resultados.length === 0) {
        // Mostrar opción "Otros" cuando no hay resultados
        sugerenciasDiv.innerHTML = `
            <div class="sugerencia-item" onclick="seleccionarSugerenciaPersonalizada()">
                <strong>"${terminoBusqueda}"</strong> - Agregar como descripción personalizada
            </div>
        `;
    } else {
        sugerenciasDiv.innerHTML = resultados.map(accesorio => `
            <div class="sugerencia-item" onclick="seleccionarSugerencia(${JSON.stringify(accesorio).replace(/"/g, '&quot;')})">
                <strong>${accesorio.tipo}</strong> - ${accesorio.diametro}
            </div>
        `).join('');

        // Agregar opción "Otros" al final
        sugerenciasDiv.innerHTML += `
            <div class="sugerencia-item sugerencia-otros" onclick="seleccionarSugerenciaPersonalizada()">
                <strong>"${terminoBusqueda}"</strong> - Agregar como descripción personalizada
            </div>
        `;
    }
    
    sugerenciasDiv.style.display = 'block';
}

// Ocultar sugerencias
function ocultarSugerencias() {
    const sugerenciasDiv = document.getElementById('sugerencias-descripcion');
    sugerenciasDiv.style.display = 'none';
    sugerenciasActivas = [];
}

// Seleccionar una sugerencia de accesorio
function seleccionarSugerencia(accesorio) {
    const descripcionInput = document.getElementById('material-descripcion');
    
    // Convertir string JSON a objeto si es necesario
    const accesorioObj = typeof accesorio === 'string' ? JSON.parse(accesorio) : accesorio;
    
    descripcionInput.value = `${accesorioObj.tipo} - ${accesorioObj.diametro}`;
    ocultarSugerencias();
    
    // Enfocar el campo de cantidad
    document.getElementById('material-cantidad').focus();
}

// Seleccionar descripción personalizada
function seleccionarSugerenciaPersonalizada() {
    const descripcionInput = document.getElementById('material-descripcion');
    // Mantener el texto que ya estaba escrito
    ocultarSugerencias();
    descripcionInput.focus();
}

// Resto de las funciones permanecen igual...
function cargarMaterialesDesdeStorage() {
    const guardados = localStorage.getItem('materialesCalculadora');
    if (guardados) {
        materiales = JSON.parse(guardados);
    }
}

function guardarMaterialesEnStorage() {
    localStorage.setItem('materialesCalculadora', JSON.stringify(materiales));
}

function agregarOActualizarMaterial() {
    const descripcion = document.getElementById('material-descripcion').value.trim();
    const cantidad = parseInt(document.getElementById('material-cantidad').value);
    const precio = parseFloat(document.getElementById('material-precio').value);

    // Validaciones
    if (!descripcion) {
        alert('Por favor, ingrese una descripción del material.');
        return;
    }
    if (isNaN(cantidad) || cantidad <= 0) {
        alert('Por favor, ingrese una cantidad válida (mayor que 0).');
        return;
    }
    if (isNaN(precio) || precio < 0) {
        alert('Por favor, ingrese un precio unitario válido.');
        return;
    }

    const importe = cantidad * precio;

    if (editIndex === null) {
        // Agregar nuevo material
        materiales.push({
            descripcion,
            cantidad,
            precio,
            importe
        });
    } else {
        // Actualizar material existente
        materiales[editIndex] = {
            descripcion,
            cantidad,
            precio,
            importe
        };
        editIndex = null;
    }

    // Limpiar formulario
    document.getElementById('material-descripcion').value = '';
    document.getElementById('material-cantidad').value = '1';
    document.getElementById('material-precio').value = '';

    // Actualizar interfaz
    actualizarTablaMateriales();
    guardarMaterialesEnStorage();

    // Recargar la aplicación para actualizar el botón de edición
    if (editIndex === null) {
        const container = document.getElementById('current-app');
        inicializarMateriales(container);
    }
}

function cancelarEdicion() {
    editIndex = null;
    const container = document.getElementById('current-app');
    inicializarMateriales(container);
}

function editarMaterial(index) {
    const material = materiales[index];
    editIndex = index;

    document.getElementById('material-descripcion').value = material.descripcion;
    document.getElementById('material-cantidad').value = material.cantidad;
    document.getElementById('material-precio').value = material.precio;

    // Recargar la aplicación para mostrar botón de cancelar
    const container = document.getElementById('current-app');
    inicializarMateriales(container);

    // Hacer scroll al formulario
    document.getElementById('material-descripcion').focus();
}

function eliminarMaterial(index) {
    if (confirm('¿Está seguro de que desea eliminar este material?')) {
        materiales.splice(index, 1);
        actualizarTablaMateriales();
        guardarMaterialesEnStorage();

        // Si estábamos editando este material, cancelar edición
        if (editIndex === index) {
            editIndex = null;
            const container = document.getElementById('current-app');
            inicializarMateriales(container);
        }
    }
}

function actualizarTablaMateriales() {
    const tbody = document.getElementById('tabla-materiales-body');
    const totalElement = document.getElementById('total-presupuesto');
    
    if (!tbody) return;

    let total = 0;
    
    if (materiales.length === 0) {
        document.getElementById('lista-materiales-container').innerHTML = `
            <div class="empty-state">
                <p>No hay materiales agregados. Comienza agregando el primer material.</p>
            </div>
        `;
        totalElement.textContent = '$0.00';
        return;
    }

    tbody.innerHTML = materiales.map((material, index) => {
        total += material.importe;
        return `
            <tr>
                <td>${material.descripcion}</td>
                <td>${material.cantidad}</td>
                <td>$${material.precio.toFixed(2)}</td>
                <td>$${material.importe.toFixed(2)}</td>
                <td class="actions-cell">
                    <button class="btn-action btn-edit" onclick="editarMaterial(${index})">Editar</button>
                    <button class="btn-action btn-delete" onclick="eliminarMaterial(${index})">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');

    totalElement.textContent = `$${total.toFixed(2)}`;
}

function limpiarLista() {
    if (materiales.length === 0) {
        alert('La lista ya está vacía.');
        return;
    }

    if (confirm('¿Está seguro de que desea eliminar todos los materiales? Esta acción no se puede deshacer.')) {
        materiales = [];
        editIndex = null;
        guardarMaterialesEnStorage();
        
        const container = document.getElementById('current-app');
        inicializarMateriales(container);
    }
}

function generarPDF() {
    if (materiales.length === 0) {
        alert('No hay materiales para generar el PDF.');
        return;
    }

    const total = materiales.reduce((sum, material) => sum + material.importe, 0);
    
    const contenido = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Listado de Materiales - Presupuesto</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px;
                    color: #333;
                }
                h1 { 
                    color: #8e44ad; 
                    text-align: center; 
                    margin-bottom: 30px;
                    border-bottom: 3px solid #9b59b6;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #2c3e50;
                    margin-top: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th {
                    background-color: #9b59b6;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: bold;
                }
                td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #ddd;
                }
                tr:hover {
                    background-color: #f5f5f5;
                }
                .total-section {
                    background-color: #2ecc71;
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-top: 30px;
                    text-align: center;
                }
                .total-amount {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .header-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>LISTADO DE MATERIALES - PRESUPUESTO</h1>
            
            <div class="header-info">
                <div>
                    <strong>Fecha:</strong> ${new Date().toLocaleDateString()}
                </div>
                <div>
                    <strong>Total de ítems:</strong> ${materiales.length}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Importe</th>
                    </tr>
                </thead>
                <tbody>
                    ${materiales.map(material => `
                        <tr>
                            <td>${material.descripcion}</td>
                            <td>${material.cantidad}</td>
                            <td>$${material.precio.toFixed(2)}</td>
                            <td>$${material.importe.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-section">
                <h2>TOTAL PRESUPUESTO</h2>
                <div class="total-amount">$${total.toFixed(2)}</div>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 12px;">
                Generado el ${new Date().toLocaleString()} - Calculadora de Materiales
            </div>
        </body>
        </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
    
    ventana.onload = function() {
        ventana.print();
    };
}

// Hacer funciones globales para los eventos onclick
window.editarMaterial = editarMaterial;
window.eliminarMaterial = eliminarMaterial;
window.seleccionarSugerencia = seleccionarSugerencia;
window.seleccionarSugerenciaPersonalizada = seleccionarSugerenciaPersonalizada;