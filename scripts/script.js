// --- BASE DE DATOS INICIAL ---
const PRODUCTOS_DEFAULT = [
    { id: 1, nombre: "Chorizo Santarrosano", descripcion: "El clásico. 100% cerdo seleccionado.", precio: 5000, img: "https://images.unsplash.com/photo-1595480205065-21739444a438?q=80&w=500" },
    { id: 2, nombre: "Chorizo Picante", descripcion: "Con chiles ahumados y especias.", precio: 6000, img: "https://images.unsplash.com/photo-1573689705887-bc0763c82eaa?q=80&w=500" },
    { id: 3, nombre: "Picada Familiar", descripcion: "Para 4 personas. Chorizo, papa y arepa.", precio: 25000, img: "https://images.unsplash.com/photo-1514516872020-436ed3617d3c?q=80&w=500" },
    { id: 4, nombre: "Choripán Clásico", descripcion: "En baguette artesanal con chimichurri.", precio: 12000, img: "https://images.unsplash.com/photo-1625938145744-e38051539643?q=80&w=500" },
    { id: 5, nombre: "Arepa con Queso", descripcion: "Doble queso mozzarella fundido.", precio: 3000, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=500" },
    { id: 6, nombre: "Gaseosa 400ml", descripcion: "Coca-Cola, Manzana o Colombiana.", precio: 3500, img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500" }
];

// --- ESTADO GLOBAL ---
let carrito = [];
let esDomicilio = false;
const COSTO_DOMICILIO = 5000;
let confirmCallback = null; // Para el modal de confirmación
let productoEditandoId = null; // Para saber si estamos editando o creando

// --- INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    inicializarProductos(); // Cargar productos al inicio
    renderizarProductos();
    if(window.lucide) lucide.createIcons();
    
    document.getElementById('admin-pass-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') verificarPassword();
    });
});

// --- GESTIÓN DE DATOS (PRODUCTOS) ---
function inicializarProductos() {
    const almacenados = localStorage.getItem('productos_db');
    if (!almacenados) {
        localStorage.setItem('productos_db', JSON.stringify(PRODUCTOS_DEFAULT));
    }
}

function obtenerProductos() {
    return JSON.parse(localStorage.getItem('productos_db') || "[]");
}

function guardarProductosDB(productos) {
    localStorage.setItem('productos_db', JSON.stringify(productos));
    renderizarProductos(); // Actualizar vista cliente
}

function formatoDinero(valor) {
    return '$ ' + parseFloat(valor).toLocaleString('es-CO');
}

// --- UI CLIENTE ---
function renderizarProductos() {
    const productos = obtenerProductos();
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = productos.map(p => `
        <div class="card">
            <div class="card-img-wrapper">
                <img src="${p.img}" alt="${p.nombre}" class="card-img" 
                onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'">
                <div class="price-badge">${formatoDinero(p.precio)}</div>
            </div>
            <div class="card-body">
                <h4 class="card-title">${p.nombre}</h4>
                <p class="card-desc">${p.descripcion}</p>
                <button onclick="agregar(${p.id})" class="btn-add">
                    <i data-lucide="plus"></i> Agregar
                </button>
            </div>
        </div>
    `).join('');
    if(window.lucide) lucide.createIcons();
}

// --- CARRITO ---
function agregar(id) {
    const productos = obtenerProductos();
    const prod = productos.find(p => p.id === id);
    const item = carrito.find(i => i.id === id);
    
    if(item) item.cantidad++;
    else carrito.push({ ...prod, cantidad: 1 });
    
    actualizarCarritoUI();
    mostrarNotificacion("Producto agregado al carrito");
}

function eliminar(id) {
    carrito = carrito.filter(i => i.id !== id);
    actualizarCarritoUI();
}

function actualizarCant(id, delta) {
    const item = carrito.find(i => i.id === id);
    if(item) {
        item.cantidad += delta;
        if(item.cantidad <= 0) eliminar(id);
        else actualizarCarritoUI();
    }
}

function actualizarCarritoUI() {
    const lista = document.getElementById('lista-carrito');
    const footer = document.getElementById('footer-carrito');
    const burbuja = document.getElementById('burbuja-carrito');
    
    const totalItems = carrito.reduce((acc, el) => acc + el.cantidad, 0);
    burbuja.innerText = totalItems;
    burbuja.classList.toggle('hidden', totalItems === 0);

    if(carrito.length === 0) {
        lista.innerHTML = `
            <div style="text-align:center; padding: 40px 20px; color:#a8a29e;">
                <i data-lucide="shopping-bag" size="48" style="margin-bottom:10px; opacity:0.5;"></i>
                <p>Tu canasta está vacía.</p>
                <button onclick="cerrarCarrito()" style="margin-top:10px; border:none; background:none; color:var(--primary); font-weight:bold; cursor:pointer;">Ver Menú</button>
            </div>`;
        footer.classList.add('hidden');
    } else {
        lista.innerHTML = carrito.map(item => `
            <div class="cart-item">
                <img src="${item.img}" class="cart-img" onerror="this.src='https://via.placeholder.com/60?text=Img'">
                <div class="cart-details">
                    <h4>${item.nombre}</h4>
                    <p class="cart-price">${formatoDinero(item.precio)}</p>
                    <div class="cart-actions">
                        <button class="qty-btn" onclick="actualizarCant(${item.id}, -1)">-</button>
                        <span style="font-weight:bold; font-size:0.9rem; width:20px; text-align:center;">${item.cantidad}</span>
                        <button class="qty-btn" onclick="actualizarCant(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold; margin-bottom:5px;">${formatoDinero(item.cantidad * item.precio)}</div>
                    <button onclick="eliminar(${item.id})" style="border:none; background:none; color:#ef4444; cursor:pointer;"><i data-lucide="trash-2" width="16"></i></button>
                </div>
            </div>
        `).join('');
        footer.classList.remove('hidden');
    }
    if(window.lucide) lucide.createIcons();
    calcularTotales();
}

// --- PAGO ---
function cambiarEntrega(tipo) {
    esDomicilio = (tipo === 'domicilio');
    document.getElementById('btn-domicilio').classList.toggle('active', esDomicilio);
    document.getElementById('btn-recoger').classList.toggle('active', !esDomicilio);
    
    const inputDir = document.getElementById('campo-direccion');
    if(esDomicilio) {
        inputDir.classList.remove('hidden');
        document.getElementById('fila-domicilio').classList.remove('hidden');
    } else {
        inputDir.classList.add('hidden');
        document.getElementById('fila-domicilio').classList.add('hidden');
    }
    calcularTotales();
}

function calcularTotales() {
    const subtotal = carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
    const total = subtotal + (esDomicilio ? COSTO_DOMICILIO : 0);
    
    document.getElementById('txt-subtotal').innerText = formatoDinero(subtotal);
    document.getElementById('txt-total').innerText = formatoDinero(total);
    return { subtotal, total };
}

function finalizarPedido() {
    const nombre = document.getElementById('input-nombre').value;
    const dir = document.getElementById('input-direccion').value;
    
    if(!nombre) return mostrarAlerta("Por favor, indícanos tu nombre.");
    if(esDomicilio && !dir) return mostrarAlerta("Necesitamos la dirección para el domicilio.");
    
    const { total } = calcularTotales();
    const pedido = {
        id: Date.now(),
        cliente: nombre,
        direccion: esDomicilio ? dir : "Recoge en Local",
        tipo: esDomicilio ? "Domicilio" : "Recoger",
        items: [...carrito],
        total: total,
        fecha: new Date().toLocaleString(),
        estado: 'Pendiente'
    };
    
    const historial = JSON.parse(localStorage.getItem('pedidos_db') || "[]");
    historial.push(pedido);
    localStorage.setItem('pedidos_db', JSON.stringify(historial));
    
    mostrarRecibo(pedido);
    
    carrito = [];
    document.getElementById('input-nombre').value = "";
    actualizarCarritoUI();
    cerrarCarrito();
}

function mostrarRecibo(pedido) {
    const contenido = document.getElementById('contenido-recibo');
    contenido.innerHTML = `
        <div style="text-align:center; margin-bottom:20px; border-bottom:1px dashed #ccc; padding-bottom:10px;">
            <h4 style="font-size:1.2rem; margin-bottom:5px;">${pedido.cliente}</h4>
            <p style="color:#666; font-size:0.9rem;">${pedido.fecha}</p>
        </div>
        <div style="margin-bottom:20px;">
            ${pedido.items.map(i => `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.95rem;">
                    <span>${i.cantidad} x ${i.nombre}</span>
                    <span>${formatoDinero(i.precio * i.cantidad)}</span>
                </div>
            `).join('')}
             ${pedido.tipo === 'Domicilio' ? `<div style="display:flex; justify-content:space-between; color:#ea580c;"><span>Envío</span><span>${formatoDinero(5000)}</span></div>` : ''}
        </div>
        <div style="text-align:right; font-size:1.5rem; font-weight:800; color:#1c1917;">
            ${formatoDinero(pedido.total)}
        </div>
    `;
    document.getElementById('modal-recibo').classList.remove('hidden');
}

// --- ADMIN ---
function abrirLoginAdmin() {
    document.getElementById('modal-login').classList.remove('hidden');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('admin-pass-input').value = '';
    document.getElementById('admin-pass-input').focus();
}
function cerrarLoginAdmin() { document.getElementById('modal-login').classList.add('hidden'); }

function verificarPassword() {
    const pass = document.getElementById('admin-pass-input').value;
    if(pass === 'admin123') {
        cerrarLoginAdmin();
        mostrarAdmin();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

function mostrarAdmin() {
    document.getElementById('seccion-menu').classList.add('hidden');
    document.getElementById('seccion-admin').classList.remove('hidden');
    window.scrollTo(0,0);
    
    const historial = JSON.parse(localStorage.getItem('pedidos_db') || "[]").reverse();
    const lista = document.getElementById('lista-pedidos');
    
    const pedidosActivos = historial.filter(p => p.estado !== 'Entregado').length;
    document.getElementById('admin-pedidos-activos').innerText = pedidosActivos;
    
    const totalVentas = historial.reduce((acc, p) => acc + p.total, 0);
    document.getElementById('admin-total-ventas').innerText = formatoDinero(totalVentas);
    
    if(historial.length === 0) {
        lista.innerHTML = `<p style="text-align:center; color:#888; grid-column:1/-1;">No hay pedidos registrados.</p>`;
    } else {
        lista.innerHTML = historial.map(p => `
            <div class="pedido-card status-${p.estado.toLowerCase()}">
                <div class="pedido-header">
                    <div class="cliente-info">
                        <h4>${p.cliente}</h4>
                        <span>${p.fecha}</span>
                        <span style="margin-left:10px; font-size:0.8rem; color:#666;">${p.tipo}</span>
                    </div>
                    <div class="pedido-total">${formatoDinero(p.total)}</div>
                </div>
                <div style="font-size:0.9rem; color:#4b5563; line-height:1.5;">
                    ${p.items.map(i => `<div>• ${i.cantidad} ${i.nombre}</div>`).join('')}
                    <div style="margin-top:5px; font-size:0.85rem; color:#666;">
                        ${p.tipo === 'Domicilio' ? '📍 ' + p.direccion : '🏪 Pasa a recoger'}
                    </div>
                </div>
                <div class="admin-controls">
                    <label style="font-size:0.85rem; font-weight:bold;">Estado:</label>
                    <select onchange="cambiarEstado(${p.id}, this.value)" class="select-status">
                        <option value="Pendiente" ${p.estado === 'Pendiente' ? 'selected' : ''}>🔴 Pendiente</option>
                        <option value="Despachado" ${p.estado === 'Despachado' ? 'selected' : ''}>🔵 Despachado</option>
                        <option value="Entregado" ${p.estado === 'Entregado' ? 'selected' : ''}>🟢 Entregado</option>
                    </select>
                </div>
            </div>
        `).join('');
    }
}

function cambiarEstado(id, nuevoEstado) {
    const historial = JSON.parse(localStorage.getItem('pedidos_db') || "[]");
    const pedidoIndex = historial.findIndex(p => p.id === id);
    
    if(pedidoIndex !== -1) {
        historial[pedidoIndex].estado = nuevoEstado;
        localStorage.setItem('pedidos_db', JSON.stringify(historial));
        mostrarAdmin();
        mostrarNotificacion("Estado actualizado");
    }
}

// --- GESTIÓN DE PRODUCTOS (NUEVO) ---
function abrirGestorProductos() {
    document.getElementById('modal-gestor-productos').classList.remove('hidden');
    renderizarListaGestor();
}
function cerrarGestorProductos() {
    document.getElementById('modal-gestor-productos').classList.add('hidden');
}

function renderizarListaGestor() {
    const productos = obtenerProductos();
    const contenedor = document.getElementById('lista-gestor-productos');
    
    if(productos.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-gray-600">No hay productos.</p>';
        return;
    }

    contenedor.innerHTML = productos.map(p => `
        <div class="item-gestor">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/50'">
            <div>
                <h4>${p.nombre}</h4>
                <p>${formatoDinero(p.precio)}</p>
            </div>
            <div class="actions-gestor">
                <button class="btn-edit" onclick="abrirFormularioProducto(${p.id})">
                    <i data-lucide="pencil" width="16"></i>
                </button>
                <button class="btn-delete" onclick="confirmarBorrarProducto(${p.id})">
                    <i data-lucide="trash-2" width="16"></i>
                </button>
            </div>
        </div>
    `).join('');
    if(window.lucide) lucide.createIcons();
}

function abrirFormularioProducto(id = null) {
    productoEditandoId = id;
    const modal = document.getElementById('modal-form-producto');
    const title = document.getElementById('form-producto-title');
    
    // Limpiar form
    document.getElementById('prod-nombre').value = '';
    document.getElementById('prod-descripcion').value = '';
    document.getElementById('prod-precio').value = '';
    document.getElementById('prod-imagen').value = '';
    
    if (id) {
        // Modo Edición
        const productos = obtenerProductos();
        const prod = productos.find(p => p.id === id);
        if (prod) {
            title.innerText = "Editar Producto";
            document.getElementById('prod-nombre').value = prod.nombre;
            document.getElementById('prod-descripcion').value = prod.descripcion;
            document.getElementById('prod-precio').value = prod.precio;
            document.getElementById('prod-imagen').value = prod.img;
        }
    } else {
        // Modo Creación
        title.innerText = "Nuevo Producto";
    }
    
    modal.classList.remove('hidden');
}

function cerrarFormularioProducto() {
    document.getElementById('modal-form-producto').classList.add('hidden');
}

function guardarProducto() {
    const nombre = document.getElementById('prod-nombre').value;
    const desc = document.getElementById('prod-descripcion').value;
    const precio = parseFloat(document.getElementById('prod-precio').value);
    let img = document.getElementById('prod-imagen').value;
    
    if(!nombre || !desc || isNaN(precio)) return mostrarAlerta("Completa los campos obligatorios.");
    if(!img) img = "https://via.placeholder.com/400x300?text=Sin+Imagen";

    let productos = obtenerProductos();
    
    if (productoEditandoId) {
        // Actualizar
        const index = productos.findIndex(p => p.id === productoEditandoId);
        if (index !== -1) {
            productos[index] = { ...productos[index], nombre, descripcion: desc, precio, img };
        }
    } else {
        // Crear
        const nuevoId = Date.now(); // ID simple basado en tiempo
        productos.push({ id: nuevoId, nombre, descripcion: desc, precio, img });
    }
    
    guardarProductosDB(productos);
    cerrarFormularioProducto();
    renderizarListaGestor();
    mostrarNotificacion("Producto guardado exitosamente");
}

function confirmarBorrarProducto(id) {
    mostrarConfirmacion("¿Eliminar este producto?", (confirmado) => {
        if (confirmado) {
            let productos = obtenerProductos();
            productos = productos.filter(p => p.id !== id);
            guardarProductosDB(productos);
            renderizarListaGestor();
            mostrarNotificacion("Producto eliminado");
        }
    });
}

// --- HELPERS Y MODALES CUSTOM ---
function mostrarAlerta(mensaje, titulo = "Atención") {
    document.getElementById('alert-title').innerText = titulo;
    document.getElementById('alert-message').innerText = mensaje;
    document.getElementById('modal-custom-alert').classList.remove('hidden');
}
function cerrarAlertaCustom() { document.getElementById('modal-custom-alert').classList.add('hidden'); }

function mostrarConfirmacion(mensaje, callback) {
    document.getElementById('confirm-title').innerText = "Confirmación";
    document.getElementById('confirm-message').innerText = mensaje;
    document.getElementById('modal-custom-confirm').classList.remove('hidden');
    confirmCallback = callback;
}

function customConfirmCallback(resultado) {
    document.getElementById('modal-custom-confirm').classList.add('hidden');
    if (confirmCallback) confirmCallback(resultado);
    confirmCallback = null;
}

function confirmarBorrarHistorial() {
    mostrarConfirmacion("¿Borrar todo el historial de pedidos?", (confirmado) => {
        if (confirmado) {
            localStorage.removeItem('pedidos_db');
            mostrarAdmin();
            mostrarNotificacion("Historial eliminado");
        }
    });
}

function mostrarNotificacion(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" color="#16a34a" width="20"></i> <span>${mensaje}</span>`;
    container.appendChild(toast);
    if(window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function abrirCarrito() { document.getElementById('modal-carrito').classList.remove('hidden'); }
function cerrarCarrito() { document.getElementById('modal-carrito').classList.add('hidden'); }
function cerrarRecibo() { document.getElementById('modal-recibo').classList.add('hidden'); }
function scrollToMenu() { document.getElementById('catalogo-titulo').scrollIntoView({behavior:'smooth'}); }
function irA(lugar) {
    if(lugar === 'menu') {
        document.getElementById('seccion-menu').classList.remove('hidden');
        document.getElementById('seccion-admin').classList.add('hidden');
        window.scrollTo(0,0);
    }
}