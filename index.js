const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

// Render asigna el puerto automáticamente, si no, usa el 3000
const port = process.env.PORT || 3000;

// Usamos una Variable de Entorno para la seguridad
const uri = process.env.MONGODB_URI || "tu_uri_local_de_prueba";
const client = new MongoClient(uri);

app.use(express.json());

// RUTA PRINCIPAL: Para que sepas que el servidor está vivo
app.get('/', (req, res) => {
    res.send('🚀 Traductor Multi-Juego Online y Funcionando');
});

// RUTA DE SINCRONIZACIÓN: Recibe datos de Roblox/Minecraft
app.post('/sincronizar', async (req, res) => {
    try {
        const { usuario, skinId, juegoOrigen, datosExtra } = req.body;
        
        console.log(`[${juegoOrigen}] Actualizando a: ${usuario}`);

        await client.connect();
        const database = client.db('Multiplataforma');
        const perfiles = database.collection('usuarios');

        // Actualizamos los datos en MongoDB
        const resultado = await perfiles.updateOne(
            { nombre: usuario },
            { 
                $set: { 
                    skinActual: skinId, 
                    ultimoJuego: juegoOrigen,
                    metadata: datosExtra,
                    fecha: new Date() 
                } 
            },
            { upsert: true }
        );

        res.status(200).json({ 
            success: true, 
            message: "Datos guardados en la nube",
            id: resultado.upsertedId 
        });

    } catch (error) {
        console.error("❌ Error en el puente:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`--- Servidor en la nube activo en puerto ${port} ---`);
});