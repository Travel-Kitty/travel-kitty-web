export function makeCode6() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid 0/O/1/I
  let s = "";
  for (let i = 0; i < 6; i++)
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
