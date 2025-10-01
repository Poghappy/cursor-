#!/usr/bin/env node

/**
 * Cursor Agent 任务规划服务
 * 用于自动分解复杂任务和管理任务依赖
 */

const fs = require('fs');
const path = require('path');

class TaskPlanner {
  constructor() {
    this.configFile = path.join(__dirname, '../.cursor/agent-todos.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      }
    } catch (error) {
      console.error('Failed to load task config:', error);
    }
    return { todoTemplates: {}, autoBreakdownRules: {} };
  }

  breakdownTask(description, complexity = 5, templateType = 'feature_development') {
    const template = this.config.todoTemplates[templateType];
    if (!template) {
      return this.autoBreakdown(description, complexity);
    }

    const tasks = template.steps.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      assignedRole: step.assignedRole,
      estimatedTime: step.estimatedTime,
      dependencies: step.dependencies,
      status: 'todo',
      priority: this.calculatePriority(step, complexity),
      createdAt: new Date().toISOString()
    }));

    return {
      mainTask: {
        title: description,
        complexity,
        templateType,
        totalEstimatedTime: this.calculateTotalTime(tasks),
        createdAt: new Date().toISOString()
      },
      subtasks: tasks,
      dependencyGraph: this.buildDependencyGraph(tasks)
    };
  }

  autoBreakdown(description, complexity) {
    const rules = this.config.autoBreakdownRules;
    const maxComplexity = rules.maxTaskComplexity || 8;
    
    if (complexity <= maxComplexity) {
      return {
        mainTask: {
          title: description,
          complexity,
          totalEstimatedTime: this.estimateTime(complexity),
          createdAt: new Date().toISOString()
        },
        subtasks: [{
          id: 'main_task',
          title: description,
          description: `执行任务: ${description}`,
          assignedRole: 'dev',
          estimatedTime: this.estimateTime(complexity),
          dependencies: [],
          status: 'todo',
          priority: 'medium',
          createdAt: new Date().toISOString()
        }],
        dependencyGraph: {}
      };
    }

    // 复杂任务自动分解
    const numSubtasks = Math.ceil(complexity / maxComplexity);
    const subtasks = [];

    for (let i = 0; i < numSubtasks; i++) {
      const subtaskComplexity = Math.min(maxComplexity, complexity - i * maxComplexity);
      subtasks.push({
        id: `subtask_${i + 1}`,
        title: `${description} - 阶段 ${i + 1}`,
        description: `执行 ${description} 的第 ${i + 1} 个阶段`,
        assignedRole: 'dev',
        estimatedTime: this.estimateTime(subtaskComplexity),
        dependencies: i > 0 ? [`subtask_${i}`] : [],
        status: 'todo',
        priority: i === 0 ? 'high' : 'medium',
        createdAt: new Date().toISOString()
      });
    }

    return {
      mainTask: {
        title: description,
        complexity,
        totalEstimatedTime: this.calculateTotalTime(subtasks),
        createdAt: new Date().toISOString()
      },
      subtasks,
      dependencyGraph: this.buildDependencyGraph(subtasks)
    };
  }

  calculatePriority(step, complexity) {
    if (step.dependencies.length === 0) return 'high';
    if (complexity > 7) return 'high';
    if (step.assignedRole === 'qa' || step.assignedRole === 'arch') return 'medium';
    return 'low';
  }

  calculateTotalTime(tasks) {
    return tasks.reduce((total, task) => {
      const time = this.parseTime(task.estimatedTime);
      return total + time;
    }, 0);
  }

  parseTime(timeStr) {
    const match = timeStr.match(/(\d+)([hd])/);
    if (!match) return 1;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    return unit === 'h' ? value : value * 8; // 1 day = 8 hours
  }

  estimateTime(complexity) {
    if (complexity <= 2) return '1h';
    if (complexity <= 4) return '2h';
    if (complexity <= 6) return '4h';
    if (complexity <= 8) return '1d';
    return '2d';
  }

  buildDependencyGraph(tasks) {
    const graph = {};
    
    tasks.forEach(task => {
      graph[task.id] = {
        dependencies: task.dependencies,
        dependents: []
      };
    });

    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        if (graph[depId]) {
          graph[depId].dependents.push(task.id);
        }
      });
    });

    return graph;
  }

  getNextTasks(taskPlan) {
    const { subtasks, dependencyGraph } = taskPlan;
    const completedTasks = subtasks
      .filter(task => task.status === 'done')
      .map(task => task.id);

    return subtasks.filter(task => {
      if (task.status !== 'todo') return false;
      
      return task.dependencies.every(depId => 
        completedTasks.includes(depId)
      );
    }).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  updateTaskStatus(taskPlan, taskId, newStatus) {
    const task = taskPlan.subtasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      task.updatedAt = new Date().toISOString();
      
      if (newStatus === 'done') {
        task.completedAt = new Date().toISOString();
      }
    }
    return taskPlan;
  }
}

// CLI 接口
if (require.main === module) {
  const planner = new TaskPlanner();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'breakdown':
      if (args.length >= 1) {
        const description = args[0];
        const complexity = parseInt(args[1]) || 5;
        const templateType = args[2] || 'feature_development';
        
        const result = planner.breakdownTask(description, complexity, templateType);
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('Usage: task-planner.js breakdown <description> [complexity] [template]');
      }
      break;

    case 'next':
      if (args.length >= 1) {
        try {
          const taskPlan = JSON.parse(args[0]);
          const nextTasks = planner.getNextTasks(taskPlan);
          console.log(JSON.stringify(nextTasks, null, 2));
        } catch (error) {
          console.error('Invalid task plan JSON');
        }
      } else {
        console.log('Usage: task-planner.js next <taskPlanJSON>');
      }
      break;

    default:
      console.log('Available commands: breakdown, next');
  }
}

module.exports = TaskPlanner;
