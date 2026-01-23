# Agents - 智能体层

这是多智能体蜂群架构的核心目录。

## 目录结构

```
agents/
├── core/              # 协调层
│   ├── ProjectManager.js
│   ├── TaskScheduler.js
│   └── DependencyResolver.js
├── executors/         # 执行层
│   ├── ContentAnalyst.js
│   ├── SceneDesigner.js
│   ├── MaterialExpert.js
│   ├── VisualDesigner.js
│   └── VideoEngineer.js
└── quality/           # 质量控制层
    ├── QualityDirector.js
    ├── validators/
    └── standards/
```

## 开发指南

请参考《多智能体蜂群执行文档.md》进行开发。
