module.exports = {
  projects: [
    // Pure TypeScript tests (schemas, lib, store, hooks, integration)
    {
      displayName: 'unit',
      testMatch: [
        '**/__tests__/schemas/**/*.test.ts',
        '**/__tests__/lib/**/*.test.ts',
        '**/__tests__/store/**/*.test.ts',
        '**/__tests__/hooks/**/*.test.ts',
        '**/__tests__/integration/**/*.test.ts',
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
      },
      testEnvironment: 'node',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    // React Native component tests
    {
      displayName: 'components',
      preset: 'jest-expo',
      testMatch: [
        '**/__tests__/components/**/*.test.tsx',
        '**/__tests__/app/**/*.test.tsx',
        '**/__tests__/integration/**/*.test.tsx',
      ],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|bna-ui|zod)',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  ],
  collectCoverageFrom: [
    'schemas/**/*.ts',
    'lib/**/*.ts',
    'store/**/*.ts',
    'hooks/**/*.ts',
    '!**/*.d.ts',
  ],
  clearMocks: true,
  resetMocks: true,
};
