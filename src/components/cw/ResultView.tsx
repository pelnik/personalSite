import React from 'react';
import { Link } from 'react-router-dom';
import type { Result, Operation } from './cwApi';

function mistakeLabel(op: Operation) {
  if (op.type === 'wrong') return `${op.sent} typed as ${op.typed}`;
  if (op.type === 'missing') return `${op.sent === ' ' ? 'space' : op.sent} missing`;
  return `extra ${op.typed === ' ' ? 'space' : op.typed}`;
}

export default function ResultView({ result, loggedIn, complete }: {
  result: Result;
  loggedIn: boolean;
  complete: boolean;
}) {
  const mistakes = result.ops.filter((op) => op.type !== 'match');

  return (
    <section className="cw-results" aria-label="Practice result">
      <h2>Result: {result.accuracy}% accuracy</h2>
      <p>{result.errors} errors of {result.sentCount} characters</p>
      {result.passed && <p className="cw-good">Good! 90% or more</p>}
      <div className="cw-alignment" aria-hidden="true">
        <div className="cw-alignment-row">
          {result.ops.map((op, i) => (
            <span key={i} className={`cw-${op.type}`}>{op.type === 'extra' ? '^' : op.sent}</span>
          ))}
        </div>
        <div className="cw-alignment-row">
          {result.ops.map((op, i) => (
            <span key={i} className={`cw-${op.type}`}>{op.type === 'missing' ? '_' : op.typed}</span>
          ))}
        </div>
      </div>
      {mistakes.length > 0 && (
        <ul className="cw-visually-hidden" aria-label="Copy mistakes">
          {mistakes.map((op, i) => <li key={i}>{mistakeLabel(op)}</li>)}
        </ul>
      )}
      {!loggedIn && (
        <p><Link to="/login?next=/cw">Log in</Link> to save your progress and get practice weighted to your weak letters</p>
      )}
      {loggedIn && !complete && <p>You stopped early, so this practice wasn't saved.</p>}
    </section>
  );
}
