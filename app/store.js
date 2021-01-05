const { configureMakeStore } = require('@gasket/redux');
const authReducers = require('@godaddy/gasket-auth/reducers');
const intlReducers = require('@gasket/intl/reducers');
const cookiesReducers = require('@godaddy/gasket-cookies/reducers');

const reducers = {
  ...authReducers,
  ...intlReducers,
  ...cookiesReducers
};

module.exports = configureMakeStore({ reducers });
