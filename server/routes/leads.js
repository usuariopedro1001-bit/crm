const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get all tasks for the user
router.get('/tasks', auth, async (req, res) => {
  try {
    const data = await db.readDB();
    const tasks = (data.tasks || []).filter(t => t.userId === req.user.id);
    res.json(tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
});

// Create task
router.post('/tasks', auth, async (req, res) => {
  try {
    const data = await db.readDB();
    if (!data.tasks) data.tasks = [];
    const newTask = {
      ...req.body,
      _id: Date.now().toString(),
      userId: req.user.id,
      completed: false,
      createdAt: new Date()
    };
    data.tasks.push(newTask);
    await db.writeDB(data);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
});

// Update task
router.put('/tasks/:id', auth, async (req, res) => {
  try {
    const data = await db.readDB();
    const index = data.tasks.findIndex(t => t._id === req.params.id && t.userId === req.user.id);
    if (index === -1) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    
    data.tasks[index] = { ...data.tasks[index], ...req.body };
    await db.writeDB(data);
    res.json(data.tasks[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
});

// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const data = await db.readDB();
    data.tasks = data.tasks.filter(t => !(t._id === req.params.id && t.userId === req.user.id));
    await db.writeDB(data);
    res.json({ message: 'Tarefa excluída.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir tarefa.' });
  }
});

// Get all leads for the user team
router.get('/', auth, async (req, res) => {
  try {
    const teamId = req.user.teamId || req.user.id;
    const leads = await db.leads.find({ teamId });
    res.json(leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar leads.' });
  }
});

// Create lead
router.post('/', auth, async (req, res) => {
  try {
    const teamId = req.user.teamId || req.user.id;
    const leadData = {
      ...req.body,
      createdBy: req.user.id,
      teamId,
      assignedTo: null,
      assignedToName: null
    };
    const lead = await db.leads.create(leadData);
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar lead.' });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const teamId = req.user.teamId || req.user.id;
    const lead = await db.leads.findOne({ _id: req.params.id, teamId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
    if (lead.assignedTo && lead.assignedTo !== req.user.id && lead.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para atualizar este lead.' });
    }
    const updatedLead = await db.leads.findOneAndUpdate(
      { _id: req.params.id, teamId },
      req.body
    );
    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar lead.' });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    const teamId = req.user.teamId || req.user.id;
    const lead = await db.leads.findOne({ _id: req.params.id, teamId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
    if (lead.assignedTo && lead.assignedTo !== req.user.id && lead.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este lead.' });
    }
    await db.leads.findOneAndDelete({ _id: req.params.id, teamId });
    res.json({ message: 'Lead excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir lead.' });
  }
});

// Get single lead details
router.get('/:id', auth, async (req, res) => {
  try {
    const teamId = req.user.teamId || req.user.id;
    const lead = await db.leads.findOne({ _id: req.params.id, teamId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar lead.' });
  }
});

// Add interaction/note
router.post('/:id/interactions', auth, async (req, res) => {
  try {
    const { content, type } = req.body;
    const teamId = req.user.teamId || req.user.id;
    const lead = await db.leads.findOneAndUpdate(
      { _id: req.params.id, teamId },
      { $push: { interactions: { content, type: type || 'Nota' } } }
    );
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
    res.json(lead);
  } catch (error) {
    console.error('ERRO AO ADICIONAR INTERAÇÃO:', error);
    res.status(500).json({ error: 'Erro ao adicionar interação.' });
  }
});

// Claim lead for the current user
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const teamId = req.user.teamId || req.user.id;
    const lead = await db.leads.findOne({ _id: req.params.id, teamId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
    if (lead.assignedTo && lead.assignedTo !== req.user.id) {
      return res.status(400).json({ error: 'Este lead já está atribuído a outra pessoa.' });
    }
    const updatedLead = await db.leads.findOneAndUpdate(
      { _id: req.params.id, teamId },
      { assignedTo: req.user.id, assignedToName: req.user.name }
    );
    res.json(updatedLead);
  } catch (error) {
    console.error('ERRO AO REIVINDICAR LEAD:', error);
    res.status(500).json({ error: 'Erro ao reivindicar lead.' });
  }
});

module.exports = router;
