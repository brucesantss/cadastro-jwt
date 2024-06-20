import express from "express";

import userRoutes from './routes/userRoutes.js';

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

app.listen(port, () => {
    console.log('server status: on-line')
})