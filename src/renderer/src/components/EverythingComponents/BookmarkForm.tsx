import React, { useEffect, useRef, useState } from 'react'

import { toast } from 'sonner'

type BookmarkCardProps = {
  onFocus: () => void
  onBlur: () => void
}

const BookmarkForm = ({  onFocus, onBlur }: BookmarkCardProps) => {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await window.electrons.createBookmark(text)

      if (!response) console.log('Error creating bookmark')
      if (response?.error) {
        toast.error(response?.error)
      }
      toast.success(response?.message)

      setText('')
    } catch (error) {
      console.error('Error creating bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height - important to shrink on delete
      textarea.style.height = 'auto'
      // Set height based on scroll height
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [text])

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className=" font-nunito ">
      <div
        className=" aspect-square flex flex-col flex-grow p-5 pt-[14px] rounded-md bg-[#1e1f2a] "
        onFocus={onFocus}
      >
        <label htmlFor="textarea" className="text-[#ff5924] text-xs tracking-widest ">
          ADD A NEW NOTE
        </label>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing here..."
          onFocus={onFocus}
          onBlur={onBlur}
          rows={4}
          className="w-full rounded-md border-none resize-none focus:ring-0 focus:outline-none bg-transparent placeholder-[#5f697e]   overflow-hidden"
          style={{
            minHeight: '4em' // Ensure the textarea has an initial height corresponding to 4 rows
          }}
        />
      </div>
      {/* <Button type="submit" className="mt-2" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </Button> */}
    </form>
  )
}

export default BookmarkForm
