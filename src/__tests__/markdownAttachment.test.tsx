import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { FileChip } from '../components/Chat/FileChip';
import { getFileTypeFromName, extractTextFromFile } from '../utils/fileProcessor';
import * as downloadHelper from '../utils/downloadHelper';

// Mock the downloadHelper
vi.mock('../utils/downloadHelper', () => ({
  downloadFile: vi.fn(),
}));

describe('Markdown File Attachments', () => {
  describe('getFileTypeFromName', () => {
    test('should identify .md and .markdown as md', () => {
      expect(getFileTypeFromName('test.md')).toBe('md');
      expect(getFileTypeFromName('test.markdown')).toBe('md');
    });
  });

  describe('extractTextFromFile', () => {
    test('should extract text correctly from a valid markdown file', async () => {
      const markdownContent = '# Hello\nThis is a test';
      const file = new File([markdownContent], 'test.md', { type: 'text/markdown' });

      const extractedContent = await extractTextFromFile(file);
      expect(extractedContent).toBe(markdownContent);
    });

    test('should throw an error for empty markdown file', async () => {
      const file = new File([''], 'empty.md', { type: 'text/markdown' });
      await expect(extractTextFromFile(file)).rejects.toThrow('Markdown file is empty');
    });
  });

  describe('FileChip Component', () => {
    const markdownFileRef = {
      id: '123',
      name: 'test.md',
      type: 'md' as const,
      content: '# Heading 1\n[Link](https://example.com)',
    };

    test('renders correctly for md file type and opens modal with markdown rendered', () => {
      render(<FileChip file={markdownFileRef} />);

      // Button should display file name
      const chipButton = screen.getByRole('button', { name: /test.md/i });
      expect(chipButton).toBeInTheDocument();
      expect(chipButton).toHaveTextContent('MD');

      // Click to open modal
      fireEvent.click(chipButton);

      // Check if Heading 1 is rendered as h1 tag, not raw markdown text
      const heading = screen.getByRole('heading', { name: 'Heading 1', level: 1 });
      expect(heading).toBeInTheDocument();

      // Check if Link is rendered as a tag with secure attributes
      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('calls downloadFile when download button is clicked', () => {
      render(<FileChip file={markdownFileRef} />);

      const chipButton = screen.getByRole('button', { name: /test.md/i });
      fireEvent.click(chipButton);

      const downloadButton = screen.getByRole('button', { name: /download file/i });
      fireEvent.click(downloadButton);

      expect(downloadHelper.downloadFile).toHaveBeenCalledWith(
        markdownFileRef.content,
        'test.md',
        'text/plain'
      );
    });
  });
});
