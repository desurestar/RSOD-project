import React, { useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import Quill from 'quill'
import ImageUploader from 'quill-image-uploader'
import { uploadImage } from '../../../utils/uploadImage' 

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

Quill.register('modules/imageUploader', ImageUploader)

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const quillRef = useRef<ReactQuill | null>(null)

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
    imageUploader: {
      upload: async (file: File) => {
        try {
          const url = await uploadImage(file)
          return url
        } catch (err) {
          console.error('Image upload failed:', err)
          throw err
        }
      },
    },
  }

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        modules={modules}
        theme="snow"
        placeholder="Напишите ваш пост..."
      />
    </div>
  )
}
