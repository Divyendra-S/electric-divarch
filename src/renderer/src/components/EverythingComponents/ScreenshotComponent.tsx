import { useState } from 'react'

import { toast } from 'sonner'

export default function ScreenshotComponent() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<{
    screenshot?: string
    html?: string
    tags?: string
    title?: string
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      if (!url.match(/^https?:\/\//i)) {
        toast.error('Invalid URL')
        return
      }
      saveBookmark()
    } catch (error) {
      setResult({ error: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }
  if (bookmarkLoading) {
  }

  const saveBookmark = async () => {
    setBookmarkLoading(true)
    const loadingToast = toast.loading('Saving bookmark...')

    try {
      const response = await window.electrons.createBookmarkWithScreenshot(url)
      if (!response?.message) {
        toast.error(response?.error)
      } else {
        toast.success(response.message)
        setUrl('')
        console.log(`Bookmark saved`)
      }
    } catch (error) {
      console.log(error)
      toast.error('An error occurred while saving the bookmark')
    } finally {
      setBookmarkLoading(false)
      toast.dismiss(loadingToast)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Url"
          className="w-full placeholder-[#748297] focus:outline-none bg-transparent font-satisfy text-6xl pl-[6px] hover:placeholder-[#444c5c] text-[#748297] transition duration-300 ease-in-out"
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
        />
        <div className="w-full h-[1px] bg-[#36373a] mt-[12px] mb-5"></div>
        {/* <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "SAVE"}
        </Button> */}
      </form>
    </div>
  )
}
