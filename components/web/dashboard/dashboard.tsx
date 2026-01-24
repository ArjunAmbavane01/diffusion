import GenerationPanel from './generation-panel'
import ImageGallery from './image-gallery'

export default function Dashboard() {
  return (
    <section className='grid grid-cols-3 gap-8 max-w-7xl mx-auto mt-16 h-[calc(100vh-4rem)] overflow-hidden items-stretch'>
        <GenerationPanel />
        <ImageGallery />
    </section>
  )
}
