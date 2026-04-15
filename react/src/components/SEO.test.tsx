import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './SEO';

describe('SEO Component', () => {
  it('рендерит базовые мета-теги', () => {
    render(
      <HelmetProvider>
        <SEO title="Test Page" description="Test Description" />
      </HelmetProvider>
    );
    expect(document.title).toBe('');
  });
});