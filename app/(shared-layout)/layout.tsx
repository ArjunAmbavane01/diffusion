import Navbar from "@/components/web/navbar/navbar"

export default function SharedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}