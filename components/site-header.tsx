import Image from 'next/image'

export function SiteHeader() {
  return (
    <div className="px-gutter flex items-center gap-2 py-3">
      <Image src="/logo.svg" alt="" width={28} height={28} priority />
      <span className="text-item font-semibold">Coffee Bar</span>
    </div>
  )
}
