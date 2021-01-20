// Even if you do not add styling here, retain this import to avoid
// a routing bug with loading scss files in other pages/components.
// @see: https://github.com/zeit/next-plugins/issues/282
import '../styles/_app.scss';

import { App, reportWebVitals, withPageEnhancers } from '@godaddy/gasket-next';
import { withAuthRequired } from '@godaddy/gasket-auth';

export { reportWebVitals };

export default withPageEnhancers([withAuthRequired({ realm: 'jomax' })])(App);
