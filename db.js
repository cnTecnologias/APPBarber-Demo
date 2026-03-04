const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'turnos.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error crítico al conectar con SQLite:', err.message);
        process.exit(1); 
    }
    console.log('Conexión establecida con SQLite local.');
});

db.serialize(() => {
    const query = `
        CREATE TABLE IF NOT EXISTS turnos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_nombre TEXT NOT NULL,
            cliente_telefono TEXT NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(fecha, hora)
        )
    `;
    
    db.run(query, (err) => {
        if (err) {
            console.error('Fallo al crear la tabla:', err.message);
            process.exit(1);
        }
        console.log('Tabla de turnos lista. Restricción UNIQUE aplicada.');
    });
});

module.exports = db;