#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import path mappings
const importMappings = {
  // Design system
  '../design/utils': '../../../shared/utils/utils',
  '../../design/utils': '../../../shared/utils/utils',
  '../../../design/utils': '../../../shared/utils/utils',
  
  // UI Components
  '../components/ui/': '../../../shared/components/ui/',
  '../../components/ui/': '../../../shared/components/ui/',
  '../../../components/ui/': '../../../shared/components/ui/',
  
  // Common components
  '../components/common/': '../../../shared/components/',
  '../../components/common/': '../../../shared/components/',
  '../../../components/common/': '../../../shared/components/',
  
  // Hooks
  '../hooks/': '../../../shared/hooks/',
  '../../hooks/': '../../../shared/hooks/',
  '../../../hooks/': '../../../shared/hooks/',
  
  // Services
  '../services/': '../../../shared/services/',
  '../../services/': '../../../shared/services/',
  '../../../services/': '../../../shared/services/',
  
  // Contexts
  '../contexts/': '../../../contexts/',
  '../../contexts/': '../../../contexts/',
  '../../../contexts/': '../../../contexts/',
  
  // Types
  '../types/': '../../../shared/types/',
  '../../types/': '../../../shared/types/',
  '../../../types/': '../../../shared/types/',
};

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldPath)) {
        content = content.replace(regex, newPath);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixImportsInFile(filePath);
    }
  }
}

// Start from src directory
const srcDir = path.join(__dirname, 'src');
console.log('Fixing imports in:', srcDir);
walkDirectory(srcDir);
console.log('Import fixing complete!');
