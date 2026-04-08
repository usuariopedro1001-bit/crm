const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const db = require('../db');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const userExists = await db.users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teamId = Date.now().toString();
    const user = await db.users.create({ 
      name, 
      email, 
      password: hashedPassword,
      teamId
    });
    
    if (!process.env.JWT_SECRET) {
      console.error('ERRO: JWT_SECRET não definido no .env');
      return res.status(500).json({ error: 'Erro interno do servidor (configuração).' });
    }

    const token = jwt.sign({ id: user._id, teamId: user.teamId }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, teamId: user.teamId } });
  } catch (error) {
    console.error('ERRO NO SIGNUP:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário. Tente novamente.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
    }
    
    const token = jwt.sign({ id: user._id, teamId: user.teamId }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, teamId: user.teamId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Get team members
router.get('/team-members', auth, async (req, res) => {
  try {
    const teamId = req.user.teamId || req.user.id;
    const users = await db.users.find({ teamId });
    res.json(users.map(({ _id, name, email }) => ({ id: _id, name, email })));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar membros da equipe.' });
  }
});

// Add a new team member
router.post('/team-members', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const teamId = req.user.teamId || req.user.id;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const userExists = await db.users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.users.create({ 
      name, 
      email, 
      password: hashedPassword,
      teamId
    });

    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    console.error('ERRO AO ADICIONAR MEMBRO DA EQUIPE:', error);
    res.status(500).json({ error: 'Erro ao adicionar membro da equipe.' });
  }
});

module.exports = router;
