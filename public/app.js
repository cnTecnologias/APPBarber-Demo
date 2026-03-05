// 1. Variables Globales de Estado
let reservaActiva = { fecha: '', hora: '' };

// 2. Inicialización de UI (Solo lo que corre al cargar)
document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha-turno');
    const hoy = new Date().toLocaleDateString('sv-SE');
    fechaInput.min = hoy;

    fechaInput.addEventListener('change', async (e) => {
        const fecha = e.target.value;
        if (!fecha) return;
        
        const grid = document.getElementById('grid-horarios');
        grid.innerHTML = '<div class="col-span-3 text-center text-acento animate-pulse py-4">Sincronizando...</div>';

        try {
            const response = await fetch(`http://localhost:3000/api/turnos/${fecha}`);
            const data = await response.json();
            renderizarGrilla(fecha, data.ocupados || []);
        } catch (error) {
            grid.innerHTML = '<div class="text-red-500">Error de conexión.</div>';
        }
    });
});

// 3. FUNCIONES GLOBALES (Accesibles desde el HTML)

function renderizarGrilla(fecha, ocupados) {
    const grid = document.getElementById('grid-horarios');
    grid.innerHTML = ''; 
    for (let i = 9; i <= 18; i++) {
        const hora = `${i.toString().padStart(2, '0')}:00`;
        const estaOcupado = ocupados.includes(hora);
        const btn = document.createElement('button');
        btn.textContent = hora;
        
        if (estaOcupado) {
            btn.className = 'py-3 rounded-lg bg-fondo text-gray-600 cursor-not-allowed opacity-50';
            btn.disabled = true;
        } else {
            btn.className = 'py-3 rounded-lg bg-panel text-white hover:border-acento transition-colors';
            btn.onclick = () => procesarReserva(fecha, hora);
        }
        grid.appendChild(btn);
    }
}

function procesarReserva(fecha, hora) {
    reservaActiva = { fecha, hora };
    document.getElementById('info-reserva').textContent = `${fecha} a las ${hora} hs`;
    document.getElementById('modal-reserva').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal-reserva').classList.add('hidden');
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-telefono').value = '';
}

async function confirmarReserva() {
    const nombre = document.getElementById('input-nombre').value;
    const telefono = document.getElementById('input-telefono').value;

    if (!nombre || !telefono) return alert('Completá los datos');

    const response = await fetch('http://localhost:3000/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, ...reservaActiva })
    });

    if (response.ok) {
        cerrarModal();
        mostrarExito();
        document.getElementById('fecha-turno').dispatchEvent(new Event('change'));
    }
}

function mostrarExito() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 5000);
}