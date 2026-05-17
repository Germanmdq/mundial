import { AppShell } from "@/components/layout/AppShell";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default function TerminosPage() {
  return (
    <AppShell>
      <PageHero 
        eyebrow="Términos"
        title="Términos del Servicio"
        description="Conocé las condiciones de uso de la plataforma Mundial entre Amigos."
      />
      <PageSection>
        <div className="max-w-[720px] mx-auto">
          <PremiumCard className="!p-8 md:!p-10 space-y-6 text-[#1d1d1f] text-[15px] leading-relaxed">
            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar el sitio web <strong>Mundial entre Amigos</strong> (<a href="https://mundialentreamigos.online" className="text-[#0071e3] hover:underline font-bold">https://mundialentreamigos.online</a>), aceptás cumplir con estos Términos y Condiciones de uso. Si no estás de acuerdo con alguna parte de estos términos, te solicitamos no ingresar ni utilizar los servicios provistos.
            </p>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">2. Descripción del Servicio</h2>
            <p>
              <em>Mundial entre Amigos</em> es una plataforma de entretenimiento interactivo diseñada para que los fanáticos del fútbol puedan realizar predicciones (&quot;pronósticos&quot;) de los partidos de la Copa Mundial de la FIFA 2026.
            </p>
            <p>
              El servicio te permite:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>Registrarte e iniciar sesión a través de Google OAuth para crear una cuenta personal.</li>
              <li>Ingresar y guardar tus predicciones para cada partido del Mundial de forma individual.</li>
              <li>Participar en el Ranking General de puntuación y crear o unirte a grupos de amigos (públicos y privados).</li>
            </ul>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">3. Registro de Cuenta y Google OAuth</h2>
            <p>
              El registro en nuestra web se realiza mediante el inicio de sesión provisto por <strong>Google</strong>. Sos responsable de mantener la seguridad y confidencialidad de tu cuenta de Google. Las credenciales de acceso nunca son recolectadas ni almacenadas por <em>Mundial entre Amigos</em>, ya que toda la autenticación es delegada de forma directa y segura a Google a través de <strong>Supabase Auth</strong>.
            </p>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">4. Uso Correcto de la Plataforma</h2>
            <p>
              Te comprometés a utilizar la plataforma con fines exclusivamente recreativos. Queda terminantemente prohibido cualquier intento de adulterar las puntuaciones, explotar vulnerabilidades técnicas o realizar un uso abusivo que atente contra el normal funcionamiento del servidor o del juego limpio entre los participantes.
            </p>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">5. Limitación de Responsabilidad</h2>
            <p>
              <em>Mundial entre Amigos</em> es una herramienta de entretenimiento personal y no tiene relación oficial ni comercial con la FIFA ni ninguna entidad gubernamental u organizadora de torneos. Ofrecemos el servicio &quot;tal cual está&quot;, sin promesas de disponibilidad absoluta frente a caídas temporales del servidor.
            </p>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">6. Modificaciones de los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Cualquier cambio significativo será publicado en esta misma sección para que los usuarios estén al tanto.
            </p>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">7. Contacto</h2>
            <p>
              Si tenés alguna consulta técnica o sugerencia sobre los Términos del Servicio, podés enviarnos un correo electrónico a: <a href="mailto:germangonzalezmdq@gmail.com" className="text-[#0071e3] hover:underline font-bold">germangonzalezmdq@gmail.com</a>.
            </p>

            <div className="pt-6 border-t border-[rgba(0,0,0,0.06)]">
              <p className="text-[#aeaeb2] text-[10px] text-center uppercase tracking-[0.2em] font-bold">
                Última actualización: Mayo 2026
              </p>
            </div>
          </PremiumCard>
        </div>
      </PageSection>
    </AppShell>
  );
}
