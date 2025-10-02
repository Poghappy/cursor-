#!/usr/bin/env node

/**
 * Cursor Agent 记忆管理服务
 * 用于管理 Agent 的长期记忆和项目上下文
 */

const fs = require('fs');
const path = require('path');

class MemoryManager {
  constructor() {
    this.memoryFile = path.join(__dirname, '../.cursor/memories.json');
    this.memory = this.loadMemory();
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        return JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
      }
    } catch (error) {
      console.error('Failed to load memory:', error);
    }
    return {};
  }

  saveMemory() {
    try {
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save memory:', error);
      return false;
    }
  }

  addMemory(category, key, value) {
    if (!this.memory[category]) {
      this.memory[category] = {};
    }
    this.memory[category][key] = {
      value,
      timestamp: new Date().toISOString(),
      accessCount: 0
    };
    return this.saveMemory();
  }

  getMemory(category, key) {
    if (this.memory[category] && this.memory[category][key]) {
      this.memory[category][key].accessCount++;
      this.memory[category][key].lastAccessed = new Date().toISOString();
      this.saveMemory();
      return this.memory[category][key].value;
    }
    return null;
  }

  searchMemory(query) {
    const results = [];
    for (const category in this.memory) {
      for (const key in this.memory[category]) {
        const item = this.memory[category][key];
        if (key.toLowerCase().includes(query.toLowerCase()) ||
            JSON.stringify(item.value).toLowerCase().includes(query.toLowerCase())) {
          results.push({
            category,
            key,
            value: item.value,
            relevance: this.calculateRelevance(query, key, item.value)
          });
        }
      }
    }
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  calculateRelevance(query, key, value) {
    let score = 0;
    const queryLower = query.toLowerCase();
    const keyLower = key.toLowerCase();
    const valueLower = JSON.stringify(value).toLowerCase();

    if (keyLower === queryLower) score += 10;
    else if (keyLower.includes(queryLower)) score += 5;
    
    if (valueLower.includes(queryLower)) score += 3;
    
    return score;
  }

  cleanupMemory(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    const now = new Date();
    let cleaned = 0;

    for (const category in this.memory) {
      for (const key in this.memory[category]) {
        const item = this.memory[category][key];
        const age = now - new Date(item.timestamp);
        
        if (age > maxAge && item.accessCount === 0) {
          delete this.memory[category][key];
          cleaned++;
        }
      }
    }

    if (cleaned > 0) {
      this.saveMemory();
    }
    return cleaned;
  }
}

// CLI 接口
if (require.main === module) {
  const manager = new MemoryManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'add':
      if (args.length >= 3) {
        const result = manager.addMemory(args[0], args[1], args[2]);
        console.log(result ? 'Memory added successfully' : 'Failed to add memory');
      } else {
        console.log('Usage: memory-manager.js add <category> <key> <value>');
      }
      break;

    case 'get':
      if (args.length >= 2) {
        const result = manager.getMemory(args[0], args[1]);
        console.log(result || 'Memory not found');
      } else {
        console.log('Usage: memory-manager.js get <category> <key>');
      }
      break;

    case 'search':
      if (args.length >= 1) {
        const results = manager.searchMemory(args[0]);
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log('Usage: memory-manager.js search <query>');
      }
      break;

    case 'cleanup':
      const cleaned = manager.cleanupMemory();
      console.log(`Cleaned up ${cleaned} old memories`);
      break;

    default:
      console.log('Available commands: add, get, search, cleanup');
  }
}

module.exports = MemoryManager;
