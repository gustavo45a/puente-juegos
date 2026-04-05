const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json());

// El servidor usará la variable que pusiste en Render
const uri = process.env.MONGODB_URI;

app.post('/sincronizar', async (req, res) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('cupg');
        const coleccion = db.collection('usuarios');

        // Guardamos los datos que vienen de Roblox
        await coleccion.updateOne(
            { nombre: req.body.usuario },
            { $set: { skin: req.body.skinId, fecha: new Date() } },
            { upsert: true }
        );

        console.log("✅ ¡Datos guardados para:", req.body.usuario);
        res.status(200).send("OK");
    } catch (err) {
        console.log("❌ Error de conexión:", err.message);
        res.status(500).send(err.message);
    } finally {
        await client.close();
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("🚀 Servidor en línea y conectado a MongoDB");
});
