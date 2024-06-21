import { z } from 'zod';

//shcema com zod + validação de entrada
export const userSchema = z.object({
    name: z.string({ required_error: 'o nome é obrigatório.' }).nonempty('não pode ficar vazio.').min(3, "o nome de usuário deve ter pelo menos 3 caracteres."),
    pass: z.string({ required_error: 'a senha é obrigatória' }).nonempty('não pode ficar vazio.').min(6, "a senha deve ter pelo menos 6 caracteres."),
    email: z.string({ required_error: 'o email é obrigatório.' }).nonempty('não pode ficar vazio.').email("email com formato inválido."),
})