import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Rutas públicas que no requieren auth
  const publicPaths = ["/", "/login", "/registro", "/convocatoria", "/clasificacion"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p));

  // Si no hay sesión y la ruta no es pública → login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si hay sesión y es ruta /admin → verificar rol
  if (session && pathname.startsWith("/admin")) {
    const { data: player } = await supabase
      .from("players")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (!player || player.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};