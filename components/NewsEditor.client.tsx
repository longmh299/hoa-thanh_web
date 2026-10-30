'use client';

import { Editor } from '@tinymce/tinymce-react';
import { marked } from 'marked';

type Props = {
  apiKey: string;
  value?: string;
  onChange?: (html: string) => void;
  height?: number;
  placeholder?: string;
};

export default function NewsEditorClient({
  apiKey,
  value,
  onChange,
  height,
  placeholder,
}: Props) {
  // ===== CLEAN HTML =====
  const cleanHTML = (html: string) => {
    if (!html) return '';

    return html
      // remove style
      .replace(/ style="[^"]*"/g, '')
      // remove span/font
      .replace(/<\/?(span|font)[^>]*>/g, '')
      // remove empty tags
      .replace(/<p>\s*<\/p>/g, '')
      // normalize heading
      .replace(/<h1/gi, '<h2')
      .replace(/<\/h1>/gi, '</h2>')
      .replace(/<h4/gi, '<h3')
      .replace(/<\/h4>/gi, '</h3>')
      // normalize bold
      .replace(/<b>/g, '<strong>')
      .replace(/<\/b>/g, '</strong>');
  };

  return (
    <Editor
      apiKey={apiKey}
      value={value} // ✅ controlled (không reload editor)
      onEditorChange={(content) => {
        const cleaned = cleanHTML(content);
        onChange?.(cleaned);
      }}
      init={{
        height,
        menubar: false,

        plugins: ['link', 'lists', 'image'],

        toolbar:
          'undo redo | blocks | bold italic | bullist numlist | link image',

        block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3',

        valid_elements:
          'p,h2,h3,ul,ol,li,a[href|target],img[src|alt],strong,em,div[class]',
        invalid_elements: 'span,font,style',

        valid_styles: {},

        forced_root_block: 'p',

        placeholder,

        content_style: `
          body {
            font-family: system-ui;
            font-size: 14px;
            line-height: 1.6;
          }
        `,

        // 🔥 PASTE HANDLER PRO
        setup: (editor) => {
          editor.on('Paste', (e: any) => {
            const clipboardData =
              e.clipboardData || (window as any).clipboardData;

            const htmlData = clipboardData.getData('text/html');
            const textData = clipboardData.getData('text/plain');

            if (!htmlData && !textData) return;

            e.preventDefault();

            let finalHTML = '';

            // ===== CASE 1: HTML (từ ChatGPT / web) =====
            if (htmlData) {
              finalHTML = cleanHTML(htmlData);
            }

            // ===== CASE 2: MARKDOWN / TEXT =====
            else if (textData) {
              const isMarkdown =
                textData.includes('##') ||
                textData.includes('- ') ||
                textData.includes('* ') ||
                textData.includes('###');

              if (isMarkdown) {
                finalHTML = marked.parse(textData) as string;
              } else {
                // convert line → paragraph
                finalHTML = textData
                  .split('\n')
                  .map((line:string) => `<p>${line}</p>`)
                  .join('');
              }

              finalHTML = cleanHTML(finalHTML);
            }

            editor.insertContent(finalHTML);
          });
        },
      }}
    />
  );
}