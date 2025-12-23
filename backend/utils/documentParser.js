const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');
const mammoth = require('mammoth');
const path = require('path');

async function parseDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    console.log('Parsing file:', filePath, 'Type:', ext);
    
    switch (ext) {
      case '.pdf':
        return await parsePDFWithUnstructured(filePath);
      case '.docx':
        return await parseDOCX(filePath);
      case '.doc':
        return await parseDOC(filePath);
      case '.pptx':
        return await parsePPTX(filePath);
      default:
        throw new Error('Unsupported file format: ' + ext);
    }
  } catch (error) {
    console.error('Parsing error:', error);
    throw error;
  }
}

// Parse PDF using Unstructured API (with image extraction)
async function parsePDFWithUnstructured(filePath) {
  const apiKey = process.env.UNSTRUCTURED_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Unstructured API key not configured.');
  }
  
  try {
    console.log('📤 Uploading PDF to Unstructured API...');
    console.log('⏳ Processing with OCR + image extraction...');
    console.log('⏱️  This may take 2-5 minutes for large PDFs. Please wait...');
    
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath));
    form.append('strategy', 'hi_res'); // Required for images
    form.append('extract_image_block_types', '["Image", "Table"]'); // Extract images and tables
    form.append('extract_image_block_to_payload', 'true'); // Include base64 images
    
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 1200000); // 10 MINUTES timeout
    
    const response = await fetch('https://api.unstructuredapp.io/general/v0/general', {
      method: 'POST',
      headers: {
        'unstructured-api-key': apiKey,
      },
      body: form,
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    console.log('📥 Receiving data from API...');
    const elements = await response.json();
    console.log(`✅ Successfully extracted ${elements.length} elements from PDF`);
    
    // Count images
    const imageCount = elements.filter(el => el.type === 'Image').length;
    console.log(`🖼️  Found ${imageCount} images`);
    
    // Transform to frontend format
    const blogContent = elements.map((element, index) => ({
      id: element.element_id || `element-${index}`,
      type: mapElementType(element.type),
      content: element.text || '',
      metadata: {
        pageNumber: element.metadata?.page_number || null,
        imageData: element.metadata?.image_base64 || null,
        htmlTable: element.metadata?.text_as_html || null
      }
    }));
    
    return blogContent;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. PDF processing took too long (>10 minutes). The PDF might be too large or complex.');
    }
    if (error.code === 'ENOTFOUND') {
      throw new Error('Cannot reach Unstructured API. Check your internet connection.');
    }
    throw error;
  }
}

function mapElementType(unstructuredType) {
  const typeMapping = {
    'Title': 'heading',
    'Header': 'heading',
    'NarrativeText': 'paragraph',
    'Text': 'paragraph',
    'ListItem': 'list-item',
    'CodeSnippet': 'code',
    'Image': 'image',
    'Table': 'table',
    'Formula': 'formula'
  };
  return typeMapping[unstructuredType] || 'paragraph';
}

async function parseDOCX(filePath) {
  const result = await mammoth.convertToHtml({ path: filePath });
  const elements = [];
  let elementId = 0;
  
  const tagRegex = /<(h[1-6]|p|pre|code)([^>]*)>(.*?)<\/\1>/gis;
  let match;
  
  while ((match = tagRegex.exec(result.value)) !== null) {
    const tag = match[1].toLowerCase();
    const content = match[3].replace(/<[^>]+>/g, '').trim();
    
    if (!content) continue;
    
    let type = 'paragraph';
    if (tag.startsWith('h')) type = 'heading';
    else if (tag === 'pre' || tag === 'code') type = 'code';
    
    elements.push({
      id: `element-${elementId++}`,
      type: type,
      content: content,
      metadata: {}
    });
  }
  
  console.log(`✅ Extracted ${elements.length} elements from DOCX`);
  return elements;
}

async function parseDOC(filePath) {
  return await parseDOCX(filePath);
}

async function parsePPTX(filePath) {
  const AdmZip = require('adm-zip');
  const elements = [];
  let elementId = 0;
  
  const zip = new AdmZip(filePath);
  const slides = zip.getEntries()
    .filter(e => e.entryName.match(/ppt\/slides\/slide\d+\.xml/))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/\d+/)[0]);
      const numB = parseInt(b.entryName.match(/\d+/)[0]);
      return numA - numB;
    });
  
  slides.forEach((slide, index) => {
    const content = slide.getData().toString('utf8');
    const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g);
    
    if (textMatches) {
      textMatches.forEach((match, i) => {
        const text = match.replace(/<\/?a:t>/g, '').trim();
        if (text) {
          elements.push({
            id: `element-${elementId++}`,
            type: i === 0 ? 'heading' : 'paragraph',
            content: text,
            metadata: { slideNumber: index + 1 }
          });
        }
      });
    }
  });
  
  console.log(`✅ Extracted ${elements.length} elements from PPTX`);
  return elements;
}

module.exports = { parseDocument };
