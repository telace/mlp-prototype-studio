import { useState } from 'react';
import { Copy } from 'lucide-react';
import { promptDocs } from '../project/project-data.js';

export default function PromptDocsPage() {
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  const copyPrompt = async (item) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedPrompt(item.title);
      window.setTimeout(() => setCopiedPrompt(null), 1400);
    } catch (error) {
      setCopiedPrompt(null);
    }
  };

  return (
    <section className="checklist-stage prompt-doc-stage" aria-label="提示词">
      <div className="checklist-head">
        <span className="eyebrow">Prompt docs</span>
        <h2>提示词</h2>
        <p>项目中的可复用提示词集中放在这里，供产品、算法和开发对齐。</p>
      </div>
      <section className="ui-spec-section">
        <h3>提示词清单</h3>
        <div className="prompt-doc-list">
          {promptDocs.map((item) => (
            <article className="prompt-doc-card" key={item.title}>
              <div className="prompt-doc-card-head">
                <strong>{item.title}</strong>
                <button type="button" onClick={() => copyPrompt(item)} aria-label={`复制${item.title}`}>
                  <Copy size={14} />
                  {copiedPrompt === item.title ? '已复制' : '复制'}
                </button>
              </div>
              <pre>{item.content}</pre>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

