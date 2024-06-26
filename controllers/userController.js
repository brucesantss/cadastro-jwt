//dependências
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

//configurações
import pool from '../db/database.js';
import 'dotenv/config';
import { userSchema } from '../models/userSchema.js';


//cadastrar usuário
export const addUser = async (req, res) => {
    const insertQuery = 'INSERT INTO users (id, email, name, pass) VALUES (?, ?, ?, ?)';
    const checkQuery = 'SELECT * FROM users WHERE email = ?'

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
            return res.status(400).json({ err: err.errors[0].message });
          }
          
        return res.status(500).json({ message: 'erro no servidor.', err })
    }
  
}

//login usuário
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

        //gerendo jwt
        const secret = process.env.SECRET;

        const token = jwt.sign({
            id: user.id
        }, secret, {expiresIn: '1h'});

        
        return res.status(200).json({ msg: 'autenticação realizada com sucesso!', token });

    }catch(err){
        console.log(err);
        return res.status(400).json({ message: 'erro no servidor.' });
    }
}

//middleware JWT
export const checkToken = async (req, res, next) => {
    const { id } = req.params;

    const findUser = 'SELECT * FROM users WHERE id = ?';
    const [user, fields] = await pool.execute(findUser, [id])

    if(!user.length > 0){
        return res.status(404).json({ msg: 'usuário não encontrado!' })  
    }

    const token = req.headers['authorization'].split(' ')[1];

    if(!token){
        return res.status(401).json({ msg: 'acesso negado!' })
    }

    try{
       const secret = process.env.SECRET; 

       const decoded = jwt.verify(token, secret);

       if(decoded.id != id){
        return res.status(401).json({ message: 'ID do token não corresponde ao ID do usuário.' });
       }

       next();

    }catch(err){
        return res.status(401).json({ msg: 'token inválido!' })
    }
  }

