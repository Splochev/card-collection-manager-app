export default {
  displayName: '@card-collection-manager-app/client',
  preset: '../../jest.preset.js',
  // jsdom simulates a browser environment (window, document, etc.)
  // Required for testing React components that interact with the DOM.
  testEnvironment: 'jsdom',
  // Runs once after the test framework is installed but before each test file.
  // Used here to load @testing-library/jest-dom custom matchers globally
  // (e.g. toBeInTheDocument, toHaveValue, toBeDisabled, …).
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/*.test.ts?(x)',
    '<rootDir>/src/__tests__/**/*.test.ts?(x)',
  ],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: 'test-output/jest/coverage',
};
