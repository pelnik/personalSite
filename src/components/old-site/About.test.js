/**
 * @jest-environment jsdom
 */

import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { About } from '..';

it('changes the class when hovered', () => {
  const about = renderer.create(
    <MemoryRouter>
      <About />
    </MemoryRouter>
  );

  let tree = about.toJSON();
  expect(tree).toMatchSnapshot();
});
