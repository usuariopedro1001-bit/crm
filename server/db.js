const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

// Initial structure
const initialData = {
  users: [],
  leads: []
};

// Initialize DB file if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

const readDB = () => {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  readDB,
  writeDB,
  users: {
    find: async () => readDB().users,
    findOne: async (query) => {
      const users = readDB().users;
      return users.find(u => Object.keys(query).every(k => u[k] === query[k]));
    },
    findById: async (id) => {
      const users = readDB().users;
      return users.find(u => u._id === id.toString());
    },
    create: async (userData) => {
      const data = readDB();
      const newUser = {
        ...userData,
        _id: Date.now().toString(),
        createdAt: new Date(),
        teamId: userData.teamId || Date.now().toString()
      };
      data.users.push(newUser);
      writeDB(data);
      return newUser;
    }
  },
  leads: {
    find: async (query = {}) => {
      let leads = readDB().leads;
      if (query.userId) {
        leads = leads.filter(l => l.userId === query.userId.toString());
      }
      if (query.teamId) {
        leads = leads.filter(l => l.teamId === query.teamId.toString());
      }
      return leads;
    },
    findOne: async (query) => {
      const leads = readDB().leads;
      return leads.find(l => {
        return Object.keys(query).every(k => {
          if (k === '_id') return l._id === query[k].toString();
          if (k === 'userId') return l.userId === query[k].toString();
          if (k === 'teamId') return l.teamId === query[k].toString();
          return l[k] === query[k];
        });
      });
    },
    create: async (leadData) => {
      const data = readDB();
      const newLead = {
        ...leadData,
        _id: Date.now().toString(),
        createdAt: new Date(),
        createdBy: leadData.createdBy || null,
        assignedTo: leadData.assignedTo || null,
        assignedToName: leadData.assignedToName || null,
        teamId: leadData.teamId || null,
        interactions: leadData.interactions || []
      };
      data.leads.push(newLead);
      writeDB(data);
      return newLead;
    },
    findOneAndUpdate: async (query, update, options = {}) => {
      const data = readDB();
      const index = data.leads.findIndex(l => {
        return Object.keys(query).every(k => {
          if (k === '_id') return l._id === query[k].toString();
          if (k === 'userId') return l.userId === query[k].toString();
          if (k === 'teamId') return l.teamId === query[k].toString();
          return l[k] === query[k];
        });
      });

      if (index === -1) return null;

      if (update.$push) {
        const key = Object.keys(update.$push)[0];
        data.leads[index][key].push({ ...update.$push[key], date: new Date() });
      } else {
        data.leads[index] = { ...data.leads[index], ...update };
      }

      writeDB(data);
      return data.leads[index];
    },
    findOneAndDelete: async (query) => {
      const data = readDB();
      const index = data.leads.findIndex(l => {
        return Object.keys(query).every(k => {
          if (k === '_id') return l._id === query[k].toString();
          if (k === 'userId') return l.userId === query[k].toString();
          if (k === 'teamId') return l.teamId === query[k].toString();
          return l[k] === query[k];
        });
      });

      if (index === -1) return null;
      const deleted = data.leads.splice(index, 1);
      writeDB(data);
      return deleted[0];
    }
  }
};
