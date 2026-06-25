const path = require('path');
const fs = require('fs');
const mockMongoose = require('../utils/mockMongoose');

// Resolve the path to mongoose in the node_modules
const mongoosePath = require.resolve('mongoose');

// Overwrite the cache so any subsequent require('mongoose') gets mockMongoose!
require.cache[mongoosePath] = {
  id: mongoosePath,
  filename: mongoosePath,
  loaded: true,
  exports: mockMongoose
};

/**
 * Connects to MongoDB database using Mongoose (or in our case, the local JSON file database).
 */
const connectDB = async () => {
  console.log('✅ Local JSON-file database engine initialized.');
  
  // Create server/data directory if it doesn't exist
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Automatic database seeding if users.json is empty or doesn't exist
  const usersFile = path.join(dataDir, 'users.json');
  let runSeed = false;
  
  if (!fs.existsSync(usersFile)) {
    runSeed = true;
  } else {
    try {
      const content = fs.readFileSync(usersFile, 'utf8').trim();
      if (content === '' || JSON.parse(content).length === 0) {
        runSeed = true;
      }
    } catch (e) {
      runSeed = true;
    }
  }

  if (runSeed) {
    console.log('📦 Database is empty. Running automatic database seed...');
    try {
      const seed = require('../utils/seedFunction');
      await seed();
      console.log('✅ Database seeded successfully with default accounts.');
    } catch (err) {
      console.error('❌ Automatic seeding failed:', err.message);
    }
  }
};

module.exports = connectDB;
