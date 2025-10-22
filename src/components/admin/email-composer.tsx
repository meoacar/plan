'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
}

interface EmailComposerProps {
  templates: EmailTemplate[]
  onSend: (data: { subject: string; content: string; recipients: string }) => Promise<void>
  isSending: boolean
}

// Requirements: 5.2, 5.3, 5.4, 5.9
export default function EmailComposer({ templates, onSend, isSending }: EmailComposerProps) {
  const [subject, setSubject] = useState('')
  const [recipients, setRecipients] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL')
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  })

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template && editor) {
      setSubject(template.subject)
      editor.commands.setContent(template.content)
    }
  }

  const handleSend = async () => {
    if (!editor) return

    const content = editor.getHTML()
    await onSend({ subject, content, recipients })
    
    // Reset form
    setSubject('')
    editor.commands.setContent('')
    setRecipients('ALL')
    setShowConfirm(false)
  }

  const getRecipientCount = () => {
    // This would ideally come from an API call
    // For now, return placeholder text
    if (recipients === 'ALL') return 'Tüm kullanıcılar'
    if (recipients === 'ADMIN') return 'Tüm adminler'
    return 'Tüm normal kullanıcılar'
  }

  if (!editor) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Şablon Seç (Opsiyonel)
        </label>
        <select
          onChange={(e) => handleTemplateSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          defaultValue=""
        >
          <option value="">Boş başla</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Konu <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email konusu..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* Recipients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alıcılar <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="recipients"
              value="ALL"
              checked={recipients === 'ALL'}
              onChange={(e) => setRecipients(e.target.value as 'ALL')}
              className="mr-2"
            />
            Tüm Kullanıcılar
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="recipients"
              value="ADMIN"
              checked={recipients === 'ADMIN'}
              onChange={(e) => setRecipients(e.target.value as 'ADMIN')}
              className="mr-2"
            />
            Sadece Admin
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="recipients"
              value="USER"
              checked={recipients === 'USER'}
              onChange={(e) => setRecipients(e.target.value as 'USER')}
              className="mr-2"
            />
            Sadece User
          </label>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İçerik <span className="text-red-500">*</span>
        </label>
        
        {/* Editor Toolbar */}
        <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded ${editor.isActive('bold') ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded ${editor.isActive('italic') ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1 rounded ${editor.isActive('underline') ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            <u>U</u>
          </button>
          <div className="w-px bg-gray-300" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            H3
          </button>
          <div className="w-px bg-gray-300" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded ${editor.isActive('bulletList') ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-3 py-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-3 py-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-3 py-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            →
          </button>
        </div>

        {/* Editor Content */}
        <div className="border border-t-0 border-gray-300 rounded-b-lg bg-white">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={!subject || !editor.getText()}
        >
          Önizle
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!subject || !editor.getText() || isSending}
        >
          {isSending ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Email Önizleme</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="border-b pb-4 mb-4">
                <p className="text-sm text-gray-600">Konu:</p>
                <p className="font-semibold">{subject}</p>
              </div>
              <div className="border-b pb-4 mb-4">
                <p className="text-sm text-gray-600">Alıcılar:</p>
                <p className="font-semibold">{getRecipientCount()}</p>
              </div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Email Gönderimini Onayla</h3>
            <p className="text-gray-600 mb-4">
              Bu email <strong>{getRecipientCount()}</strong> grubuna gönderilecek. Devam etmek istediğinize emin misiniz?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Bu işlem geri alınamaz. Email kuyruğa alınacak ve kısa süre içinde gönderilecektir.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSending}
              >
                İptal
              </button>
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                disabled={isSending}
              >
                {isSending ? 'Gönderiliyor...' : 'Evet, Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
