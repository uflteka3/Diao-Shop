/** Formatage des prix — français, devise administrable (ex. « 25 000 FCFA »). */
export function formatPrix(montant: number, devise: string): string {
  const nombre = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: montant % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(montant);
  return `${nombre} ${devise}`;
}
