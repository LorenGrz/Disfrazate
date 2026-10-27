/** Pre-filtro del texto que escribe el usuario antes de gastar una llamada al namer. */
export const QUERY_MIN = 2;
export const QUERY_MAX = 40;
const QUERY_PATTERN = /^[\p{L}\p{N} \-'.]+$/u;

/** Letras, números, espacios y `-'.` (incluye ñ, tildes y ü); 2 a 40 caracteres ya recortado. */
export function isValidQuery(query: string): boolean {
  const trimmed = query.trim();
  return (
    trimmed.length >= QUERY_MIN &&
    trimmed.length <= QUERY_MAX &&
    QUERY_PATTERN.test(trimmed)
  );
}
