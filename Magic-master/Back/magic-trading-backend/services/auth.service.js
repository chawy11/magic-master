const bcrypt = require('bcryptjs');

class AuthService {
    constructor(users, jwtSecret) {
        this.users = users;
        this.jwtSecret = jwtSecret;
    }

    async register({ usuario, email, password }) {
        if (!usuario || !email || !password) {
            throw Object.assign(new Error('Todos los campos son obligatorios'), { status: 400 });
        }

        const [emailExists, usernameExists] = await Promise.all([
            this.users.findOne({ email }),
            this.users.findOne({ usuario })
        ]);
        const errors = [];
        if (emailExists) errors.push('El email ya está registrado');
        if (usernameExists) errors.push('El nombre de usuario ya está registrado');
        if (errors.length) {
            throw Object.assign(new Error('Error de validación'), { status: 400, errors });
        }

        const result = await this.users.insertOne({
            usuario,
            email,
            password: await bcrypt.hash(password, 10),
            fechaRegistro: new Date(),
            wants: [],
            sells: []
        });
        return result.insertedId;
    }

    async login({ usuario, password }) {
        if (!usuario || !password) {
            throw Object.assign(new Error('Todos los campos son obligatorios'), { status: 400 });
        }
        const user = await this.users.findOne({ usuario });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw Object.assign(new Error('Usuario o contraseña incorrectos'), { status: 400 });
        }
        const jwt = require('jsonwebtoken');
        return {
            token: jwt.sign(
                { id: user._id.toString(), usuario: user.usuario },
                this.jwtSecret,
                { expiresIn: '1h', algorithm: 'HS256' }
            ),
            usuario: user.usuario
        };
    }
}

module.exports = { AuthService };
