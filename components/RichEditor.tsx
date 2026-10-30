import React from 'react';
import RichEditorClient from './RichEditor.client';

type Props = {
  name?: string;
  value?: string;
  onChange?: (html: string) => void;
  height?: number;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  id?: string;
};

export default function RichEditor(props: Props) {
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;
  const isReadOnly = props.readOnly || !apiKey;

  // 👉 wrapper class chuẩn cho toàn bộ content
  const wrapperClass =
    'prose prose-slate max-w-none ' +
    'prose-h2:font-semibold prose-h2:text-[22px] ' +
    'prose-p:leading-relaxed ' +
    'prose-a:text-[var(--color-accent)] ' +
    'prose-img:rounded-xl ' +
    'prose-ul:pl-5 ' +
    'rounded-xl border border-gray-200 bg-white p-4';

  if (isReadOnly) {
    return (
      <div className={`${wrapperClass} ${props.className ?? ''}`}>
        <div
          className="min-h-[180px]"
          dangerouslySetInnerHTML={{
            __html:
              props.value && props.value.trim()
                ? props.value
                : '<p><em>(Không có nội dung)</em></p>',
          }}
        />

        {/* hidden input để submit */}
        {props.name ? (
          <input type="hidden" name={props.name} value={props.value ?? ''} />
        ) : null}
      </div>
    );
  }

  return (
    <div className={props.className}>
      <RichEditorClient
        apiKey={apiKey!}
        {...props}
        height={props.height ?? 420}
        placeholder={
          props.placeholder ??
          'Viết nội dung... (dùng H2 cho tiêu đề, không dùng màu chữ)'
        }
      />

      {/* 👉 hint cho editor (rất quan trọng) */}
      <p className="mt-2 text-xs text-gray-500">
        Sử dụng H2/H3 để chia mục. Không dùng màu chữ hoặc style.
      </p>
    </div>
  );
}