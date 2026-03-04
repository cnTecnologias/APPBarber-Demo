document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha-turno');
    const grid = document.getElementById('grid-horarios');

    // 1. Bloqueo de UI: Nadie viaja en el tiempo.
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;

    // 2. Escuchar cambios de fecha y consultar al backend
    fechaInput.addEventListener('change', async (e) => {
        const fecha = e.target.value;
        if (!fecha) return;

        // Feedback visual inmediato
        grid.innerHTML = '<div class="col-span-3 text-center text-acento animate-pulse py-4">Sincronizando con base de datos...</div>';

        try {
            const response = await fetch(`http://localhost:3000/api/turnos/${fecha}`);
            if (!response.ok) throw new Error('Fallo en la red');
            
            const data = await response.json();
            renderizarGrilla(fecha, data.ocupados || []);
        } catch (error) {
            grid.innerHTML = '<div class="col-span-3 text-center text-red-500 py-4 border border-red-500 rounded">Error crítico: No se pudo conectar con el servidor.</div>';
        }
    });

    // 3. Motor de renderizado y lógica de negocio
    function renderizarGrilla(fecha, ocupados) {
        grid.innerHTML = ''; // Limpiar grilla
        
        for (let i = 9; i <= 18; i++) {
            const hora = `${i.toString().padStart(2, '0')}:00`;
            const estaOcupado = ocupados.includes(hora);
            
            const btn = document.createElement('button');
            btn.textContent = hora;
            
            if (estaOcupado) {
                // Turno muerto
                btn.className = 'py-3 rounded-lg bg-fondo text-gray-600 cursor-not-allowed border border-gray-800 font-medium opacity-50';
                btn.disabled = true;
            } else {
                // Turno vivo
                btn.className = 'py-3 rounded-lg bg-panel text-white border border-gray-600 hover:border-acento hover:text-acento transition-colors focus:ring-1 focus:ring-acento shadow-sm font-medium';
                btn.onclick = () => procesarReserva(fecha, hora);
            }
            grid.appendChild(btn);
        }
    }

    // 4. Transacción Segura
   // Variables globales para el estado del modal
let reservaActiva = { fecha: '', hora: '' };

function procesarReserva(fecha, hora) {
    reservaActiva = { fecha, hora };
    const modal = document.getElementById('modal-reserva');
    const info = document.getElementById('info-reserva');
    
    info.textContent = `${fecha} a las ${hora} hs`;
    modal.classList.remove('hidden'); // Mostramos el modal
}

function cerrarModal() {
    document.getElementById('modal-reserva').classList.add('hidden');
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-telefono').value = '';
}

// Escuchar el clic del botón del modal
document.getElementById('btn-confirmar').onclick = async () => {
    const nombre = document.getElementById('input-nombre').value;
    const telefono = document.getElementById('input-telefono').value;

    if (!nombre || !telefono) return alert('Por favor, completa los datos');

    const response = await fetch('http://localhost:3000/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, ...reservaActiva })
    });

    if (response.ok) {
        cerrarModal();
        mostrarExito();
        // Recargar grilla
        document.getElementById('fecha-turno').dispatchEvent(new Event('change'));
    } else {
        const error = await response.json();
        alert(error.error);
    }
};

function mostrarExito() {
    const toast = document.getElementById('toast');
    
    // Mostramos el cartel
    toast.classList.remove('hidden');
    
    // 5000 milisegundos = 5 segundos de pura confirmación visual
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000); 
}
});