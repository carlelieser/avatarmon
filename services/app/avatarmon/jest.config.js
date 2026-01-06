module.exports = {
  projects: [
    // Unit tests for pure TypeScript (lib, types, constants, hooks)
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/__tests__/lib/**/*.test.ts',
        '<rootDir>/__tests__/hooks/**/*.test.ts',
      ],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: false }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@avatarmon/shared$': '<rootDir>/../../../packages/shared/src/index.ts',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.unit.js'],
    },
    // React Native component tests
    {
      displayName: 'components',
      preset: 'jest-expo',
      testMatch: [
        '<rootDir>/__tests__/components/**/*.test.{ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native)',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@avatarmon/shared$': '<rootDir>/../../../packages/shared/src/index.ts',
      },
    },
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
  ],
};
