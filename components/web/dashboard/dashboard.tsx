import GenerationPanel from './generation-panel'

export default function Dashboard() {
  return (
    <section className='grid grid-cols-3 max-w-7xl mx-auto mt-16 min-h-[calc(100vh-4rem)]'>
        <GenerationPanel />
    </section>
  )
}
