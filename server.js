const express = require('express');
const cors = require('cors');
const db = require('./db.js'); // Conecta con el archivo que acabas de crear

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

// GET: Consultar disponibilidad
app.get('/api/turnos/:fecha', (req, res) => {
    const { fecha } = req.params;
    const query = `SELECT hora FROM turnos WHERE fecha = ?`;
    
    db.all(query, [fecha], (err, rows) => {
        if (err) {
            console.error('Error al consultar turnos:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        const horasOcupadas = rows.map(row => row.hora);
        res.json({ ocupados: horasOcupadas });
    });
});

// POST: Registrar nueva reserva
app.post('/api/turnos', (req, res) => {
    const { nombre, telefono, fecha, hora } = req.body;

    if (!nombre || !telefono || !fecha || !hora) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const query = `INSERT INTO turnos (cliente_nombre, cliente_telefono, fecha, hora) VALUES (?, ?, ?, ?)`;

    db.run(query, [nombre, telefono, fecha, hora], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Ese horario acaba de ser reservado por otra persona.' });
            }
            console.error('Error al insertar turno:', err.message);
            return res.status(500).json({ error: 'Error interno al guardar la reserva.' });
        }
        
        res.status(201).json({ 
            mensaje: 'Turno reservado con éxito', 
            id_reserva: this.lastID 
        });
    });
});

// GET: Ver todos los turnos (Solo para el Admin)
app.get('/api/admin/turnos', (req, res) => {
    const query = `SELECT * FROM turnos ORDER BY fecha ASC, hora ASC`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// DELETE: Eliminar un turno por ID (solo admin) 
app.delete('/api/admin/turnos/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM turnos WHERE id = ?`;

    db.run(query, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Turno eliminado correctamente' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor de Barbería corriendo en http://localhost:${PORT}`);
});