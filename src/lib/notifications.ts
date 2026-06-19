import { supabase } from "@/lib/supabaseClient";

type NotificationType = "match_created" | "result_published" | "match_cancelled";

type NotificationPayload = {
  title: string;
  message: string;
  type: NotificationType;
};

const templates: Record<NotificationType, (data?: any) => NotificationPayload> = {
  match_created: (data) => ({
    type: "match_created",
    title: "Nuevo partido convocado",
    message: `Se ha convocado un partido para el ${data?.date ?? ""} en ${data?.location ?? ""}.`,
  }),
  result_published: (data) => ({
    type: "result_published",
    title: "Resultado publicado",
    message: `Equipo A ${data?.scoreA ?? 0} - ${data?.scoreB ?? 0} Equipo B`,
  }),
  match_cancelled: (data) => ({
    type: "match_cancelled",
    title: "Partido cancelado",
    message: `El partido del ${data?.date ?? ""} ha sido cancelado.`,
  }),
};

export async function sendNotificationToAll(
  type: NotificationType,
  data?: any
) {
  const payload = templates[type](data);

  const { data: players, error } = await supabase
    .from("players")
    .select("id")
    .eq("is_active", true);

  if (error || !players) return;

  const notifications = players.map((player) => ({
    player_id: player.id,
    title: payload.title,
    message: payload.message,
    type: payload.type,
  }));

  await supabase.from("notifications").insert(notifications);
}