import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// Applies the project-level Storybook annotations (decorators, parameters,
// global styles from preview.ts) to every story when run under Vitest.
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
