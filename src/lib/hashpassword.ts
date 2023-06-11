import { hash, compare } from 'bcryptjs';

export async function hashPassword(password: string) {
    const encryptedPassword = await hash(password, 12);
    return encryptedPassword;
}

export async function verifyPassword(password: string, hashedPassword: string) {
    const isValid = await compare(password, hashedPassword);
    return isValid;
}