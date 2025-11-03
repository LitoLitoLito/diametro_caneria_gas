// Variables globales SIGAS
let tramos = [];
let tramoActual = null;
let accesoriosSugeridos = [];
let consumosActuales = [];
let longitudesData = [];
let accesoriosData = [];

function inicializarSigas(container) {
    console.log('🚀 Inicializando aplicación SIGAS');
    
    container.innerHTML = `
        <div class="sigas-app">
            <div class="sigas-header">
                <h1>Calculadora de Diámetros - Polietileno SIGAS</h1>
                <p>Sistema para cálculo de diámetros de cañerías de gas natural por termofusión</p>
            </div>

            <div class="step-indicator">
                <div class="step-item active" id="step1-indicator">
                    <div class="step-number">1</div>
                    <div class="step-title">Tramos</div>
                </div>
                <div class="step-item" id="step2-indicator">
                    <div class="step-number">2</div>
                    <div class="step-title">Accesorios</div>
                </div>
                <div class="step-item" id="step3-indicator">
                    <div class="step-number">3</div>
                    <div class="step-title">Resultados</div>
                </div>
            </div>
            
            <!-- Paso 1: Ingreso de tramos -->
            <div class="step" id="step1">
                <div class="card">
                    <div class="card-header">Ingreso de Tramos</div>
                    
                    <div class="form-group">
                        <label for="tramo-nombre">Nombre del Tramo</label>
                        <input type="text" id="tramo-nombre" placeholder="Ej: Cocina, Calefón, etc.">
                    </div>
                    
                    <div class="form-group">
                        <label for="tramo-longitud">Longitud Real (metros)</label>
                        <input type="number" id="tramo-longitud" min="0" step="0.01" placeholder="Ej: 5.5">
                    </div>
                    
                    <div class="form-group">
                        <label for="tramo-consumo">Consumo (Kcal/h)</label>
                        <input type="number" id="tramo-consumo" min="0" step="0.01" placeholder="Ej: 23000">
                        <small style="color: #666; font-size: 0.9rem;">Se convertirá automáticamente a m³/h (÷ 9300)</small>
                    </div>
                    
                    <div class="btn-group">
                        <button id="agregar-consumo">Agregar Consumo</button>
                        <button id="finalizar-tramo" class="secondary">Finalizar Tramo</button>
                    </div>
                </div>
                
                <div class="card" id="consumos-actuales-card">
                    <div class="card-header">Consumos del Tramo Actual</div>
                    <div id="consumos-actuales-lista"></div>
                    <div class="consumo-total" id="consumo-total">Consumo Total: 0 Kcal/h</div>
                </div>
                
                <div class="card" id="tramos-lista-card">
                    <div class="card-header">Tramos Ingresados</div>
                    <div id="tramos-lista"></div>
                    
                    <div class="btn-group">
                        <button id="continuar-accesorios" class="secondary">Continuar a Accesorios</button>
                        <button id="limpiar-tramos" class="danger">Limpiar Todos</button>
                    </div>
                </div>
            </div>
            
            <!-- Paso 2: Ingreso de accesorios -->
            <div class="step hidden" id="step2">
                <div class="card">
                    <div class="card-header">Selección de Tramo para Agregar Accesorios</div>
                    
                    <div class="form-group">
                        <label for="tramo-seleccionado">Seleccionar Tramo</label>
                        <select id="tramo-seleccionado"></select>
                    </div>
                    
                    <div class="form-group">
                        <label for="accesorio-busqueda">Buscar Accesorio</label>
                        <input type="text" id="accesorio-busqueda" placeholder="Escriba las primeras letras del accesorio">
                        <div class="autocomplete">
                            <div class="autocomplete-items" id="accesorio-sugerencias"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="cantidad-accesorio">Cantidad</label>
                        <input type="number" id="cantidad-accesorio" min="1" value="1" placeholder="Cantidad de accesorios">
                    </div>
                    
                    <div class="btn-group">
                        <button id="agregar-accesorio">Agregar Accesorio</button>
                        <button id="duplicar-accesorios" class="secondary">Duplicar Accesorios de Otro Tramo</button>
                    </div>
                </div>
                
                <div class="card" id="accesorios-lista-card">
                    <div class="card-header">Accesorios del Tramo Seleccionado</div>
                    <div id="accesorios-lista"></div>
                    
                    <div class="btn-group">
                        <button id="calcular-tramos" class="secondary">Calcular Todos los Tramos</button>
                        <button id="volver-tramos" class="danger">Volver a Tramos</button>
                    </div>
                </div>
            </div>
            
            <!-- Paso 3: Resultados -->
            <div class="step hidden" id="step3">
                <div class="card">
                    <div class="card-header">Resultados Finales</div>
                    
                    <div class="results-table">
                        <table id="resultados-tabla">
                            <thead>
                                <tr>
                                    <th>Tramo</th>
                                    <th>Long. Real (m)</th>
                                    <th>Consumo</th>
                                    <th>Diam. Predim. (mm)</th>
                                    <th>Long. Cálculo (m)</th>
                                    <th>Long. Adoptada (m)</th>
                                    <th>Cons. Adoptado (m³/h)</th>
                                    <th>Diam. Final (mm)</th>
                                </tr>
                            </thead>
                            <tbody id="resultados-cuerpo">
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="btn-group">
                        <button id="imprimir-pdf" class="print-btn">Imprimir PDF</button>
                        <button id="nuevo-calculo" class="secondary">Nuevo Cálculo</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inicializar la aplicación SIGAS
    inicializarSigasApp();
}

function inicializarSigasApp() {
    // Elementos DOM
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step1Indicator = document.getElementById('step1-indicator');
    const step2Indicator = document.getElementById('step2-indicator');
    const step3Indicator = document.getElementById('step3-indicator');

    const tramoNombre = document.getElementById('tramo-nombre');
    const tramoLongitud = document.getElementById('tramo-longitud');
    const tramoConsumo = document.getElementById('tramo-consumo');
    const agregarConsumoBtn = document.getElementById('agregar-consumo');
    const finalizarTramoBtn = document.getElementById('finalizar-tramo');
    const consumosActualesLista = document.getElementById('consumos-actuales-lista');
    const consumoTotalDiv = document.getElementById('consumo-total');
    const consumosActualesCard = document.getElementById('consumos-actuales-card');
    const tramosLista = document.getElementById('tramos-lista');
    const tramosListaCard = document.getElementById('tramos-lista-card');
    const continuarAccesoriosBtn = document.getElementById('continuar-accesorios');
    const limpiarTramosBtn = document.getElementById('limpiar-tramos');

    const tramoSeleccionado = document.getElementById('tramo-seleccionado');
    const accesorioBusqueda = document.getElementById('accesorio-busqueda');
    const accesorioSugerencias = document.getElementById('accesorio-sugerencias');
    const cantidadAccesorio = document.getElementById('cantidad-accesorio');
    const agregarAccesorioBtn = document.getElementById('agregar-accesorio');
    const duplicarAccesoriosBtn = document.getElementById('duplicar-accesorios');
    const accesoriosLista = document.getElementById('accesorios-lista');
    const calcularTramosBtn = document.getElementById('calcular-tramos');
    const volverTramosBtn = document.getElementById('volver-tramos');

    const resultadosCuerpo = document.getElementById('resultados-cuerpo');
    const imprimirPdfBtn = document.getElementById('imprimir-pdf');
    const nuevoCalculoBtn = document.getElementById('nuevo-calculo');

    // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
    function normalizarTexto(texto) {
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    // Función para convertir Kcal/h a m³/h
    function convertirKcalAm3(kcal) {
        return kcal / 9300;
    }

    // Cargar datos JSON
    async function cargarDatos() {
        try {
            // Cargar longitudes.json
            const responseLongitudes = await fetch('data/longitudes.json');
            longitudesData = await responseLongitudes.json();
            
            // Cargar accesorios.json
            const responseAccesorios = await fetch('data/accesorios.json');
            accesoriosData = await responseAccesorios.json();
            
            console.log('Datos cargados correctamente');
            console.log('Longitudes:', longitudesData.length);
            console.log('Accesorios:', accesoriosData.accesorios.length);
        } catch (error) {
            console.error('Error cargando los datos:', error);
            alert('Error al cargar los datos necesarios. Verifique que los archivos JSON estén en la raíz del proyecto.');
        }
    }

    // Funciones de utilidad
    function mostrarPaso(paso) {
        step1.classList.add('hidden');
        step2.classList.add('hidden');
        step3.classList.add('hidden');
        
        step1Indicator.classList.remove('active', 'completed');
        step2Indicator.classList.remove('active', 'completed');
        step3Indicator.classList.remove('active', 'completed');
        
        if (paso === 1) {
            step1.classList.remove('hidden');
            step1Indicator.classList.add('active');
        } else if (paso === 2) {
            step2.classList.remove('hidden');
            step1Indicator.classList.add('completed');
            step2Indicator.classList.add('active');
        } else if (paso === 3) {
            step3.classList.remove('hidden');
            step1Indicator.classList.add('completed');
            step2Indicator.classList.add('completed');
            step3Indicator.classList.add('active');
        }
    }

    function calcularDiametroPredimensionado(longitud, consumo) {
        // Buscar la longitud en longitudesData
        let longitudAdoptada = null;
        for (let i = 0; i < longitudesData.length; i++) {
            if (longitudesData[i].longitud >= longitud) {
                longitudAdoptada = longitudesData[i];
                break;
            }
        }
        
        // Si no se encuentra, usar el último valor
        if (!longitudAdoptada) {
            longitudAdoptada = longitudesData[longitudesData.length - 1];
        }
        
        // Buscar el consumo en las columnas
        let diametro = null;
        const diametros = ["20", "25", "32", "40", "50", "63", "75", "90", "110"];
        
        for (let i = 0; i < diametros.length; i++) {
            const diam = diametros[i];
            if (longitudAdoptada[diam] >= consumo) {
                diametro = diam;
                break;
            }
        }
        
        // Si no se encuentra, usar el último valor
        if (!diametro) {
            diametro = diametros[diametros.length - 1];
        }
        
        return {
            diametroPredimensionado: diametro,
            longitudAdoptada: longitudAdoptada.longitud,
            consumoAdoptado: longitudAdoptada[diametro]
        };
    }

    function calcularDiametroFinal(longitudCalculo, consumo) {
        // Buscar la longitud en longitudesData
        let longitudAdoptada = null;
        for (let i = 0; i < longitudesData.length; i++) {
            if (longitudesData[i].longitud >= longitudCalculo) {
                longitudAdoptada = longitudesData[i];
                break;
            }
        }
        
        // Si no se encuentra, usar el último valor
        if (!longitudAdoptada) {
            longitudAdoptada = longitudesData[longitudesData.length - 1];
        }
        
        // Buscar el consumo en las columnas
        let diametro = null;
        const diametros = ["20", "25", "32", "40", "50", "63", "75", "90", "110"];
        
        for (let i = 0; i < diametros.length; i++) {
            const diam = diametros[i];
            if (longitudAdoptada[diam] >= consumo) {
                diametro = diam;
                break;
            }
        }
        
        // Si no se encuentra, usar el último valor
        if (!diametro) {
            diametro = diametros[diametros.length - 1];
        }
        
        return {
            diametroFinal: diametro,
            longitudAdoptadaFinal: longitudAdoptada.longitud,
            consumoAdoptadoFinal: longitudAdoptada[diametro]
        };
    }

    function actualizarConsumosActuales() {
        consumosActualesLista.innerHTML = '';
        
        if (consumosActuales.length === 0) {
            consumosActualesCard.classList.add('hidden');
            return;
        }
        
        consumosActualesCard.classList.remove('hidden');
        
        consumosActuales.forEach((consumoKcal, index) => {
            const consumoDiv = document.createElement('div');
            consumoDiv.className = 'consumo-item';
            
            const consumoM3 = convertirKcalAm3(consumoKcal);
            
            consumoDiv.innerHTML = `
                <div>
                    <strong>Consumo:</strong> ${consumoKcal} Kcal/h 
                    <br><small>→ ${consumoM3.toFixed(4)} m³/h</small>
                </div>
                <div>
                    <button class="danger" onclick="eliminarConsumo(${index})">Eliminar</button>
                </div>
            `;
            
            consumosActualesLista.appendChild(consumoDiv);
        });
        
        // Actualizar consumo total
        const totalKcal = consumosActuales.reduce((sum, consumo) => sum + consumo, 0);
        const totalM3 = convertirKcalAm3(totalKcal);
        consumoTotalDiv.innerHTML = `
            <strong>Consumo Total:</strong> ${totalKcal.toFixed(2)} Kcal/h 
            <br><small>→ ${totalM3.toFixed(4)} m³/h</small>
        `;
    }

    function actualizarTramosLista() {
        tramosLista.innerHTML = '';
        
        if (tramos.length === 0) {
            tramosListaCard.classList.add('hidden');
            return;
        }
        
        tramosListaCard.classList.remove('hidden');
        
        tramos.forEach((tramo, index) => {
            const tramoDiv = document.createElement('div');
            tramoDiv.className = 'tramo-item';
            
            const consumoTotalKcal = tramo.consumos.reduce((sum, consumo) => sum + consumo, 0);
            const consumoTotalM3 = convertirKcalAm3(consumoTotalKcal);
            
            // Calcular el diámetro predimensionado para mostrar en la lista (usa m³/h)
            const predimensionado = calcularDiametroPredimensionado(tramo.longitud, consumoTotalM3);
            
            tramoDiv.innerHTML = `
                <h3>${tramo.nombre}</h3>
                <p><strong>Longitud:</strong> ${tramo.longitud} m</p>
                <p><strong>Consumo total:</strong> ${consumoTotalKcal.toFixed(2)} Kcal/h 
                   <br><small>→ ${consumoTotalM3.toFixed(4)} m³/h</small>
                </p>
                <p><strong>Diámetro predimensionado:</strong> ${predimensionado.diametroPredimensionado} mm</p>
                <p><strong>Accesorios:</strong> ${tramo.accesorios.length} tipos, ${tramo.accesorios.reduce((sum, acc) => sum + acc.cantidad, 0)} unidades</p>
                <button class="danger" onclick="eliminarTramo(${index})">Eliminar</button>
            `;
            
            tramosLista.appendChild(tramoDiv);
        });
    }

    function actualizarTramoSeleccionado() {
        tramoSeleccionado.innerHTML = '';
        
        tramos.forEach((tramo, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = tramo.nombre;
            tramoSeleccionado.appendChild(option);
        });
        
        if (tramos.length > 0) {
            tramoActual = 0;
            actualizarAccesoriosLista();
        }
    }

    function actualizarAccesoriosLista() {
        accesoriosLista.innerHTML = '';
        
        if (tramoActual === null || !tramos[tramoActual]) {
            return;
        }
        
        const tramo = tramos[tramoActual];
        
        if (tramo.accesorios.length === 0) {
            accesoriosLista.innerHTML = '<p>No se han agregado accesorios para este tramo.</p>';
            return;
        }
        
        tramo.accesorios.forEach((accesorio, index) => {
            const accesorioDiv = document.createElement('div');
            accesorioDiv.className = 'accesorio-item';
            
            const perdidaTotal = accesorio.perdida_carga * accesorio.cantidad;
            
            accesorioDiv.innerHTML = `
                <div>
                    <strong>${accesorio.tipo}</strong> - ${accesorio.diametro}
                    <br><small>Cantidad: ${accesorio.cantidad}</small>
                </div>
                <div>
                    <span>${perdidaTotal.toFixed(3)} m (${accesorio.perdida_carga} m × ${accesorio.cantidad})</span>
                    <button class="danger" onclick="eliminarAccesorio(${index})">Eliminar</button>
                </div>
            `;
            
            accesoriosLista.appendChild(accesorioDiv);
        });
    }

    function buscarAccesorios(termino) {
        if (!termino) {
            accesorioSugerencias.innerHTML = '';
            accesoriosSugeridos = [];
            return;
        }
        
        const terminoNormalizado = normalizarTexto(termino);
        
        const resultados = accesoriosData.accesorios.filter(accesorio => {
            const tipoNormalizado = normalizarTexto(accesorio.tipo);
            const diametroNormalizado = normalizarTexto(accesorio.diametro);
            
            return tipoNormalizado.includes(terminoNormalizado) || 
                   diametroNormalizado.includes(terminoNormalizado);
        });
        
        accesoriosSugeridos = resultados;
        
        accesorioSugerencias.innerHTML = '';
        
        if (resultados.length === 0) {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.textContent = 'No se encontraron accesorios';
            accesorioSugerencias.appendChild(div);
            return;
        }
        
        resultados.forEach((accesorio, index) => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.textContent = `${accesorio.tipo} - ${accesorio.diametro} (${accesorio.perdida_carga} m)`;
            div.addEventListener('click', () => {
                accesorioBusqueda.value = `${accesorio.tipo} - ${accesorio.diametro}`;
                accesorioSugerencias.innerHTML = '';
                accesoriosSugeridos = [accesorio];
                cantidadAccesorio.value = 1;
                cantidadAccesorio.focus();
            });
            
            accesorioSugerencias.appendChild(div);
        });
    }

    // Función para duplicar accesorios de otro tramo
        // Función para duplicar accesorios de otro tramo - CORREGIDA
        // Función para duplicar accesorios de otro tramo - CORREGIDA
    function duplicarAccesorios() {
        if (tramos.length < 2) {
            alert('Necesita al menos 2 tramos para poder duplicar accesorios.');
            return;
        }
        
        if (tramoActual === null) {
            alert('Por favor, seleccione un tramo primero.');
            return;
        }
        
        // Crear un modal para seleccionar el tramo a duplicar
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 10px; width: 90%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #2c3e50;">Duplicar Accesorios</h3>
                    <span class="close-modal" style="cursor: pointer; font-size: 24px; color: #7f8c8d;">&times;</span>
                </div>
                <div style="margin-bottom: 20px;">
                    <div class="form-group">
                        <label for="tramo-origen" style="display: block; margin-bottom: 8px; font-weight: 600;">Seleccionar tramo del cual copiar accesorios:</label>
                        <select id="tramo-origen" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
                            ${tramos.map((tramo, index) => 
                                index !== tramoActual ? `<option value="${index}">${tramo.nombre}</option>` : ''
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 8px; margin-top: 15px;">
                            <input type="checkbox" id="reemplazar-accesorios" checked>
                            Reemplazar accesorios existentes en el tramo actual
                        </label>
                    </div>
                    <p style="margin-top: 15px; color: #666; font-size: 0.9rem;">
                        Se copiarán todos los accesorios del tramo seleccionado al tramo actual: <strong>${tramos[tramoActual].nombre}</strong>
                    </p>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="confirmar-duplicacion" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">Duplicar Accesorios</button>
                    <button id="cancelar-duplicacion" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Función para cerrar el modal
        const cerrarModal = () => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        };
        
        // Event listeners para el modal
        modal.querySelector('.close-modal').addEventListener('click', cerrarModal);
        modal.querySelector('#cancelar-duplicacion').addEventListener('click', cerrarModal);
        
        modal.querySelector('#confirmar-duplicacion').addEventListener('click', () => {
            const tramoOrigenIndex = parseInt(modal.querySelector('#tramo-origen').value);
            const reemplazar = modal.querySelector('#reemplazar-accesorios').checked;
            
            const tramoOrigen = tramos[tramoOrigenIndex];
            const tramoDestino = tramos[tramoActual];
            
            if (reemplazar) {
                // Reemplazar todos los accesorios
                tramoDestino.accesorios = tramoOrigen.accesorios.map(accesorio => ({
                    ...accesorio,
                    // Crear una copia profunda para evitar referencias
                    tipo: accesorio.tipo,
                    diametro: accesorio.diametro,
                    perdida_carga: accesorio.perdida_carga,
                    cantidad: accesorio.cantidad
                }));
            } else {
                // Agregar accesorios sin reemplazar
                tramoOrigen.accesorios.forEach(accesorio => {
                    // Verificar si ya existe un accesorio igual para evitar duplicados exactos
                    const existe = tramoDestino.accesorios.some(acc => 
                        acc.tipo === accesorio.tipo && 
                        acc.diametro === accesorio.diametro && 
                        acc.perdida_carga === accesorio.perdida_carga
                    );
                    
                    if (!existe) {
                        tramoDestino.accesorios.push({
                            tipo: accesorio.tipo,
                            diametro: accesorio.diametro,
                            perdida_carga: accesorio.perdida_carga,
                            cantidad: accesorio.cantidad
                        });
                    }
                });
            }
            
            // Actualizar la lista de accesorios
            actualizarAccesoriosLista();
            
            // Cerrar el modal
            cerrarModal();
            
            // Mostrar mensaje de éxito
            alert(`✅ Accesorios del tramo "${tramoOrigen.nombre}" copiados correctamente al tramo "${tramoDestino.nombre}".`);
        });

        // Cerrar modal al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        });

        // Prevenir que el clic dentro del contenido cierre el modal
        modal.querySelector('div').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    function calcularTodosLosTramos() {
        tramos.forEach(tramo => {
            // Calcular consumo total en Kcal/h y convertir a m³/h
            const consumoTotalKcal = tramo.consumos.reduce((sum, consumo) => sum + consumo, 0);
            const consumoTotalM3 = convertirKcalAm3(consumoTotalKcal);
            
            // Calcular predimensionado (usa m³/h)
            const predimensionado = calcularDiametroPredimensionado(tramo.longitud, consumoTotalM3);
            tramo.diametroPredimensionado = predimensionado.diametroPredimensionado;
            tramo.longitudAdoptadaPred = predimensionado.longitudAdoptada;
            tramo.consumoAdoptadoPred = predimensionado.consumoAdoptado;
            
            // Calcular longitud de cálculo (longitud real + suma de accesorios multiplicados por cantidad)
            const longitudAccesorios = tramo.accesorios.reduce((sum, accesorio) => 
                sum + (accesorio.perdida_carga * accesorio.cantidad), 0);
            tramo.longitudCalculo = tramo.longitud + longitudAccesorios;
            
            // Calcular diámetro final (usa m³/h)
            const final = calcularDiametroFinal(tramo.longitudCalculo, consumoTotalM3);
            tramo.diametroFinal = final.diametroFinal;
            tramo.longitudAdoptadaFinal = final.longitudAdoptadaFinal;
            tramo.consumoAdoptadoFinal = final.consumoAdoptadoFinal;
            
            // Guardar también los consumos en ambas unidades para el reporte
            tramo.consumoTotalKcal = consumoTotalKcal;
            tramo.consumoTotalM3 = consumoTotalM3;
        });
        
        mostrarResultados();
        mostrarPaso(3);
    }

    function mostrarResultados() {
        resultadosCuerpo.innerHTML = '';
        
        tramos.forEach(tramo => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${tramo.nombre}</td>
                <td>${tramo.longitud}</td>
                <td>${tramo.consumoTotalKcal.toFixed(2)} Kcal/h<br>
                    <small>→ ${tramo.consumoTotalM3.toFixed(4)} m³/h</small>
                </td>
                <td>${tramo.diametroPredimensionado}</td>
                <td>${tramo.longitudCalculo.toFixed(2)}</td>
                <td>${tramo.longitudAdoptadaFinal}</td>
                <td>${tramo.consumoAdoptadoFinal.toFixed(4)}</td>
                <td>${tramo.diametroFinal}</td>
            `;
            
            resultadosCuerpo.appendChild(fila);
        });
    }

    // Función para generar el contenido del PDF
    function generarContenidoPDF() {
        let contenido = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Cálculo de Cañerías - SIGAS</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #000; text-align: center; margin-bottom: 30px; }
                    h2 { color: #333; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-top: 30px; }
                    h3 { color: #555; margin-top: 25px; }
                    h4 { color: #666; margin-top: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #3498db; color: #fff; font-weight: bold; }
                    .tramo-section { margin-bottom: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                    .resumen-tramo { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .page-break { page-break-after: always; }
                    tfoot td { font-weight: bold; background-color: #f9f9f9; }
                    small { font-size: 0.9em; color: #666; }
                    .conversion { background-color: #f0f8ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
                    @media print {
                        body { margin: 0; font-size: 12px; }
                        .no-print { display: none; }
                        .tramo-section { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1>Reporte de Cálculo de Diámetros de Cañerías</h1>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Total de tramos:</strong> ${tramos.length}</p>
                <div class="conversion">
                    <strong>Factor de conversión utilizado:</strong> 1 m³/h = 9300 Kcal/h
                    <br><strong>Fórmula:</strong> m³/h = Kcal/h ÷ 9300
                </div>
        `;

        // Tabla resumen de resultados
        contenido += `
            <h2>Resumen de Resultados</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tramo</th>
                        <th>Long. Real (m)</th>
                        <th>Consumo</th>
                        <th>Diam. Predim. (mm)</th>
                        <th>Long. Cálculo (m)</th>
                        <th>Long. Adoptada (m)</th>
                        <th>Cons. Adoptado (m³/h)</th>
                        <th>Diam. Final (mm)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        tramos.forEach(tramo => {
            contenido += `
                <tr>
                    <td>${tramo.nombre}</td>
                    <td>${tramo.longitud}</td>
                    <td>${tramo.consumoTotalKcal.toFixed(2)} Kcal/h<br>
                        <small>→ ${tramo.consumoTotalM3.toFixed(4)} m³/h</small>
                    </td>
                    <td>${tramo.diametroPredimensionado}</td>
                    <td>${tramo.longitudCalculo.toFixed(2)}</td>
                    <td>${tramo.longitudAdoptadaFinal}</td>
                    <td>${tramo.consumoAdoptadoFinal.toFixed(4)}</td>
                    <td>${tramo.diametroFinal}</td>
                </tr>
            `;
        });

        contenido += `
                </tbody>
            </table>
        `;

        // Detalle por tramo
        contenido += `<h2>Detalle por Tramo</h2>`;

        tramos.forEach((tramo, index) => {
            const totalAccesorios = tramo.accesorios.reduce((sum, acc) => sum + acc.cantidad, 0);
            const longitudAccesorios = tramo.accesorios.reduce((sum, acc) => sum + (acc.perdida_carga * acc.cantidad), 0);

            contenido += `
                <div class="tramo-section">
                    <h3>Tramo: ${tramo.nombre}</h3>
                    <div class="resumen-tramo">
                        <p><strong>Longitud Real:</strong> ${tramo.longitud} m</p>
                        <p><strong>Consumo Total:</strong> ${tramo.consumoTotalKcal.toFixed(2)} Kcal/h 
                           <small>→ ${tramo.consumoTotalM3.toFixed(4)} m³/h</small>
                        </p>
                        <p><strong>Diámetro Predimensionado:</strong> ${tramo.diametroPredimensionado} mm</p>
                        <p><strong>Longitud de Cálculo:</strong> ${tramo.longitudCalculo.toFixed(2)} m</p>
                        <p><strong>Diámetro Final:</strong> ${tramo.diametroFinal} mm</p>
                    </div>
            `;

            // Detalle de consumos
            if (tramo.consumos.length > 0) {
                contenido += `
                    <h4>Consumos del Tramo</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Consumo (Kcal/h)</th>
                                <th>Conversión a m³/h</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                tramo.consumos.forEach((consumoKcal, i) => {
                    const consumoM3 = convertirKcalAm3(consumoKcal);
                    contenido += `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${consumoKcal} Kcal/h</td>
                            <td>${consumoKcal} ÷ 9300 = ${consumoM3.toFixed(4)} m³/h</td>
                        </tr>
                    `;
                });

                // Fila de total
                const totalKcal = tramo.consumos.reduce((sum, consumo) => sum + consumo, 0);
                const totalM3 = convertirKcalAm3(totalKcal);
                contenido += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="text-align: right; font-weight: bold;">Total:</td>
                                <td style="font-weight: bold;">${totalKcal.toFixed(2)} ÷ 9300 = ${totalM3.toFixed(4)} m³/h</td>
                            </tr>
                        </tfoot>
                    </table>
                `;
            }

            // Detalle de accesorios
            if (tramo.accesorios.length > 0) {
                contenido += `
                    <h4>Accesorios del Tramo (Total: ${totalAccesorios})</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Diámetro</th>
                                <th>Cantidad</th>
                                <th>Pérdida Individual (m)</th>
                                <th>Pérdida Total (m)</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                tramo.accesorios.forEach((accesorio, i) => {
                    const perdidaTotal = accesorio.perdida_carga * accesorio.cantidad;
                    contenido += `
                        <tr>
                            <td>${accesorio.tipo}</td>
                            <td>${accesorio.diametro}</td>
                            <td>${accesorio.cantidad}</td>
                            <td>${accesorio.perdida_carga} m</td>
                            <td>${perdidaTotal.toFixed(3)} m</td>
                        </tr>
                    `;
                });

                contenido += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align: right;">Longitud equivalente total de accesorios:</td>
                                <td>${longitudAccesorios.toFixed(3)} m</td>
                            </tr>
                            <tr>
                                <td colspan="4" style="text-align: right;">Longitud real del tramo:</td>
                                <td>${tramo.longitud} m</td>
                            </tr>
                            <tr>
                                <td colspan="4" style="text-align: right;">Longitud de cálculo (real + accesorios):</td>
                                <td>${tramo.longitudCalculo.toFixed(2)} m</td>
                            </tr>
                        </tfoot>
                    </table>
                `;
            } else {
                contenido += `<p><em>No se han agregado accesorios para este tramo.</em></p>`;
            }

            contenido += `</div>`;

            if ((index + 1) % 2 === 0 && index !== tramos.length - 1) {
                contenido += `<div class="page-break"></div>`;
            }
        });

        contenido += `
            </body>
            </html>
        `;

        return contenido;
    }

    // Función para imprimir PDF mejorado
    function imprimirPDF() {
        const contenido = generarContenidoPDF();
        
        const ventana = window.open('', '_blank');
        ventana.document.write(contenido);
        ventana.document.close();
        
        // Esperar a que se cargue el contenido antes de imprimir
        ventana.onload = function() {
            ventana.print();
        };
    }

    function eliminarConsumo(index) {
        consumosActuales.splice(index, 1);
        actualizarConsumosActuales();
    }

    function eliminarTramo(index) {
        tramos.splice(index, 1);
        actualizarTramosLista();
        actualizarTramoSeleccionado();
    }

    function eliminarAccesorio(index) {
        if (tramoActual !== null && tramos[tramoActual]) {
            tramos[tramoActual].accesorios.splice(index, 1);
            actualizarAccesoriosLista();
        }
    }

    function limpiarTodo() {
        tramos = [];
        tramoActual = null;
        consumosActuales = [];
        tramoNombre.value = '';
        tramoLongitud.value = '';
        tramoConsumo.value = '';
        accesorioBusqueda.value = '';
        cantidadAccesorio.value = '1';
        accesorioSugerencias.innerHTML = '';
        actualizarConsumosActuales();
        actualizarTramosLista();
        actualizarTramoSeleccionado();
    }

    // Event Listeners
    agregarConsumoBtn.addEventListener('click', () => {
        const consumoKcal = parseFloat(tramoConsumo.value);
        
        if (isNaN(consumoKcal) || consumoKcal <= 0) {
            alert('Por favor, ingrese un valor de consumo válido en Kcal/h.');
            return;
        }
        
        consumosActuales.push(consumoKcal);
        tramoConsumo.value = '';
        
        actualizarConsumosActuales();
    });

    finalizarTramoBtn.addEventListener('click', () => {
        const nombre = tramoNombre.value.trim();
        const longitud = parseFloat(tramoLongitud.value);
        
        if (!nombre || isNaN(longitud) || longitud <= 0) {
            alert('Por favor, complete el nombre y la longitud del tramo correctamente.');
            return;
        }
        
        if (consumosActuales.length === 0) {
            alert('Debe agregar al menos un consumo para este tramo.');
            return;
        }
        
        const tramo = {
            nombre,
            longitud,
            consumos: [...consumosActuales],
            accesorios: []
        };
        
        tramos.push(tramo);
        
        // Limpiar campos para el siguiente tramo
        tramoNombre.value = '';
        tramoLongitud.value = '';
        tramoConsumo.value = '';
        consumosActuales = [];
        
        actualizarConsumosActuales();
        actualizarTramosLista();
        actualizarTramoSeleccionado();
    });

    continuarAccesoriosBtn.addEventListener('click', () => {
        if (tramos.length === 0) {
            alert('Debe agregar al menos un tramo antes de continuar.');
            return;
        }
        
        mostrarPaso(2);
    });

    limpiarTramosBtn.addEventListener('click', () => {
        if (confirm('¿Está seguro de que desea eliminar todos los tramos?')) {
            limpiarTodo();
        }
    });

    tramoSeleccionado.addEventListener('change', () => {
        tramoActual = parseInt(tramoSeleccionado.value);
        actualizarAccesoriosLista();
    });

    accesorioBusqueda.addEventListener('input', () => {
        buscarAccesorios(accesorioBusqueda.value);
    });

    agregarAccesorioBtn.addEventListener('click', () => {
        if (tramoActual === null || accesoriosSugeridos.length === 0) {
            alert('Por favor, seleccione un accesorio de la lista.');
            return;
        }
        
        const cantidad = parseInt(cantidadAccesorio.value);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert('Por favor, ingrese una cantidad válida (mayor que 0).');
            return;
        }
        
        const accesorio = {
            ...accesoriosSugeridos[0],
            cantidad: cantidad
        };
        
        tramos[tramoActual].accesorios.push(accesorio);
        
        accesorioBusqueda.value = '';
        cantidadAccesorio.value = '1';
        accesorioSugerencias.innerHTML = '';
        accesoriosSugeridos = [];
        
        actualizarAccesoriosLista();
    });

    // Event listener para el nuevo botón de duplicar accesorios
    duplicarAccesoriosBtn.addEventListener('click', () => {
        duplicarAccesorios();
    });

    calcularTramosBtn.addEventListener('click', () => {
        calcularTodosLosTramos();
    });

    volverTramosBtn.addEventListener('click', () => {
        mostrarPaso(1);
    });

    imprimirPdfBtn.addEventListener('click', () => {
        imprimirPDF();
    });

    nuevoCalculoBtn.addEventListener('click', () => {
        if (confirm('¿Está seguro de que desea comenzar un nuevo cálculo? Se perderán todos los datos actuales.')) {
            limpiarTodo();
            mostrarPaso(1);
        }
    });

    // INICIALIZACIÓN INMEDIATA - CORREGIDA
    cargarDatos().then(() => {
        mostrarPaso(1);
        actualizarConsumosActuales();
        actualizarTramosLista();
    });

    // Hacer funciones globales para los eventos onclick
    window.eliminarConsumo = eliminarConsumo;
    window.eliminarTramo = eliminarTramo;
    window.eliminarAccesorio = eliminarAccesorio;

    console.log('✅ Aplicación SIGAS inicializada');
}