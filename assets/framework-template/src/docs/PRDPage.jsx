import prdSource from '../../docs/PRD.md?raw';
import { designContract } from '../project/project-data.js';

function renderMarkdown(source) {
  return source.split(/\r?\n/).map((line, index) => {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = `h${heading[1].length}`;
      return <Tag key={index}>{heading[2]}</Tag>;
    }
    if (/^[-*]\s+/.test(line)) return <li key={index}>{line.replace(/^[-*]\s+/, '')}</li>;
    if (!line.trim()) return <div className="prd-gap" key={index} />;
    return <p key={index}>{line}</p>;
  });
}

export default function PRDPage() {
  const prd = designContract.prd || {};
  return (
    <section className="checklist-stage prd-stage" aria-label="PRD">
      <div className="checklist-head prd-head">
        <div><span className="eyebrow">Product requirements</span><h2>PRD</h2></div>
        <div className="prd-meta"><strong>{prd.version || '0.1'}</strong><span>{prd.status || 'draft'}</span></div>
      </div>
      <article className="prd-document">{renderMarkdown(prdSource)}</article>
    </section>
  );
}
