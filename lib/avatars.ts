// Fotos reais de pessoas (Unsplash) usadas como avatar dos pesquisadores.
const FACES = [
  "photo-1560250097-0b93528c311a",
  "photo-1573496359142-b8d87734a5a2",
  "photo-1500648767791-00dcc994a43e",
  "photo-1519085360753-af0119f7cbe7",
  "photo-1573497019940-1c28c88b4f3e",
  "photo-1595211877493-41a4e5f236b3",
  "photo-1573496358961-3c82861ab8f4",
  "photo-1629425733761-caae3b5f2e50",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function avatarUrl(handle: string, size = 96): string {
  const id = FACES[hash(handle) % FACES.length];
  return `https://images.unsplash.com/${id}?w=${size}&h=${size}&fit=crop&crop=faces&q=80`;
}
