const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../configs/cloudinary');
const verifyToken = require('../middlewares/verifyToken');


const storage = new CloudinaryStorage({
   cloudinary,
   params: {   
      folder: 'couple_app_uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov']
   },
});

const upload = multer({ storage: storage });

router.post('/', verifyToken, upload.single('file'), (req, res) => {
   if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
   try{
      res.json({ 
         message: 'File uploaded successfully', 
         url: req.file.path,
         public_id: req.file.filename
      });
   } catch(err){
      res.status(500).json({ 
         error: 'File upload failed', 
         details: err.message 
      });
   }
});

module.exports = router;