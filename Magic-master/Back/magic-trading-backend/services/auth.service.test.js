const { AuthService } = require('./auth.service');

describe('AuthService', () => {
    it('rejects incomplete registration data', async () => {
        const service = new AuthService({}, 'secret');
        await expect(service.register({ usuario: '', email: '', password: '' }))
            .rejects.toMatchObject({ status: 400 });
    });

    it('rejects invalid credentials without exposing which field failed', async () => {
        const service = new AuthService({ findOne: jest.fn().mockResolvedValue(null) }, 'secret');
        await expect(service.login({ usuario: 'missing', password: 'bad' }))
            .rejects.toMatchObject({
                status: 400,
                message: 'Usuario o contraseña incorrectos'
            });
    });
});
