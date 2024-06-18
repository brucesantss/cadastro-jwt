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
    const insertQuery = 'INSERT INTO users (id, email, name, pass) VALUES (?, ?, ?, ?)';
    const checkQuery = 'SELECT * FROM users WHERE   email = ?'

    try{
        const { email, name, pass } = userSchema.parse(req.body);

        //verifica se o user já existe
        const [existingUsers] = await pool.execute(checkQuery, [email]);
        if(existingUsers.length > 0){
            return res.status(400).json({ message: 'esse email já está sendo usado.' })
        }

        //gerando uuid
        const id = uuidv4();
        const values = [id, email, name, pass];

        //cadastrando usuário
        const [result] = await pool.execute(insertQuery, values)

        return res.status(201).json({ message: 'usuário cadastrado' })

    }catch(err){
        // retornar erros de validação  
        if (err instanceof z.ZodError) {
            return res.status(400).json({ err: err.errors });
          }
          
        return res.status(401).json({ message: 'erro no servidor.', err })
    }
  
}