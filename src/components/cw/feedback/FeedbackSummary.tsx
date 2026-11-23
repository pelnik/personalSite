import React from 'react';
import type { LetterCounts, LetterSummary } from '../cwApi';

type Props = {
  score: string;
  answered: number;
  totals: LetterCounts;
  letters: LetterSummary[];
};

export default function FeedbackSummary({ score, answered, totals, letters }: Props) {
  return (
    <section className="cw-results" aria-labelledby="cw-fb-summary">
      <h2 id="cw-fb-summary">Run summary</h2>
      {answered === 0 ? <p>No letters answered.</p> : (
        <>
          <p>{score}</p>
          <p>Feedback runs aren't saved.</p>
          <div className="cw-stats-table-wrap">
            <table className="cw-stats-table">
              <thead>
                <tr>
                  <th scope="col">Letter</th>
                  <th scope="col">Seen</th>
                  <th scope="col">Missed</th>
                  <th scope="col">Shown vs baseline</th>
                </tr>
              </thead>
              <tbody>
                {letters.map(({ char, multiplier }) => {
                  const [seen, missed] = totals[char] ?? [0, 0];
                  return (
                    <tr key={char}>
                      <th scope="row">{char}</th>
                      <td>{seen}</td>
                      <td>{missed}</td>
                      <td>{(multiplier ?? 1).toFixed(1)}×</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
