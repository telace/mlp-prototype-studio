import { useEffect, useState } from 'react';
import { Copy, FileText, Link, X } from 'lucide-react';
import { project } from '../project/project-data.js';

const localPath = `/Users/telace/Documents/Codex/mlp-projects/${project.slug}/exports/ai-handoff.md`;
const publicPath = `${project.path.replace(/\/?$/, '/') }ai-handoff.md`;

export default function AIHandoffModal({ open, onClose }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    if (!open) return;
    let disposed = false;
    setStatus('loading');
    setMessage('读取 ai-handoff.md...');
    fetch(`./ai-handoff.md?t=${Date.now()}`)
      .then((response) => {
        if (!response.ok) throw new Error('未找到 ai-handoff.md，请先运行 npm run mlp:export-ai。');
        return response.text();
      })
      .then((text) => {
        if (disposed) return;
        setMarkdown(text);
        setStatus('ready');
        setMessage('交接文档已就绪。');
      })
      .catch((error) => {
        if (disposed) return;
        setMarkdown('');
        setStatus('error');
        setMessage(error.message || '读取失败，请先运行 npm run mlp:export-ai。');
      });
    return () => {
      disposed = true;
    };
  }, [open]);

  if (!open) return null;

  const copyText = async (value, successMessage) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('ready');
      setMessage(successMessage);
    } catch {
      setStatus('error');
      setMessage('复制失败，请手动选择内容复制。');
    }
  };

  return (
    <div className="command-help-layer" role="presentation" onMouseDown={onClose}>
      <section className="ai-handoff-modal" role="dialog" aria-modal="true" aria-label="AI 交接文档" onMouseDown={(event) => event.stopPropagation()}>
        <header className="command-help-head">
          <div>
            <span className="eyebrow">AI handoff</span>
            <strong>AI 交接文档</strong>
          </div>
          <button type="button" className="command-help-close" aria-label="关闭 AI 交接文档" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="ai-handoff-body">
          <p className={`ai-handoff-status ${status}`}>{message}</p>
          <div className="ai-handoff-actions">
            <button type="button" onClick={() => copyText(markdown, '已复制 Markdown 全文。')} disabled={!markdown}>
              <FileText size={15} />
              <span>复制 Markdown 全文</span>
            </button>
            <button type="button" onClick={() => copyText(publicPath, '已复制线上交接链接。')}>
              <Link size={15} />
              <span>复制线上链接</span>
            </button>
            <button type="button" onClick={() => copyText(localPath, '已复制本地文件路径。')}>
              <Copy size={15} />
              <span>复制本地路径</span>
            </button>
          </div>
          <div className="ai-handoff-hint">
            <strong>生成命令</strong>
            <code>npm run mlp:export-ai</code>
            <p>本地预览使用 `public/ai-handoff.md`，部署后可通过项目路径下的 `ai-handoff.md` 访问。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
