const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB
const client = new MongoClient(MONGODB_URI);

async function connect() {
    try {
        await client.connect();
        console.log('Conectado a MongoDB');
    } catch (err) {
        console.error('Error conectando a MongoDB:', err);
        process.exit(1);
    }
}

// Manejo de cierre de conexión
process.on('SIGINT', async () => {
    await client.close();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
});

connect();

// Ruta para el registro
app.post('/api/registro', async (req, res) => {
    const { usuario, email, password } = req.body;

    // Validar datos
    if (!usuario || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        // Verificar ambas condiciones y recopilar errores
        const errores = [];

        // Verificar si el email ya está registrado
        const emailExistente = await collection.findOne({ email });
        if (emailExistente) {
            errores.push('El email ya está registrado');
        }

        // Verificar si el usuario ya está registrado
        const usuarioExistente = await collection.findOne({ usuario });
        if (usuarioExistente) {
            errores.push('El nombre de usuario ya está registrado');
        }

        // Si hay errores, devolver todos juntos
        if (errores.length > 0) {
            return res.status(400).json({
                message: 'Error de validación',
                errores
            });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardar el usuario en la base de datos
        const result = await collection.insertOne({
            usuario,
            email,
            password: hashedPassword,
            fechaRegistro: new Date(),
            wants: [],
            sells: []
        });

        res.status(201).json({ message: 'Usuario registrado con éxito', id: result.insertedId });
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Ruta para el login
app.post('/api/login', async (req, res) => {
    const { usuario, password } = req.body;

    // Validar datos
    if (!usuario || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        // Buscar el usuario en la base de datos
        const usuarioEncontrado = await collection.findOne({ usuario });
        if (!usuarioEncontrado) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        // Verificar la contraseña
        const contraseñaValida = await bcrypt.compare(password, usuarioEncontrado.password);
        if (!contraseñaValida) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            {
                id: usuarioEncontrado._id,
                usuario: usuarioEncontrado.usuario
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Usuario autenticado con éxito',
            token,
            usuario: usuarioEncontrado.usuario
        });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// Middleware para autenticar token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
}

// Obtener perfil de usuario
app.get('/api/user/:username', async (req, res) => {
    const { username } = req.params;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        const user = await collection.findOne({ usuario: username }, { projection: { password: 0 } });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('Error al obtener perfil:', err);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

// Get user profile by username (for viewing other profiles)
app.get('/api/profile/:username', async (req, res) => {
    const { username } = req.params;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        const user = await collection.findOne(
            { usuario: username },
            { projection: { password: 0, email: 0 } }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            _id: user._id, // Asegúrate de incluir el ID
            usuario: user.usuario,
            wants: user.wants || [],
            sells: user.sells || []
        });
    } catch (err) {
        console.error('Error al obtener perfil:', err);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

// Express route example
// Fix the authenticateJWT to authenticateToken to match your existing middleware
app.get('/api/matches/:username', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user.usuario; // Get current username from token
        const otherUser = req.params.username;

        const db = client.db('magic_trading');
        const collection = db.collection('usuarios');

        // Get both users' lists
        const currentUserProfile = await collection.findOne({ usuario: currentUser });
        const otherUserProfile = await collection.findOne({ usuario: otherUser });

        if (!currentUserProfile || !otherUserProfile) {
            return res.status(404).json({ message: 'One or both users not found' });
        }

        // Debug logs to check data
        console.log(`Current user wants: ${JSON.stringify(currentUserProfile.wants)}`);
        console.log(`Other user sells: ${JSON.stringify(otherUserProfile.sells)}`);

        // Calculate matches (their sells match your wants)
        const wantsMatches = currentUserProfile.wants ?
            currentUserProfile.wants.filter(wantCard =>
                    otherUserProfile.sells && otherUserProfile.sells.some(sellCard =>
                        sellCard.cardName === wantCard.cardName
                    )
            ).length : 0;

        // Calculate matches (your sells match their wants)
        const sellsMatches = currentUserProfile.sells ?
            currentUserProfile.sells.filter(sellCard =>
                    otherUserProfile.wants && otherUserProfile.wants.some(wantCard =>
                        wantCard.cardName === sellCard.cardName
                    )
            ).length : 0;

        res.json({
            wantsMatches,
            wantsTotal: currentUserProfile.wants ? currentUserProfile.wants.length : 0,
            sellsMatches,
            sellsTotal: currentUserProfile.sells ? currentUserProfile.sells.length : 0
        });
    } catch (error) {
        console.error('Error getting matches:', error);
        res.status(500).json({ message: 'Error getting matches' });
    }
});

// Obtener cartas coincidentes para transacción
app.get('/api/matches/:username/cards', authenticateToken, async (req, res) => {
    const { username } = req.params;
    const currentUserId = req.user.id;
    const currentUsername = req.user.usuario;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        // Obtener usuario actual
        const currentUser = await collection.findOne({ usuario: currentUsername });

        // Obtener otro usuario
        const otherUser = await collection.findOne({ usuario: username });

        if (!currentUser || !otherUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Cartas que el usuario actual tiene y que coinciden con wants del otro usuario
        const myMatchingCards = (currentUser.sells || []).filter(myCard =>
            (otherUser.wants || []).some(theirWant =>
                myCard.cardName === theirWant.cardName
            )
        );

        // Cartas que el otro usuario tiene y que coinciden con wants del usuario actual
        const theirMatchingCards = (otherUser.sells || []).filter(theirCard =>
            (currentUser.wants || []).some(myWant =>
                myWant.cardName === theirCard.cardName
            )
        );

        res.status(200).json({
            myMatchingCards,
            theirMatchingCards
        });
    } catch (error) {
        console.error('Error al obtener cartas coincidentes:', error);
        res.status(500).json({ message: 'Error al obtener cartas coincidentes' });
    }
});

// En index.js
app.get('/api/transactions', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const transactionsCollection = db.collection('transactions');

    try {
        // Buscar transacciones donde el usuario es comprador o vendedor
        const transactions = await transactionsCollection.find({
            $or: [
                { buyerId: new ObjectId(userId) },
                { sellerId: new ObjectId(userId) }
            ]
        }).sort({ createdAt: -1 }).toArray();

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error al obtener transacciones:', error);
        res.status(500).json({ message: 'Error al obtener transacciones' });
    }
});

// Crear una transacción
app.post('/api/transaction/create', authenticateToken, async (req, res) => {
    const { sellerId, buyerWants, sellerWants } = req.body;
    const buyerId = req.user.id;

    const db = client.db('magic_trading');
    const transactionsCollection = db.collection('transactions');
    const usersCollection = db.collection('usuarios');

    try {
        // Obtener información de los usuarios
        const buyer = await usersCollection.findOne({ _id: new ObjectId(buyerId) });
        const seller = await usersCollection.findOne({ _id: new ObjectId(sellerId) });

        if (!buyer || !seller) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Crear la transacción (soporta tanto compra, venta o ambas)
        const result = await transactionsCollection.insertOne({
            buyerId: new ObjectId(buyerId),
            sellerId: new ObjectId(sellerId),
            buyerUsername: buyer.usuario,
            sellerUsername: seller.usuario,
            buyerWants: buyerWants || [],  // Lo que el comprador quiere (del vendedor)
            sellerWants: sellerWants || [], // Lo que el vendedor quiere (del comprador)
            buyerConfirmed: false,
            sellerConfirmed: false,
            status: 'pending',
            createdAt: new Date()
        });

        // Marcar las cartas como en transacción
        if (buyerWants && buyerWants.length > 0) {
            for (const card of buyerWants) {
                await usersCollection.updateOne(
                    { _id: new ObjectId(sellerId), "sells.cardId": card.cardId },
                    { $set: { "sells.$.inTransaction": true } }
                );
            }
        }

        if (sellerWants && sellerWants.length > 0) {
            for (const card of sellerWants) {
                await usersCollection.updateOne(
                    { _id: new ObjectId(buyerId), "sells.cardId": card.cardId },
                    { $set: { "sells.$.inTransaction": true } }
                );
            }
        }

        res.status(201).json({
            message: 'Transacción creada correctamente',
            transactionId: result.insertedId
        });
    } catch (error) {
        console.error('Error al crear transacción:', error);
        res.status(500).json({ message: 'Error al crear transacción' });
    }
});

// Modificación en index.js para manejar cartas después de completar una transacción
app.put('/api/transaction/:id/confirm', authenticateToken, async (req, res) => {
    const transactionId = req.params.id;
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const transactionsCollection = db.collection('transactions');
    const usersCollection = db.collection('usuarios');

    try {
        const transaction = await transactionsCollection.findOne({
            _id: new ObjectId(transactionId),
            $or: [
                { buyerId: new ObjectId(userId) },
                { sellerId: new ObjectId(userId) }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transacción no encontrada' });
        }

        // Determinar si el usuario es comprador o vendedor
        const isBuyer = transaction.buyerId.toString() === userId;

        // Actualizar el estado de confirmación
        const updateField = isBuyer ? 'buyerConfirmed' : 'sellerConfirmed';

        await transactionsCollection.updateOne(
            { _id: new ObjectId(transactionId) },
            { $set: { [updateField]: true } }
        );

        // Verificar si ambos han confirmado
        const updatedTransaction = await transactionsCollection.findOne({
            _id: new ObjectId(transactionId)
        });

        if (updatedTransaction.buyerConfirmed && updatedTransaction.sellerConfirmed) {
            // Actualizar estado de la transacción
            await transactionsCollection.updateOne(
                { _id: new ObjectId(transactionId) },
                { $set: { status: 'completed', completedAt: new Date() } }
            );

            // 1. Eliminar las cartas que el comprador recibe de la lista de sells del vendedor
            if (updatedTransaction.buyerWants && updatedTransaction.buyerWants.length > 0) {
                for (const card of updatedTransaction.buyerWants) {
                    console.log(`Eliminando carta ${card.cardName} (${card.cardId}) de sells del vendedor`);
                    await usersCollection.updateOne(
                        { _id: updatedTransaction.sellerId },
                        { $pull: { sells: { cardId: card.cardId.toString() } } }
                    );

                    // NUEVO: Eliminar de wants del comprador
                    await usersCollection.updateOne(
                        { _id: updatedTransaction.buyerId },
                        { $pull: { wants: { cardName: card.cardName } } }
                    );
                }
            }

            // 2. Eliminar las cartas que el vendedor recibe de la lista de sells del comprador
            if (updatedTransaction.sellerWants && updatedTransaction.sellerWants.length > 0) {
                for (const card of updatedTransaction.sellerWants) {
                    console.log(`Eliminando carta ${card.cardName} (${card.cardId}) de sells del comprador`);
                    await usersCollection.updateOne(
                        { _id: updatedTransaction.buyerId },
                        { $pull: { sells: { cardId: card.cardId.toString() } } }
                    );

                    // NUEVO: Eliminar de wants del vendedor
                    await usersCollection.updateOne(
                        { _id: updatedTransaction.sellerId },
                        { $pull: { wants: { cardName: card.cardName } } }
                    );
                }
            }
        }

        res.status(200).json({
            message: 'Confirmación registrada',
            transactionCompleted: (updatedTransaction.buyerConfirmed && updatedTransaction.sellerConfirmed)
        });
    } catch (error) {
        console.error('Error al confirmar transacción:', error);
        res.status(500).json({ message: 'Error al confirmar transacción' });
    }
});

// Añadir reseña a una transacción
app.post('/api/transaction/:id/review', authenticateToken, async (req, res) => {
    const transactionId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'La valoración debe ser un número entre 1 y 5' });
    }

    const db = client.db('magic_trading');
    const transactionsCollection = db.collection('transactions');

    try {
        // Verificar que la transacción existe y el usuario es parte de ella
        const transaction = await transactionsCollection.findOne({
            _id: new ObjectId(transactionId),
            $or: [
                { buyerId: new ObjectId(userId) },
                { sellerId: new ObjectId(userId) }
            ],
            status: 'completed' // Solo permitir reseñas en transacciones completadas
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transacción no encontrada o no completada' });
        }

        // Determinar si el usuario es comprador o vendedor
        const isBuyer = transaction.buyerId.toString() === userId;
        const reviewField = isBuyer ? 'buyerReview' : 'sellerReview';
        const otherReviewField = isBuyer ? 'sellerReview' : 'buyerReview';

        // Verificar si ya dejó una reseña
        if (transaction[reviewField]) {
            return res.status(400).json({ message: 'Ya has dejado una reseña para esta transacción' });
        }

        // Actualizar la transacción con la reseña
        await transactionsCollection.updateOne(
            { _id: new ObjectId(transactionId) },
            { $set: {
                    [reviewField]: {
                        rating,
                        comment,
                        date: new Date()
                    }
                }}
        );

        // Buscar transacción actualizada para verificar si ambos han dejado reseña
        const updatedTransaction = await transactionsCollection.findOne({
            _id: new ObjectId(transactionId)
        });

        // Si ambos han dejado reseña, marcar la transacción como completamente revisada
        if (updatedTransaction.buyerReview && updatedTransaction.sellerReview) {
            await transactionsCollection.updateOne(
                { _id: new ObjectId(transactionId) },
                { $set: { reviewsCompleted: true } }
            );
        }

        res.status(200).json({ message: 'Reseña guardada correctamente' });
    } catch (error) {
        console.error('Error al guardar reseña:', error);
        res.status(500).json({ message: 'Error al guardar la reseña' });
    }
});

app.get('/api/user/reviews', authenticateToken, async (req, res) => {
    try {
        // Nota: Cambiamos req.user.id por req.user._id
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        console.log('Buscando valoraciones para el usuario:', userId);

        const db = client.db('magic_trading');
        const transactionsCollection = db.collection('transactions');

        // Asegúrate de comparar con el mismo tipo de datos
        const { ObjectId } = require('mongodb');
        const objectId = new ObjectId(userId);

        // Buscar transacciones usando ObjectId
        const sellerReviews = await transactionsCollection.find({
            sellerId: userId, // o objectId si usas ObjectId
            status: 'completed',
            buyerReview: { $exists: true }
        }).toArray();

        const buyerReviews = await transactionsCollection.find({
            buyerId: userId, // o objectId si usas ObjectId
            status: 'completed',
            sellerReview: { $exists: true }
        }).toArray();

        console.log('Valoraciones como vendedor:', sellerReviews.length);
        console.log('Valoraciones como comprador:', buyerReviews.length);

        // Resto del código igual...
        const reviews = [];

        // Añadir valoraciones recibidas como vendedor
        for (const tx of sellerReviews) {
            if (tx.buyerReview) {
                reviews.push({
                    fromUsername: tx.buyerUsername,
                    rating: tx.buyerReview.rating,
                    comment: tx.buyerReview.comment,
                    date: tx.buyerReview.date,
                    cards: tx.buyerWants || []
                });
            }
        }

        // Añadir valoraciones recibidas como comprador
        for (const tx of buyerReviews) {
            if (tx.sellerReview) {
                reviews.push({
                    fromUsername: tx.sellerUsername,
                    rating: tx.sellerReview.rating,
                    comment: tx.sellerReview.comment,
                    date: tx.sellerReview.date,
                    cards: tx.sellerWants || []
                });
            }
        }

        return res.status(200).json(reviews);
    } catch (error) {
        console.error('Error al obtener valoraciones:', error);
        return res.status(500).json({ message: 'Error al cargar las valoraciones: ' + error.message });
    }
});

// Update the want cards endpoint
app.post('/api/user/wants', authenticateToken, async (req, res) => {
    const { cardId, cardName, quantity = 1, setCode = '', edition = '', language = 'English', foil = false, price = 0 } = req.body;
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        // Verificar si la carta ya existe en la lista
        const user = await collection.findOne(
            { _id: new ObjectId(userId), 'wants.cardId': cardId }
        );

        if (user) {
            return res.status(400).json({ message: 'La carta ya está en tu lista de wants' });
        }

        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { wants: { cardId, cardName, quantity, edition, setCode, language, foil, price, dateAdded: new Date() } } }
        );

        res.status(200).json({ message: 'Carta añadida a wants' });
    } catch (err) {
        console.error('Error al añadir carta:', err);
        res.status(500).json({ message: 'Error al añadir carta' });
    }
});


// Update the sell cards endpoint
app.post('/api/user/sells', authenticateToken, async (req, res) => {
    const { cardId, cardName, quantity = 1, setCode = '', edition = '', language = 'English', foil = false, price = 0 } = req.body;
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        // Verificar si la carta ya existe en la lista
        const user = await collection.findOne(
            { _id: new ObjectId(userId), 'sells.cardId': cardId }
        );

        if (user) {
            return res.status(400).json({ message: 'La carta ya está en tu lista de sells' });
        }

        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { sells: { cardId, cardName, quantity, edition, setCode, language, foil, price, dateAdded: new Date() } } }
        );

        res.status(200).json({ message: 'Carta añadida a sells' });
    } catch (err) {
        console.error('Error al añadir carta:', err);
        res.status(500).json({ message: 'Error al añadir carta' });
    }
});

// Actualizar carta en wants

app.put('/api/user/wants/:cardId', authenticateToken, async (req, res) => {
    const { cardId } = req.params;
    const { quantity, edition, language, foil, price = 0, setCode = '' } = req.body;
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        await collection.updateOne(
            { _id: new ObjectId(userId), "wants.cardId": cardId },
            { $set: {
                    "wants.$.quantity": quantity,
                    "wants.$.edition": edition,
                    "wants.$.language": language,
                    "wants.$.foil": foil,
                    "wants.$.price": price,
                    "wants.$.setCode": setCode
                } }
        );

        res.status(200).json({ message: 'Carta actualizada en wants' });
    } catch (err) {
        console.error('Error al actualizar carta:', err);
        res.status(500).json({ message: 'Error al actualizar carta' });
    }
});

// Actualizar carta en sells
app.put('/api/user/sells/:cardId', authenticateToken, async (req, res) => {
    const { cardId } = req.params;
    const { quantity, edition, language, foil, price, setCode = '' } = req.body;
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        await collection.updateOne(
            { _id: new ObjectId(userId), "sells.cardId": cardId },
            { $set: {
                    "sells.$.quantity": quantity,
                    "sells.$.edition": edition,
                    "sells.$.language": language,
                    "sells.$.foil": foil,
                    "sells.$.price": price,
                    "sells.$.setCode": setCode
                } }
        );

        res.status(200).json({ message: 'Carta actualizada en sells' });
    } catch (err) {
        console.error('Error al actualizar carta:', err);
        res.status(500).json({ message: 'Error al actualizar carta' });
    }
});

// Eliminar carta de wants
app.delete('/api/user/wants/:cardId', authenticateToken, async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { wants: { cardId } } }
        );

        res.status(200).json({ message: 'Carta eliminada de wants' });
    } catch (err) {
        console.error('Error al eliminar carta:', err);
        res.status(500).json({ message: 'Error al eliminar carta' });
    }
});

// Eliminar carta de sells
app.delete('/api/user/sells/:cardId', authenticateToken, async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { sells: { cardId } } }
        );

        res.status(200).json({ message: 'Carta eliminada de sells' });
    } catch (err) {
        console.error('Error al eliminar carta:', err);
        res.status(500).json({ message: 'Error al eliminar carta' });
    }
});

// Obtener detalles del usuario autenticado
app.get('/api/user/profile/me', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    const db = client.db('magic_trading');
    const collection = db.collection('usuarios');

    try {
        const user = await collection.findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Error al obtener perfil:', err);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

app.get('/', (req, res) => {
    res.send('¡Bienvenido al backend de Magic Trading!');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});