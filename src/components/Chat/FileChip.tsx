import React, { useState } from 'react';
import { FileText, FileSpreadsheet, File, Download, FileCode } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileReference } from '../../types';
import { Modal } from '../UI/Modal';
import { downloadFile } from '../../utils/downloadHelper';

interface FileChipProps {
  file: FileReference;
}

export function FileChip({ file }: FileChipProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getIcon = () => {
    switch (file.type) {
      case 'pdf':
        return <FileText size={14} className="text-red-500" />;
      case 'csv':
      case 'excel':
        return <FileSpreadsheet size={14} className="text-green-500" />;
      case 'md':
        return <FileCode size={14} className="text-purple-500" />;
      default:
        return <File size={14} className="text-blue-500" />;
    }
  };

  const getTypeLabel = () => {
    return file.type.toUpperCase();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {getIcon()}
        <span>{file.name}</span>
        <span className="text-xs opacity-70">{getTypeLabel()}</span>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center justify-between w-full pr-8">
            <span>{file.name} ({getTypeLabel()})</span>
            <button
              onClick={() => {
                const extension = file.type === 'md' ? 'md' : file.type === 'csv' ? 'csv' : 'txt';
                const filename = file.name.includes('.') ? file.name : `${file.name}.${extension}`;
                downloadFile(file.content, filename, 'text/plain');
              }}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Download file"
            >
              <Download size={18} />
            </button>
          </div>
        }
      >
        <div className="relative max-h-[70vh] overflow-auto">
          <div className="pr-4 pb-4">
            {file.type === 'md' ? (
              <div className="prose dark:prose-invert max-w-none text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: (props) => {
                      const rest = { ...props };
                      // @ts-expect-error remove node from rest
                      delete rest.node;
                      return <a {...rest} target="_blank" rel="noopener noreferrer" />;
                    }
                  }}
                >
                  {file.content}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-hidden">
                {file.content}
              </pre>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}