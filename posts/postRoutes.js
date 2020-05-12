const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.post('/', (req, res) => {
  console.log('posting a post');
  const newPost = req.body;
  if (!newPost.title || !newPost.contents) {
    res.status(400).json({
      errorMessage: "Please provide title and contents for the user."
    });
  } else {
    db.insert(newPost).then(value => {
      newPost.id = value.id;
      res.status(201).json(newPost);
    }).catch(e => {
      res.status(500).json({
        errorMessage: "There was an error while saving the post to the database"
      });
    });
  }
});

router.post('/:id/comments', (req, res) => {
  console.log('hello from comment post thing');
  db.findById(req.params.id).then(post => {
    if (!post.length) {
      res.status(404).json({
        errorMessage: 'The post with the specified ID does not exist.'
      });
    } else if (!req.body.text) {
      res.status(400).json({
        errorMessage: "Please provide text for the comment."
      });
    } else {
      db.insertComment({
        post_id: req.params.id,
        text: req.body.text
      }).then(commentId => {
        return db.findCommentById(commentId.id);
      }).then(comment => {
        res.status(201).json(comment);
      }).catch(e => {
        res.status(500).json({
          errorMessage: "There was an error while saving the comment to the database"
        });
      });
    }
  });
});

router.get('/', (req, res) => {
  db.find().then(posts => {
    res.status(200).json(posts);
  }).catch(e => {
    res.status(500).json({
      errorMessage: "The posts information coul dnot be retrieved."
    });
  });
});

router.get('/:id', (req, res) => {
  db.findById(req.params.id).then(post => {
    if (post.length) {
      res.status(200).json(post[0]);
    } else {
      res.status(404).json({
        message: 'The post with the specified ID does not exist.'
      });
    }
  }).catch(e => {
    res.status(500).json({
      error: 'The post information could not be retrieved.'
    });
  });
});

router.get('/:id/comments', (req, res) => {
  // is there a way to do this without 2 db calls?
  db.findById(req.params.id).then(post => {
    if (post.length) {
      db.findPostComments(req.params.id).then(comments => {
        res.status(200).json(comments);
      }).catch(e => {
        res.status(500).json({
          error: 'The comments information could not be retrieved.'
        });
      });
    } else {
      res.status(404).json({
        message: 'The post with the specified ID does not exist.'
      });
    }
  });
});

router.delete('/:id', (req, res) => {
  db.remove(req.params.id).then(numRecordsDeleted => {
    if (numRecordsDeleted) {
      res.status(200).json({recordsDeleted: numRecordsDeleted});
    } else {
      res.status(404).json({message: 'The post with the specified ID does not exist.'});
    }
  }).catch(e => {
    res.status(500).json({error: "The post could not be removed" });
  });
});

// This updates the record correctly, but returns the error response...
router.put('/:id', (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res.status(400).json({
      errorMessage: "Please provide title and contents for the user."
    });
  } else {
    db.update(req.params.id, req.body).then(numRecordsUpdated => {
      if (!numRecordsUpdated) {
        res.status(404).json({
          message: 'The post with the specified ID does not exist.'
        });
      } else {
        db.findById(req.params.id).then(post => {
          res.status(200).json(post[0]);
        });
      }
    }).catch(e => {
      console.log('put error: ', e);
      res.status(500).json({error: "The post information could not be modified." });
    });
  }
});

module.exports = router;
