import React from 'react';
import { Link } from 'react-router-dom';
import type { Result, Operation } from './cwApi';
function label(op: Operation) {
  if (op.type === 'wrong') return `${op.sent} typed as ${op.typed}`;
  if (op.type === 'missing') return `${op.sent === ' ' ? 'space' : op.sent} missing`;
  if (op.type === 'extra') return `extra ${op.typed === ' ' ? 'space' : op.typed}`;
  return `${op.sent === ' ' ? 'space' : op.sent} correct`;
}
export default function ResultView({ result, loggedIn }: { result: Result; loggedIn: boolean }) {
  return <section className="cw-results" aria-label="Practice result">
    <h2>Result: {result.accuracy}% accuracy</h2>
    <p>{result.errors} errors of {result.sentCount} characters</p>
    {result.passed && <p className="cw-good">Good! 90% or more</p>}
    <div className="cw-alignment" aria-label="Sent and typed comparison">
      <div className="cw-alignment-row">{result.ops.map((op, i) => <span key={i} className={`cw-${op.type}`} role="img" aria-label={label(op)}>{op.type === 'extra' ? '^' : op.sent === ' ' ? '\u00a0' : op.sent}</span>)}</div>
      <div className="cw-alignment-row" aria-hidden="true">{result.ops.map((op, i) => <span key={i} className={`cw-${op.type}`}>{op.type === 'missing' ? '_' : op.typed === ' ' ? '\u00a0' : op.typed || '\u00a0'}</span>)}</div>
    </div>
    {!loggedIn && <p><Link to="/login?next=/cw">Log in</Link> to save your progress and get practice weighted to your weak letters</p>}
  </section>;
}
