module.exports = {
  extends: ['next'],
  ignorePatterns: ['build/', '.next/', 'node_modules/'],
  rules: {
    'react/prop-types': 'off',
    'valid-jsdoc': 'off',
    'quote-props': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'id-length': [
      'error',
      {
        max: 45,
        min: 1
      }
    ],
    indent: 'off',
    'max-len': ['error', 120],
    'max-params': ['error', 4],
    'max-statements': ['warn', 20],
    'react/display-name': 'off',
    'no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    'react/jsx-curly-spacing': 'off',
    'no-multiple-empty-lines': [
      'error',
      {
        max: 2,
        maxEOF: 1
      }
    ],
    'object-curly-spacing': 'off',
    eqeqeq: ['error', 'allow-null']
  }
};
