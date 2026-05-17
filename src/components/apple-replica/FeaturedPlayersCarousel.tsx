"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import styles from "./AppleReplicaLanding.module.css";

interface PlayerData {
  category: string;
  title: string;
  src: string;
  country: string;
  age: string;
  club: string;
  position: string;
  short: string;
  career: string;
  titles: string[];
  impact: string;
}

function PlayerContent({ player }: { player: PlayerData }) {
  return (
    <article className={styles.playerPopupVertical}>
      <div className={styles.playerPopupImageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={player.src}
          alt={player.title}
          className={styles.playerPopupImage}
        />
      </div>

      <div className={styles.playerPopupBody}>
        <div className={styles.playerPopupMeta}>
          <span>{player.country}</span>
          <span>{player.age}</span>
          <span>{player.position}</span>
        </div>

        <h3>{player.title}</h3>

        <p className={styles.playerPopupClub}>{player.club}</p>

        <p className={styles.playerPopupLead}>{player.short}</p>

        <section className={styles.playerPopupSection}>
          <h4>Carrera</h4>
          <p>{player.career}</p>
        </section>

        <section className={styles.playerPopupSection}>
          <h4>Títulos principales</h4>
          <ul>
            {player.titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className={styles.playerPopupSection}>
          <h4>Por qué puede ser decisivo</h4>
          <p>{player.impact}</p>
        </section>
      </div>
    </article>
  );
}

const featuredPlayers: PlayerData[] = [
  {
    category: "Argentina",
    title: "Lionel Messi",
    src: "/players/messi.webp",
    country: "Argentina",
    age: "38 años",
    club: "Inter Miami",
    position: "Delantero / creador",
    short: "El líder emocional de Argentina y uno de los jugadores más determinantes de la historia.",
    career:
      "Formado en Newell's y desarrollado en Barcelona, Messi construyó una carrera legendaria en Europa antes de pasar por PSG y llegar a Inter Miami. Con Argentina alcanzó la cima en Qatar 2022, donde fue el eje futbolístico y anímico del equipo campeón.",
    titles: [
      "Campeón del Mundo 2022",
      "Campeón de América con Argentina",
      "8 veces ganador del Balón de Oro",
      "Ganador de Champions League con Barcelona",
      "Leagues Cup 2023 con Inter Miami",
    ],
    impact:
      "Aunque ya no depende de la velocidad, sigue teniendo la pausa, el pase final y la precisión para cambiar un partido en una sola jugada.",
  },
  {
    category: "Francia",
    title: "Kylian Mbappé",
    src: "/players/mbappe.webp",
    country: "Francia",
    age: "27 años",
    club: "Real Madrid",
    position: "Delantero",
    short: "Velocidad, gol y jerarquía mundial. Un jugador diseñado para aparecer en partidos grandes.",
    career:
      "Nacido en París y formado entre Mónaco y PSG, Mbappé explotó muy joven en la élite europea. Con Francia ganó el Mundial 2018 y fue protagonista absoluto en Qatar 2022. Desde 2024 juega en Real Madrid, donde continúa su etapa como una de las figuras globales del fútbol.",
    titles: [
      "Campeón del Mundo 2018",
      "Campeón de la Nations League",
      "7 ligas francesas",
      "4 Copas de Francia",
      "Golden Boy",
      "Trofeo Kopa",
    ],
    impact:
      "Cuando tiene espacios, rompe cualquier sistema. Su potencia puede convertir una transición simple en una ocasión de gol.",
  },
  {
    category: "Brasil",
    title: "Vinícius Jr.",
    src: "/players/vinicius.webp",
    country: "Brasil",
    age: "25 años",
    club: "Real Madrid",
    position: "Delantero",
    short: "Desequilibrio puro por banda, agresividad ofensiva y una capacidad enorme para romper defensas.",
    career:
      "Surgido de Flamengo, llegó a Real Madrid en 2018 y se transformó en una de las piezas más peligrosas del ataque blanco. Su crecimiento lo llevó de promesa irregular a figura decisiva en Champions League y referente ofensivo de Brasil.",
    titles: [
      "2 Champions League",
      "3 Mundiales de Clubes",
      "2 Supercopas de Europa",
      "3 Ligas de España",
      "1 Copa del Rey",
      "3 Supercopas de España",
    ],
    impact:
      "Puede romper un partido desde el uno contra uno. Si está inspirado, obliga al rival a defender más bajo y abre espacios para todos.",
  },
  {
    category: "Inglaterra",
    title: "Jude Bellingham",
    src: "/players/bellingham.webp",
    country: "Inglaterra",
    age: "22 años",
    club: "Real Madrid",
    position: "Mediocampista",
    short: "Un mediocampista moderno: físico, llegada al área, lectura del juego y carácter competitivo.",
    career:
      "Debutó muy joven en Birmingham City, brilló en Borussia Dortmund y llegó a Real Madrid en 2023. En Madrid se consolidó como centrocampista total, capaz de organizar, presionar, llegar al área y definir partidos.",
    titles: [
      "1 Champions League",
      "1 Mundial de Clubes",
      "1 Supercopa de Europa",
      "1 Liga de España",
      "1 Supercopa de España",
      "1 Copa de Alemania",
      "Golden Boy",
      "Trofeo Kopa",
    ],
    impact:
      "No es solo talento: es presencia. Puede dominar zonas del campo, llegar desde segunda línea y marcar diferencias sin necesidad de tocar la pelota todo el tiempo.",
  },
  {
    category: "Noruega",
    title: "Erling Haaland",
    src: "/players/haaland.webp",
    country: "Noruega",
    age: "25 años",
    club: "Manchester City",
    position: "Delantero centro",
    short: "Un finalizador brutal. Potencia, desmarque y una relación directa con el gol.",
    career:
      "Pasó por Bryne, Molde, Salzburgo y Borussia Dortmund antes de llegar a Manchester City en 2022. En Inglaterra se convirtió en una máquina de goles y fue pieza central del City campeón de Europa.",
    titles: [
      "Champions League 2022/23",
      "Premier League 2022/23",
      "Premier League 2023/24",
      "FA Cup 2022/23",
      "Supercopa de Europa 2023",
      "Mundial de Clubes 2023",
    ],
    impact:
      "No necesita muchas oportunidades. Si recibe una pelota limpia en el área, el partido puede cambiar en segundos.",
  },
  {
    category: "España",
    title: "Lamine Yamal",
    src: "/players/yamal.webp",
    country: "España",
    age: "18 años",
    club: "FC Barcelona",
    position: "Extremo derecho",
    short: "La aparición joven más impactante del fútbol actual: regate, creatividad y una madurez impropia de su edad.",
    career:
      "Formado en La Masia, debutó con el primer equipo del Barcelona con apenas 15 años. Se convirtió en récord de precocidad para Barça y España, ganó la Eurocopa 2024 y ya es una pieza central del ataque blaugrana.",
    titles: [
      "Eurocopa 2024 con España",
      "3 Ligas con Barcelona",
      "1 Copa del Rey",
      "2 Supercopas de España",
      "Kopa Trophy 2024",
      "Laureus Breakthrough 2025",
    ],
    impact:
      "Tiene gambeta, pausa y último pase. Su valor no está solo en lo que hace, sino en lo que obliga a imaginar al rival cada vez que recibe.",
  },
];

export function FeaturedPlayersCarousel() {
  const cards = featuredPlayers.map((player) => ({
    ...player,
    content: <PlayerContent player={player} />,
  }));

  const renderedCards = cards.map((card, index) => (
    <Card key={card.title} card={card} index={index} />
  ));

  return (
    <section className={styles.featuredPlayers} id="jugadores">
      <div className={styles.featuredPlayersHeader}>
        <p className={styles.featuredPlayersEyebrow}>Jugadores destacados</p>
        <h2 className={styles.featuredPlayersTitle}>
          Los nombres que pueden cambiar el Mundial.
        </h2>
      </div>

      <Carousel items={renderedCards} />
    </section>
  );
}
