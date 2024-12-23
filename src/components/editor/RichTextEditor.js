import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
  Button,
  ButtonGroup,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Image as ImageIcon,
} from '@mui/icons-material';

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) {
    return null;
  }

  const handleImageInput = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    event.target.value = '';
  };

  return (
    <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
      <ButtonGroup variant="outlined" size="small">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <FormatBold />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <FormatItalic />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          <FormatListBulleted />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          <FormatListNumbered />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          <FormatQuote />
        </Button>
      </ButtonGroup>

      <Tooltip title="Insert image">
        <IconButton component="label">
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageInput}
          />
          <ImageIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const RichTextEditor = ({ content, onChange, onImageUpload }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <Box 
      sx={{ 
        border: 1, 
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        minHeight: '200px',
        '& .ProseMirror': {
          outline: 'none',
          height: '100%',
          '& > *': {
            marginBottom: '0.5em',
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
          },
        },
      }}
    >
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} />
    </Box>
  );
};

export default RichTextEditor;
