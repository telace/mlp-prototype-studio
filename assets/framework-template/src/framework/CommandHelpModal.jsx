import { X } from 'lucide-react';

const commandGroups = [
  {
    title: '日常编辑',
    items: [
      {
        phrase: '调用 mlp，修改当前项目原型，并给我本地预览',
        command: 'npm run mlp:fast-check',
        note: '用于普通页面、文案、布局、组件修改；不生成文档，不跑视觉验收。'
      },
      {
        phrase: '调用 mlp，修改当前项目的页面状态或路由，并检查',
        command: 'npm run mlp:route-check',
        note: '用于新增页面状态、登录流程、目录、路由或右侧面板行为；不跑视觉验收。'
      },
      {
        phrase: '调用 mlp，同步当前项目到最新框架',
        command: '<skill>/scripts/refresh-project.sh <project>',
        note: '刷新框架层和基础脚本；默认只做非视觉检查。'
      }
    ]
  },
  {
    title: '文档与验收',
    items: [
      {
        phrase: '调用 mlp，对当前项目执行完整文档输出',
        command: 'npm run mlp:docs-complete',
        note: '在页面确认完成后生成/检查 Product Notes 和 Test Cases；不跑视觉验收。'
      },
      {
        phrase: '调用 mlp，导出当前项目给其他 AI 读取',
        command: 'npm run mlp:export-ai',
        note: '生成 exports/ai-handoff.md 和 public/ai-handoff.md，包含目录、布局树、交互说明和测试用例；不生成截图。'
      },
      {
        phrase: '调用 mlp，对当前项目执行完整非视觉验收',
        command: 'npm run mlp:acceptance',
        note: '包含构建、路由运行时、文档覆盖检查；不生成截图。'
      },
      {
        phrase: '调用 mlp，对当前项目执行视觉验收',
        command: 'npm run mlp:visual-acceptance',
        note: '只有明确要求视觉验收、截图验收或更新视觉基线时使用。'
      }
    ]
  },
  {
    title: '项目与发布',
    items: [
      {
        phrase: '调用 mlp，基于新框架新建一个项目',
        command: '<skill>/scripts/scaffold-framework-project.sh <project-slug>',
        note: '在 MLP 项目根目录下创建隔离项目，不覆盖旧项目。'
      },
      {
        phrase: '调用 mlp，基于新框架重构旧项目',
        command: '<skill>/scripts/rebuild-project-from-legacy.sh <old> <new>',
        note: '用最新框架作为基底，还原旧项目业务页面和数据。'
      },
      {
        phrase: '调用 mlp，发布当前项目到线上',
        command: 'npm run mlp:release && npm run build',
        note: '上线前生成版本更新日志；部署仍按项目独立路径执行。'
      },
      {
        phrase: '调用 mlp，查看或回退项目版本',
        command: 'npm run mlp:versions / npm run mlp:rollback',
        note: '查看版本记录，或把当前版本指针回退到指定 x.x.xx 版本。'
      }
    ]
  }
];

export default function CommandHelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="command-help-layer" role="presentation" onMouseDown={onClose}>
      <section className="command-help-modal" role="dialog" aria-modal="true" aria-label="MLP 指令查看" onMouseDown={(event) => event.stopPropagation()}>
        <header className="command-help-head">
          <div>
            <span className="eyebrow">Commands</span>
            <strong>MLP 指令查看</strong>
          </div>
          <button type="button" className="command-help-close" aria-label="关闭指令查看" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="command-help-body">
          {commandGroups.map((group) => (
            <section className="command-help-group" key={group.title}>
              <h3>{group.title}</h3>
              <div className="command-help-list">
                {group.items.map((item) => (
                  <article className="command-help-item" key={item.phrase}>
                    <strong>{item.phrase}</strong>
                    <code>{item.command}</code>
                    <p>{item.note}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
