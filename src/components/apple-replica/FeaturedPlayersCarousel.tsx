"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import styles from "./AppleReplicaLanding.module.css";

interface PlayerContentProps {
  name: string;
  country: string;
  role: string;
}

function PlayerContent({ name, country, role }: PlayerContentProps) {
  return (
    <div className={styles.playerModalContent}>
      <div className={styles.playerModalVisual}></div>
      <div className={styles.playerModalText}>
        <p>{country}</p>
        <h3>{name}</h3>
        <span>{role}</span>
      </div>
    </div>
  );
}

const featuredPlayers = [
  {
    category: "Argentina",
    title: "Lionel Messi",
    src: "/players/messi.webp",
    content: <PlayerContent name="Lionel Messi" country="Argentina" role="Creador, líder y definición." />,
  },
  {
    category: "Francia",
    title: "Kylian Mbappé",
    src: "/players/mbappe.webp",
    content: <PlayerContent name="Kylian Mbappé" country="Francia" role="Velocidad, gol y desequilibrio." />,
  },
  {
    category: "Brasil",
    title: "Vinícius Jr.",
    src: "/players/vinicius.webp",
    content: <PlayerContent name="Vinícius Jr." country="Brasil" role="Uno contra uno, vértigo y ataque." />,
  },
  {
    category: "Inglaterra",
    title: "Jude Bellingham",
    src: "/players/bellingham.webp",
    content: <PlayerContent name="Jude Bellingham" country="Inglaterra" role="Llegada, carácter y control del juego." />,
  },
  {
    category: "Noruega",
    title: "Erling Haaland",
    src: "/players/haaland.webp",
    content: <PlayerContent name="Erling Haaland" country="Noruega" role="Potencia, área y definición." />,
  },
  {
    category: "España",
    title: "Lamine Yamal",
    src: "/players/yamal.webp",
    content: <PlayerContent name="Lamine Yamal" country="España" role="Talento joven, pausa y gambeta." />,
  },
];

export function FeaturedPlayersCarousel() {
  const cards = featuredPlayers.map((player, index) => (
    <Card key={player.src} card={player} index={index} />
  ));

  return (
    <section className={styles.featuredPlayers} id="jugadores">
      <div className={styles.featuredPlayersHeader}>
        <p className={styles.featuredPlayersEyebrow}>Jugadores destacados</p>
        <h2 className={styles.featuredPlayersTitle}>
          Los nombres que pueden cambiar el Mundial.
        </h2>
      </div>

      <Carousel items={cards} />
    </section>
  );
}
