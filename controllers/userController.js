import { z } from 'zod';
import pool from '../db/database.js';
import {v4 as uuidv4} from 'uuid';

//shcema com zod + validação de entrada
const userSchema = z.object({
    name: z.string().nonempty('não pode ficar vazio.').min(3, "o nome de usuário deve ter pelo menos 3 caracteres."),
    pass: z.string().nonempty('não pode ficar vazio.').min(6, "a senha deve ter pelo menos 6 caracteres."),
    email: z.string().nonempty('não pode ficar vazio.').email("email inválido."),
})


export const addUser = async (req, res) => {
    return res.status(201).json({ message: 'usuário cadastrado.' })
  
}