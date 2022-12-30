const express = require('express');
const router = express.Router();
const Organ = require('../models/organ');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const BASE_URL = "http://localhost:3000/";

const storage = multer.diskStorage({
  destination: (req,file,cb) =>{
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const upload = multer({
  storage: storage
});

router.get('/',(req,res,next) => {
  Organ.find()
    .select("_id name description layer organImage")
    .exec()
    .then(docs => {
        if (docs.length >= 0) {
          const response = {
            count: docs.length,
            organs: docs.map(doc => {
              var fileName = doc.organImage.split("\\");
              return {
                name: doc.name,
                layer: doc.layer,
                description: doc.description,
                organImage: doc.organImage,
                organImage: BASE_URL+"uploads/"+fileName[1],
                _id: doc._id,
                request: {
                  type: "GET",
                  url: BASE_URL+"organ/" + doc._id
                }
              };
            })
          };
          res.status(200).json(response);
        } else {
            res.status(404).json({
                message: 'No entries found'
            });
        }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/',upload.single('organImage'),(req,res,next) => {
    console.log(req.file);
    const organ = new Organ({
        _id: new mongoose.Types.ObjectId(),
        name : req.body.name,
        layer : req.body.layer,
        description: req.body.description,
        organImage: req.file.path
    });
    Organ.find({name : req.body.name})
    .exec()
    .then(doc => {
      if (doc.length >0) {
        res.status(500).json({
            error: "Organ already exist"
        });
      } else {
        organ.save()
        .then(result => {
        console.log(result.organImage);
        var fileName = result.organImage.split("\\");
        res.status(201).json({
          message: "Created organ successfully",
          createdProduct: {
              name: result.name,
              layer : result.layer,
              description: result.description,
              organImage: BASE_URL+"uploads/"+fileName[1],
              _id: result._id,
              request: {
                  type: 'GET',
                  url: BASE_URL+"organ/" + result.name
              }
          }
        });
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});


router.get('/:organId',(req,res,next) => {
    const id = req.params.organId;
    Organ.findOne({name : id})
    .select('_id name description layer organImage')
    .exec()
    .then(doc => {
      if (doc) {
        var fileName = doc.organImage.split("\\");
        res.status(200).json({
              name: doc.name,
              layer: doc.layer,
              description: doc.description,
              organImage: BASE_URL+"uploads/"+fileName[1],
              _id: doc._id
        });
      }else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.put('/:organId',(req,res,next) => {
    const id = req.params.organId;
    Organ.updateMany({ name : id }, {
      layer: req.body.layer, 
      description: req.body.description 
    })
    .exec()
    .then(result => {
    console.log(result);
    res.status(200).json(result);
    })
    .catch(err => {
    console.log(err);
    res.status(500).json({
        error: err
    });
    });
});

router.delete('/:organId',(req,res,next) => {
    const id = req.params.organId;
    Organ.findOne({name : id})
    .select('_id name description layer organImage')
    .exec()
    .then(doc => {
        fs.unlink(doc.organImage, (err) => {
            if (err) {
                throw err;
            }else{
              Organ.remove({ name: id })
                .exec()
                .then(result => {
                  res.status(200).json(result);
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err
                  });
                });
            }
        });
    })  
});

module.exports = router;