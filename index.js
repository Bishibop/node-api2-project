const express = require('express');
const postRoutes = require('./posts/postRoutes');
const server = express();
//const db = require('./data/db');

server.use(express.json());
server.use('/api/posts', postRoutes);

server.get('/', (req, res) => {
  res.status(200).json({hello: 'world'});
});

server.listen(5000, () => 
  console.log('Server running on http://localhost:5000')
);

//console.log(db);

