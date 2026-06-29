import { Boxes, ClipboardCheck, FileText, History, ListChecks, Moon, Sun, WandSparkles } from 'lucide-react';
import { project } from '../project/project-data.js';
import { settingsRailPages } from './supportPages.js';

const settingsPageIcons = {
  components: Boxes,
  testAcceptance: ClipboardCheck,
  changelog: History
};

export default function ProjectSettingsRail({ active, setPage, theme, toggleTheme, interactionGuideEnabled, toggleInteractionGuide, openCommandHelp, openAIHandoff }) {
  return (
    <aside className="project-settings-rail" aria-label="项目信息与设置">
      <div className="project-card">
        <div>
          <span className="eyebrow">Low-fi prototype</span>
          <strong>{project.name}</strong>
        </div>
        <div className="project-meta">
          <span>{project.slug}</span>
          <span>{project.path}</span>
        </div>
      </div>
      <div className="theme-card">
        <div>
          <span className="eyebrow">Theme</span>
          <strong>原型配色</strong>
        </div>
        <div className="segmented-toggle" role="group" aria-label="原型配色">
          <button className={theme === 'light' ? 'active' : ''} type="button" aria-pressed={theme === 'light'} onClick={() => theme !== 'light' && toggleTheme()}>
            <Sun size={14} />
            <span>亮色</span>
          </button>
          <button className={theme === 'dark' ? 'active' : ''} type="button" aria-pressed={theme === 'dark'} onClick={() => theme !== 'dark' && toggleTheme()}>
            <Moon size={14} />
            <span>暗色</span>
          </button>
        </div>
      </div>
      <div className="theme-card guide-settings-card">
        <div>
          <span className="eyebrow">Guide</span>
          <strong>交互引导 <kbd>G</kbd></strong>
        </div>
        <div className="segmented-toggle guide-toggle" role="group" aria-label="交互引导">
          <button className={!interactionGuideEnabled ? 'active' : ''} type="button" aria-pressed={!interactionGuideEnabled} onClick={() => interactionGuideEnabled && toggleInteractionGuide()}>
            <WandSparkles size={14} />
            <span>关闭</span>
          </button>
          <button className={interactionGuideEnabled ? 'active' : ''} type="button" aria-pressed={interactionGuideEnabled} onClick={() => !interactionGuideEnabled && toggleInteractionGuide()}>
            <WandSparkles size={14} />
            <span>开启</span>
          </button>
        </div>
      </div>
      <div className="theme-card settings-docs-card">
        <div>
          <span className="eyebrow">Content</span>
          <strong>相关内容</strong>
        </div>
        <div className="settings-doc-list">
          <button type="button" onClick={openCommandHelp}>
            <ListChecks size={15} />
            <span>
              <strong>指令查看</strong>
              <em>查看所有指令</em>
            </span>
          </button>
          <button type="button" onClick={openAIHandoff}>
            <FileText size={15} />
            <span>
              <strong>获取 .md</strong>
              <em>复制 AI 交接文档</em>
            </span>
          </button>
          {settingsRailPages.map((item) => {
            const Icon = settingsPageIcons[item.id] || ListChecks;
            return (
              <button key={item.id} className={active === item.id ? 'active' : ''} type="button" onClick={() => setPage(item.id)}>
                <Icon size={15} />
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.description}</em>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
