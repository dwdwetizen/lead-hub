import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/prospeccao" });
  },
  head: () => ({
    meta: [
      { title: "LocalWay OS | Prospecção, Follow-up e CRM" },
      {
        name: "description",
        content:
          "Operação comercial local: prospecção presencial e online, follow-up com IA e CRM Kanban.",
      },
      { property: "og:title", content: "LocalWay OS" },
      { property: "og:description", content: "Prospecção, follow-up e CRM em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
