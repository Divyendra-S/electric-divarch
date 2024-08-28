// components/BookmarkInput.tsx
import React, { useRef, useEffect } from 'react'

interface BookmarkInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch: () => void
}

const BookmarkInput: React.FC<BookmarkInputProps> = ({ value, onChange, onSearch }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [value])

  return (
    <div className="relative w-full mb-4">
      <input
        key="text"
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder="Search my mind..."
        className="w-full placeholder-[#748297] focus:outline-none bg-transparent font-satisfy text-6xl pl-[6px] hover:placeholder-[#444c5c] text-[#748297] transition duration-300 ease-in-out"
      />
      <div className="w-full h-[1px] bg-[#36373a] mt-[12px]"></div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
        <div className="moving-highlight"></div>
      </div>
      {value && (
        <button
          onClick={onSearch}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 ml-4 px-3.5 py-2 rounded-full text-sm flex items-center transition-all duration-300 font-nunito hover:bg-[#2a2b38] border border-[#ff5924] mt-2 tracking-wider text-[#748297]"
        >
          SAVE SMART SPACE
        </button>
      )}
    </div>
  )
}

export default BookmarkInput
