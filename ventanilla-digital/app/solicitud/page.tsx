import { auth } from "@/auth";
import CreateTicketForm from "@/components/CreateTicketForm";
import { redirect } from "next/navigation";

export default async function SolicitudPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/");
    }

    const user = {
        nombre: session.user.name ?? "",
        cargo: (session.user as any).cargo ?? "",
        gerencia: (session.user as any).gerencia ?? "",
        email: session.user.email ?? "",
    };

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-8 md:py-12">
            <div className="mx-auto w-full max-w-4xl">
                <CreateTicketForm currentUser={user} />
            </div>
        </main>
    );
}
