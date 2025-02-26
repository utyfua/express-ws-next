export default function addTrailingSlash(str: string) {
  let suffixed = str;
  if (suffixed.charAt(suffixed.length - 1) !== '/') {
    suffixed = `${suffixed}/`;
  }
  return suffixed;
}
