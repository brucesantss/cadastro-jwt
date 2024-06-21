import express from "express";

import userRoutes from './routes/userRoutes.js';
import { checkToken } from "./controllers/userController.js";

const app = express();
const port = process.env.PORT || 8080;

//compatibilidade
app.use(express.json());


//rotas definidas
app.use('/', userRoutes);

//rota home
app.get('/', (req, res) => {
    
    return res.status(200).json({ message: 'bem-vindo a home.' })
})

//rota configurações
app.post('/settings/:id', checkToken,  (req, res) => {
    return res.status(200).json({ message: 'bem-vindo as configurações.' })
})


app.listen(port, () => {
    console.log('server status: on-line')
})