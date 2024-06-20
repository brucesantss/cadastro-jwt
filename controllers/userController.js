import { z } from 'zod';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcrypt';

import pool from '../db/database.js';

//shcema com zod + validação de entrada
const userSchema = z.object({
    name: z.string({ required_error: 'o nome é obrigatório.' }).nonempty('não pode ficar vazio.').min(3, "o nome de usuário deve ter pelo menos 3 caracteres."),
    pass: z.string({ required_error: 'a senha é obrigatória' }).nonempty('não pode ficar vazio.').min(6, "a senha deve ter pelo menos 6 caracteres."),
    email: z.string({ required_error: 'o email é obrigatório.' }).nonempty('não pode ficar vazio.').email("email inválido."),
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

        //hash de senha
        const salt = await bcrypt.genSalt(12);
        const passHash = await bcrypt.hash(pass, salt);

        //gerando uuid
        const id = uuidv4();
        const values = [id, email, name, passHash];

        //cadastrando usuário
        await pool.execute(insertQuery, values)

        return res.status(201).json({ message: 'usuário cadastrado' })

    }catch(err){
        // retornar erros de validação  
        if (err instanceof z.ZodError) {
            return res.status(400).json({ err: err.errors });
          }
          
        return res.status(500).json({ message: 'erro no servidor.', err })
    }
  
}

export const loginUser = async (req, res) => {
    const { email, pass } = req.body;

    if(!email){
        return res.status(401).json({ message: 'o email é obrigatório.' });
    }

    if(!pass){
        return res.status(401).json({ message: 'a senha é obrigatória.' });
    }

    const findUser = 'SELECT * FROM users WHERE `email` = ?'; 

    try{

        const [rows] = await pool.execute(findUser, [email]);

        if(rows.length === 0){
            return res.status(200).json({ message: 'usuário não encontrado.' });
        }

        const user = rows[0]; 
        const compareHash = await bcrypt.compare(pass, user.pass);

        if(!compareHash){
            return res.status(400).json({ message: 'senha incorreta.' });
        }

        return res.status(200).json({ message: 'logando...' }); 

    }catch(err){
        console.log(err);
        return res.status(400).json({ message: 'erro no servidor.' });
    }
}
