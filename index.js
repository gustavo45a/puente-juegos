const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/sincronizar', async (req, res) => {
    console.log("--- NUEVA PETICIÓN RECIBIDA ---");
    console.log("Datos recibidos:", req.body);

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.log("❌ ERROR: No hay MONGODB_URI en Render");
        return res.status(500).send("Falta URI");
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('cupg'); 
        const coleccion = db.collection('usuarios');
        
        const result = await coleccion.updateOne(
            { nombre: req.body.usuario || "SinNombre" },
            { $set: { skin: req.body.skinId || "0", fecha: new Date() } },
            { upsert: true }
        );
        
        console.log("✅ Datos guardados en MongoDB:", result.upsertedId || "Actualizado");
        res.status(200).json({ success: true });
    } catch (err) {
        console.log("❌ ERROR DE MONGO:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        await client.close();
    }
});

app.listen(port, () => console.log("🚀 Servidor escuchando en puerto " + port));
