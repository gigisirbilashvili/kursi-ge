const shared = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
    }],
  },
  clearMocks: true,
}

module.exports = {
  projects: [
    { ...shared, displayName: 'unit', testEnvironment: 'node', testMatch: ['<rootDir>/**/*.test.ts'] },
    { ...shared, displayName: 'react', testEnvironment: 'jsdom', testMatch: ['<rootDir>/**/*.test.tsx'] },
  ],
}
