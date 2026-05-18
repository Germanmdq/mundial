export type DolarBlueRate = {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  moneda: string;
  fechaActualizacion: string;
};

export async function getDolarBlueRate(): Promise<DolarBlueRate | null> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 300 }, // Cache revalidation every 5 minutes
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data?.venta || typeof data.venta !== "number") {
      return null;
    }

    return data;
  } catch (err) {
    console.error("Failed to fetch dollar blue exchange rate:", err);
    return null;
  }
}
