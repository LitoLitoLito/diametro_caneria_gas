class CalculadoraUnificada {
    constructor() {
        this.currentApp = null;
        this.appsCargadas = {
            sigas: false,
            hierro: false,
            materiales: false // NUEVA LÍNEA
        };
        this.init();
    }

    init() {
        this.configurarMenuMobile();
        this.configurarScrollHeader();
        this.mostrarMenuPrincipal();
        console.log('✅ Calculadora Unificada inicializada');
    }

    configurarMenuMobile() {
        const menuToggle = document.getElementById('menu-toggle');
        const navbar = document.getElementById('navbar');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navbar.classList.toggle('active');
            });

            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target) && !menuToggle.contains(e.target)) {
                    navbar.classList.remove('active');
                }
            });
        }
    }

    configurarScrollHeader() {
        const header = document.getElementById('main-header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('shrink');
            } else {
                header.classList.remove('shrink');
            }
            lastScrollY = window.scrollY;
        });
    }

    mostrarMenuPrincipal() {
        document.getElementById('main-menu').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
        this.currentApp = null;
        this.restaurarTituloOriginal();
        
        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async cargarApp(tipo) {
        console.log(`🔄 Cargando aplicación: ${tipo}`);
        
        // Mostrar loading
        this.mostrarLoading();

        try {
            // Ocultar menú principal
            document.getElementById('main-menu').style.display = 'none';
            
            // Mostrar contenedor de app
            const appContainer = document.getElementById('app-container');
            appContainer.style.display = 'block';
            
            // Cerrar menú móvil si está abierto
            document.getElementById('navbar').classList.remove('active');
            
            // Cargar recursos específicos si no están cargados
            if (!this.appsCargadas[tipo]) {
                await this.cargarRecursos(tipo);
            }
            
            // Ejecutar la app específica
            this.ejecutarApp(tipo);
            
            // Scroll al inicio del contenedor
            appContainer.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('❌ Error cargando aplicación:', error);
            this.mostrarError(`Error al cargar la aplicación: ${error.message}`);
        } finally {
            this.ocultarLoading();
        }
    }

    mostrarLoading() {
        // Podrías agregar un spinner aquí si quieres
        console.log('⏳ Cargando...');
    }

    ocultarLoading() {
        console.log('✅ Carga completada');
    }

    mostrarError(mensaje) {
        const appContainer = document.getElementById('current-app');
        appContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <h3>❌ Error</h3>
                <p>${mensaje}</p>
                <button onclick="app.volverAlMenu()" class="btn-primary" style="margin-top: 20px;">
                    Volver al Menú Principal
                </button>
            </div>
        `;
    }

    async cargarRecursos(tipo) {
        console.log(`📦 Cargando recursos para: ${tipo}`);
        
        const recursos = {
            sigas: ['styles/sigas.css', 'js/sigas.js'],
            hierro: ['styles/hierro.css', 'js/hierro.js'],
            materiales: ['styles/materiales.css', 'js/materiales.js'] // NUEVA LÍNEA
        };

        for (const recurso of recursos[tipo]) {
            if (recurso.endsWith('.css')) {
                await this.cargarCSS(recurso);
            } else if (recurso.endsWith('.js')) {
                await this.cargarJS(recurso);
            }
        }

        console.log(`✅ Recursos de ${tipo} cargados correctamente`);
        this.appsCargadas[tipo] = true;
    }

    cargarCSS(url) {
        return new Promise((resolve, reject) => {
            // Evitar duplicados
            if (document.querySelector(`link[href="${url}"]`)) {
                console.log(`📁 CSS ya cargado: ${url}`);
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = () => {
                console.log(`✅ CSS cargado: ${url}`);
                resolve();
            };
            link.onerror = () => {
                console.error(`❌ Error cargando CSS: ${url}`);
                reject(new Error(`No se pudo cargar el CSS: ${url}`));
            };
            document.head.appendChild(link);
        });
    }

    cargarJS(url) {
        return new Promise((resolve, reject) => {
            // Evitar duplicados
            if (document.querySelector(`script[src="${url}"]`)) {
                console.log(`📁 JS ya cargado: ${url}`);
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                console.log(`✅ JS cargado: ${url}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`❌ Error cargando JS: ${url}`);
                reject(new Error(`No se pudo cargar el JS: ${url}`));
            };
            document.body.appendChild(script);
        });
    }

    ejecutarApp(tipo) {
        const appContainer = document.getElementById('current-app');
        
        // Limpiar contenedor
        appContainer.innerHTML = '<div style="padding: 20px; text-align: center;">🔄 Inicializando aplicación...</div>';
        
        // Cambiar título del header
        this.actualizarTituloHeader(tipo);
        
        // Ejecutar la función de inicialización específica - SIN setTimeout
        const funcionInicializacion = `inicializar${this.capitalize(tipo)}`;
        if (typeof window[funcionInicializacion] === 'function') {
            console.log(`🚀 Ejecutando: ${funcionInicializacion}`);
            window[funcionInicializacion](appContainer);
        } else {
            this.mostrarError(`Función de inicialización no encontrada: ${funcionInicializacion}`);
        }
        
        this.currentApp = tipo;
    }

    actualizarTituloHeader(tipo) {
        const titulos = {
            'sigas': 'Polietileno SIGAS',
            'hierro': 'Hierro Negro con Recubrimiento Epoxi',
            'materiales': 'Listado de Materiales y Presupuesto' // NUEVA LÍNEA
        };
        
        const logoH1 = document.querySelector('.logo h1');
        if (logoH1 && titulos[tipo]) {
            logoH1.textContent = `Calculadora - ${titulos[tipo]}`;
        }
    }

    restaurarTituloOriginal() {
        const logoH1 = document.querySelector('.logo h1');
        if (logoH1) {
            logoH1.textContent = 'Calculadora de Diámetros de Cañerías';
        }
    }

    volverAlMenu() {
        console.log('🏠 Volviendo al menú principal');
        
        // Limpiar estilos específicos de apps
        this.limpiarEstilosEspecificos();
        
        // Restaurar título original
        this.restaurarTituloOriginal();
        
        this.mostrarMenuPrincipal();
    }

    limpiarEstilosEspecificos() {
        // Remover estilos CSS específicos
        const estilosEspecificos = document.querySelectorAll('link[href*="sigas.css"], link[href*="hierro.css"]');
        estilosEspecificos.forEach(link => link.remove());
        
        // Resetear flags de carga
        this.appsCargadas.sigas = false;
        this.appsCargadas.hierro = false;
        this.appsCargadas.materiales = false; // NUEVA LÍNEA
    }

    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CalculadoraUnificada();
});

// Funciones globales para los botones (compatibilidad)
function cargarApp(tipo) {
    if (window.app) {
        window.app.cargarApp(tipo);
    }
}

function volverAlMenu() {
    if (window.app) {
        window.app.volverAlMenu();
    }
}