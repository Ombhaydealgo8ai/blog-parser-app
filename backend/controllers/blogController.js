const { parseDocument } = require('../utils/documentParser');
const fs = require('fs');

exports.uploadAndParse = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    
    // Parse document
    const blogContent = await parseDocument(filePath);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        content: blogContent
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing document'
    });
  }
};
