import { BadgeCheck, Moon, Sun, WandSparkles } from 'lucide-react';
import { project } from '../project/project-data.js';

export default function ProjectSettingsRail({ theme, toggleTheme, interactionGuideEnabled, toggleInteractionGuide, rightPanelMode, toggleRightPanelMode }) {
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
          <strong>交互引导</strong>
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
      <div className="theme-card notes-mode-card">
        <div>
          <span className="eyebrow">Panel</span>
          <strong>右侧面板</strong>
        </div>
        <div className="segmented-toggle notes-mode-toggle" role="group" aria-label="右侧面板">
          <button className={rightPanelMode === 'notes' ? 'active' : ''} type="button" aria-pressed={rightPanelMode === 'notes'} onClick={() => rightPanelMode !== 'notes' && toggleRightPanelMode()}>
            <BadgeCheck size={14} />
            <span>说明</span>
          </button>
          <button className={rightPanelMode === 'tests' ? 'active' : ''} type="button" aria-pressed={rightPanelMode === 'tests'} onClick={() => rightPanelMode !== 'tests' && toggleRightPanelMode()}>
            <BadgeCheck size={14} />
            <span>用例</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

