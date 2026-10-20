import Navbar from "@/components/Navbar";

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="catalog-page">
            <Navbar />
            {children}
        </div>
    );
}
