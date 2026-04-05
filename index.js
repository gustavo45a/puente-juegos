const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/sincronizar', async (req, res) => {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        
        // Usaremos el nombre 'cupg' para que coincida con tu proyecto
        const db = client.db('cupg'); 
        const coleccion = db.collection('usuarios');
        
        const { usuario, skinId, juegoOrigen } = req.body;

        await coleccion.updateOne(
            { nombre: usuario },
            { 
                $set: { 
                    skinActual: skinId, 
                    plataforma: juegoOrigen, 
                    ultimaConexion: new Date() 
                } 
            },
            { upsert: true } // Esto crea el registro si no existe
        );
        
        res.status(200).json({ success: true, message: "Datos guardados en cupg" });
    } catch (err) {
        console.error("❌ Error en el servidor:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        await client.close();
    }
});

app.listen(port, () => console.log("Servidor en marcha"));
