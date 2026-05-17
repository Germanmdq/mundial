import { AppShell } from "@/components/layout/AppShell";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default function PrivacidadPage() {
  return (
    <AppShell>
      <PageHero 
        eyebrow="Políticas"
        title="Políticas de Privacidad"
        description="Conocé cómo protegemos y administramos tus datos en Mundial entre Amigos."
      />
      <PageSection>
        <div className="max-w-[720px] mx-auto">
          <PremiumCard className="!p-8 md:!p-10 space-y-6 text-[#1d1d1f] text-[15px] leading-relaxed">
            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">1. Información General</h2>
            <p>
              Bienvenido a <strong>Mundial entre Amigos</strong> (disponible en <a href="https://mundialentreamigos.online" className="text-[#0071e3] hover:underline font-bold">https://mundialentreamigos.online</a>). Nos tomamos muy en serio la privacidad de nuestros usuarios y la seguridad de sus datos. Esta política de privacidad describe cómo recolectamos, usamos y protegemos tu información.
            </p>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">2. Inicio de Sesión y Datos Recolectados</h2>
            <p>
              Para facilitarte el acceso al sistema, utilizamos el servicio de inicio de sesión de terceros a través de <strong>Google OAuth</strong> provisto por <strong>Supabase</strong>. 
            </p>
            <p>
              Al iniciar sesión con tu cuenta de Google, únicamente accedemos a:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>Tu dirección de correo electrónico (para identificar de manera única tu cuenta de usuario).</li>
              <li>Tu nombre público (para personalizar tu experiencia en la plataforma y mostrarlo en las tablas de posiciones si participás en el ranking).</li>
              <li>Tu foto de perfil pública de Google (opcional, para tu perfil de usuario).</li>
            </ul>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">3. Uso de la Información</h2>
            <p>
              Utilizamos la información recolectada exclusivamente para los siguientes fines operativos del juego:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>Identificar y autenticar tu cuenta de usuario.</li>
              <li>Guardar y persistir de manera segura tus predicciones deportivas del Mundial.</li>
              <li>Mostrar tu posición en el <strong>Ranking General</strong> y permitirte participar en grupos de predicción privados y públicos creados dentro de la plataforma.</li>
            </ul>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">4. Protección y Venta de Datos</h2>
            <p>
              <strong>No vendemos ni comercializamos tus datos personales bajo ninguna circunstancia.</strong> Tus datos son privados y se usan únicamente para el normal desarrollo de la experiencia interactiva dentro de <em>Mundial entre Amigos</em>.
            </p>

            <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">5. Contacto</h2>
            <p>
              Si tenés alguna duda o consulta con respecto a tus datos personales o querés solicitar la eliminación completa de tu cuenta, podés contactarnos directamente escribiendo a nuestro correo electrónico: <a href="mailto:germangonzalezmdq@gmail.com" className="text-[#0071e3] hover:underline font-bold">germangonzalezmdq@gmail.com</a>.
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
