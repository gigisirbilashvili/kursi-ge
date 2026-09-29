import { deserialize, serialize } from 'node:v8'

import '@testing-library/jest-dom/jest-globals'

globalThis.structuredClone ??= <T>(value: T): T => deserialize(serialize(value)) as T
